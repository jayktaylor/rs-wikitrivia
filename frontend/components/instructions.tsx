import React from "react";
import styles from "../styles/instructions.module.scss";
import Button from "./button";
import Score from "./score";
import config from '../lib/config';

import RSWLogo from '../public/images/RSW_logo.svg';
import OSWLogo from '../public/images/OSRSW_logo.png';

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
          src={config.game.toLowerCase() === 'osrs' ? OSWLogo.src : RSWLogo.src}
          width='100px'
        />
        <h2>Place the cards on the timeline in the correct order.</h2>
        <h3>Earn a <strong>10</strong> streak for a <span className={styles.silver}>silver medal</span>, and a <strong>20</strong> streak for a <span className={styles.gold}>gold medal</span>.</h3>
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
              href={`https://${config.game.toLowerCase() === 'osrs' ? 'oldschool.' : ''}runescape.wiki`}
              target="_blank"
              rel="noopener noreferrer"
            >
              the RuneScape Wiki
            </a>
            .
          </div>
          <div className={styles.copyright}>
            Created by <a href="https://github.com/jayktaylor/rs-wikitrivia/" target="_blank" rel="noopener noreferrer">Jayden Bailey</a>, forked from a game by <a href="https://github.com/tom-james-watson" target="_blank" rel="noopener noreferrer">Tom Watson</a>.<br />
            RuneScape and RuneScape Old School are the trademarks of Jagex Limited and are used with the permission of Jagex.
          </div>
        </div>
      </div>
    </div>
  );
}
