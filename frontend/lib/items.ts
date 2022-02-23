import { Item, PlayedItem } from "../types/item";
import { createWikiImage } from "./image";

export function getRandomItem(deck: Item[], played: Item[]): Item {
  const playedDates = played.map((item): number => {
    return item.released;
  });

  const periods: [number, number][] = [
    [946684800000, 1104537600000], // 2000 -> 2005
    [1104537600000, 1167609600000], // 2005 -> 2007
    [1167609600000, 1262304000000], // 2007 - 2010
    [1262304000000, 1420070400000], // 2010 -> 2015
    [1420070400000, 1672531200000] // 2015 - 2023
  ]; // unix timestamps
  const [fromTimestamp, toTimestamp] =
    periods[Math.floor(Math.random() * periods.length)];

  const candidates = deck.filter((candidate) => {
    if (candidate.released < fromTimestamp || candidate.released > toTimestamp) {
      return false;
    }

    if (playedDates.includes(candidate.released)) {
      return false;
    }

    return true;
  });

  if (candidates.length === 0) {
    throw new Error("No item candidates");
  }

  const item = { ...candidates[Math.floor(Math.random() * candidates.length)] };

  return item;
}

export function checkCorrect(
  played: PlayedItem[],
  item: Item,
  index: number
): { correct: boolean; delta: number } {
  const sorted = [...played, item].sort((a, b) => a.released - b.released);
  const correctIndex = sorted.findIndex((i) => {
    return i.id === item.id;
  });

  if (index !== correctIndex) {
    return { correct: false, delta: correctIndex - index };
  }

  return { correct: true, delta: 0 };
}

export function preloadImage(url: string): HTMLImageElement {
  const img = new Image();
  img.src = createWikiImage(url);
  return img;
}
