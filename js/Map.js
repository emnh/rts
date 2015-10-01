export function Map(options) {

  const game = options.game;
  const config = options.config;
  const addToScene = options.addToScene;
  const ground = game.ground;
  const createUnit = options.createUnit;

  function initCrystal(crystal) {
    crystal.remaining = 5000;
  }

  function initMap() {
    const protoCrystal = game.models.crystal;

    function createCrystals(z) {
      for (let i = 0; i < 10; i++) {
        const crystal = createUnit(protoCrystal);
        crystal.team = undefined;
        initCrystal(crystal);
        game.units.push(crystal);
        const x = (i - 5) * crystal.geometry.boundingSphere.radius * 2;
        const y = ground.getAlignment(crystal, new THREE.Vector3(x, 0, z));
        crystal.position.set(x, y, z);
      }
    }
    {
      const z1 = config.terrain.height / 2 - 100;
      createCrystals(z1);
      const z2 = -(config.terrain.height / 2 - 100);
      createCrystals(z2);
    }

    function addHQ(z) {
      const protohq = game.models.headquarters;
      const hq = createUnit(protohq);
      const x = 0;
      const y = ground.getAlignment(hq, new THREE.Vector3(x, 0, z));
      hq.position.set(x, y, z);
      game.units.push(hq);
    }
    {
      const z1 = config.terrain.height / 2 - 200;
      addHQ(z1);
      const z2 = -(config.terrain.height / 2 - 200);
      addHQ(z2);
    }

  }

  initMap();
}
