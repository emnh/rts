const M3Models = require('./m3/M3Models.js');
const Util = require('./Util.js').Util;
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

  const baseShader = new THREE.RawShaderMaterial({
    fragmentShader: $("#m3-fragment").text(),
    vertexShader: $("#m3-vertex").text()
  });

  this.modelRegister = [];
  this.modelByName = {};
  this.instanceRegister = [];

  function createObject(modelOptions, model, geomats, geometry) {
    const rotation = modelOptions.rotation;
    const scale = modelOptions.scale;
    let meshparent = new THREE.Object3D();
    // for bounding sphere etc
    meshparent.geometry = geometry.clone();
    meshparent.geomats = geomats;
    meshparent.modelOptions = modelOptions;
    meshparent.model = model;
    for (const geomat of geomats) {
      const [geo, mat] = geomat;
      let mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = modelOptions.id;
      mesh.rotation.set(rotation.x, rotation.y, rotation.z);
      mesh.scale.set(scale, scale, scale);
      mesh.updateMatrix();
      mesh.updateMatrixWorld();
      geomat.localMesh = mesh;
      //meshparent.add(mesh);
    }
    return meshparent;
  }

  this.addInstance = function(modelOptions) {
    const viewer = scope.viewer;
    const model = modelOptions.model;
    const onLoad = function(object) {
      const instance = object.instance;
      const teamId = 0;
      const modelInfo = scope.modelByName[model.model.name];
      const meshparent = createObject(modelOptions, model, modelInfo.geomats, modelInfo.geometry);
      meshparent.forPortrait = () => {
        //const geometry = modelInfo.geometry.clone();
        const geometry = new THREE.BoxGeometry(5, 5, 5);
        const material = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: 0x00FF00,
        });
        const mesh = new THREE.Mesh(geometry, material);
        // const meshClone = mesh.clone();
        // meshClone.position.copy(meshparent.position);
        // options.scene.add(meshClone);
        // meshparent.add(meshClone);
        return mesh;
      };
      meshparent.instance = instance;
      meshparent.instanceId = modelOptions.freeInstances.pop();
      scope.instanceRegister.push(meshparent);
      return meshparent;
    };

    const promise = new Promise((resolve, reject) => {
      const listener = (object) => {
        // console.log("load", object === asyncInstance, object, asyncInstance);
        if (object === asyncInstance) {
          // TODO: this seems to not work
          viewer.removeEventListener('load', listener);
          resolve(object);
        }
      };
      viewer.addEventListener('load', listener);
      const asyncInstance = model.instances[0];
      // const asyncInstance = viewer.loadInstance(model.source, false);
      // console.log("asyncInstance", asyncInstance);
      if (asyncInstance.ready) {
        // console.log("resolved immediately");
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

  this.addModel = function(modelOptions, model, viewer, progress) {
    console.log("model", model.model.name, model);

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
    // console.log("batchlength", batches.length);
    const l2 = batches.length;

    const geomats = [];
    const pTextures = [];
    const pTexturesBySource = {};

    // make a big hwbones texture for the whole animation
    const context = viewer.getContext();
    // in milliseconds
    const asyncinstance = model.instances[0];
    const instance = asyncinstance.instance;
    const skeleton = instance.skeleton;
    const hwbones = skeleton.hwbones;
    const hwbonesLength = hwbones.length;

    const sequenceId = model.model.sequencesByName[modelOptions.sequence];
    if (sequenceId !== undefined) {
      instance.setSequence(sequenceId);
    } else {
      console.warn("could't find sequence", modelOptions.sequence, model.model.name, model);
      instance.setSequence(0);
    }

    const animationLength = model.model.sequences[instance.sequence].animationEnd;
    const frames = Math.round(animationLength / context.frameTime);
    // console.log("frames", frames, model.model.name);
    const bighwbones = new Float32Array(frames * hwbonesLength);

    for (let i = 0; i < frames; i++) {
      asyncinstance.update(context);
      bighwbones.set(hwbones, i * hwbonesLength);
    }
    instance.hwTextureWidth = hwbonesLength / 4;
    instance.hwTextureHeight = frames;
    const hwTextureWidth = instance.hwTextureWidth;
    const hwTextureHeight = instance.hwTextureHeight;
    instance.bighwbones = bighwbones;
    const hwbonesTexture = 
      new THREE.DataTexture(
        bighwbones, 
        instance.hwTextureWidth,
        instance.hwTextureHeight,
        THREE.RGBAFormat,
        THREE.FloatType);
    instance.hwbonesTexture = hwbonesTexture
    hwbonesTexture.flipY = false;
    hwbonesTexture.unpackAlignment = 4;
    hwbonesTexture.generateMipmaps = false;
    hwbonesTexture.needsUpdate = true;
    hwbonesTexture.minFilter = THREE.NearestFilter;
    // end bighwbones
    
    // BEGIN UPDATEPOSITIONS
    // only to get bounding box
    var boneAtIndex = function(index) {
      const offset = index * 16;
      const elements = [];
      // console.log("index", index, hwbones.length);
      for (let i = 0; i < 16; i++) {
        elements[i] = hwbones[offset + i];
      }
      // console.log("elements", elements);
      const mat = new THREE.Matrix4();
      mat.set.apply(mat, elements);
      mat.transpose();
      // console.log("mat", mat);
      return mat;
    };

    const updatePositions = function() {
      const bgeo = new THREE.Geometry();
      const l = batches.length;
      for (let i = 0; i < l; i++) {
        const batch = batches[i];
        const region = batch.region;
        const offset = region.offset / 2;
        const boneLookup = region.firstBoneLookupIndex;
        for (let k = 0; k < region.elements; k++) {
          const element = offset + k;

          const floatIndex = elementArray[element] * vertexSize / 4;
          const byteIndex = elementArray[element] * vertexSize;
          const shortIndex = elementArray[element] * vertexSize / 2;

          const x = floats[floatIndex + 0];
          const y = floats[floatIndex + 1];
          const z = floats[floatIndex + 2];
          const pos = new THREE.Vector3(x, y, z);

          const weight =
            new THREE.Vector4(
              bytes[byteIndex + 12],
              bytes[byteIndex + 13],
              bytes[byteIndex + 14],
              bytes[byteIndex + 15]);

          const bone =
            new THREE.Vector4(
              bytes[byteIndex + 16],
              bytes[byteIndex + 17],
              bytes[byteIndex + 18],
              bytes[byteIndex + 19]);

          // debug code
          const weightedBone0 = boneAtIndex(bone.x + boneLookup).multiplyScalar(weight.x / 255);
          const weightedBone1 = boneAtIndex(bone.y + boneLookup).multiplyScalar(weight.y / 255);
          const weightedBone2 = boneAtIndex(bone.z + boneLookup).multiplyScalar(weight.z / 255);
          const weightedBone3 = boneAtIndex(bone.w + boneLookup).multiplyScalar(weight.w / 255);
          const position = new THREE.Vector4(pos.x, pos.y, pos.z, 1.0);
          const outposition4 = new THREE.Vector4();
          outposition4.add(position.clone().applyMatrix4(weightedBone0));
          outposition4.add(position.clone().applyMatrix4(weightedBone1));
          outposition4.add(position.clone().applyMatrix4(weightedBone2));
          outposition4.add(position.clone().applyMatrix4(weightedBone3));
          const outposition = new THREE.Vector3(outposition4.x, outposition4.y, outposition4.z);
          // console.log("position", pos);
          // console.log("outposition", outposition);
          bgeo.vertices.push(outposition);
        }
      }

      const rotation = modelOptions.rotation;
      const scale = modelOptions.scale;
      const mat = new THREE.Matrix4();
      mat.makeRotationX(rotation.x);
      bgeo.applyMatrix(mat);
      mat.makeRotationY(rotation.y);
      bgeo.applyMatrix(mat);
      mat.makeRotationZ(rotation.z);
      bgeo.applyMatrix(mat);
      mat.makeScale(scale, scale, scale);
      bgeo.applyMatrix(mat);
      
      bgeo.computeFaceNormals();
      bgeo.computeVertexNormals();

      /*const bufferGeo = new THREE.BufferGeometry();
      bufferGeo.fromGeometry(bgeo);
      bufferGeo.computeBoundingSphere();
      bufferGeo.computeBoundingBox();
      bufferGeo.computeVertexNormals();*/
      return bgeo;
    }
    const bgeo = updatePositions();
    // END UPDATEPOSITIONS
      
    const maxInstances = options.maxInstancesPerModel;
    modelOptions.freeInstances = [];
    for (let i = 0; i < maxInstances; i++) {
      modelOptions.freeInstances.push(i);
    }

    // BEGIN BIG VERTEX DECODE LOOP
    for (let i = 0; i < l2; i++) {
      const uvs = [
        [], [], [], [],
      ];

      const vertices = [];
      const weights = [];
      const bones = [];
      const normals = [];
      const tangents = [];

      const batch = batches[i];
      if (!instance.meshVisibilities[batch.regionId]) {
        console.log("invisible batch");
        continue;
      }
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
        // set unused uvis as well, to avoid switching GL programs
        for (let uvi = uvSetCount; uvi < 4; uvi++) {
          const uvx = shorts[shortIndex + 24 / 2 + 0 + 0/2];
          const uvy = shorts[shortIndex + 24 / 2 + 1 + 0/2];
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
      // TODO: select correct material
      // TODO: batch.material? looks funny with that
      let sourceMaterial = batch.material; // model.model.materials[1][0];
      if (modelOptions.materialHack) {
        sourceMaterial = model.model.materials[1][0];
      }
      const material = baseShader.clone();
      material.defines = {};
      material.uniforms = {
        u_firstBoneLookupIndex: { type: 'f', value: boneLookup },
        u_eyePos: { type: 'v3', value: options.camera.position },
        //u_lightPos: { type: 'v3', value: options.light.position },
        u_lightPos: { type: 'v3', value: new THREE.Vector3(0.0, 0.0, 10000.0) },
        // fragment
        u_specularity: { type: 'f', value: sourceMaterial.specularity },
        u_specMult: { type: 'f', value: sourceMaterial.specMult },
        u_emisMult: { type: 'f', value: sourceMaterial.emisMult * 0.0 },
        u_lightAmbient: { type: 'v4', value: new THREE.Vector4(0.02, 0.02, 0.02, 0) },
        modelViewMatrix: { type: 'm4', value: new THREE.Matrix4() },
        projectionMatrix2: { type: 'm4', value: new THREE.Matrix4() },
      };
      material.uniforms.u_boneMap = { type: 't', value: hwbonesTexture };
      material.uniforms.u_matrix_size = { type: 'f', value: 4 / hwTextureWidth };
      material.uniforms.u_texel_size = { type: 'f', value: 1 / hwTextureWidth };
      material.uniforms.u_frame_size = { type: 'f', value: 1 / hwTextureHeight };
      material.attributes = {
        position: { type: 'v3', value: vertices },
        a_weights: { type: 'v4', value: weights },
        a_bones: { type: 'v4', value: bones },
        a_normal: { type: 'v4', value: normals },
        a_tangent: { type: 'v4', value: tangents },
      };
      const setLayerSettings = function(layer, layerSettings) {
        for (var name in layerSettings) {
          const fullName = layer.uniforms[name];
          material.uniforms[fullName] = layerSettings[name];
        }
      }
      const layers = sourceMaterial.layers;
      const b2i = (b) => b ? 1 : 0;
      for (const layer of layers) {
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
                // console.log("2nd texture", tinfo.texture, layer.source, layer.uniforms.map);
                material.uniforms[layer.uniforms.map] = { type: 't', value: tinfo.texture };
              });
          } else {
            const promise = new Promise((resolve, reject) => {
              loader.load(mpqFile(layer.source), (texture) => {
                  // console.log("texture", texture, layer.source, layer.uniforms.map);
                  material.uniforms[layer.uniforms.map] = { type: 't', value: texture };
                  resolve({
                    texture: texture,
                    uniform: layer.uniforms.map
                  });
                }, progress);
            });
            pTextures.push(promise);
            pTexturesBySource[layer.source] = promise;
          }
        } else {
          if (layer.uniforms !== undefined) {
            setLayerSettings(layer, {
              enabled: { type: 'i', value: b2i(layer.active) },
            });
          }
        }
      }

      //material.defines[uvSets] = true;
      for (let uvi = 0; uvi < uvSetCount; uvi++) {
        material.attributes['a_uv' + uvi] = { type: 'v2', value: uvs[uvi] };
      }
      
      const geo = new THREE.InstancedBufferGeometry();

      let attributeCount = 0;
      for (const attributeName in material.attributes) {
        const attribute = material.attributes[attributeName];
        const value = attribute.value;
        let size = 4;
        if (attribute.type === 'v3') {
          size = 3;
        } else if (attribute.type === 'v2') {
          size = 2;
        }
        const attributeArray = new Float32Array(value.length * size);
        let i = 0;
        for (const val of value) {
          const arval = val.toArray();
          for (let j = 0; j < size; j++) {
            attributeArray[i + j] = arval[j];
          }
          i += size;
        }
        geo.addAttribute(attributeName, new THREE.BufferAttribute(attributeArray, size));
        //attribute.value = null;
        //material.attributes[attributeName] = attributeCount++;
      }
      material.attributes.a_mv0 = attributeCount++;
      material.attributes.a_mv1 = attributeCount++;
      material.attributes.a_mv2 = attributeCount++;
      material.attributes.a_mv3 = attributeCount++;
      material.attributes.a_teamColor = attributeCount++;
      material.attributes.a_frame = attributeCount++;

      //const ipositionAttribute = new THREE.InstancedBufferAttribute(new Float32Array(maxInstances * 16), 16, 1, false);
      //geo.addAttribute('a_iposition', ipositionAttribute);
      Util.createAttributeMatrix(geo, maxInstances);
      const teamColorsAttribute = new THREE.InstancedBufferAttribute(new Float32Array(maxInstances * 3), 3, 1, true);
      geo.addAttribute('a_teamColor', teamColorsAttribute);
      const frameAttribute = new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1, 1, true);
      geo.addAttribute('a_frame', frameAttribute);

      //geo.computeBoundingSphere();
      //geo.computeFaceNormals();
      //geo.computeVertexNormals();
      if (modelOptions.layers !== undefined) {
        if (modelOptions.layers.filter((l) => l == i).length === 0) {
          continue;
        };
      }
      geomats.push([geo, material]);
    }
    // END BIG VERTEX DECODE LOOP

    const pTexture = Promise.all(pTextures);

    const pReturn = new Promise((resolve, reject) => {
      pTexture.then(() => {

        //const meshparent = createObject(modelOptions, model, geomats);
        const meshparent = new THREE.Mesh(bgeo, new THREE.MeshBasicMaterial());
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
          geometry: bgeo,
        };
        scope.modelRegister.push(modelInfo);
        scope.modelByName[model.model.name] = modelInfo;

        for (const geomat of geomats) {
          const [geo, mat] = geomat;
          const sceneMesh = new THREE.Mesh(geo, mat);
          geomat.sceneMesh = sceneMesh;
          options.scene.add(sceneMesh);
        }

        resolve();
      });
    });

    return pReturn;
  }

  this.getModels = function() {
    return scope.modelOptionsList;
  }

  
  this.loadModels = function(progress) {
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

    viewer.addEventListener('progress', progress);

    const modelOptionsByName = {};
    let i = 0;
    for (const model of M3Models.M3Models) {
      model.id = i;
      i++;
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
      // set sequencesByName
      for (const model of models) {
        model.model.sequencesByName = {};
        let i = 0;
        for (const sequence of model.model.sequences) {
          model.model.sequencesByName[sequence.name] = i;
          i++;
        }
      }

      viewer.stepUpdate();

      // load my models
      const modelPromises = [];
      for (const model of models) {
        const modelOptions = modelOptionsByName[model.model.name]
        modelOptions.model = model;
        const promise = scope.addModel(modelOptions, model, viewer, progress);
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

    let oldTime = (new Date()).getTime() / 1000;
    var update = function() {
      // viewer.stepUpdate();
      const nowTime = (new Date()).getTime() / 1000;
      const elapsed = nowTime - oldTime;
      const FPS = 60;
      const elapsedFrames = elapsed * FPS;
      oldTime = nowTime;
      scope.instanceRegister = scope.instanceRegister.filter((unit) => {
        if (unit.dead) {
          for (const geomat of unit.geomats) {
            const [geo, mat] = geomat;
            const a_mv_matrix = (new THREE.Matrix4()).makeTranslation(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
            Util.updateAttributeMatrix(geo, a_mv_matrix, unit.instanceId);
          }
          unit.modelOptions.freeInstances.push(unit.instanceId);
        }
        return !unit.dead;
      });
      const focus = options.getCameraFocus(0, 0);
      for (let i = 0; i < scope.instanceRegister.length; i++) {
        const instance = scope.instanceRegister[i];
        for (let j = 0; j < instance.geomats.length; j++) {
          const geomat = instance.geomats[j];
          const geo = geomat[0];
          const mat = geomat[1];
          const mesh = geomat.localMesh;

          geomat.sceneMesh.position.copy(focus);

          const a_mv_matrix = new THREE.Matrix4();
          a_mv_matrix.multiply(options.camera.matrixWorldInverse);
          instance.updateMatrixWorld();
          a_mv_matrix.multiply(instance.matrixWorld);
          a_mv_matrix.multiply(mesh.matrix);
          Util.updateAttributeMatrix(geo, a_mv_matrix, instance.instanceId);

          const a_frame = geo.getAttribute('a_frame');
          a_frame.setX(instance.instanceId, a_frame.getX(instance.instanceId) + elapsedFrames);
          a_frame.needsUpdate = true;
          //geo.needsUpdate = true;

          // TODO: update eyePos
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
