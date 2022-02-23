/**
 * Generates a JSON with valid data to use for the rs-wikitrivia game
 */

import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import crypto from 'crypto';
import PageType from './enums/PageType';

const BASE_ENDPOINT = 'https://runescape.wiki/api.php';
const RESULT_KEYS_TO_STRIP = ['printouts', 'namespace', 'exists', 'displaytitle', 'fulltext'];

const makeSMWRequest = async (offset: string | null = null) => {
  const query = new URLSearchParams({
    action: 'ask',
    format: 'json',
    query: `[[Release date::+]]${offset ? `|[[>>${offset}]]` : ''}|?Release date|?Examine|?Item name|?Monster name|?Monster JSON|?NPC ID|?Item ID|?Quest JSON|limit=500`,
  })

  console.log('Making SMW request with offset', offset);
  const res = await axios.get(`${BASE_ENDPOINT}?${query.toString()}`)
  return res;
}

const makePageImagesRequest = async (titles = []) => {
  const query = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'pageimages',
    titles: titles.join('|')
  })

  const res = await axios.get(`${BASE_ENDPOINT}?${query.toString()}`)
  return res;
}

(async () => {
  console.log('Begin generation of JSON...');
  let pages: {
    [key: string]: {
      [key: string]: any;
      id: string;
      label: string;
      released: number;
      examine: string | null;
      type: PageType;
    };
  } = {};

  let images: { [key: string]: string } = {};

  let finalPages: {
    [key: string]: any;
    id: string;
    label: string;
    released: number;
    examine: string | null;
    type: PageType;
  }[] = [];

  // Use Semantic MediaWiki to generate a list of pages with release dates
  console.log('Generating page list with SMW...');
  let offset: string | null = null;
  while (true) {
    const res: AxiosResponse<any> = await makeSMWRequest(offset);
    if (res.data) {
      pages = {...pages, ...res.data.query.results};

      if (Object.keys(res.data.query.results).length < 500) {
        // Finished!
        break;
      }

      offset = Object.keys(res.data.query.results).slice(-1)[0];
      continue;
    }
    break;
  }

  const initialCandidates = Object.keys(pages).length;
  console.log('Generated page list of', initialCandidates, 'candidates...');

  // Attempt to get page images...
  console.log('Generating images list using pageimages extension...');
  let pageOffset = 0;
  while (true) {
    console.log(`Making pageimages request (${pageOffset}/${Object.keys(pages).length})`);
    // @ts-ignore
    const res: {
      data: {
        query: {
          pages: {
            [key: string]: any;
          }
        }
      }
    // @ts-ignore
    } = await makePageImagesRequest(Object.keys(pages).slice(pageOffset, pageOffset + 50));
    if (res.data) {
      let imagesToAdd: { [key: string]: string; } = {};

      if (!res.data.hasOwnProperty('query')) {
        break;
      }

      for (let pv of Object.values(res.data.query.pages)) {
        if (pv.hasOwnProperty('pageimage')) {
          imagesToAdd[pv['title']] = pv['pageimage'];
        }
      }

      if (Object.keys(imagesToAdd).length > 0) {
        images = {
          ...images,
          ...imagesToAdd
        };
      }

      pageOffset += 50; // Cloudflare will probably shout at us if we do more than this

      if (pageOffset > Object.keys(pages).length) {
        // Offset is higher than number of pages, we are done!
        break;
      }

      continue;
    }
    break;
  }

  console.log(`Retrieved images for ${Object.keys(images).length}/${initialCandidates} candidates...`);

  // Sanitise output of SMW results
  console.log('Sanitising SMW results...')
  let sanitiseTotals = { badtitle: 0, noimg: 0, notype: 0, noid: 0 };

  for (let [k, v] of Object.entries(pages)) {
    if (/(#|\(|\))/.test(k)) {
      // If this page has brackets in the name, or is a SMW subobject, do not use this page.
      sanitiseTotals.badtitle += 1;
      continue;
    }

    v['image'] = images[k];
    if (!v['image']) {
      // If we have no image, do not use this page.
      sanitiseTotals.noimg += 1;
      continue;
    }

    let po = v['printouts'];
    // Determine page type
    if (po['Item name'].length) v['type'] = PageType.ITEM
    if (po['NPC ID'].length) v['type'] = PageType.NPC
    if (po['Monster name'].length) v['type'] = PageType.MONSTER
    if (po['Quest JSON'].length) v['type'] = PageType.QUEST
  
    if (!v['type']) {
      // If we cannot determine the type, do not use this page.
      sanitiseTotals.notype += 1;
      continue;
    }

    const released = new Date(parseInt(po['Release date'][0]['timestamp']) * 1000);

    // Sanitise our printouts
    v['year'] = released.getFullYear();
    v['released'] = parseInt(po['Release date'][0]['timestamp']) * 1000;
    v['examine'] = po['Examine'].length ? po['Examine'][0] : '';

    switch (v.type) {
      case PageType.ITEM:
        v['id'] = po['Item ID'].length ? 'ITEM-' + po['Item ID'] : '';
        v['label'] = po['Item name'][0] || '';
        break;
      case PageType.MONSTER:
        v['id'] = po['NPC ID'].length ? 'NPC-' + po['NPC ID'][0] : '';
        v['label'] = po['Monster name'][0] || '';
        v['examine'] = po['Monster JSON']['examine'] || '';
        break;
      case PageType.NPC:
        v['id'] = po['NPC ID'].length ? 'NPC-' + po['NPC ID'][0] : '';
        break;
      case PageType.QUEST:
        // There is no IDs for quests on the wiki, so we create an MD5 hash instead for a (hopefully) unique ID.
        v['id'] = 'QUEST-' + crypto.createHash('md5').update(k).digest('hex');
        break;
      default:
        break;
    }

    if (!v['id']) {
      // If there is no ID, do not use this page.
      sanitiseTotals.noid += 1;
      continue;
    }

    if (!v['label']) v['label'] = k; // set default label as key name

    // Strip unnecessary properties
    for (let k2 of RESULT_KEYS_TO_STRIP) {
      if (v.hasOwnProperty(k2)) delete v[k2];
    }
    finalPages.push(v);
  }

  console.log(`Final number of candidates: ${Object.keys(finalPages).length}/${initialCandidates}`);
  console.log(`Breakdown of removed candidates: ${JSON.stringify(sanitiseTotals)}`)

  await fs.writeFile('generated.json', JSON.stringify(finalPages, null, 2), (err) => {
    if (err) throw err;
  });
  console.log('Saved to file!')
})().catch(err => {
  console.error(err);
});