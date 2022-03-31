import config from './config';

let BASE_IMAGE_URL = "https://runescape.wiki";
if (config.isOSRS()) {
  BASE_IMAGE_URL = "https://oldschool.runescape.wiki";
}

export function createWikiImage(image: string): string {
  image = image.replace(/ /g,"_")
  image = image.replace(/\(/g, '%28').replace(/\)/g, '%29')
  const cb = '48781';
  return BASE_IMAGE_URL + '/images/' + image + '?' + cb;
}
