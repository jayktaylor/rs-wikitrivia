/**
 * Generates a JSON with valid data to use for the rs-wikitrivia game
 */

import axios from 'axios';
import fs from 'fs';
import crypto from 'crypto';
import PageType from './enums/PageType';

const BASE_ENDPOINT = 'https://runescape.wiki/api.php';
const RESULT_KEYS_TO_STRIP = ['printouts', 'namespace', 'exists', 'displaytitle', 'fulltext'];

const makeSMWRequest = async (offset = 0) => {
  const query = new URLSearchParams({
    action: 'ask',
    format: 'json',
    query: `[[Release date::+]]|?Release date|?Examine|?Item name|?Object name|?Monster name|?Monster JSON|?NPC ID|?Item ID|?Quest JSON|?Object ID|limit=500|offset=${offset}`
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
  let offset = 0;
  while (true) {
    const res = await makeSMWRequest(offset);
    if (res.data) {
      pages = {...pages, ...res.data.query.results};

      // TODO: remove this once offset issue sorted out
      if (offset === 5500) {
        break;
      }

      if (res.data.hasOwnProperty('query-continue-offset')) {
        offset = res.data['query-continue-offset'];
        continue;
      }
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
  for (let [k, v] of Object.entries(pages)) {
    v['image'] = images[k];
    if (!v['image']) {
      // If we have no image, do not use this page.
      continue;
    }

    let po = v['printouts'];
    // Determine page type
    if (po['Item name'].length) v['type'] = PageType.ITEM
    if (po['Object name'].length) v['type'] = PageType.OBJECT
    if (po['NPC ID'].length) v['type'] = PageType.NPC
    if (po['Monster name'].length) v['type'] = PageType.MONSTER
    if (po['Quest JSON'].length) v['type'] = PageType.QUEST
  
    if (!v['type']) {
      // If we cannot determine the type, do not use this page.
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
      case PageType.OBJECT:
        v['id'] = po['Object ID'].length ? 'OBJ-' + po['Object ID'] : '';
        v['label'] = po['Object name'][0] || '';
        break;
      case PageType.MONSTER:
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

  await fs.writeFile('generated.json', JSON.stringify(finalPages, null, 2), (err) => {
    if (err) throw err;
  });
  console.log('Saved to file!')
})().catch(err => {
  console.error(err);
});