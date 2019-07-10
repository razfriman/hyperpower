# Hyperpower

Extension for Hyper that turns on power mode.

- Simple configuration in `.hyper.js`

![hyper](https://cloud.githubusercontent.com/assets/13041/16820268/13c9bfe6-4905-11e6-8fe4-baf8fc8d9293.gif)

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
