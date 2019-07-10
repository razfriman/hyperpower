# Hyperpower2

Extension for Hyper that turns on power mode.

- Simple configuration in `.hyper.js`

![hyper](https://user-images.githubusercontent.com/1769935/61003168-a33b9380-a3a6-11e9-83e5-76b80ebc1a14.gif)

## How to use

Install [Hyper](https://hyper.is) and add `hyperpower2`
to `plugins` in `~/.hyper.js`.

## Configure

Add a `hyperPower` section to your hyper configuration (`~/.hyper.js`) with any of the following properties. Missing properties will use these default values:

```js
module.exports = {
  config: {
    // rest of the config
    hyperPower: {
      shake: false,
      colorMode: 'cursor', // 'cursor', 'custom', 'rainbow'
      colors: ['#eee'],
      particleSize: 3,
      minSpawnCount: 10,
      maxSpawnCount: 12,
      maximumParticles: 500
    }
  }
  // rest of the file
};
```

## Credits

Based on [`power-mode`](https://atom.io/packages/power-mode) and
[`rage-power`](https://github.com/itszero/rage-power) and
[`hyperpower`](https://github.com/zeit/hyperpower).

## License

MIT
