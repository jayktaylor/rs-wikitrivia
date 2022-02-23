export function createWikiImage(image: string, width = 300): string {
  return `https://runescape.wiki/index.php?title=Special:Redirect/file/${encodeURIComponent(
    image
  )}&width=${width}`;
}
