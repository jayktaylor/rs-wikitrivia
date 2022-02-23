import { Item, PlayedItem } from "../types/item";
import { createWikiImage } from "./image";

export function getRandomItem(deck: Item[], played: Item[]): Item {
  const playedYears = played.map((item): number => {
    return item.year;
  });

  const periods: [number, number][] = [
    [2000, 2007],
    [2007, 2010],
    [2010, 2015],
    [2015, 2020],
    [2020, 2022]
  ];
  const [fromYear, toYear] =
    periods[Math.floor(Math.random() * periods.length)];

  const candidates = deck.filter((candidate) => {
    if (candidate.year < fromYear || candidate.year > toYear) {
      return false;
    }

    if (playedYears.includes(candidate.year)) {
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
  const sorted = [...played, item].sort((a, b) => a.year - b.year);
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
