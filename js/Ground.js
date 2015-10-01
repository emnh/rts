const UnitType = require('./UnitType.js').UnitType;
const Util = require('./Util.js').Util;

export function Ground(options) {

  const game = options.game;
  const config = options.config;
  const ground = this;

  const heightField = [];
  const heightFieldIndex = [];

  function getSampler() {
    return new Promise((resolve, reject) => {
      const loader = new THREE.ImageLoader();
      
      const sampler = {};

      loader.load('models/maps/man.jpg', function(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, image.width, image.height);

        sampler.getHeight = (x, y) => {
          x = Math.round(x * image.width) % image.width;
          y = Math.round(y * image.height) % image.height;
          const i = (x + y * image.width) * 4;
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          return new THREE.Color(r, g, b).getHSL().l;
        };

        resolve(sampler);
      });
    });
  }

  function xramp(y, start, end, current, width, reverse) {
    const box = new THREE.Box2();
    box.expandByPoint(new THREE.Vector2(start.x, start.z));
    box.expandByPoint(new THREE.Vector2(end.x, end.z));
    box.min.x = -width / 2;
    box.max.x = width / 2;
    if (box.containsPoint(current)) {
      let delta = (current.y - box.min.y) / (box.max.y - box.min.y);
      if (reverse) {
        delta = 1 - delta;
      }
      return delta * (start.y - end.y);
    } else {
      return y;
    }
  }

  function plateau(y, centre, current, radius, height) {
    const dist = centre.distanceTo(current);
    if (dist <= radius) {
      return height;
    } else {
      return y;
    }
  }

  function initGround() {

    const samplerPromise = getSampler();

    // Materials
    const groundMaterial = new THREE.MeshLambertMaterial({
      map: THREE.ImageUtils.loadTexture( 'models/images/grass.jpg'),
    });
    groundMaterial.map.wrapS = groundMaterial.map.wrapT = THREE.RepeatWrapping;
    groundMaterial.map.repeat.set(config.terrain.width / 100.0, config.terrain.height / 100.0);

    // Ground
    game.noiseGen = new SimplexNoise();
    const groundGeometry = new THREE.PlaneBufferGeometry(
        config.terrain.width,
        config.terrain.height,
        config.terrain.xFaces,
        config.terrain.yFaces);
    groundGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));
    for (let i = 0; i <= config.terrain.xFaces; i++) {
      heightField[i] = [];
      heightFieldIndex[i] = [];
    }
    const stride = 3;
    const positionsLength = groundGeometry.attributes.position.count * stride;
    for (let i = 0; i < positionsLength; i += stride) {
      const x = groundGeometry.attributes.position.array[i];
      const z = groundGeometry.attributes.position.array[i + 2];
      let y = 0;
      // let edges of map be 0
      const eps = 0.01;
      if (x > -config.terrain.width / 2 + eps &&
          x < config.terrain.width / 2 - eps &&
          z > -config.terrain.height / 2 + eps &&
          z < config.terrain.height / 2 - eps) {
        const noise = game.noiseGen.noise(x / 100, z / 100);
        // normalize [-1,1] to [0,1]
        const normalNoise = (noise + 1) / 2;
        y = normalNoise * config.terrain.maxElevation + config.terrain.minElevation;
        const plateauHeight = config.terrain.maxElevation * 2;
        const plateauRadius = 500;
        y = plateau(y,
            new THREE.Vector2(0, config.terrain.height / 2),
            new THREE.Vector2(x, z),
            plateauRadius,
            plateauHeight);
        y = plateau(y,
            new THREE.Vector2(0, -config.terrain.height / 2),
            new THREE.Vector2(x, z),
            plateauRadius,
            plateauHeight);
        const rampWidth = 100;
        const rampLength = 200;
        y = xramp(y,
            new THREE.Vector3(0, plateauHeight, config.terrain.height / 2 - plateauRadius),
            new THREE.Vector3(0, 0, config.terrain.height / 2 - plateauRadius - rampLength),
            new THREE.Vector2(x, z),
            rampWidth);
        y = xramp(y,
            new THREE.Vector3(0, plateauHeight, -(config.terrain.height / 2 - plateauRadius)),
            new THREE.Vector3(0, 0, -(config.terrain.height / 2 - plateauRadius - rampLength)),
            new THREE.Vector2(x, z),
            rampWidth,
            true);
        groundGeometry.attributes.position.array[i + 1] = y;
      }

      const xi = (x + config.terrain.width / 2) * config.terrain.xFaces / config.terrain.width;
      const yi = (z + config.terrain.height / 2) * config.terrain.yFaces / config.terrain.height;
      heightField[xi][yi] = y;
      heightFieldIndex[xi][yi] = i;
    }
    groundGeometry.computeFaceNormals();
    groundGeometry.computeVertexNormals();

    game.scene.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    // ground.rotation.x = Math.PI / -2;
    game.scene.ground.receiveShadow = true;
    game.scene.ground.renderOrder = game.renderOrders.ground;
    options.addToScene(game.scene.ground);

    samplerPromise.then((sampler) => {
      for (let i = 0; i < positionsLength; i += 3) {
        const x = groundGeometry.attributes.position.array[i];
        const z = groundGeometry.attributes.position.array[i + 2];
        const xt = (x + config.terrain.width / 2) / config.terrain.width;
        const yt = (z + config.terrain.height / 2) / config.terrain.height;
        const xi = Math.round(xt * config.terrain.xFaces);
        const yi = Math.round(yt * config.terrain.yFaces);
        let y = sampler.getHeight(xt, yt) + config.terrain.minElevation;
        // const y = config.terrain.minElevation;
        if (!Util.isInt(y) && !Util.isFloat(y)) {
          throw 'doesnt work'
        }
        // XXX: disabled
        // groundGeometry.attributes.position.array[i + 1] = y;
        // game.heightField[xi][yi] = y;
      };
      game.scene.ground.geometry.computeFaceNormals();
      game.scene.ground.geometry.computeVertexNormals();
      game.scene.ground.geometry.attributes.position.needsUpdate = true;
    });

    game.mapBounds.min.x = -config.terrain.width / 2;
    game.mapBounds.min.y = 0;
    game.mapBounds.min.z = -config.terrain.height / 2;
    game.mapBounds.max.x = config.terrain.width / 2;
    game.mapBounds.max.y = config.terrain.maxElevation * 2;
    game.mapBounds.max.z = config.terrain.height / 2;
  }

  this.funTerrain = () => {
    const time = (new Date().getTime()) / 1000.0 - game.startTime;
    for (let i = 0; i < game.scene.ground.geometry.attributes.position.length; i += 3) {
      const x = game.scene.ground.geometry.attributes.position.array[i];
      const z = game.scene.ground.geometry.attributes.position.array[i + 2];
      const noise = game.noiseGen.noise3d(x / 100, z / 100, time);
      const normalNoise = (noise + 1) / 2;
      const y = normalNoise * config.terrain.maxElevation;
      game.scene.ground.geometry.attributes.position.array[i + 1] = y;

      const xi = (x + config.terrain.width / 2) * config.terrain.xFaces / config.terrain.width;
      const yi = (z + config.terrain.height / 2) * config.terrain.yFaces / config.terrain.height;
      heightField[xi][yi] = y;
    }
    game.scene.ground.geometry.computeFaceNormals();
    game.scene.ground.geometry.computeVertexNormals();
    game.scene.ground.geometry.attributes.position.needsUpdate = true;
  };

  this.setHeight = (x, y, height, increment, batch) => {
    // set height of nearest vertex
    const xi = Math.round((x + config.terrain.width / 2) * config.terrain.xFaces / config.terrain.width);
    const yi = Math.round((y + config.terrain.height / 2) * config.terrain.yFaces / config.terrain.height);
    // TODO: calculate heightFieldIndex instead of using map
    const i = heightFieldIndex[xi][yi];
    const newHeight = height + (increment ? heightField[xi][yi] : 0);
    game.scene.ground.geometry.attributes.position.array[i + 1] = newHeight;
    heightField[xi][yi] = newHeight;

    if (batch !== true) {
      game.scene.ground.geometry.computeFaceNormals();
      game.scene.ground.geometry.computeVertexNormals();
      game.scene.ground.geometry.attributes.position.needsUpdate = true;
    }
  };

  this.getHeight = (x, y) => {
    const xd = (x + config.terrain.width / 2) * config.terrain.xFaces / config.terrain.width;
    const yd = (y + config.terrain.height / 2) * config.terrain.yFaces / config.terrain.height;
    const xi = Math.floor(xd);
    const yi = Math.floor(yd);

    // https:// en.wikipedia.org/wiki/Bilinear_interpolation
    const x1 = x - (xd % 1) * config.terrain.width / config.terrain.xFaces;
    const x2 = x1 + 1 * config.terrain.width / config.terrain.xFaces;
    const y1 = y - (yd % 1) * config.terrain.height / config.terrain.yFaces;
    const y2 = y1 + 1 * config.terrain.height / config.terrain.yFaces;
    if (xi < 0 ||
        yi < 0 ||
        isNaN(xi) ||
        isNaN(yi) ||
        xi >= heightField.length ||
        xi + 1 >= heightField.length ||
        yi >= heightField[xi].length ||
        yi + 1 >= heightField[xi].length) {
      return 0;
    }
    const fQ11 = heightField[xi][yi];
    const fQ21 = heightField[xi + 1][yi];
    const fQ12 = heightField[xi][yi + 1];
    const fQ22 = heightField[xi + 1][yi + 1];

    const fxy1 = ((x2 - x) / (x2 - x1)) * fQ11 + ((x - x1) / (x2 - x1)) * fQ21;
    const fxy2 = ((x2 - x) / (x2 - x1)) * fQ12 + ((x - x1) / (x2 - x1)) * fQ22;
    const fyy = ((y2 - y) / (y2 - y1)) * fxy1 + ((y - y1) / (y2 - y1)) * fxy2;

    return fyy;
  };

  this.getAlignment = (unit, position) => {
    if (position === undefined) {
      position = unit.position;
    }
    const groundHeight = ground.getHeight(position.x, position.z);
    let y = groundHeight - unit.bbox.min.y * unit.scale.y;
    if (unit.type === UnitType.Air) {
      y += config.units.airAltitude;
    }
    return y;
  };

  this.elevate = (amount) => {
    const focus = options.getCameraFocus(0, 0);
    const x = focus.x;
    const z = focus.z;
    ground.setHeight(x, z, amount, true, false);
  };

  initGround();
}
