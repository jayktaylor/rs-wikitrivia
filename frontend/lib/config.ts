const config = {
  game: 'osrs',
  isOSRS: () => {
    return config.game.toLowerCase() === 'osrs'
  }
}

export default config;