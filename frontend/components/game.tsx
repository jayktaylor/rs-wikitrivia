import React, { useState } from "react";
import axios from "axios";
import { GameState } from "../types/game";
import { Item } from "../types/item";
import createState from "../lib/create-state";
import Board from "./board";
import Loading from "./loading";
import Instructions from "./instructions";
import config from '../lib/config';

const data: Item[] = require(`../public/final_${config.isOSRS() ? 'os': ''}rs.json`);

export default function Game() {
  const [state, setState] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);

  React.useEffect(() => {
    const fetchGameData = async () => {
      const items: Item[] = data
        // Filter out questions which give away their answers
        .filter((item: Item) => {
          return !item.label.includes(String(item.year))
        })
        .filter((item: Item) => !item.examine.includes(String(item.year)))
      setItems(items);
    };

    fetchGameData();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (items !== null) {
        setState(await createState(items));
        setLoaded(true);
      }
    })();
  }, [items]);

  const resetGame = React.useCallback(() => {
    (async () => {
      if (items !== null) {
        setState(await createState(items));
      }
    })();
  }, [items]);

  const [highscore, setHighscore] = React.useState<number>(
    Number(localStorage.getItem(`highscore${config.isOSRS() ? '-osrs' : ''}`) ?? "0")
  );

  const updateHighscore = React.useCallback((score: number) => {
    localStorage.setItem(`highscore${config.isOSRS() ? '-osrs' : ''}`, String(score));
    setHighscore(score);
  }, []);

  if (!loaded || state === null) {
    return <Loading />;
  }

  if (!started) {
    return (
      <Instructions highscore={highscore} start={() => setStarted(true)} />
    );
  }

  return (
    <Board
      highscore={highscore}
      state={state}
      setState={setState}
      resetGame={resetGame}
      updateHighscore={updateHighscore}
    />
  );
}
