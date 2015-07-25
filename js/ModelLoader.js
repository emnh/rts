const M3Models = require('./M3Models.js');
const mpqFile = M3Models.mpqFile;

export function ModelLoader(options) {

  const scope = this;
  
  const teamColors = [
    [255, 3, 3],
    [0, 66, 255],
    [28, 230, 185],
    [84, 0, 129],
    [255, 252, 1],
    [254, 138, 14],
    [32, 192, 0],
    [229, 91, 176],
    [149, 150, 151],
    [126, 191, 241],
    [16, 98, 70],
    [78, 42, 4],
    [40, 40, 40],
    [0, 0, 0],
    ];

  this.modelRegister = [];
  this.modelByName = {};
  this.instanceRegister = [];

  function createObject(modelOptions, model, geomats) {
    const rotation = modelOptions.rotation;
    const scale = modelOptions.scale;
    let meshparent = new THREE.Object3D();
    meshparent.geomats = geomats;
    meshparent.modelOptions = modelOptions;
    meshparent.model = model;
    for (const geomat of geomats) {
      const [geo, mat] = geomat;
      let mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.set(rotation.x, rotation.y, rotation.z);
      mesh.scale.set(scale, scale, scale);
      meshparent.add(mesh);
    }
    return meshparent;
  }

  this.addInstance = function(modelOptions) {
    const viewer = scope.viewer;
    const model = modelOptions.model;
    const onLoad = function(object) {
      const context = viewer.getContext();
      object.update(context);
      const instance = object.instance;
      const sequenceId = model.model.sequencesByName[modelOptions.sequence];
      if (sequenceId !== undefined) {
        instance.setSequence(sequenceId);
      } else {
        console.warn("could't find sequence", modelOptions.sequence, model.model.name, model);
        instance.setSequence(0);
      }
      const teamId = 0; //instance.teamColor;
      const skeleton = instance.skeleton;
      const hwbones = skeleton.hwbones;
      const hwbonesTexture = new THREE.DataTexture(hwbones, hwbones.length / 4, 1, THREE.RGBAFormat, THREE.FloatType);
      hwbonesTexture.flipY = false;
      hwbonesTexture.unpackAlignment = 4;
      hwbonesTexture.generateMipmaps = false;
      hwbonesTexture.needsUpdate = true;
      hwbonesTexture.minFilter = THREE.NearestFilter;
      //console.log("modelByName", scope.modelByName, model.model.name);
      const modelInfo = scope.modelByName[model.model.name];
      const newGeoMats = [];
      let batchIndex = 0;
      for (const geomat of modelInfo.geomats) {
        const [geo, material] = geomat;
        const batch = model.model.batches[batchIndex];
        if (instance.meshVisibilities[batch.regionId]) {
          newGeoMats.push([geo, material.clone()]);
        }
        batchIndex++;
      }
      let i = 0;
      for (const geomat of newGeoMats) {
        //const [geo, material] = geomat;
        const geo = geomat[0];
        const material = geomat[1];
        const oldMaterial = modelInfo.geomats[i][1];
        i++;
        // set textures. strange workaround for cloning problem
        for (const pTexture of modelInfo.pTextures) {
          pTexture.then((tinfo) => {
            material.uniforms[tinfo.uniform].value = tinfo.texture;
          });
        }
        material.uniforms.u_boneMap = { type: 't', value: hwbonesTexture, needsUpdate: true };
        material.uniforms.u_matrix_size = { type: 'f', value: 4 / (hwbones.length / 4) };
        material.uniforms.u_texel_size = { type: 'f', value: 1 / (hwbones.length / 4)};
        material.uniforms.u_teamColor = {
                type: 'c',
                value: new THREE.Color(
                  teamColors[teamId][0],
                  teamColors[teamId][1],
                  teamColors[teamId][2])
              };
      }
      const meshparent = createObject(modelOptions, model, newGeoMats);
      meshparent.position.set(Math.random() * 100, 300, Math.random() * 100);
      meshparent.hwbones = hwbones;
      meshparent.instance = instance;
      scope.instanceRegister.push(meshparent);
      //console.log("resolve asyncInstance");
      return meshparent;
    };

    const promise = new Promise((resolve, reject) => {
      const listener = (object) => {
        //console.log("load", object === asyncInstance, object, asyncInstance);
        if (object === asyncInstance) {
          // TODO: this seems to not work
          viewer.removeEventListener('load', listener);
          resolve(object);
        }
      };
      viewer.addEventListener('load', listener);
      const asyncInstance = viewer.loadInstance(model.source, false);
      //console.log("asyncInstance", asyncInstance);
      if (asyncInstance.ready) {
        //console.log("resolved immediately");
        resolve(asyncInstance);
      }
    });
    return new Promise((resolve, reject) => {
      promise.then((object) => {
        const meshparent = onLoad(object);
        resolve(meshparent);
      });
    });
  }

  this.addModel = function(modelOptions, model, viewer) {
    console.log("model", model);

    //const geo = new THREE.BufferGeometry();
    const vertices = model.model.parser.vertices;
    const floats = new Float32Array(vertices.buffer);
    const bytes = new Uint8Array(vertices.buffer);
    const shorts = new Int16Array(vertices.buffer);
    const vertexSize = model.model.vertexSize;
    //const positions = new Float32Array(vertices.length * 3 / vertexSize);

    const div = model.model.parser.divisions[0];
    const regions = div.regions;
    const triangles = div.triangles;
    const batches = model.model.batches;

    const offsets = [];

    let totalElements = 0;
    const l = regions.length;
    for (let i = 0; i < l; i++) {
        offsets[i] = totalElements;
        totalElements += regions[i].triangleIndicesCount;
    }

    const elementArray = new Uint16Array(totalElements);
    const edgeArray = new Uint16Array(totalElements * 2);
    // the following fills in elementArray and edgeArray
    for (let i = 0; i < l; i++) {
        let r = (new M3.Region(regions[i], div.triangles, elementArray, edgeArray, offsets[i]));
    }

        
    const uvSetCount = model.model.uvSetCount;
    //console.log("batchlength", batches.length);
    const l2 = batches.length;

    const geomats = [];
    const pTextures = [];
    const pTexturesBySource = {};

    for (let i = 0; i < l2; i++) {
      const uvs = [
        [], [], [], [],
      ];
      let faceIndex = 0;

      const vertices = [];
      const weights = [];
      const bones = [];
      const normals = [];
      const tangents = [];

      const batch = batches[i];
      const region = batch.region;
      const offset = region.offset / 2;
      const boneLookup = region.firstBoneLookupIndex;
      for (let k = 0; k < region.elements; k++) {
        const element = offset + k;
        // divide by float size
        const floatIndex = elementArray[element] * vertexSize / 4;
        const byteIndex = elementArray[element] * vertexSize;
        const shortIndex = elementArray[element] * vertexSize / 2;

        const x = floats[floatIndex + 0];
        const y = floats[floatIndex + 1];
        const z = floats[floatIndex + 2];
        const pos = new THREE.Vector3(x, y, z);
        vertices.push(pos);

        const weight =
          new THREE.Vector4(
            bytes[byteIndex + 12],
            bytes[byteIndex + 13],
            bytes[byteIndex + 14],
            bytes[byteIndex + 15]);
        weights.push(weight);

        const bone =
          new THREE.Vector4(
            bytes[byteIndex + 16],
            bytes[byteIndex + 17],
            bytes[byteIndex + 18],
            bytes[byteIndex + 19]);
        bones.push(bone);

        const normal =
          new THREE.Vector4(
            bytes[byteIndex + 20],
            bytes[byteIndex + 21],
            bytes[byteIndex + 22],
            bytes[byteIndex + 23]);
        normals.push(normal);

        for (let uvi = 0; uvi < uvSetCount; uvi++) {
          const uvx = shorts[shortIndex + 24 / 2 + 0 + uvi/2];
          const uvy = shorts[shortIndex + 24 / 2 + 1 + uvi/2];
          const uvPos = new THREE.Vector2(uvx, uvy);
          uvs[uvi].push(uvPos);
        }

        const tangent =
          new THREE.Vector4(
            bytes[byteIndex + 24 + uvSetCount * 4],
            bytes[byteIndex + 25 + uvSetCount * 4],
            bytes[byteIndex + 26 + uvSetCount * 4],
            bytes[byteIndex + 27 + uvSetCount * 4]);
        tangents.push(tangent);
      }
      
      const loader = new THREE.DDSLoader();
      const uvSets = "EXPLICITUV" + (uvSetCount - 1);
      const vscommon = SHADERS.vsbonetexture + SHADERS.svscommon + "\n";
      const vsstandard = vscommon + SHADERS.svsstandard;
      const pscommon = SHADERS.spscommon + "\n";
      const psstandard = pscommon + SHADERS.spsstandard;
      // TODO: select correct material
      // TODO: batch.material? looks funny with that
      const sourceMaterial = batch.material; // model.model.materials[1][0];
      const material = new THREE.ShaderMaterial({
        /*defines: {
        },*/
        uniforms: {
          u_firstBoneLookupIndex: { type: 'f', value: boneLookup },
          u_eyePos: { type: 'v3', value: options.camera.position },
          //u_lightPos: { type: 'v3', value: options.light.position },
          u_lightPos: { type: 'v3', value: new THREE.Vector3(0.0, 0.0, 0.0) },
          // fragment
          u_specularity: { type: 'f', value: sourceMaterial.specularity },
          u_specMult: { type: 'f', value: sourceMaterial.specMult + 10 },
          u_emisMult: { type: 'f', value: sourceMaterial.emisMult * 0.1 },
          //u_lightAmbient: { type: 'v4', value: new THREE.Vector4(0.02, 0.02, 0.02, 0) },
          u_lightAmbient: { type: 'v4', value: new THREE.Vector4(0.5, 0.5, 0.5, 0) },
        },
        attributes: {
          a_position: { type: 'v3', value: vertices },
          a_weights: { type: 'v4', value: weights },
          a_bones: { type: 'v4', value: bones },
          a_normal: { type: 'v4', value: normals },
          a_tangent: { type: 'v4', value: tangents },
        },
        //fragmentShader: psstandard,
        //vertexShader: vsstandard,
        fragmentShader: $("#m3-fragment").text(),
        vertexShader: $("#m3-vertex").text()
      });
      const setLayerSettings = function(layer, layerSettings) {
        for (var name in layerSettings) {
          const fullName = layer.uniforms[name];
          material.uniforms[fullName] = layerSettings[name];
        }
      }
      const layers = sourceMaterial.layers;
      const layersByType = {}
      const b2i = (b) => b ? 1 : 0;
      for (const layer of layers) {
        layersByType[layer.type] = layer;
        if (layer.active) {
          setLayerSettings(layer, {
            enabled: { type: 'i', value: b2i(layer.active) },
            op: { type: 'f', value: layer.op },
            channels: { type: 'f', value: layer.colorChannels },
            teamColorMode: { type: 'f', value: layer.teamColorMode },
            invert: { type: 'i', value: b2i(layer.invert) },
            clampResult: { type: 'i', value: b2i(layer.clampResult) },
            uvCoordinate: { type: 'f', value: layer.uvCoordinate },
          });
          if (pTexturesBySource[layer.source] !== undefined) {
            pTexturesBySource[layer.source].then((tinfo) => {
              //console.log("2nd texture", tinfo.texture, layer.source, layer.uniforms.map);
              material.uniforms[layer.uniforms.map] = { type: 't', value: tinfo.texture };
            });
          } else {
            const promise = new Promise((resolve, reject) => {
              loader.load(mpqFile(layer.source), (texture) => {
                //console.log("texture", texture, layer.source, layer.uniforms.map);
                material.uniforms[layer.uniforms.map] = { type: 't', value: texture };
                resolve({
                  texture: texture,
                  uniform: layer.uniforms.map
                });
              });
            });
            pTextures.push(promise);
            pTexturesBySource[layer.source] = promise;
          }
        }
      }

      material.defines[uvSets] = true;
      for (let uvi = 0; uvi < uvSetCount; uvi++) {
        material.attributes['a_uv' + uvi] = { type: 'v2', value: uvs[uvi] };
      }
      
      const geo = new THREE.BufferGeometry();
      for (const attributeName in material.attributes) {
        const attribute = material.attributes[attributeName];
        const value = attribute.value;
        let size = 4;
        // let Type = Uint8Array;
        let Type = Float32Array;
        if (attribute.type === 'v3') {
          Type = Float32Array;
          size = 3;
        } else if (attribute.type === 'v2') {
          // Type = Int16Array;
          Type = Float32Array;
          size = 2;
        }
        const attributeArray = new Type(value.length * size);
        let i = 0;
        for (const val of value) {
          const arval = val.toArray();
          // if (Math.random() < 0.001) console.log("arval", arval);
          for (let j = 0; j < size; j++) {
            attributeArray[i + j] = arval[j];
          }
          i += size;
        }
        if (attributeName === 'a_position') {
          geo.addAttribute('position', new THREE.BufferAttribute(attributeArray, size));
        }
        geo.addAttribute(attributeName, new THREE.BufferAttribute(attributeArray, size));
        attribute.value = null;
      }
      geo.computeBoundingSphere();
      geo.computeFaceNormals();
      geo.computeVertexNormals();
      geomats.push([geo, material]);
    }

    const pTexture = Promise.all(pTextures);

    const pReturn = new Promise((resolve, reject) => {
      pTexture.then(() => {

        const meshparent = createObject(modelOptions, model, geomats);
        options.scene.add(meshparent);
        const bboxHelper = new THREE.BoundingBoxHelper(meshparent, 0);
        bboxHelper.update();
        modelOptions.bboxHelper = bboxHelper;

        options.scene.remove(meshparent);
        const modelInfo = {
          modelOptions,
          model,
          geomats,
          pTextures,
        };
        scope.modelRegister.push(modelInfo);
        scope.modelByName[model.model.name] = modelInfo;
        resolve();
      });
    });

    return pReturn;
  }

  this.getModels = function() {
    return scope.modelOptionsList;
  }

  this.loadModels = function() {
    const canvas = $("canvas#viewer");
    const viewer = ModelViewer(canvas[0], mpqFile);
    viewer.registerTextureHandler(".blp", BLPTexture);
    viewer.registerTextureHandler(".tga", TGATexture);
    viewer.registerModelHandler(".mdx", Mdx.Model, Mdx.ModelInstance, 1);
    //viewer.registerTextureHandler(".dds", DDSTexture);
    viewer.registerModelHandler(".m3", M3.Model, M3.ModelInstance, 1);
    viewer.clear();

    scope.viewer = viewer;
    scope.modelOptionsList = M3Models.M3Models;

    const modelOptionsByName = {};
    for (const model of M3Models.M3Models) {
      modelOptionsByName[model.name] = model;
      viewer.load(model.path, mpqFile);
    }
    const models = viewer.getModels();
    const waitForIt = function(resolve) {
      var ready = true;
      for (var i = 0; i < models.length; i++) {
        var model = models[i];
        ready = ready && model.ready;
      }
      if (ready) {
        resolve();
      }
    }
    const onLoad = function(resolve) {
      // set instance properties
      for (const model of models) {
        for (const instance of model.instances) {
          model.model.sequencesByName = {};
          let i = 0;
          for (const sequence of model.model.sequences) {
            model.model.sequencesByName[sequence.name] = i;
            i++;
          }
          //instance.setSequence(model.model.sequencesByName['Walk']);
          //instance.setTeamColor(0);
        }
      }

      viewer.stepUpdate();

      // load my models
      const modelPromises = [];
      for (const model of models) {
        const modelOptions = modelOptionsByName[model.model.name]
        modelOptions.model = model;
        const promise = scope.addModel(modelOptions, model, viewer);
        modelPromises.push(promise);
      }
      const modelPromise = Promise.all(modelPromises);

      // load my instances
      modelPromise.then(() => {
        const instancePromises = [];
        /*for (const model of models) {
          const modelOptions = modelOptionsByName[model.model.name]
          instancePromises.push(
            scope.addInstance(modelOptions)
            );
        }*/
        const instancePromise = Promise.all(instancePromises);
        instancePromise.then(resolve);
      });
    }

    const allModelsLoaded = new Promise((resolve, reject) => {
      viewer.addEventListener('load', () => waitForIt(resolve));
    });

    var update = function() {
      viewer.stepUpdate();
      for (const instance of scope.instanceRegister) {
        for (const geomat of instance.geomats) {
          //const [geo, mat] = geomat;
          const geo = geomat[0];
          const mat = geomat[1];
          //console.log("hwbones", instance.hwbones[0], instance.hwbones);
          mat.uniforms.u_boneMap.value.needsUpdate = true;
        }
      }
    };
    scope.update = update;

    const returnPromise = new Promise((resolve, reject) => {
      allModelsLoaded.then(() => onLoad(resolve));
    });
    
    return returnPromise;
  }
}
