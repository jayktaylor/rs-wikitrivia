import React from "react";
import styles from "../styles/instructions.module.scss";
import Button from "./button";
import Score from "./score";

import RSWLogo from '../public/images/RSW_logo.svg';

interface Props {
  highscore: number;
  start: () => void;
}

export default function Instructions(props: Props) {
  const { highscore, start } = props;

  return (
    <div className={styles.instructions}>
      <div className={styles.wrapper}>
        <img
          src={RSWLogo.src}
          width='100px'
        />
        <h2>Place the cards on the timeline in the correct order.</h2>
        {highscore !== 0 && (
          <div className={styles.highscoreWrapper}>
            <Score score={highscore} title="Best streak" />
          </div>
        )}
        <Button onClick={start} text="Start game" />
        <div className={styles.about}>
          <div>
            All data sourced from{" "}
            <a
              href="https://runescape.wiki"
              target="_blank"
              rel="noopener noreferrer"
            >
              the RuneScape Wiki
            </a>
            .<br />Have feedback? Please report it on{" "}
            <a
              href="https://github.com/jayktaylor/rs-wikitrivia/issues/"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            .
          </div>
          <div className={styles.copyright}>
            RuneScape and RuneScape Old School are the trademarks of Jagex Limited and are used with the permission of Jagex.
          </div>
        </div>
      </div>
    </div>
  );
}
