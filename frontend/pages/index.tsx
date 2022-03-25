import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import config from '../lib/config';

import favicon from '../public/images/favicon.ico';
import faviconOSRS from '../public/images/favicon-osrs.ico';

const Game = dynamic(() => import("../components/game"), { ssr: false });

export default function Index() {
  return (
    <>
      <Head>
        <title>{config.game.toLowerCase() === 'osrs' ? 'Old School ' : ''}RuneScape Wiki Timeline</title>
        <link
          rel="shortcut icon"
          href={config.game.toLowerCase() === 'osrs' ? faviconOSRS.src : favicon.src}
        />
      </Head>

      <Game />
    </>
  );
}
