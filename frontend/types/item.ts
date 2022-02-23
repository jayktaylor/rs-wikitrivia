export interface Item {
  examine: string;
  id: string;
  image: string;
  label: string;
  type: string;
  fullurl: string;
  year: number;
}

export type PlayedItem = Item & {
  played: {
    correct: boolean;
  };
};
