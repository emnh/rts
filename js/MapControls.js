/**
 * source: https://raw.githubusercontent.com/grey-eminence/3DIT/master/js/controls/MapControls.js
 * @author Jacek Jankowski / http://grey-eminence.org/
 * @author Eivind Magnus Hvidevold (modified)
 */

// It is an adaptation of the three.js OrbitControls class to map environments

export function MapControls(camera, mesh, renderFunction, domElement, resetCamera) {

	this.camera = camera;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.render = renderFunction;
	this.enabled = true;
	this.target = new THREE.Vector3();
	this.zoomSpeed = 1.0;
  this.scrollSpeed = 10.0;
	this.minDistance = 0;
	this.maxDistance = Infinity;
	this.rotateSpeed = 0.3;

	// How far you can orbit vertically, upper and lower limits.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI / 2 - Math.PI / 16; // radians

	// internals
	var scope = this;
	var EPS = 0.000001;
	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();
	var panStart = new THREE.Vector3();
	var panDelta = new THREE.Vector3();	
	var phiDelta = 0;
	var thetaDelta = 0;
	var lastPosition = new THREE.Vector3();
	var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2 };
	var state = STATE.NONE;
	var vector, projector, raycaster, intersects;
  var scrollFunctions = [];
  var lastMouseX;
  var lastMouseY;
  
  let scrollLeft = false;
  let scrollTop = false;
  let scrollRight = false;
  let scrollBottom = false;
  
  let rotateLeft = false;
  let rotateRight = false;
  let rotateUp = false;
  let rotateDown = false;

  let zoomIn = false;
  let zoomOut = false;

	this.update = function () {
		if (lastPosition.distanceTo(this.camera.position) > 0) {
			this.render();
			lastPosition.copy(this.camera.position);
		}
	};


	function onMouseDown(event) {

		if (scope.enabled === false) { 
      return true;
    }

		event.preventDefault();

		if ( event.button === 0 ) {

			state = STATE.PAN;

			var mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
			var mouseY = -( event.clientY / window.innerHeight ) * 2 + 1;

			vector = new THREE.Vector3( mouseX, mouseY, camera.near );
      vector.unproject(camera);
			raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
			intersects = raycaster.intersectObject( mesh );

			if ( intersects.length > 0 ) {

				panStart = intersects[ 0 ].point;

			}

		} else if ( event.button === 2 ) {

			state = STATE.ROTATE;

			vector = new THREE.Vector3( 0, 0, camera.near );
      vector.unproject(camera);
			raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
			intersects = raycaster.intersectObject( mesh );

			if ( intersects.length > 0 ) {
				scope.target = intersects[ 0 ].point;
			}

			rotateStart.set( event.clientX, event.clientY );

		} 

		scope.domElement.addEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.addEventListener( 'mouseup', onMouseUp, false );

	}

  function arcBallRotation(mul, updown = false) {
    // determine focal point
    vector = new THREE.Vector3(0, 0, camera.near);
    vector.unproject(camera);
    raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    intersects = raycaster.intersectObject(mesh);
    if (intersects.length > 0) {
      // rotate
      const focus = intersects[0].point;
      const axis = camera.position.clone();
      axis.sub(focus);
      // TODO: consolidate two different methods of arc ball rotation
      if (updown) {
        const offset = axis;
        const phiDelta = scope.rotateSpeed * mul;

        // angle from z-axis around y-axis
        let theta = Math.atan2( offset.x, offset.z );

			  // angle from y-axis
        let phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);
			
        phi += phiDelta;

        // restrict phi to be between desired limits
        phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, phi));

        // restrict phi to be betwee EPS and PI-EPS
        phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

        let radius = offset.length();

        offset.x = radius * Math.sin( phi ) * Math.sin( theta );
        offset.y = radius * Math.cos( phi );
        offset.z = radius * Math.sin( phi ) * Math.cos( theta );

        camera.position.copy(focus).add(offset);
      } else {
        axis.y = 0;
        axis.normalize();
        const old = camera.position.clone();
        camera.position.applyAxisAngle(axis, scope.rotateSpeed * mul);
        if (!updown) {
          camera.position.y = old.y;
        }
      }
      camera.lookAt(focus);
    }
  }

  function scroll() {
    // scroll at edge of element
    var edgeSize = 0.1;
    if (lastMouseX < -1.0 + edgeSize || scrollLeft) {
      var delta = new THREE.Vector3(-scope.scrollSpeed, 0, 0);
      delta.applyQuaternion(camera.quaternion);
      camera.position.add(delta);
    }
    if (lastMouseX > 1.0 - edgeSize || scrollRight) {
      var delta = new THREE.Vector3(scope.scrollSpeed, 0, 0);
      delta.applyQuaternion(camera.quaternion);
      camera.position.add(delta);
    }
    if (lastMouseY < -1.0 + edgeSize || scrollBottom) {
      var delta = new THREE.Vector3(0, -1, 0);
      delta.applyQuaternion(camera.quaternion);
      delta.y = 0;
      delta.normalize();
      delta.multiplyScalar(scope.scrollSpeed);
      camera.position.add(delta);
    }
    if (lastMouseY > 1.0 - edgeSize || scrollTop) {
      var delta = new THREE.Vector3(0, 1, 0);
      delta.applyQuaternion(camera.quaternion);
      delta.y = 0;
      delta.normalize();
      delta.multiplyScalar(scope.scrollSpeed);
      camera.position.add(delta);
    }

    // rotation
    const mul = 0.1;
    if (rotateUp) {
      arcBallRotation(-mul, true);
    }
    if (rotateDown) {
      arcBallRotation(mul, true);
    }
    if (rotateLeft) {
      arcBallRotation(mul);
    }
    if (rotateRight) {
      arcBallRotation(-mul);
    }

    // zoom
    const zmul = 50;
    if (zoomIn) {
      zoom(zmul);
    }
    
    if (zoomOut) {
      zoom(-zmul);
    }
  }

  function onMouseMoveScroll(event) {
    var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

    lastMouseX = ( event.clientX / element.width ) * 2 - 1;
    lastMouseY = -( event.clientY / element.height ) * 2 + 1;

    return true;
  }

	function onMouseMove( event ) {

		if (scope.enabled === false) {
      return true;
    }

    event.preventDefault();
		
    var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( state === STATE.PAN ) {

			var mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
			var mouseY = -( event.clientY / window.innerHeight ) * 2 + 1;

			vector = new THREE.Vector3( mouseX, mouseY, camera.near );
      vector.unproject(camera);
			raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
			intersects = raycaster.intersectObject( mesh );

			if ( intersects.length > 0 ) {

				panDelta = intersects[ 0 ].point;

				var delta = new THREE.Vector3();
				delta.subVectors( panStart, panDelta );

				camera.position.addVectors( camera.position, delta );

			}

		} else if ( state === STATE.ROTATE ) {

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			thetaDelta -=  2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed;
			phiDelta -=  2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed;

			var position = camera.position;
			var offset = position.clone().sub( scope.target );

			// angle from z-axis around y-axis
			var theta = Math.atan2( offset.x, offset.z );

			// angle from y-axis
			var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

			theta += thetaDelta;
			phi += phiDelta;

			// restrict phi to be between desired limits
			phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, phi ) );

			// restrict phi to be betwee EPS and PI-EPS
			phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

			var radius = offset.length();

			// restrict radius to be between desired limits
			radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, radius ) );

			offset.x = radius * Math.sin( phi ) * Math.sin( theta );
			offset.y = radius * Math.cos( phi );
			offset.z = radius * Math.sin( phi ) * Math.cos( theta );

			position.copy( scope.target ).add( offset );

			camera.lookAt( scope.target );

			thetaDelta = 0;
			phiDelta = 0;	

			rotateStart.copy( rotateEnd );

		}

		scope.update();

	}

	function onMouseUp( /* event */ ) {

		if (scope.enabled === false) {
      return true;
    }

		scope.domElement.removeEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

  function zoom(delta) {
    const zoomOffset = new THREE.Vector3();
		const te = camera.matrix.elements;
		zoomOffset.set(te[8], te[9], te[10]);
		zoomOffset.multiplyScalar(delta * -scope.zoomSpeed * camera.position.y/1000);
		camera.position.addVectors(camera.position, zoomOffset);
  }

	function onMouseWheel( event ) {

		if (scope.enabled === false) {
      return true;
    }

		var delta = 0;

		if (event.wheelDelta) {
      // WebKit / Opera / Explorer 9
			delta = event.wheelDelta;
		} else if (event.detail) {
      // Firefox
			delta = -event.detail;
		}

    zoom(delta);
	}

  function setScroll(keyCode, val) {
    if (keyCode == window.KeyEvent.DOM_VK_LEFT) {
      scrollLeft = val;
    }
    if (keyCode == window.KeyEvent.DOM_VK_RIGHT) {
      scrollRight = val;
    }
    if (keyCode == window.KeyEvent.DOM_VK_UP) {
      scrollTop = val;
    }
    if (keyCode == window.KeyEvent.DOM_VK_DOWN) {
      scrollBottom = val;
    }
  }

  function setRotate(keyCode, val) {
    if (keyCode == window.KeyEvent.DOM_VK_LEFT) {
      rotateLeft = val;
    }
    if (keyCode == window.KeyEvent.DOM_VK_RIGHT) {
      rotateRight = val;
    }
    if (keyCode == window.KeyEvent.DOM_VK_UP) {
      rotateUp = val;
    }
    if (keyCode == window.KeyEvent.DOM_VK_DOWN) {
      rotateDown = val;
    }
  }

  function setZoom(keyCode, val) {
    if (keyCode == window.KeyEvent.DOM_VK_PAGE_UP) {
      zoomIn = val;
    }
    if (keyCode == window.KeyEvent.DOM_VK_PAGE_DOWN) {
      zoomOut = val;
    }
  }

  function onKeyUp(evt) {
    setScroll(evt.keyCode, false);
    setRotate(evt.keyCode, false);
    setZoom(evt.keyCode, false);
    if (evt.keyCode === window.KeyEvent.DOM_VK_HOME) {
      resetCamera();
    }
  }

  function onKeyDown(evt) {
    if (evt.ctrlKey) {
      setRotate(evt.keyCode, true);
    } else {
      setScroll(evt.keyCode, true);
    }
    setZoom(evt.keyCode, true);
  }

	this.domElement.addEventListener('contextmenu', function ( event ) { event.preventDefault(); }, false);
	this.domElement.addEventListener('mousedown', onMouseDown, false);
	this.domElement.addEventListener('mousewheel', onMouseWheel, false);
	this.domElement.addEventListener('mousemove', onMouseMoveScroll, false);
	// this.domElement.addEventListener('keydown', onKeyDown, false);
	// this.domElement.addEventListener('keyup', onKeyUp, false);
  const body = document.body;
	body.addEventListener('keydown', onKeyDown, false);
	body.addEventListener('keyup', onKeyUp, false);
  setInterval(scroll, 10);

};
