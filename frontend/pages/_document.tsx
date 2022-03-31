import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';
import config from '../lib/config';

export default function Document() {
  return (
    <Html>
      <Head />
      <body className={config.isOSRS() ? 'game-osrs' : 'game-rs'}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}