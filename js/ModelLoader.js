const M3Models = require('./M3Models.js');
const mpqFile = M3Models.mpqFile;

export function ModelLoader(options) {

  const scope = this;
  
  /*var updateHW = function (skeleton, sequence) {
      var bones = skeleton.nodes;
      var initialReferences = skeleton.initialReference;
      var boneLookup = skeleton.boneLookup;
      var bone;
      var finalMatrix;
      var boneMatrices = [];

      if (sequence === -1) {
          finalMatrix = skeleton.rootNode.worldMatrix;
      } else {
          finalMatrix = skeleton.localMatrix;
      }

      for (var i = 0, l = boneLookup.length; i < l; i++) {
          if (sequence !== -1) {
              bone = boneLookup[i];
              mat4.multiply(finalMatrix, bones[bone].worldMatrix, initialReferences[bone]);
          } 
          boneMatrices[i] = finalMatrix;
      }

      return boneMatrices;
  }*/

  this.addModel = function(model, viewer) {
    console.log("model", model);

    //const geo = new THREE.BufferGeometry();
    const geo2 = new THREE.Geometry();
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

    for (let i = 0; i < l; i++) {
        let r = (new M3.Region(regions[i], div.triangles, elementArray, edgeArray, offsets[i]));
    }

    const skeleton = model.instances[0].instance.skeleton;
    
    var faceIndex = 0;
    geo2.faceVertexUvs[0] = [];
    const weights = [];
    const bones = [];
    const normals = [];
    const tangents = [];

    const uvSetCount = model.model.uvSetCount;
    const uvs = [
      [], [], [], [],
    ];
    console.log("batchlength", batches.length);
    // TODO: per region. this will fail when there are more than one
    const firstBoneLookupIndex = batches[0].region.firstBoneLookupIndex;
    console.log("firstBone", firstBoneLookupIndex);
    const hwbones = skeleton.hwbones;
    console.log("hwbones", hwbones);
    var boneAtIndex = function(index) {
      const offset = index * 16;
      const elements = [];
      //console.log("index", index, hwbones.length);
      for (let i = 0; i < 16; i++) {
        elements[i] = hwbones[offset + i];
      }
      //console.log("elements", elements);
      const mat = new THREE.Matrix4();
      mat.set.apply(mat, elements);
      mat.transpose();
      //console.log("mat", mat);
      return mat;
    };
    const updatePositions = function() {
      let vertexIndex = 0;
      const l = batches.length;
      for (let i = 0; i < l; i++) {
        const batch = batches[i];
        const region = batch.region;
        const offset = region.offset / 2;
        const bonelookup = region.firstBoneLookupIndex;
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
          const weightedBone0 = boneAtIndex(bone.x + firstBoneLookupIndex).multiplyScalar(weight.x / 255);
          const weightedBone1 = boneAtIndex(bone.y + firstBoneLookupIndex).multiplyScalar(weight.y / 255);
          const weightedBone2 = boneAtIndex(bone.z + firstBoneLookupIndex).multiplyScalar(weight.z / 255);
          const weightedBone3 = boneAtIndex(bone.w + firstBoneLookupIndex).multiplyScalar(weight.w / 255);
          const position = new THREE.Vector4(pos.x, pos.y, pos.z, 1.0);
          const outposition4 = new THREE.Vector4();
          outposition4.add(position.clone().applyMatrix4(weightedBone0));
          outposition4.add(position.clone().applyMatrix4(weightedBone1));
          outposition4.add(position.clone().applyMatrix4(weightedBone2));
          outposition4.add(position.clone().applyMatrix4(weightedBone3));
          const outposition = new THREE.Vector3(outposition4.x, outposition4.y, outposition4.z);
          //console.log("position", pos);
          //console.log("outposition", outposition);
          geo2.vertices[vertexIndex] = outposition;
          vertexIndex++;
        }
      }
    }
    const l2 = batches.length;
    for (let i = 0; i < l2; i++) {
      const batch = batches[i];
      const region = batch.region;
      const offset = region.offset / 2;
      const bonelookup = region.firstBoneLookupIndex;
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
        geo2.vertices.push(pos);

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

        // debug code
        const weightedBone0 = boneAtIndex(bone.x + firstBoneLookupIndex).multiplyScalar(weight.x / 255);
        const weightedBone1 = boneAtIndex(bone.y + firstBoneLookupIndex).multiplyScalar(weight.y / 255);
        const weightedBone2 = boneAtIndex(bone.z + firstBoneLookupIndex).multiplyScalar(weight.z / 255);
        const weightedBone3 = boneAtIndex(bone.w + firstBoneLookupIndex).multiplyScalar(weight.w / 255);
        const position = new THREE.Vector4(pos.x, pos.y, pos.z, 1.0);
        const outposition4 = new THREE.Vector4();
        outposition4.add(position.clone().applyMatrix4(weightedBone0));
        outposition4.add(position.clone().applyMatrix4(weightedBone1));
        outposition4.add(position.clone().applyMatrix4(weightedBone2));
        outposition4.add(position.clone().applyMatrix4(weightedBone3));
        const outposition = new THREE.Vector3(outposition4.x, outposition4.y, outposition4.z);
        //console.log("position", pos);
        //console.log("outposition", outposition);
        //geo2.vertices.push(outposition);

        if ((faceIndex + 1) % 3 == 0) {
          geo2.faces.push(new THREE.Face3(faceIndex - 2, faceIndex - 1, faceIndex));
          geo2.faceVertexUvs[0].push([
            uvs[0][faceIndex - 2],
            uvs[0][faceIndex - 1],
            uvs[0][faceIndex - 0]
          ]);
        }
        faceIndex++;
      }
    }
    /*const hwbonesNew = new Float32Array(skeleton.boneTextureSize);
    for (let i = 0; i < hwbones.length; i++) {
      hwbonesNew[i] = hwbones[i];
    }*/
    const hwbonesTexture = new THREE.DataTexture(hwbones, hwbones.length / 4, 1, THREE.RGBAFormat, THREE.FloatType);
    hwbonesTexture.flipY = false;
    hwbonesTexture.unpackAlignment = 4;
    hwbonesTexture.generateMipmaps = false;
    hwbonesTexture.needsUpdate = true;
    hwbonesTexture.minFilter = THREE.NearestFilter;

    //geo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    //geo2.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));

    //geo.computeBoundingSphere();
    //geo.computeFaceNormals();
    //geo.computeVertexNormals();
    geo2.computeBoundingSphere();
    geo2.computeFaceNormals();
    geo2.computeVertexNormals();

    const parserMaterial = model.model.parser.materials[0][0];
    const diffuse = parserMaterial.diffuseLayer.imagePath.toLowerCase();
    const diffuse_path = mpqFile(diffuse);
    const specular = parserMaterial.specularLayer.imagePath.toLowerCase();
    const specular_path = mpqFile(specular);
    const emissive = parserMaterial.emissiveLayer.imagePath.toLowerCase();
    const emissive_path = mpqFile(emissive); 
    const normal = parserMaterial.normalLayer.imagePath.toLowerCase();
    const normal_path = mpqFile(normal);
    const loader = new THREE.DDSLoader();
    /**var material = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
    });*/
    console.log("uvSetCount", uvSetCount);
    console.log("weights", weights);
    console.log("bones", bones);
    const uvSets = "EXPLICITUV" + (uvSetCount - 1);
    const vscommon = SHADERS.vsbonetexture + SHADERS.svscommon + "\n";
    const vsstandard = vscommon + SHADERS.svsstandard;
    const pscommon = SHADERS.spscommon + "\n";
    const psstandard = pscommon + SHADERS.spsstandard;
    const sourceMaterial = model.model.materials[1][0];
    const material = new THREE.ShaderMaterial({
      /*defines: {
      },*/
      uniforms: {
        u_boneMap: { type: 't', value: hwbonesTexture },
        //u_matrix_size: { type: 'f', value: 4 / hwbones.length },
        //u_texel_size: { type: 'f', value: 1 / hwbones.length },
        u_matrix_size: { type: 'f', value: skeleton.matrixFraction },
        u_texel_size: { type: 'f', value: skeleton.texelFraction },
        u_firstBoneLookupIndex: { type: 'f', value: firstBoneLookupIndex },
        u_mvp: { type: 'm4', value: options.camera.projectionMatrix },
        u_mv: { type: 'm4', value: null },
        u_eyePos: { type: 'v3', value: options.camera.position },
        u_lightPos: { type: 'v3', value: options.light.position },
        // fragment
        u_specularity: { type: 'f', value: sourceMaterial.specularity },
        u_specMult: { type: 'f', value: sourceMaterial.specMult },
        u_emisMult: { type: 'f', value: sourceMaterial.emisMult },
        u_lightAmbient: { type: 'v4', value: new THREE.Vector4(0.02, 0.02, 0.02, 0) },
      },
      attributes: {
        a_position: { type: 'v3', value: geo2.vertices },
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
        console.log("setuniform", fullName, layerSettings[name]);
      }
    }
    // TODO: select correct layer
    const layers = model.model.materials[1][0].layers;
    const layersByType = {}
    const b2i = (b) => b ? 1 : 0;
    const pTextures = [];
    const pTexturesBySource = {};
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
          pTexturesBySource[layer.source].then((texture) => {
            console.log("2nd texture", layer.source, layer.uniforms.map);
            material.uniforms[layer.uniforms.map] = { type: 't', value: texture };
          });
        } else {
          const promise = new Promise((resolve, reject) => {
            loader.load(mpqFile(layer.source), (texture) => {
              console.log("texture", layer.source, layer.uniforms.map);
              material.uniforms[layer.uniforms.map] = { type: 't', value: texture };
              resolve(texture);
            });
          });
          pTextures.push(promise);
          pTexturesBySource[layer.source] = promise;
        }
      }
    }

    material.defines[uvSets] = true;
    for (let uvi = 0; uvi < uvSetCount; uvi++) {
      console.log('a_uv' + uvi, uvs[uvi]);
      material.attributes['a_uv' + uvi] = { type: 'v2', value: uvs[uvi] };
    }

    const pTexture = Promise.all(pTextures);
    //const scale = 0.01;
    const scale = 1;
    //const scale = 100;

    pTexture.then(() => {
      let mesh = new THREE.Mesh(geo2, material);
      options.scene.add(mesh);
      mesh.position.set(0, 300, 0);
      mesh.scale.set(scale, scale, scale);
      //mesh.lookAt(options.camera.position);
      const u_mv = options.camera.matrixWorldInverse.clone().multiply(mesh.matrixWorld);
      material.uniforms.u_mv.value = u_mv;
      console.log("added", model.model.name);
      console.log("uniforms", material.uniforms);

      let oldMesh = mesh;

      var step = function() {
        viewer.stepUpdate();

        //updatePositions();
        //material.attributes.a_position.needsUpdate = true;
        /*let mesh = new THREE.Mesh(geo2, material);
        options.scene.remove(oldMesh);
        options.scene.add(mesh);
        mesh.position.set(0, 300, 0);
        mesh.scale.set(scale, scale, scale);
        oldMesh = mesh;*/

        hwbonesTexture.needsUpdate = true;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    const boxg = new THREE.BoxGeometry(scale, scale, scale);
    const boxm = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const box = new THREE.Mesh(boxg, boxm);
    options.scene.add(box);
    box.position.set(300, 300, 300);

    //var mesh = new THREE.PointCloud(geo2, new THREE.PointCloudMaterial());
    
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
    for (const model of M3Models.M3Models) {
      viewer.load(model.path, mpqFile);
    }
    var models = viewer.getModels();
    var modelsByName = {};
    var waitForIt = function(callback) {
      var ready = true;
      for (var i = 0; i < models.length; i++) {
        var model = models[i];
        ready = ready && model.ready;
      }
      if (ready) {
        callback();
      } else {
        setTimeout(() => { waitForIt(callback); }, 100);
      }
    }
    var onLoad = function() {
      for (const model of models) {
        for (const instance of model.instances) {
          instance.setSequence(1);
          instance.setTeamColor(0);
        }
      }

      const camera = viewer.getCamera();
      camera.projection = options.camera.projectionMatrix;
      camera.view = options.camera.matrixWorldInverse;
      viewer.updateCamera();
      viewer.stepUpdate();

      for (var i = 0; i < models.length; i++) {
        var model = models[i];
        scope.addModel(models[i], viewer);
        modelsByName[model.model.name] = model;
      }
    
      //simpleThree.addModel(modelsByName.Thor);
    }

    waitForIt(onLoad);

  }
}
