/**
 * source: https://raw.githubusercontent.com/grey-eminence/3DIT/master/js/controls/MapControls.js
 * @author Jacek Jankowski / http://grey-eminence.org/
 * @author Eivind Magnus Hvidevold (modified)
 */

// It is an adaptation of the three.js OrbitControls class to map environments

export function MapControls(camera, mesh, renderFunction, domElement) {

  this.object = camera;
	this.camera = camera;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.render = renderFunction;
	this.enabled = true;
	this.target = new THREE.Vector3();
	this.zoomSpeed = 1.0;
	this.minDistance = 0;
	this.maxDistance = Infinity;
	this.rotateSpeed = 0.3;

	// How far you can orbit vertically, upper and lower limits.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI / 2; // radians

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


	this.update = function () {

		if ( lastPosition.distanceTo( this.camera.position ) > 0 ) {

			this.render();
			lastPosition.copy( this.camera.position );

		}

	};


	function onMouseDown( event ) {

		if ( scope.enabled === false ) { return; }
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

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

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

				scope.object.position.addVectors( scope.object.position, delta );

			}

		} else if ( state === STATE.ROTATE ) {

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			thetaDelta -=  2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed;
			phiDelta -=  2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed;

			var position = scope.object.position;
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

			scope.object.lookAt( scope.target );

			thetaDelta = 0;
			phiDelta = 0;	

			rotateStart.copy( rotateEnd );

		}

		scope.update();

	}

	function onMouseUp( /* event */ ) {

		if ( scope.enabled === false ) return;

		scope.domElement.removeEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false ) return;

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail;

		}

		var zoomOffset = new THREE.Vector3();
		var te = scope.object.matrix.elements;
		zoomOffset.set( te[8], te[9], te[10] );
		zoomOffset.multiplyScalar( delta * -scope.zoomSpeed * scope.object.position.y/1000 );
		scope.object.position.addVectors( scope.object.position, zoomOffset );

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );

};
