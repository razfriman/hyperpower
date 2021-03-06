const defaultConfig = {
  shake: false,
  colorMode: 'custom', // 'cursor', 'custom', 'rainbow'
  colors: ['red', 'green', 'blue'],
  particleSize: 3,
  minSpawnCount: 10,
  maxSpawnCount: 12,
  maximumParticles: 500
};
const throttle = require('lodash.throttle');
const Color = require('color');
const nameToHex = require('convert-css-color-name-to-hex');
const toHex = str => Color(nameToHex(str)).hex();
const values = require('lodash.values');
const random = require('lodash.random');
const RAINBOW_COLORS = [
  '#a800ff',
  '#0079ff',
  '#00f11d',
  '#ffef00',
  '#ff7f00',
  '#ff0900'
].map(color => Color(color).hex());

// Constants for the particle simulation.
const PARTICLE_GRAVITY = 0.075;
const PARTICLE_ALPHA_FADEOUT = 0.96;
const PARTICLE_VELOCITY_RANGE = {
  x: [-1, 1],
  y: [-3.5, -1.5]
};

// The `decorateTerm` hook allows our extension to return a higher order react component.
// It supplies us with:
// - Term: The terminal component.
// - React: The enture React namespace.
// - notify: Helper function for displaying notifications in the operating system.
//
// The portions of this code dealing with the particle simulation are heavily based on:
// - https://atom.io/packages/power-mode
// - https://github.com/itszero/rage-power/blob/master/index.jsx
exports.decorateTerm = (Term, { React, notify }) => {
  // Define and return our higher order component.
  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      // Since we'll be passing these functions around, we need to bind this
      // to each.
      this._getColors = this._getColors.bind(this);
      this._drawFrame = this._drawFrame.bind(this);
      this._resizeCanvas = this._resizeCanvas.bind(this);
      this._onDecorated = this._onDecorated.bind(this);
      this._onCursorMove = this._onCursorMove.bind(this);
      this._shake = throttle(this._shake.bind(this), 100, { trailing: false });
      this._spawnParticles = throttle(this._spawnParticles.bind(this), 25, {
        trailing: false
      });
      // Initial particle state
      this._particles = [];
      // We'll set these up when the terminal is available in `_onDecorated`
      this._div = null;
      this._canvas = null;

      this._loadSettings();
      config.subscribe(() => {
        this._loadSettings();
      });
    }

    _loadSettings() {
      const userSettings = config.getConfig().hyperPower || {};
      this._settings = {
        shake: userSettings.shake || defaultConfig.shake,
        colorMode: userSettings.colorMode || defaultConfig.colorMode,
        colors: userSettings.colors || defaultConfig.colors,
        particleSize: userSettings.particleSize || defaultConfig.particleSize,
        minSpawnCount:
          userSettings.minSpawnCount || defaultConfig.minSpawnCount,
        maxSpawnCount:
          userSettings.minSpawnCount || defaultConfig.maxSpawnCount,
        maximumParticles:
          userSettings.maximumParticles || defaultConfig.maximumParticles
      };

      if (this._settings.minSpawnCount < 0) {
        this._settings.minSpawnCount = 0;
      }

      if (this._settings.maxSpawnCount < this._settings.minSpawnCount) {
        this._settings.maxSpawnCount = this._settings.minSpawnCount;
      }
    }

    _getColors() {
      if (this._settings.colorMode === 'cursor') {
        return [toHex(this.props.cursorColor)];
      } else if (this._settings.colorMode === 'rainbow') {
        return RAINBOW_COLORS;
      } else {
        return values(this._settings.colors).map(toHex);
      }
    }

    _onDecorated(term) {
      if (this.props.onDecorated) this.props.onDecorated(term);
      this._div = term ? term.termRef : null;
      this._initCanvas();
    }

    // Set up our canvas element we'll use to do particle effects on.
    _initCanvas() {
      this._canvas = document.createElement('canvas');
      this._canvas.style.position = 'absolute';
      this._canvas.style.top = '0';
      this._canvas.style.pointerEvents = 'none';
      this._canvasContext = this._canvas.getContext('2d');
      this._canvas.width = window.innerWidth;
      this._canvas.height = window.innerHeight;
      document.body.appendChild(this._canvas);
      window.requestAnimationFrame(this._drawFrame);
      window.addEventListener('resize', this._resizeCanvas);
    }

    _resizeCanvas() {
      this._canvas.width = window.innerWidth;
      this._canvas.height = window.innerHeight;
    }

    // Draw the next frame in the particle simulation.
    _drawFrame() {
      const particleSize = this._settings.particleSize;
      const maximumParticles = this._settings.maximumParticles;
      this._particles.length &&
        this._canvasContext.clearRect(
          0,
          0,
          this._canvas.width,
          this._canvas.height
        );
      this._particles.forEach(particle => {
        particle.velocity.y += PARTICLE_GRAVITY;
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.alpha *= PARTICLE_ALPHA_FADEOUT;
        this._canvasContext.fillStyle = `rgba(${particle.color.join(',')}, ${
          particle.alpha
        })`;
        this._canvasContext.fillRect(
          Math.round(particle.x - 1),
          Math.round(particle.y - 1),
          particleSize,
          particleSize
        );
      });
      this._particles = this._particles
        .slice(Math.max(this._particles.length - maximumParticles, 0))
        .filter(particle => particle.alpha > 0.1);
      if (this._particles.length > 0 || this.props.needsRedraw) {
        window.requestAnimationFrame(this._drawFrame);
      }
      this.props.needsRedraw = this._particles.length === 0;
    }

    // Pushes `PARTICLE_NUM_RANGE` new particles into the simulation.
    _spawnParticles(x, y) {
      // const { colors } = this.props;
      const length = this._particles.length;
      const colors = this._getColors();
      const numParticles = random(
        this._settings.maxSpawnCount,
        this._settings.maxSpawnCount
      );
      for (let i = 0; i < numParticles; i++) {
        const colorCode = colors[i % colors.length];
        const r = parseInt(colorCode.slice(1, 3), 16);
        const g = parseInt(colorCode.slice(3, 5), 16);
        const b = parseInt(colorCode.slice(5, 7), 16);
        const color = [r, g, b];
        this._particles.push(this._createParticle(x, y, color));
      }
      if (length === 0) {
        window.requestAnimationFrame(this._drawFrame);
      }
    }

    // Returns a particle of a specified color
    // at some random offset from the input coordinates.
    _createParticle(x, y, color) {
      return {
        x,
        y: y,
        alpha: 1,
        color,
        velocity: {
          x:
            PARTICLE_VELOCITY_RANGE.x[0] +
            Math.random() *
              (PARTICLE_VELOCITY_RANGE.x[1] - PARTICLE_VELOCITY_RANGE.x[0]),
          y:
            PARTICLE_VELOCITY_RANGE.y[0] +
            Math.random() *
              (PARTICLE_VELOCITY_RANGE.y[1] - PARTICLE_VELOCITY_RANGE.y[0])
        }
      };
    }

    // 'Shakes' the screen by applying a temporary translation
    // to the terminal container.
    _shake() {
      // TODO: Maybe we should do this check in `_onCursorMove`?
      if (!this._settings.shake) return;

      const intensity = 1 + 2 * Math.random();
      const x = intensity * (Math.random() > 0.5 ? -1 : 1);
      const y = intensity * (Math.random() > 0.5 ? -1 : 1);
      this._div.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      setTimeout(() => {
        if (this._div) this._div.style.transform = '';
      }, 75);
    }

    _onCursorMove(cursorFrame) {
      if (this.props.onCursorMove) this.props.onCursorMove(cursorFrame);
      this._shake();
      const { x, y } = cursorFrame;
      const origin = this._div.getBoundingClientRect();
      requestAnimationFrame(() => {
        this._spawnParticles(x + origin.left, y + origin.top);
      });
    }

    render() {
      // Return the default Term component with our custom onTerminal closure
      // setting up and managing the particle effects.
      return React.createElement(
        Term,
        Object.assign({}, this.props, {
          onDecorated: this._onDecorated,
          onCursorMove: this._onCursorMove
        })
      );
    }

    componentWillUnmount() {
      document.body.removeChild(this._canvas);
    }
  };
};
