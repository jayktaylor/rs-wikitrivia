import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

import favicon from '../public/images/favicon.ico';

const Game = dynamic(() => import("../components/game"), { ssr: false });

export default function Index() {
  return (
    <>
      <Head>
        <title>RuneScape Wikitrivia</title>
        <link
          rel="shortcut icon"
          href={favicon.src}
        />
      </Head>

      <Game />
    </>
  );
}
