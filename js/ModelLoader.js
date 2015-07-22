const M3Models = require('./M3Models.js');
const mpqFile = M3Models.mpqFile;

export function ModelLoader(options) {

  const scope = this;
  
  var updateHW = function (skeleton, sequence) {
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
  }

  this.addModel = function(model) {
    console.log(model);

    var geo = new THREE.BufferGeometry();
    var geo2 = new THREE.Geometry();
    var vertices = model.model.parser.vertices;
    var floats = new Float32Array(vertices.buffer);
    var bytes = new Uint8Array(vertices.buffer);
    var shorts = new Int16Array(vertices.buffer);
    var vertexSize = model.model.vertexSize;
    //console.log(vertices.length, vertexSize);
    var positions = new Float32Array(vertices.length * 3 / vertexSize);

    var div = model.model.parser.divisions[0];
    var regions = div.regions;
    var triangles = div.triangles;
    var batches = model.model.batches;

    var offsets = [];
    var i, l;
    var totalElements = 0;

    for (i = 0, l = regions.length; i < l; i++) {
        offsets[i] = totalElements;
        totalElements += regions[i].triangleIndicesCount;
    }

    var elementArray = new Uint16Array(totalElements);
    var edgeArray = new Uint16Array(totalElements * 2);

    for (i = 0, l = regions.length; i < l; i++) {
        var r = (new M3.Region(regions[i], div.triangles, elementArray, edgeArray, offsets[i]));
    }

    var skeleton = model.instances[0].instance.skeleton;
    var sequence = -1;
    var boneMatrices = updateHW(skeleton, sequence);
    
    var f = 0;
    geo2.faceVertexUvs[0] = [];
    var uvs = [];
    for (i = 0, l = batches.length; i < l; i++) {
      var batch = batches[i];
      var region = batch.region;
      var offset = region.offset / 2;
      var bonelookup = region.firstBoneLookupIndex;
      for (var k = 0; k < region.elements; k++) {
        var element = offset + k;
        //var vertex = bytes[
        // divide by float size
        var floatIndex = elementArray[element] * vertexSize / 4;
        var byteIndex = elementArray[element] * vertexSize;
        var shortIndex = elementArray[element] * vertexSize / 2;
        var x = floats[floatIndex + 0];
        var y = floats[floatIndex + 1];
        var z = floats[floatIndex + 2];
        const pos = new THREE.Vector3(x, y, z);
        var a_bones = [];
        a_bones.push(bytes[byteIndex + 16]);
        a_bones.push(bytes[byteIndex + 16]);
        var bones = [];
        //bones.push(floats[index
        geo2.vertices.push(pos);
        var uvx = shorts[shortIndex + 24 / 2 + 0 + 0/2] / 2048;
        var uvy = shorts[shortIndex + 24 / 2 + 1 + 0/2] / 2048;
        var uvPos = new THREE.Vector2(uvx, uvy);
        uvs.push(uvPos);
        if ((f + 1) % 3 == 0) {
          geo2.faces.push(new THREE.Face3(f - 2, f - 1, f));
          geo2.faceVertexUvs[0].push([
            uvs[f - 2],
            uvs[f - 1],
            uvs[f - 0]
          ]);
        }
        f++;
      }
    }

    /*for (var i = 0; i < vertices.length; i += vertexSize) {
      var x = floats[i + 0];
      var y = floats[i + 1];
      var z = floats[i + 2];
      var pi = Math.round(i / vertexSize);
      positions[pi + 0] = x;
      positions[pi + 1] = y;
      positions[pi + 2] = z;
      geo2.vertices.push(new THREE.Vector3(x, y, z));
    }*/
    //console.log(floats, positions);
    //console.log(geo2.vertices);
    geo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo2.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));

    geo.computeBoundingSphere();
    geo.computeFaceNormals();
    geo.computeVertexNormals();
    geo2.computeBoundingSphere();
    geo2.computeFaceNormals();
    geo2.computeVertexNormals();

    var material = model.model.parser.materials[0][0];
    var diffuse = material.diffuseLayer.imagePath.toLowerCase();
    var diffuse_path = mpqFile(diffuse);
    var specular = material.specularLayer.imagePath.toLowerCase();
    var specular_path = mpqFile(specular);
    var emissive = material.emissiveLayer.imagePath.toLowerCase();
    var emissive_path = mpqFile(emissive); 
    var normal = material.normalLayer.imagePath.toLowerCase();
    var normal_path = mpqFile(normal);
    var loader = new THREE.DDSLoader();
    console.log("loader", loader);
    //var texture = THREE.ImageUtils.loadCompressedTexture(tpath);
    var material = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
    });
    var texturesLoaded = 0;
    const pTextures = [];
    pTextures.push(new Promise((resolve, reject) => {
      loader.load(diffuse_path, (texture) => {
        console.log("texture", texture);
        material.map = texture;
        resolve();
      });
    }));
    pTextures.push(new Promise((resolve, reject) => {
      loader.load(specular_path, (texture) => {
        console.log("texture", texture);
        material.specularMap = texture;
        resolve();
      });
    }));
    pTextures.push(new Promise((resolve, reject) => {
      loader.load(emissive_path, (texture) => {
        console.log("texture", texture);
        //material.lightMap = texture;
        resolve();
      });
    }));
    pTextures.push(new Promise((resolve, reject) => {
      loader.load(normal_path, (texture) => {
        console.log("texture", texture);
        //material.normalMap = texture;
        resolve();
      });
    }));

    const pTexture = Promise.all(pTextures);

    pTexture.then(() => {
      var mesh = new THREE.Mesh(geo2, material);
      options.scene.add(mesh);
      mesh.position.set(0, 300, 0);
      mesh.scale.set(scale, scale, scale);
      mesh.lookAt(options.camera.position);
      console.log("finished");
    });

    const scale = 100;
    const boxg = new THREE.BoxGeometry(scale, scale, scale);
    const boxm = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const box = new THREE.Mesh(boxg, boxm);
    console.log("scene", options.scene);
    options.scene.add(box);
    box.position.set(300, 300, 300);

    //var mesh = new THREE.PointCloud(geo2, new THREE.PointCloudMaterial());
    
    console.log("added", model.model.name);
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
      for (var i = 0; i < models.length; i++) {
        var model = models[i];
        scope.addModel(models[i]);
        modelsByName[model.model.name] = model;
      }
    
      //console.log(modelsByName);
      //simpleThree.addModel(modelsByName.Thor);
    }

    waitForIt(onLoad);

  }
}
