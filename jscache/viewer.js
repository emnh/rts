/* The MIT License (MIT)

Copyright (c) 2013-2015 Chananya Freiman

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

if(!GLMAT_ARRAY_TYPE) {
    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
}

if(!GLMAT_RANDOM) {
    var GLMAT_RANDOM = Math.random;
}

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    GLMAT_ARRAY_TYPE = type;
}

if(typeof(exports) !== 'undefined') {
    exports.glMatrix = glMatrix;
}

var degree = Math.PI / 180;

/**
* Convert Degree To Radian
*
* @param {Number} Angle in Degrees
*/
glMatrix.toRadian = function(a){
     return a * degree;
}
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */
var vec3 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3.fromValues = function(x, y, z) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3.set = function(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
vec3.sub = vec3.subtract;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
vec3.mul = vec3.multiply;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Alias for {@link vec3.divide}
 * @function
 */
vec3.div = vec3.divide;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
vec3.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.distance}
 * @function
 */
vec3.dist = vec3.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
vec3.sqrDist = vec3.squaredDistance;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.length}
 * @function
 */
vec3.len = vec3.length;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
vec3.sqrLen = vec3.squaredLength;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
vec3.inverse = function(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.cross = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Performs a hermite interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.hermite = function (out, a, b, c, d, t) {
  var factorTimes2 = t * t,
      factor1 = factorTimes2 * (2 * t - 3) + 1,
      factor2 = factorTimes2 * (t - 2) + t,
      factor3 = factorTimes2 * (t - 1),
      factor4 = factorTimes2 * (3 - 2 * t);
  
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  
  return out;
};

/**
 * Performs a bezier interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.bezier = function (out, a, b, c, d, t) {
  var inverseFactor = 1 - t,
      inverseFactorTimesTwo = inverseFactor * inverseFactor,
      factorTimes2 = t * t,
      factor1 = inverseFactorTimesTwo * inverseFactor,
      factor2 = 3 * t * inverseFactorTimesTwo,
      factor3 = 3 * factorTimes2 * inverseFactor,
      factor4 = factorTimes2 * t;
  
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  
  return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
vec3.random = function (out, scale) {
    scale = scale || 1.0;

    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
    var z = (GLMAT_RANDOM() * 2.0) - 1.0;
    var zScale = Math.sqrt(1.0-z*z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2],
        w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
};

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat3 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3.transformQuat = function(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
vec3.rotateX = function(out, a, b, c){
   var p = [], r=[];
	  //Translate point to the origin
	  p[0] = a[0] - b[0];
	  p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];

	  //perform rotation
	  r[0] = p[0];
	  r[1] = p[1]*Math.cos(c) - p[2]*Math.sin(c);
	  r[2] = p[1]*Math.sin(c) + p[2]*Math.cos(c);

	  //translate to correct position
	  out[0] = r[0] + b[0];
	  out[1] = r[1] + b[1];
	  out[2] = r[2] + b[2];

  	return out;
};

/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
vec3.rotateY = function(out, a, b, c){
  	var p = [], r=[];
  	//Translate point to the origin
  	p[0] = a[0] - b[0];
  	p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];
  
  	//perform rotation
  	r[0] = p[2]*Math.sin(c) + p[0]*Math.cos(c);
  	r[1] = p[1];
  	r[2] = p[2]*Math.cos(c) - p[0]*Math.sin(c);
  
  	//translate to correct position
  	out[0] = r[0] + b[0];
  	out[1] = r[1] + b[1];
  	out[2] = r[2] + b[2];
  
  	return out;
};

/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
vec3.rotateZ = function(out, a, b, c){
  	var p = [], r=[];
  	//Translate point to the origin
  	p[0] = a[0] - b[0];
  	p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];
  
  	//perform rotation
  	r[0] = p[0]*Math.cos(c) - p[1]*Math.sin(c);
  	r[1] = p[0]*Math.sin(c) + p[1]*Math.cos(c);
  	r[2] = p[2];
  
  	//translate to correct position
  	out[0] = r[0] + b[0];
  	out[1] = r[1] + b[1];
  	out[2] = r[2] + b[2];
  
  	return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec3.forEach = (function() {
    var vec = vec3.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 3;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
        }
        
        return a;
    };
})();

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
vec3.angle = function(a, b) {
   
    var tempA = vec3.fromValues(a[0], a[1], a[2]);
    var tempB = vec3.fromValues(b[0], b[1], b[2]);
 
    vec3.normalize(tempA, tempA);
    vec3.normalize(tempB, tempB);
 
    var cosine = vec3.dot(tempA, tempB);

    if(cosine > 1.0){
        return 0;
    } else {
        return Math.acos(cosine);
    }     
};

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec3 = vec3;
}
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */
var vec4 = {};

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4.fromValues = function(x, y, z, w) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4.set = function(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
vec4.sub = vec4.subtract;

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
vec4.mul = vec4.multiply;

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Alias for {@link vec4.divide}
 * @function
 */
vec4.div = vec4.divide;

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
vec4.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.distance}
 * @function
 */
vec4.dist = vec4.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
vec4.sqrDist = vec4.squaredDistance;

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.length}
 * @function
 */
vec4.len = vec4.length;

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
vec4.sqrLen = vec4.squaredLength;

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to invert
 * @returns {vec4} out
 */
vec4.inverse = function(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  out[3] = 1.0 / a[3];
  return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x*x + y*y + z*z + w*w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = x * len;
        out[1] = y * len;
        out[2] = z * len;
        out[3] = w * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */
vec4.random = function (out, scale) {
    scale = scale || 1.0;

    //TODO: This is a pretty awful way of doing this. Find something better.
    out[0] = GLMAT_RANDOM();
    out[1] = GLMAT_RANDOM();
    out[2] = GLMAT_RANDOM();
    out[3] = GLMAT_RANDOM();
    vec4.normalize(out, out);
    vec4.scale(out, out, scale);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    out[3] = a[3];
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec4.forEach = (function() {
    var vec = vec4.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 4;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec4 = vec4;
}
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

/**
 * @class 3x3 Matrix
 * @name mat3
 */
var mat3 = {};

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
mat3.fromMat4 = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }
    
    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
mat3.mul = mat3.multiply;

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
mat3.translate = function(out, a, v) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],
        x = v[0], y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.rotate = function (out, a, rad) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.scale = function(out, a, v) {
    var x = v[0], y = v[1];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.translate(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Translation vector
 * @returns {mat3} out
 */
mat3.fromTranslation = function(out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = v[0];
    out[7] = v[1];
    out[8] = 1;
    return out;
}

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.rotate(dest, dest, rad);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.fromRotation = function(out, rad) {
    var s = Math.sin(rad), c = Math.cos(rad);

    out[0] = c;
    out[1] = s;
    out[2] = 0;

    out[3] = -s;
    out[4] = c;
    out[5] = 0;

    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.scale(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat3} out
 */
mat3.fromScaling = function(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;

    out[3] = 0;
    out[4] = v[1];
    out[5] = 0;

    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
}

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat2d} a the matrix to copy
 * @returns {mat3} out
 **/
mat3.fromMat2d = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
mat3.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;

    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;

    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;

    return out;
};

/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/
mat3.normalFromMat4 = function (out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

/**
 * Returns Frobenius norm of a mat3
 *
 * @param {mat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat3.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2)))
};


if(typeof(exports) !== 'undefined') {
    exports.mat3 = mat3;
}
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

/**
 * @class 4x4 Matrix
 * @name mat4
 */
var mat4 = {};

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
mat4.mul = mat4.multiply;

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.scale = function(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateX = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateY = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromTranslation = function(out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Scaling vector
 * @returns {mat4} out
 */
mat4.fromScaling = function(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = v[1];
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = v[2];
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.fromRotation = function(out, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t;
    
    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
    
    // Perform rotation-specific matrix multiplication
    out[0] = x * x * t + c;
    out[1] = y * x * t + z * s;
    out[2] = z * x * t - y * s;
    out[3] = 0;
    out[4] = x * y * t - z * s;
    out[5] = y * y * t + c;
    out[6] = z * y * t + x * s;
    out[7] = 0;
    out[8] = x * z * t + y * s;
    out[9] = y * z * t - x * s;
    out[10] = z * z * t + c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.fromXRotation = function(out, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad);
    
    // Perform axis-specific matrix multiplication
    out[0]  = 1;
    out[1]  = 0;
    out[2]  = 0;
    out[3]  = 0;
    out[4] = 0;
    out[5] = c;
    out[6] = s;
    out[7] = 0;
    out[8] = 0;
    out[9] = -s;
    out[10] = c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.fromYRotation = function(out, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad);
    
    // Perform axis-specific matrix multiplication
    out[0]  = c;
    out[1]  = 0;
    out[2]  = -s;
    out[3]  = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = s;
    out[9] = 0;
    out[10] = c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.fromZRotation = function(out, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad);
    
    // Perform axis-specific matrix multiplication
    out[0]  = c;
    out[1]  = s;
    out[2]  = 0;
    out[3]  = 0;
    out[4] = -s;
    out[5] = c;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslation = function (out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslationScale = function (out, q, v, s) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2,
        sx = s[0],
        sy = s[1],
        sz = s[2];

    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     mat4.translate(dest, origin);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *     mat4.translate(dest, negativeOrigin);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @param {vec3} o The origin vector around which to scale and rotate
 * @returns {mat4} out
 */
mat4.fromRotationTranslationScaleOrigin = function (out, q, v, s, o) {
  // Quaternion math
  var x = q[0], y = q[1], z = q[2], w = q[3],
      x2 = x + x,
      y2 = y + y,
      z2 = z + z,

      xx = x * x2,
      xy = x * y2,
      xz = x * z2,
      yy = y * y2,
      yz = y * z2,
      zz = z * z2,
      wx = w * x2,
      wy = w * y2,
      wz = w * z2,
      
      sx = s[0],
      sy = s[1],
      sz = s[2],

      ox = o[0],
      oy = o[1],
      oz = o[2];
      
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0] + ox - (out[0] * ox + out[4] * oy + out[8] * oz);
  out[13] = v[1] + oy - (out[1] * ox + out[5] * oy + out[9] * oz);
  out[14] = v[2] + oz - (out[2] * ox + out[6] * oy + out[10] * oz);
  out[15] = 1;
        
  return out;
};

mat4.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspectiveFromFieldOfView = function (out, fov, near, far) {
    var upTan = Math.tan(fov.upDegrees * Math.PI/180.0),
        downTan = Math.tan(fov.downDegrees * Math.PI/180.0),
        leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0),
        rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0),
        xScale = 2.0 / (leftTan + rightTan),
        yScale = 2.0 / (upTan + downTan);

    out[0] = xScale;
    out[1] = 0.0;
    out[2] = 0.0;
    out[3] = 0.0;
    out[4] = 0.0;
    out[5] = yScale;
    out[6] = 0.0;
    out[7] = 0.0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[9] = ((upTan - downTan) * yScale * 0.5);
    out[10] = far / (near - far);
    out[11] = -1.0;
    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = (far * near) / (near - far);
    out[15] = 0.0;
    return out;
}

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4.lookAt = function (out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < GLMAT_EPSILON &&
        Math.abs(eyey - centery) < GLMAT_EPSILON &&
        Math.abs(eyez - centerz) < GLMAT_EPSILON) {
        return mat4.identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4.str = function (a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};

/**
 * Returns Frobenius norm of a mat4
 *
 * @param {mat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat4.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2) ))
};


if(typeof(exports) !== 'undefined') {
    exports.mat4 = mat4;
}
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

/**
 * @class Quaternion
 * @name quat
 */
var quat = {};

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */
quat.rotationTo = (function() {
    var tmpvec3 = vec3.create();
    var xUnitVec3 = vec3.fromValues(1,0,0);
    var yUnitVec3 = vec3.fromValues(0,1,0);

    return function(out, a, b) {
        var dot = vec3.dot(a, b);
        if (dot < -0.999999) {
            vec3.cross(tmpvec3, xUnitVec3, a);
            if (vec3.length(tmpvec3) < 0.000001)
                vec3.cross(tmpvec3, yUnitVec3, a);
            vec3.normalize(tmpvec3, tmpvec3);
            quat.setAxisAngle(out, tmpvec3, Math.PI);
            return out;
        } else if (dot > 0.999999) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        } else {
            vec3.cross(tmpvec3, a, b);
            out[0] = tmpvec3[0];
            out[1] = tmpvec3[1];
            out[2] = tmpvec3[2];
            out[3] = 1 + dot;
            return quat.normalize(out, out);
        }
    };
})();

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
quat.setAxes = (function() {
    var matr = mat3.create();

    return function(out, view, right, up) {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];

        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];

        matr[2] = -view[0];
        matr[5] = -view[1];
        matr[8] = -view[2];

        return quat.normalize(out, quat.fromMat3(out, matr));
    };
})();

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
quat.clone = vec4.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
quat.fromValues = vec4.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
quat.copy = vec4.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
quat.set = vec4.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat.identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat.setAxisAngle = function(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
quat.add = vec4.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.multiply = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Alias for {@link quat.multiply}
 * @function
 */
quat.mul = quat.multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
quat.scale = vec4.scale;

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateX = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateY = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        by = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateZ = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bz = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat.calculateW = function (out, a) {
    var x = a[0], y = a[1], z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
quat.dot = vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
quat.lerp = vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.slerp = function (out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var        omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if ( cosom < 0.0 ) {
        cosom = -cosom;
        bx = - bx;
        by = - by;
        bz = - bz;
        bw = - bw;
    }
    // calculate coefficients
    if ( (1.0 - cosom) > 0.000001 ) {
        // standard case (slerp)
        omega  = Math.acos(cosom);
        sinom  = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {        
        // "from" and "to" quaternions are very close 
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    
    return out;
};

/**
 * Performs a spherical quadrangle interpolation
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {quat} c the third operand
 * @param {quat} d the fourth operand
 * @param {Number} t interpolation amount
 * @returns {quat} out
 */
quat.squad = (function () {
  var temp1 = quat.create();
  var temp2 = quat.create();
  
  return function (out, a, b, c, d, t) {
    quat.slerp(temp1, a, d, t);
    quat.slerp(temp2, b, c, t);
    quat.slerp(out, temp1, temp2, 2 * t * (1 - t));
    
    return out;
  };
}());

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;
    
    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0*invDot;
    out[1] = -a1*invDot;
    out[2] = -a2*invDot;
    out[3] = a3*invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
quat.length = vec4.length;

/**
 * Alias for {@link quat.length}
 * @function
 */
quat.len = quat.length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
quat.squaredLength = vec4.squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
quat.sqrLen = quat.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
quat.normalize = vec4.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = function(out, m) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    var fTrace = m[0] + m[4] + m[8];
    var fRoot;

    if ( fTrace > 0.0 ) {
        // |w| > 1/2, may as well choose w > 1/2
        fRoot = Math.sqrt(fTrace + 1.0);  // 2w
        out[3] = 0.5 * fRoot;
        fRoot = 0.5/fRoot;  // 1/(4w)
        out[0] = (m[5]-m[7])*fRoot;
        out[1] = (m[6]-m[2])*fRoot;
        out[2] = (m[1]-m[3])*fRoot;
    } else {
        // |w| <= 1/2
        var i = 0;
        if ( m[4] > m[0] )
          i = 1;
        if ( m[8] > m[i*3+i] )
          i = 2;
        var j = (i+1)%3;
        var k = (i+2)%3;
        
        fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[j*3+k] - m[k*3+j]) * fRoot;
        out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
        out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
    }
    
    return out;
};

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.quat = quat;
}
vec3.UNIT_X = vec3.fromValues(1, 0, 0);
vec3.UNIT_Y = vec3.fromValues(0, 1, 0);
vec3.UNIT_Z = vec3.fromValues(0, 0, 1);

vec3.hermite = function (out, a, b, c, d, t) {
    var factorTimes2 = t * t,
        factor1 = factorTimes2 * (2 * t - 3) + 1,
        factor2 = factorTimes2 * (t - 2) + t,
        factor3 = factorTimes2 * (t - 1),
        factor4 = factorTimes2 * (3 - 2 * t);
    
    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
    
    return out;
};

vec3.bezier = function (out, a, b, c, d, t) {
    var inverseFactor = 1 - t,
        inverseFactorTimesTwo = inverseFactor * inverseFactor,
        factorTimes2 = t * t,
        factor1 = inverseFactorTimesTwo * inverseFactor,
        factor2 = 3 * t * inverseFactorTimesTwo,
        factor3 = 3 * factorTimes2 * inverseFactor,
        factor4 = factorTimes2 * t;
    
    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
    
    return out;
};

mat4.fromRotationTranslationScale = function (out, q, v, s) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,
        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2,
        sx = s[0],
        sy = s[1],
        sz = s[2];
    
    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;

    return out;
};

mat4.fromRotationTranslationScaleOrigin = function (out, q, v, s, o) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,
        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2,
        sx = s[0],
        sy = s[1],
        sz = s[2],
        ox = o[0],
        oy = o[1],
        oz = o[2];
    
    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0] + ox - (out[0] * ox + out[4] * oy + out[8] * oz);
    out[13] = v[1] + oy - (out[1] * ox + out[5] * oy + out[9] * oz);
    out[14] = v[2] + oz - (out[2] * ox + out[6] * oy + out[10] * oz);
    out[15] = 1;
    
    return out;
};

mat4.toRotationMat4 = (function () {
    var quadrent = mat3.create();
    
    return function (out, m) {
        mat3.fromMat4(quadrent, m);
        mat3.invert(quadrent, quadrent);
        
        out[0] = quadrent[0];
        out[1] = quadrent[1];
        out[2] = quadrent[2];
        out[3] = 1;
        out[4] = quadrent[3];
        out[5] = quadrent[4];
        out[6] = quadrent[5];
        out[7] = 1;
        out[8] = quadrent[6];
        out[9] = quadrent[7];
        out[10] = quadrent[8];
        out[11] = 1;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        
        return out;
    };
}());

mat4.decomposeScale = function (out, m) {
    var m0 = m[0], m1 = m[1], m2 = m[2],
        m4 = m[4], m5 = m[5], m6 = m[6],
        m8 = m[8], m9 = m[9], m10 = m[10];
    
    out[0] = Math.sqrt(m0*m0 + m1*m1 + m2*m2);
    out[1] = Math.sqrt(m4*m4 + m5*m5 + m6*m6);
    out[2] = Math.sqrt(m8*m8 + m9*m9 + m10*m10);
    
    return out;
};

vec3.unproject = (function () {
    var heap = vec4.create();
    
    return function (out, x, y, z, inverseMatrix, viewport) {
        x = 2 * (x - viewport[0]) / viewport[2] - 1;
        y = 1 - 2 * (y - viewport[1]) / viewport[3];
        z = 2 * z - 1;
        
        vec4.set(heap, x, y, z, 1);
        vec4.transformMat4(heap, heap, inverseMatrix);
        vec3.set(out, heap[0] / heap[3], heap[1] / heap[3], heap[2] / heap[3]);
        
        return out;
    };
}());

quat.nlerp = function (out, a, b, t) {
    var dot = quat.dot(a, b),
        inverseFactor = 1 - t;

    if (dot < 0) {
        out[0] = inverseFactor * a[0] - t * b[0];
        out[1] = inverseFactor * a[1] - t * b[1];
        out[2] = inverseFactor * a[2] - t * b[2];
        out[3] = inverseFactor * a[3] - t * b[3];
    } else {
        out[0] = inverseFactor * a[0] + t * b[0];
        out[1] = inverseFactor * a[1] + t * b[1];
        out[2] = inverseFactor * a[2] + t * b[2];
        out[3] = inverseFactor * a[3] + t * b[3];
    }

    quat.normalize(out, out);

    return out;
};

quat.nquad = (function () {
    var temp1 = quat.create();
    var temp2 = quat.create();
  
    return function (out, a, b, c, d, t) {
        quat.nlerp(temp1, a, d, t);
        quat.nlerp(temp2, b, c, t);
        quat.nlerp(out, temp1, temp2, 2 * t * (1 - t));

        return out;
    };
}());
Math.TO_RAD = Math.PI / 180;
Math.TO_DEG = 180 / Math.PI;

/**
 * Convert from degrees to radians.
 *
 * @param {number} degrees
 * @returns {number} Radians.
 */
Math.toRad = function (degrees) {
    return degrees * Math.TO_RAD;
};

/**
 * Convert from radians to degrees.
 *
 * @param {number} radians
 * @returns {number} Degrees.
 */
Math.toDeg = function (radians) {
    return radians * Math.TO_DEG;
};

/**
 * Convert an array of numbers from degrees to radians.
 *
 * @param {number} degrees
 * @returns {number} Radians.
 */
Array.toRad = function (degrees) {
    var arr = [],
        i,
        l;
    
    for (i = 0, l = degrees.length; i < l; i++) {
        arr[i] = degrees[i] * Math.TO_RAD;
    }
    
    return arr;
};

/**
 * Convert an array of numbers from radians to degrees.
 *
 * @param {number} radians
 * @returns {number} Degrees.
 */
Array.toDeg = function (radians) {
    var arr = [],
        i,
        l;
    
    for (i = 0, l = radians.length; i < l; i++) {
        arr[i] = radians[i] * Math.TO_DEG;
    }
    
    return arr;
};

/**
 * Gets a random number in the given range.
 *
 * @param {number} a
 * @param {number} b
 * @returns {number} A random number in [a, b].
 */
Math.randomRange = function (a, b) {
    return a + Math.random() * (b - a);
};

/**
 * Sets the float precision of a number.
 *
 * @param {number} number
 * @param {number} decimals The number of decimals to keep.
 * @returns {number} New number.
 */
Math.setFloatPrecision = function (number, decimals) {
    var multiplier = Math.pow(10, decimals);

    return Math.round(number * multiplier) / multiplier;
};

/**
 * Sets the float precision of an array of numbers.
 *
 * @param {array} array
 * @param {number} decimals The number of decimals to keep.
 * @returns {number} Array of new numbers.
 */
Array.setFloatPrecision = function (array, decimals) {
    var multiplier = Math.pow(10, decimals),
        arr = [],
        i,
        l;

    for (i = 0, l = array.length; i < l; i++) {
        arr[i] = Math.round(array[i] * multiplier) / multiplier;
    }

    return arr;
};

/**
 * Clamp a number in a range.
 *
 * @param {number} x
 * @param {number} minVal
 * @param {number} maxVal
 * @returns {number} Clamped number.
 */
Math.clamp = function (x, minVal, maxVal) {
    return Math.min(Math.max(x, minVal), maxVal);
};

/**
 * Linear interpolation between to numbers.
 *
 * @param {number} a First number.
 * @param {number} b Second number.
 * @param {number} t Factor.
 * @returns {number} Interpolated value.
 */
Math.lerp = function (a, b, t) {
    return a + t * (b - a);
};

/**
 * Hermite interpolation between to numbers.
 *
 * @param {number} a First number.
 * @param {number} b First control point.
 * @param {number} c Second control point.
 * @param {number} d Second number.
 * @param {number} t Factor.
 * @returns {number} Interpolated value.
 */
Math.hermite = function (a, b, c, d, t) {
    var factorTimes2 = t * t,
        factor1 = factorTimes2 * (2 * t - 3) + 1,
        factor2 = factorTimes2 * (t - 2) + t,
        factor3 = factorTimes2 * (t - 1),
        factor4 = factorTimes2 * (3 - 2 * t);

    return (a * factor1) + (b * factor2) + (c * factor3) + (d * factor4);
};

/**
 * Bezier interpolation between to numbers.
 *
 * @param {number} a First number.
 * @param {number} b First control point.
 * @param {number} c Second control point.
 * @param {number} d Second number.
 * @param {number} t Factor.
 * @returns {number} Interpolated value.
 */
Math.bezier = function (a, b, c, d, t) {
    var invt = 1 - t,
        factorTimes2 = t * t,
        inverseFactorTimesTwo = invt * invt,
        factor1 = inverseFactorTimesTwo * invt,
        factor2 = 3 * t * inverseFactorTimesTwo,
        factor3 = 3 * factorTimes2 * invt,
        factor4 = factorTimes2 * t;

    return (a * factor1) + (b * factor2) + (c * factor3) + (d * factor4);
};

/**
 * Gets the sign of a number.
 *
 * @param {number} x
 * @returns {number} The sign.
 */
Math.sign = function (x) {
    return x === 0 ? 0 : (x < 0 ? -1 : 1);
};

/**
 * Copies the sign of one number onto another.
 *
 * @param {number} x Destination.
 * @param {number} y Source.
 * @returns {number} Returns the destination with the source's sign.
 */
Math.copysign = function (x, y) {
    var signy = Math.sign(y),
        signx;

    if (signy === 0) {
        return 0;
    }

    signx = Math.sign(x);

    if (signx !== signy) {
        return -x;
    }

    return x;
};

/**
 * Gets the closest power of two bigger than the given number.
 *
 * @param {number} x
 * @returns {number} A power of two number.
 */
Math.powerOfTwo = function (x) {
    x--;
    x |= x >> 1; 
    x |= x >> 2; 
    x |= x >> 4; 
    x |= x >> 8; 
    x |= x >> 16; 
    x++;

    return x;
};
var interpolator = (function () {
    var zeroV = vec3.create(),
        zeroQ = quat.create();

    function scalar(a, b, c, d, t, type) {
        if (type === 0) {
            return a;
        } else if (type === 1) {
            return Math.lerp(a, d, t);
        } else if (type === 2) {
            return Math.hermite(a, b, c, d, t);
        } else if (type === 3) {
            return Math.bezier(a, b, c, d, t);
        }

        return 0;
    }

    function vector(out, a, b, c, d, t, type) {
        if (type === 0) {
            return a;
        } else if (type === 1) {
            return vec3.lerp(out, a, d, t);
        } else if (type === 2) {
            return vec3.hermite(out, a, b, c, d, t);
        } else if (type === 3) {
            return vec3.bezier(out, a, b, c, d, t);
        }

        return vec3.copy(out, zeroV);
    }

    function quaternion(out, a, b, c, d, t, type) {
        if (type === 0) {
            return a;
        } else if (type === 1) {
            return quat.nlerp(out, a, d, t);
        } else if (type === 2 || type === 3) {
            return quat.nquad(out, a, b, c, d, t);
        }

        return quat.copy(out, zeroQ);
    }

    return function (out, a, b, c, d, t, type) {
        var length = a.length;

        if (length === 3) {
            return vector(out, a, b, c, d, t, type);
        } else if (length === 4) {
            return quaternion(out, a, b, c, d, t, type);
        } else {
            return scalar(a, b, c, d, t, type);
        }
    };
}());
/**
 * A simple binary reader.
 *
 * @class BinaryReader
 * @param {ArrayByffer} buffer The internal buffer this reader uses.
 * @property {ArrayBuffer} buffer
 * @property {number} index
 * @property {DataView} dataview
 * @property {Uint8Array} uint8Array
 * @property {number} size
 */
function BinaryReader(buffer) {
    this.buffer = buffer;
    this.index = 0;
    this.dataview = new DataView(buffer);
    this.uint8Array = new Uint8Array(buffer);
    this.size = buffer.byteLength;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @returns {number} The remaining bytes.
 */
function remaining(reader) {
    return reader.size - reader.index;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} bytes Bytes to skip.
 */
function skip(reader, bytes) {
    reader.index += bytes;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} index Where to seek to.
 */
function seek(reader, index) {
    reader.index = index;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @return {number} The reader's position.
 */
function tell(reader) {
    return reader.index;
}

/**
 * Reads a string, but does not advance the reader's position.
 *
 * @param {BinaryReader} reader Binary reader.
 * @param {number} size Number of bytes to read.
 * @return {string} The read string.
 */
function peek(reader, size) {
    var bytes = reader.uint8Array.subarray(reader.index, reader.index + size),
        b,
        data = "";

    for (var i = 0, l = size; i < l; i++) {
        b = bytes[i];

        // Avoid \0
        if (b > 0) {
            data += String.fromCharCode(b);
        }
    }

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} size Number of bytes to read.
 * @return {string} The read string.
 */
function read(reader, size) {
    var data = peek(reader, size);

    reader.index += size;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @return {number} The read number.
 */
function readInt8(reader) {
    var data = reader.dataview.getInt8(reader.index, true);

    reader.index += 1;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @return {number} The read number.
 */
function readInt16(reader) {
    var data = reader.dataview.getInt16(reader.index, true);

    reader.index += 2;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @return {number} The read number.
 */
function readInt32(reader) {
    var data = reader.dataview.getInt32(reader.index, true);

    reader.index += 4;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @return {number} The read number.
 */
function readUint8(reader) {
    var data = reader.dataview.getUint8(reader.index, true);

    reader.index += 1;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @return {number} The read number.
 */
function readUint16(reader) {
    var data = reader.dataview.getUint16(reader.index, true);

    reader.index += 2;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @return {number} The read number.
 */
function readUint32(reader) {
    var data = reader.dataview.getUint32(reader.index, true);

    reader.index += 4;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @return {number} The read number.
 */
function readFloat32(reader) {
    var data = reader.dataview.getFloat32(reader.index, true);

    reader.index += 4;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @return {number} The read number.
 */
function readFloat64(reader) {
    var data = reader.dataview.getFloat64(reader.index, true);

    reader.index += 8;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Array size.
 * @return {Int8Array} The read array.
 */
function readInt8Array(reader, count) {
    var data = new Int8Array(count);

    for (var i = 0; i < count; i++) {
        data[i] = reader.dataview.getInt8(reader.index + i, true);
    }

    reader.index += data.byteLength;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Array size.
 * @return {Int16Array} The read array.
 */
function readInt16Array(reader, count) {
    var data = new Int16Array(count);

    for (var i = 0; i < count; i++) {
        data[i] = reader.dataview.getInt16(reader.index + 2 * i, true);
    }

    reader.index += data.byteLength;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Array size.
 * @return {Int32Array} The read array.
 */
function readInt32Array(reader, count) {
    var data = new Int32Array(count);

    for (var i = 0; i < count; i++) {
        data[i] = reader.dataview.getInt32(reader.index + 4 * i, true);
    }

    reader.index += data.byteLength;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Array size.
 * @return {Uint8Array} The read array.
 */
function readUint8Array(reader, count) {
    var data = new Uint8Array(count);

    for (var i = 0; i < count; i++) {
        data[i] = reader.dataview.getUint8(reader.index + i, true);
    }

    reader.index += data.byteLength;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Array size.
 * @return {Uint16Array} The read array.
 */
function readUint16Array(reader, count) {
    var data = new Uint16Array(count);

    for (var i = 0; i < count; i++) {
        data[i] = reader.dataview.getUint16(reader.index + 2 * i, true);
    }

    reader.index += data.byteLength;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Array size.
 * @return {Uint32Array} The read array.
 */
function readUint32Array(reader, count) {
    var data = new Uint32Array(count);

    for (var i = 0; i < count; i++) {
        data[i] = reader.dataview.getUint32(reader.index + 4 * i, true);
    }

    reader.index += data.byteLength;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Array size.
 * @return {Float32Array} The read array.
 */
function readFloat32Array(reader, count) {
    var data = new Float32Array(count);

    for (var i = 0; i < count; i++) {
        data[i] = reader.dataview.getFloat32(reader.index + 4 * i, true);
    }

    reader.index += data.byteLength;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Array size.
 * @return {Float64Array} The read array.
 */
function readFloat64Array(reader, count) {
    var data = new Float64Array(count);

    for (var i = 0; i < count; i++) {
        data[i] = reader.dataview.getFloat64(reader.index + 8 * i, true);
    }

    reader.index += data.byteLength;

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Rows.
 * @param {number} size Columns.
 * @return {array} The read array of Int8Array.
 */
function readInt8Matrix(reader, count, size) {
    var data = [];

    for (var i = 0; i < count; i++) {
        data[i] = readInt8Array(reader, size);
    }

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Rows.
 * @param {number} size Columns.
 * @return {array} The read array of Int16Array.
 */
function readInt16Matrix(reader, count, size) {
    var data = [];

    for (var i = 0; i < count; i++) {
        data[i] = readInt16Array(reader, size);
    }

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Rows.
 * @param {number} size Columns.
 * @return {array} The read array of Int32Array.
 */
function readInt32Matrix(reader, count, size) {
    var data = [];

    for (var i = 0; i < count; i++) {
        data[i] = readInt32Array(reader, size);
    }

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Rows.
 * @param {number} size Columns.
 * @return {array} The read array of Uint8Array.
 */
function readUint8Matrix(reader, count, size) {
    var data = [];

    for (var i = 0; i < count; i++) {
        data[i] = readUint8Array(reader, size);
    }

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Rows.
 * @param {number} size Columns.
 * @return {array} The read array of Uint16Array.
 */
function readUint16Matrix(reader, count, size) {
    var data = [];

    for (var i = 0; i < count; i++) {
        data[i] = readUint16Array(reader, size);
    }

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Rows.
 * @param {number} size Columns.
 * @return {array} The read array of Uint32Array.
 */
function readUint32Matrix(reader, count, size) {
    var data = [];

    for (var i = 0; i < count; i++) {
        data[i] = readUint32Array(reader, size);
    }

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Rows.
 * @param {number} size Columns.
 * @return {array} The read array of Float32Array.
 */
function readFloat32Matrix(reader, count, size) {
    var data = [];

    for (var i = 0; i < count; i++) {
        data[i] = readFloat32Array(reader, size);
    }

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @param {number} count Rows.
 * @param {number} size Columns.
 * @return {array} The read array of Float64Array.
 */
function readFloat64Matrix(reader, count, size) {
    var data = [];

    for (var i = 0; i < count; i++) {
        data[i] = readFloat64Array(reader, size);
    }

    return data;
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @return {Float32Array} The read array.
 */
function readVector2(reader) {
    return readFloat32Array(reader, 2);
}
  
/**
 * @param {BinaryReader} reader Binary reader.
 * @return {Float32Array} The read array.
 */
function readVector3(reader) {
    return readFloat32Array(reader, 3);
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @return {Float32Array} The read array.
 */
function readVector4(reader) {
    return readFloat32Array(reader, 4);
}

/**
 * @param {BinaryReader} reader Binary reader.
 * @return {Float32Array} The read array.
 */
function readMatrix(reader) {
    return readFloat32Array(reader, 16);
}
// Compute the spherical coordinates of a vector (end - start).
// The returned values are [radius, azimuthal angle, polar angle].
// See mathworld.wolfram.com/SphericalCoordinates.html
function computeSphericalCoordinates(start, end) {
    var v = vec3.sub([], start, end),
        r = vec3.len(v),
        theta = Math.atan2(v[1], v[0]),
        phi = Math.acos(v[2] / r);
    
    return [r, theta, phi];
}

// A simple incrementing ID generator
var generateID = (function () {
    var i = -1;

    return function () {
        i += 1;

        return i;
    };
}());

/**
 * Mixes one object onto another.
 *
 * @param {object} mixer The source.
 * @param {object} mixed The destination.
 */
function mixin(mixer, mixed) {
    var properties = Object.getOwnPropertyNames(mixer),
        property,
        i,
        l;

    for (i = 0, l = properties.length; i < l; i++) {
        property = properties[i];

        mixed[property] = mixer[property];
    }
    
    return mixed;
}

function extend(base, properties) {
    var prototype = Object.create(base),
        keys = Object.keys(properties),
        key,
        i,
        l;
    
    for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        prototype[key] = properties[key];
    }
    
    return prototype;
}

/**
 * Encodes two 0-255 numbers into one.
 *
 * @param {number} x The first number.
 * @param {number} y The second number.
 * @returns {number} The encoded number.
 */
function encodeFloat2(x, y) {
    return x + y * 256;
}

/**
 * Decodes a previously encoded number into the two original numbers.
 *
 * @param {number} f The input.
 * @returns {array} The two decoded numbers.
 */
function decodeFloat2(f) {
    var v = [];

    v[1] = Math.floor(f / 256);
    v[0] = Math.floor(f - v[1] * 256);

    return v;
}

/**
 * Encodes three 0-255 numbers into one.
 *
 * @param {number} x The first number.
 * @param {number} y The second number.
 * @param {number} z The third number.
 * @returns {number} The encoded number.
 */
function encodeFloat3(x, y, z) {
    return x + y * 256 + z * 65536;
}

/**
 * Decodes a previously encoded number into the three original numbers.
 *
 * @param {number} f The input.
 * @returns {array} The three decoded numbers.
 */
function decodeFloat3(f) {
    var v = [];

    v[2] = Math.floor(f / 65536);
    v[1] = Math.floor((f - v[2] * 65536) / 256);
    v[0] = Math.floor(f - v[2] * 65536 - v[1] * 256);

    return v;
}

/**
 * Gets the file name from a file path.
 *
 * @param {string} source The file path.
 * @returns {string} The file name.
 */
function fileNameFromPath(path) {
    var input = path.replace(/^.*[\\\/]/, "")
    
    return input.substr(0, input.lastIndexOf(".")) || input;
}

/**
 * Gets the file extention from a file path.
 *
 * @param {string} source The file path.
 * @returns {string} The file extension.
 */
function fileTypeFromPath(path) {
    var input = path.replace(/^.*[\\\/]/, ""),
        output = input.substring(input.lastIndexOf(".")) || "";
    
    return output.toLowerCase();
}

if (!window.requestAnimationFrame ) {
    window.requestAnimationFrame = (function() {
        return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); };
    }());
}

/**
 * Sends an XHR2 request.
 *
 * @param {string} path The url to request.
 * @param {boolean} binary If true, the request type will be arraybuffer.
 * @param {function} onload onload callback.
 * @param {function} onerror onerror callback.
 * @param {function} onprogress onprogress callback.
 */
function getRequest(path, binary, onload, onerror, onprogress) {
    var xhr = new XMLHttpRequest();

    if (onload) {
        xhr.addEventListener("load", onload);
    }

    if (onerror) {
        xhr.addEventListener("error", onerror);
    }

    if (onprogress) {
        xhr.addEventListener("progress", onprogress);
    }

    xhr.open("GET", path, true);

    if (binary) {
        xhr.responseType = "arraybuffer";
    }

    xhr.send();
    
    return xhr;
}

/**
 * A very simple string hashing algorithm.
 *
 * @param {string} s String to hash.
 * @returns {number} The string hash.
 */
String.hashCode = function(s) {
    var hash = 0,
        i,
        l;

    for (i = 0, l = s.length; i < l; i++) {
        hash = hash * 31 + s.charCodeAt(i);
        hash = hash & hash;
    }

    return hash;
};

/**
 * A deep Object copy.
 *
 * @param {object} object The object to copy.
 * @returns {object} The copied object.
 */
Object.copy = function (object) {
    var keys = Object.keys(object),
        key,
        newObj = (object instanceof Array) ? [] : {},
        i, 
        l;

    for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];

        if (typeof key === "object") {
            newObj[key] = Object.copy(object[key]);
        } else {
            newObj[key] = object[key];
        }
    }

    return newObj;
};

Object.clear = function (object) {
    for (var property in object) {
        if (object.hasOwnProperty(property)) {
            delete object[property];
        }
    }
};

/**
 * A shallow Array copy.
 *
 * @param {array} a The array to copy.
 * @returns {array} The copied array.
 */
Array.copy = function (array) {
    var newArray = [],
        i,
        l;

    for (i = 0, l = array.length; i < l; i++) {
        newArray[i] = array[i];
    }

    return newArray;
};

Array.clear = function (array) {
    while (array.length) {
      array.pop();
    }
    
    return array;
};/**
 * @memberof GL
 * @class A WebGL rectangle.
 * @name Rect
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {number} z Z coordinate.
 * @param {number} hw Half of the width.
 * @param {number} hh Half of the height.
 * @param {number} stscale A scale that is applied to the texture coordinates.
 * @property {number} originalSize
 * @property {number} originalStscale
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {WebGLBuffer} buffer
 * @property {Float32Array} data
 */
function Rect(ctx, x, y, z, hw, hh, stscale) {
    stscale = stscale || 1;

    this.ctx = ctx;
    this.originalSize = hw;
    this.originalStscale = stscale;
    this.x = x;
    this.y = y;
    this.z = z;

    this.buffer = ctx.createBuffer();
    this.data = new Float32Array(20);

    this.resize(hw, hh);
}

Rect.prototype = {
  /**
   * Renders a rectangle with the given shader.
   *
   * @memberof GL.Rect
   * @instance
   * @param {GL.Shader} shader
   */
    render: function (shader) {
        var ctx = this.ctx;
        
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.buffer);

        ctx.vertexAttribPointer(shader.variables.a_position, 3, ctx.FLOAT, false, 20, 0);
        ctx.vertexAttribPointer(shader.variables.a_uv, 2, ctx.FLOAT, false, 20, 12);

        ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);
    },
  
  /**
   * Resizes a rectangle..
   *
   * @memberof GL.Rect
   * @instance
   * @param {number} hw The new half width.
   * @param {number} hh The new half height.
   */
    resize: function (hw, hh) {
        hw /= 2;
        hh /= 2;
        
        var ctx = this.ctx;
        var diff = hw / this.originalSize;
        var stscale = this.originalStscale * diff;
        var data = this.data;
        var x = this.x;
        var y = this.y;
        var z = this.z;

        data[0] = x - hw;
        data[1] = y - hh;
        data[2] = z
        data[3] = 0;
        data[4] = stscale;

        data[5] = x + hw;
        data[6] = y - hh;
        data[7] = z;
        data[8] = stscale;
        data[9] = stscale;

        data[10] = x - hw;
        data[11] = y + hh;
        data[12] = z;
        data[13] = 0;
        data[14] = 0;

        data[15] = x + hw;
        data[16] = y + hh;
        data[17] = z;
        data[18] = stscale;
        data[19] = 0;

        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.buffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.STATIC_DRAW);
    }
};
/**
 * @memberof GL
 * @class A WebGL cube.
 * @name Cube
 * @param {number} x1 Minimum X coordinate.
 * @param {number} y1 Minimum Y coordinate.
 * @param {number} z1 Minimum Z coordinate.
 * @param {number} x2 Maximum X coordinate.
 * @param {number} y2 Maximum Y coordinate.
 * @param {number} z2 Maximum Z coordinate.
 * @property {WebGLBuffer} buffer
 * @property {Float32Array} data
 */
function Cube(ctx, x1, y1, z1, x2, y2, z2) {
    this.ctx = ctx;
    this.buffer = ctx.createBuffer();
    this.data = new Float32Array([
        x1, y2, z1,
        x1, y2, z2,
        x1, y2, z2,
        x2, y2, z2,
        x2, y2, z2,
        x2, y2, z1,
        x2, y2, z1,
        x1, y2, z1,
        x1, y1, z1,
        x1, y1, z2,
        x1, y1, z2,
        x2, y1, z2,
        x2, y1, z2,
        x2, y1, z1,
        x2, y1, z1,
        x1, y1, z1,
        x1, y1, z2,
        x1, y2, z2,
        x1, y2, z1,
        x1, y1, z1,
        x2, y1, z2,
        x2, y2, z2,
        x2, y2, z1,
        x2, y1, z1
    ]);

    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.buffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, this.data, ctx.STATIC_DRAW);
}

Cube.prototype = {
  /**
   * Renders a cubes's lines with the given shader.
   *
   * @memberof GL.Cube
   * @instance
   * @param {GL.Shader} shader
   */
    renderLines: function (shader) {
        var ctx = this.ctx;
        
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.buffer);

        ctx.vertexAttribPointer(shader.variables.a_position, 3, ctx.FLOAT, false, 12, 0);

        ctx.drawArrays(ctx.LINES, 0, 24);
    }
};
/**
 * @memberof GL
 * @class A WebGL sphere.
 * @name Sphere
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {number} z Z coordinate.
 * @param {number} latitudeBands Latitude bands.
 * @param {number} longitudeBands Longitude bands.
 * @param {number} radius The sphere radius.
 * @property {WebGLBuffer} vertexBuffer
 * @property {WebGLBuffer} indexBuffer
 * @property {Float32Array} vertexArray
 * @property {Float32Array} indexArray
 */
function Sphere(ctx, x, y, z, latitudeBands, longitudeBands, radius) {
    var vertexData = [];
    var indexData = [];
    var latNumber;
    var longNumber;

    for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var vx = cosPhi * sinTheta;
            var vy = cosTheta;
            var vz = sinPhi * sinTheta;
            var s = 1 - (longNumber / longitudeBands);
            var t = latNumber / latitudeBands;

            // Position
            vertexData.push(x + vx * radius);
            vertexData.push(y + vy * radius);
            vertexData.push(z + vz * radius);
            // Normal
            //vertexData.push(x);
            //vertexData.push(y);
            //vertexData.push(z);
            // Texture coordinate
            vertexData.push(s);
            vertexData.push(t);
        }
    }

    for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;

            // First trianctxe
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);
            // Second trianctxe
            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    this.ctx = ctx;
    
    this.vertexArray = new Float32Array(vertexData);
    this.indexArray = new Uint16Array(indexData);

    this.vertexBuffer = ctx.createBuffer();
    this.indexBuffer = ctx.createBuffer();

    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.vertexBuffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, this.vertexArray, ctx.STATIC_DRAW);

    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, this.indexArray, ctx.STATIC_DRAW);
}

Sphere.prototype = {
  /**
   * Renders a sphere with the given shader.
   *
   * @memberof GL.Sphere
   * @instance
   * @param {GL.Shader} shader
   */
    render: function (shader) {
        var ctx = this.ctx;
        
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.vertexBuffer);

        ctx.vertexAttribPointer(shader.variables.a_position, 3, ctx.FLOAT, false, 20, 0);
        ctx.vertexAttribPointer(shader.variables.a_uv, 2, ctx.FLOAT, false, 20, 12);

        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        ctx.drawElements(ctx.TRIANGLES, this.indexArray.length, ctx.UNSIGNED_SHORT, 0);
    },
  
  /**
   * Renders a sphere's lines with the given shader.
   *
   * @memberof GL.Sphere
   * @instance
   * @param {Shader} shader
   */
    renderLines: function (shader) {
        var ctx = this.ctx;
        
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.vertexBuffer);

        ctx.vertexAttribPointer(shader.variables.a_position, 3, ctx.FLOAT, false, 20, 0);

        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        ctx.drawElements(ctx.LINES, this.indexArray.length, ctx.UNSIGNED_SHORT, 0);
    }
};
/**
 * @memberof GL
 * @class A WebGL cylinder.
 * @name Cylinder
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {number} z Z coordinate.
 * @param {number} r The cylinder radius.
 * @param {number} h The cylinder height.
 * @param {number} bands Number of bands.
 * @property {WebGLBuffer} buffer
 * @property {Float32Array} data
 * @property {number} bands
 */
function Cylinder(ctx, x, y, z, r, h, bands) {
    var i, l;
    var step = Math.PI * 2 / bands;
    var offset = 0;

    var buffer = ctx.createBuffer();
    var data = new Float32Array(72 * bands);
  
    for (i = 0, l = bands; i < l; i++) {
        var c = Math.cos(step * i) * r;
        var s = Math.sin(step * i) * r;
        var c2 = Math.cos(step * (i + 1)) * r;
        var s2 = Math.sin(step * (i + 1)) * r;
        var index = i * 72;

        // Top band
        data[index + 0] = 0;
        data[index + 1] = 0;
        data[index + 2] = h;
        data[index + 3] = c;
        data[index + 4] = s;
        data[index + 5] = h;

        data[index + 6] = 0;
        data[index + 7] = 0;
        data[index + 8] = h;
        data[index + 9] = c2;
        data[index + 10] = s2;
        data[index + 11] = h;

        data[index + 12] = c;
        data[index + 13] = s;
        data[index + 14] = h;
        data[index + 15] = c2;
        data[index + 16] = s2;
        data[index + 17] = h;

        // Bottom band
        data[index + 18] = 0;
        data[index + 19] = 0;
        data[index + 20] = -h;
        data[index + 21] = c;
        data[index + 22] = s;
        data[index + 23] = -h;

        data[index + 24] = 0;
        data[index + 25] = 0;
        data[index + 26] = -h;
        data[index + 27] = c2;
        data[index + 28] = s2;
        data[index + 29] = -h;

        data[index + 30] = c;
        data[index + 31] = s;
        data[index + 32] = -h;
        data[index + 33] = c2;
        data[index + 34] = s2;
        data[index + 35] = -h;

        // Side left-bottom band
        data[index + 36] = c;
        data[index + 37] = s;
        data[index + 38] = h;
        data[index + 39] = c;
        data[index + 40] = s;
        data[index + 41] = -h;

        data[index + 42] = c;
        data[index + 43] = s;
        data[index + 44] = h;
        data[index + 45] = c2;
        data[index + 46] = s2;
        data[index + 47] = -h;

        data[index + 48] = c;
        data[index + 49] = s;
        data[index + 50] = -h;
        data[index + 51] = c2;
        data[index + 52] = s2;
        data[index + 53] = -h;

        // Side right-top band
        data[index + 54] = c2;
        data[index + 55] = s2;
        data[index + 56] = -h;
        data[index + 57] = c;
        data[index + 58] = s;
        data[index + 59] = h;

        data[index + 60] = c2;
        data[index + 61] = s2;
        data[index + 62] = -h;
        data[index + 63] = c2;
        data[index + 64] = s2;
        data[index + 65] = h;

        data[index + 66] = c;
        data[index + 67] = s;
        data[index + 68] = h;
        data[index + 69] = c2;
        data[index + 70] = s2;
        data[index + 71] = h;
    }

    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.STATIC_DRAW);

    this.ctx = ctx;
    
    this.buffer = buffer;
    this.data = data;
    this.bands = bands;
}

Cylinder.prototype = {
  /**
   * Renders a cylinder's lines with the given shader.
   *
   * @memberof GL.Cylinder
   * @instance
   * @param {GL.Shader} shader
   */
    renderLines: function (shader) {
        var ctx = this.ctx;
        
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.buffer);

        ctx.vertexAttribPointer(shader.variables.a_position, 3, ctx.FLOAT, false, 12, 0);

        ctx.drawArrays(ctx.LINES, 0, this.bands * 24);
    }
};
function AsyncTexture(source, fileType, options, textureHandlers, ctx, compressedTextures, callbacks, isFromMemory) {
    var handler = textureHandlers[fileType];
    
    this.type = "texture";
    this.source = source;
    this.options = options || {};
    this.handler = handler;
    this.onerror = callbacks.onerror;
    this.onprogress = callbacks.onprogress;
    this.onload = callbacks.onload;
    this.id = generateID();
    
    callbacks.onloadstart(this);
    
    if (handler) {
        if (isFromMemory) {
            this.impl = new this.handler(source, this.options, ctx, this.onerror.bind(undefined, this), this.onload.bind(undefined, this), compressedTextures, isFromMemory);
        } else {
            this.request = getRequest(source, true, this.onloadTexture.bind(this, ctx, compressedTextures), callbacks.onerror.bind(undefined, this), callbacks.onprogress.bind(undefined, this));
        }
    } else {
        callbacks.onerror(this, "NoHandler");
    }
}

AsyncTexture.prototype = {
    onloadTexture: function (ctx, compressedTextures, e) {
        var target = e.target,
            response = target.response,
            status = target.status;
        
        if (status === 200) {
            this.impl = new this.handler(target.response, this.options, ctx, this.onerror.bind(undefined, this),  this.onload.bind(undefined, this), compressedTextures);
        } else {
            this.onerror(this, "" + status);
        }
    },
    
    loaded: function () {
        if (this.request) {
            return (this.request.readyState === XMLHttpRequest.DONE);
        }
        
        return false;
    }
};
/**
 * A texture.
 * 
 * @memberof GL
 * @class A wrapper around native images.
 * @name NativeTexture
 * @param {ArrayBuffer} arrayBuffer The raw texture data.
 * @param {object} options An object containing options.
 * @param {WebGLRenderingContext} ctx A WebGL context.
 * @param {function} onerror A function that allows to report errors.
 * @param {function} onload A function that allows to manually report a success at parsing.
 * @property {WebGLTexture} id
 * @property {boolean} ready
 */
function NativeTexture(source, options, ctx, onerror, onload, compressedTextures, isFromMemory) {
    if (isFromMemory) {
        var id = ctx.createTexture();

        ctx.bindTexture(ctx.TEXTURE_2D, id);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_LINEAR);
        ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, source);
        ctx.generateMipmap(ctx.TEXTURE_2D);

        this.id = id;
        this.ready = true;

        onload();
    } else {
        var blob = new Blob([source]),
            url = URL.createObjectURL(blob),
            image = new Image(),
            self = this;

        image.onload = function (e) {
            var id = ctx.createTexture();

            ctx.bindTexture(ctx.TEXTURE_2D, id);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_LINEAR);
            ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image);
            ctx.generateMipmap(ctx.TEXTURE_2D);

            self.id = id;
            self.ready = true;

            onload();
        };

        image.src = url;
    }
}
/**
 * @memberof GL
 * @class A wrapper around WebGL shader units.
 * @name ShaderUnit
 * @param {string} source The GLSL source.
 * @param {number} type The WebGL shader unit identifier - VERTEX_SHADER or FRAGMENT_SHADER.
 * @param {string} name The owning shader's name.
 * @property {string} source
 * @property {number} type
 * @property {WebGLShader} id
 * @property {boolean} ready
 */
function ShaderUnit(ctx, source, type, name) {
    var id = ctx.createShader(type);

    this.type = "shaderunit";
    this.source = source;
    this.shaderType = type;
    this.id = id;

    ctx.shaderSource(id, source);
    ctx.compileShader(id);

    if (ctx.getShaderParameter(id, ctx.COMPILE_STATUS)) {
        this.ready = true;
    } else {
        //console.warn("Failed to compile a shader:");
        console.warn(name, ctx.getShaderInfoLog(this.id));
        //console.warn(source);
        onerror(this, "Compile");
    }
}

/**
 * @memberof GL
 * @class A wrapper around WebGL shader programs.
 * @name Shader
 * @param {string} name The shader's name.
 * @param {GL.ShaderUnit} vertexUnit The vertex shader unit.
 * @param {GL.ShaderUnit} fragmentUnit The fragment shader unit.
 * @property {string} name
 * @property {GL.ShaderUnit} vertexUnit
 * @property {GL.ShaderUnit} fragmentUnit
 * @property {WebGLProgram} id
 * @property {object} variables
 * @property {number} attribs
 * @property {boolean} ready
 */
function Shader(ctx, name, vertexUnit, fragmentUnit) {
    var id = ctx.createProgram();

    this.type = "shader";
    this.name = name;
    this.vertexUnit = vertexUnit;
    this.fragmentUnit = fragmentUnit;
    this.id = id;

    ctx.attachShader(id, vertexUnit.id);
    ctx.attachShader(id, fragmentUnit.id);
    ctx.linkProgram(id);

    if (ctx.getProgramParameter(id, ctx.LINK_STATUS)) {
        this.getVariables(ctx);
        this.ready = true;
    } else {
        console.warn(name, ctx.getProgramInfoLog(this.id));
        onerror(this, "Link");
    }
}

Shader.prototype = {
    getVariables: function (ctx) {
        var id = this.id;
        var variables = {};
        var i, l, v, location;

        for (i = 0, l = ctx.getProgramParameter(id, ctx.ACTIVE_UNIFORMS); i < l; i++) {
            v = ctx.getActiveUniform(id, i);
            location = ctx.getUniformLocation(id, v.name);

            variables[v.name] = location;
        }

        l = ctx.getProgramParameter(id, ctx.ACTIVE_ATTRIBUTES);

        for (i = 0; i < l; i++) {
            v = ctx.getActiveAttrib(id, i);
            location = ctx.getAttribLocation(id, v.name);

            variables[v.name] = location;
        }

        this.variables = variables;
        this.attribs = l;
    }
};
/**
 * @class A wrapper around WebGL.
 * @name GL
 * @param {HTMLCanvasElement} element A canvas element.
 * @param {function} onload A callback function.
 * @param {function} callbacks.onerror A callback function.
 * @param {function} callbacks.onprogress A callback function.
 * @param {function} callbacks.onloadstart A callback function.
 * @param {function} callbacks.onremove A callback function.
 * @property {WebGLRenderingContext} ctx
 */
function GL(element, callbacks) {
    var ctx,
        identifiers = ["webgl", "experimental-webgl"],
        i,
        l;
  
    for (var i = 0, l = identifiers.length; i < l; ++i) {
        try {
            ctx = element.getContext(identifiers[i], {antialias: true, alpha: false/*, preserveDrawingBuffer: true*/});
        } catch(e) {
            
        }

        if (ctx) {
            break;
        }
    }
  
    if (!ctx) {
        console.error("[WebGLContext]: Failed to create a WebGLContext");
        throw "[WebGLContext]: Failed to create a WebGLContext";
    }
  
    var hasVertexTexture = ctx.getParameter(ctx.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0;
    var hasFloatTexture = ctx.getExtension("OES_texture_float");
    var compressedTextures = ctx.getExtension("WEBGL_compressed_texture_s3tc");
    
    if (!hasVertexTexture) {
        console.error("[WebGLContext]: No vertex shader texture support");
        throw "[WebGLContext]: No vertex shader texture support";
    }

    if (!hasFloatTexture) {
        console.error("[WebGLContext]: No float texture support");
        throw "[WebGLContext]: No float texture support";
    }
    
    if (!compressedTextures) {
        console.warn("[WebGLContext]: No compressed textures support");
    }
  
    var refreshViewProjectionMatrix = false;
    var projectionMatrix = mat4.create();
    var viewMatrix = mat4.create();
    var viewProjectionMatrix = mat4.create();
    var matrixStack = [];
    var textureStore = {};
    var textureStoreById = {};
    var shaderUnitStore = {};
    var shaderStore = {};
    var boundShader;
    var boundShaderName = "";
    var boundTextures = [];
    var floatPrecision = "precision mediump float;\n";
    var textureHandlers = {};

    ctx.viewport(0, 0, element.clientWidth, element.clientHeight);
    ctx.depthFunc(ctx.LEQUAL);
    ctx.enable(ctx.DEPTH_TEST);
    ctx.enable(ctx.CULL_FACE);
  
    function textureOptions(wrapS, wrapT, magFilter, minFilter) {
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, wrapS);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, wrapT);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, magFilter);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, minFilter);
    }
	
	/**
	 * Sets a perspective projection matrix.
	 *
	 * @memberof GL
	 * @instance
	 * @param {number} fovy
	 * @param {number} aspect
	 * @param {number} near
	 * @param {number} far
	 */
	function setPerspective(fovy, aspect, near, far) {
		mat4.perspective(projectionMatrix, fovy, aspect, near, far);
		refreshViewProjectionMatrix = true;
	}

	/**
	 * Sets an orthogonal projection matrix.
	 *
	 * @memberof GL
	 * @instance
	 * @param {number} left
	 * @param {number} right
	 * @param {number} bottom
	 * @param {number} top
	 * @param {number} near
	 * @param {number} far
	 */
	function setOrtho(left, right, bottom, top, near, far) {
		mat4.ortho(projectionMatrix, left, right, bottom, top, near, far);
		refreshViewProjectionMatrix = true;
	}

	/**
	 * Resets the view matrix.
	 *
	 * @memberof GL
	 * @instance
	 */
	function loadIdentity() {
		mat4.identity(viewMatrix);
		refreshViewProjectionMatrix = true;
	}

	/**
	 * Translates the view matrix.
	 *
	 * @memberof GL
	 * @instance
	 * @param {vec3} v Translation.
	 */
	function translate(v) {
		mat4.translate(viewMatrix, viewMatrix, v);
		refreshViewProjectionMatrix = true;
	}

	/**
	 * Rotates the view matrix.
	 *
	 * @memberof GL
	 * @instance
	 * @param {number} radians Angle.
	 * @param {vec3} axis The rotation axis..
	 */
	function rotate(radians, axis) {
		mat4.rotate(viewMatrix, viewMatrix, radians, axis);
		refreshViewProjectionMatrix = true;
	}

	/**
	 * Scales the view matrix.
	 *
	 * @memberof GL
	 * @instance
	 * @param {vec3} v Scaling.
	 */
	function scale(v) {
		mat4.scale(viewMatrix, viewMatrix, v);
		refreshViewProjectionMatrix = true;
	}

	/**
	 * Sets the view matrix to a look-at matrix.
	 *
	 * @memberof GL
	 * @instance
	 * @param {vec3} eye
	 * @param {vec3} center
	 * @param {vec3} up
	 */
	function lookAt(eye, center, up) {
		mat4.lookAt(viewMatrix, eye, center, up);
		refreshViewProjectionMatrix = true;
	}

	/**
	 * Multiplies the view matrix by another matrix.
	 *
	 * @memberof GL
	 * @instance
	 * @param {mat4} mat.
	 */
	function multMat(mat) {
		mat4.multiply(viewMatrix, viewMatrix, mat);
		refreshViewProjectionMatrix = true;
	}

	/**
	 * Pushes the current view matrix in the matrix stack.
	 *
	 * @memberof GL
	 * @instance
	 */
	function pushMatrix() {
		matrixStack.push(mat4.clone(viewMatrix));
		refreshViewProjectionMatrix = true;
	}

	/**
	 * Pops the matrix stacks and sets the popped matrix to the view matrix.
	 *
	 * @memberof GL
	 * @instance
	 */
	function popMatrix() {
		viewMatrix = matrixStack.pop();
		refreshViewProjectionMatrix = true;
	}

	/**
	 * Gets the view-projection matrix.
	 *
	 * @memberof GL
	 * @instance
	 * @returns {mat4} MVP.
	 */
	function getViewProjectionMatrix() {
		if (refreshViewProjectionMatrix) {
			mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);
			refreshViewProjectionMatrix = false;
		}

		return viewProjectionMatrix;
	}

	/**
	 * Gets the projection matrix.
	 *
	 * @memberof GL
	 * @instance
	 * @returns {mat4} P.
	 */
	function getProjectionMatrix() {
		return projectionMatrix;
	}

	/**
	 * Gets the view matrix.
	 *
	 * @memberof GL
	 * @instance
	 * @returns {mat4} MV.
	 */
	function getViewMatrix() {
		return viewMatrix;
	}

	function setProjectionMatrix(matrix) {
		mat4.copy(projectionMatrix, matrix);
		refreshViewProjectionMatrix = true;
	}

	function setViewMatrix(matrix) {
		mat4.copy(viewMatrix, matrix);
		refreshViewProjectionMatrix = true;
	}

	/**
	 * Creates a new {@link GL.ShaderUnit}, or grabs it from the cache if it was previously created, and returns it.
	 *
	 * @memberof GL
	 * @instance
	 * @param {string} source GLSL source.
	 * @param {number} type Shader unit type.
	 * @param {string} name Owning shader's  name.
	 * @returns {GL.ShaderUnit} The created shader unit.
	 */
	function createShaderUnit(source, type, name) {
		var hash = String.hashCode(source);

		if (!shaderUnitStore[hash]) {
			shaderUnitStore[hash] = new ShaderUnit(ctx, source, type, name);
		}

		return shaderUnitStore[hash];
	}

	/**
	 * Creates a new {@link GL.Shader} program, or grabs it from the cache if it was previously created, and returns it.
	 *
	 * @memberof GL
	 * @instance
	 * @param {string} name The name of the shader.
	 * @param {string} vertexSource Vertex shader GLSL source.
	 * @param {string} fragmentSource Fragment shader GLSL source.
	 * @param {array} defines An array of strings that will be added as #define-s to the shader source.
	 * @returns {GL.Shader?} The created shader, or a previously cached version, or null if it failed to compile and link.
	 */
	function createShader(name, vertexSource, fragmentSource, defines) {
		if (!shaderStore[name]) {
			defines = defines || [];

			for (var i = 0; i < defines.length; i++) {
				defines[i] = "#define " + defines[i];
			}

			defines = defines.join("\n") + "\n";

			var vertexUnit = createShaderUnit(defines + vertexSource, ctx.VERTEX_SHADER, name);
			var fragmentUnit = createShaderUnit(floatPrecision + defines + fragmentSource, ctx.FRAGMENT_SHADER, name);

			if (vertexUnit.ready && fragmentUnit.ready) {
				shaderStore[name] = new Shader(ctx, name, vertexUnit, fragmentUnit);
			}
		}

		if (shaderStore[name] && shaderStore[name].ready) {
			return shaderStore[name];
		}
	}

	/**
	 * Checks if a shader is ready for use.
	 *
	 * @memberof GL
	 * @instance
	 * @param {string} name The name of the shader.
	 * @returns {boolean} The shader's status.
	 */
	function shaderStatus(name) {
		var shader = shaderStore[name];

		return shader && shader.ready;
	}

	/**
	 * Enables the WebGL vertex attribute arrays in the range defined by start-end.
	 *
	 * @memberof GL
	 * @instance
	 * @param {number} start The first attribute.
	 * @param {number} end The last attribute.
	 */
	function enableVertexAttribs(start, end) {
		for (var i = start; i < end; i++) {
			ctx.enableVertexAttribArray(i);
		}
	}

	/**
	 * Disables the WebGL vertex attribute arrays in the range defined by start-end.
	 *
	 * @memberof GL
	 * @instance
	 * @param {number} start The first attribute.
	 * @param {number} end The last attribute.
	 */
	function disableVertexAttribs(start, end) {
		for (var i = start; i < end; i++) {
			ctx.disableVertexAttribArray(i);
		}
	}

	/**
	 * Binds a shader. This automatically handles the vertex attribute arrays. Returns the currently bound shader.
	 *
	 * @memberof GL
	 * @instance
	 * @param {string} name The name of the shader.
	 * @returns {GL.Shader} The bound shader.
	 */
	function bindShader(name) {
		var shader = shaderStore[name];

		if (shader && (!boundShader || boundShader.id !== shader.id)) {
			var oldAttribs = 0;

			if (boundShader) {
				oldAttribs = boundShader.attribs;
			}

			var newAttribs = shader.attribs;

			ctx.useProgram(shader.id);

			if (newAttribs > oldAttribs) {
				enableVertexAttribs(oldAttribs, newAttribs);
			} else if (newAttribs < oldAttribs) {
				disableVertexAttribs(newAttribs, oldAttribs);
			}

			boundShaderName = name;
			boundShader = shader;
		}

		return boundShader;
	}

	/**
	 * Loads a texture, with optional options that will be sent to the texture's constructor,
	 * If the texture was already loaded previously, it returns it.
	 *
	 * @memberof GL
	 * @instance
	 * @param {string} source The texture's url.
	 * @param {object} options Options.
	 */
	function loadTexture(source, fileType, isFromMemory, options) {
	    if (!textureStore[source]) {
	        textureStore[source] = new AsyncTexture(source, fileType, options, textureHandlers, ctx, compressedTextures, callbacks, isFromMemory);
	        textureStoreById[textureStore[source].id] = textureStore[source];
	    }

	    return textureStore[source];
	}

	/**
	 * Unloads a texture.
	 *
	 * @memberof GL
	 * @instance
	 * @param {string} source The texture's url.
	 */
	function removeTexture(source) {
		if (textureStore[source]) {
			callbacks.onremove(textureStore[source]);
			
			delete textureStore[source]; 
		}
	}

	function textureLoaded(source) {
		var texture = textureStore[source];
		
		return (texture && texture.loaded());
	}

	/**
	 * Binds a texture to the specified texture unit.
	 *
	 * @memberof GL
	 * @instance
	 * @param {(string|null)} object A texture source.
	 * @param {number} [unit] The texture unit.
	 */
	function bindTexture(source, unit) {
	    //console.log(source);
		var texture;

		unit = unit || 0;

		if (typeof source === "string") {
		    texture = textureStore[source];
		} else if (typeof source === "number") {
		    texture = textureStoreById[source];
		}

		if (texture && texture.impl && texture.impl.ready) {
			// Only bind if actually necessary
			if (!boundTextures[unit] || boundTextures[unit].id !== texture.id) {
				boundTextures[unit] = texture.impl;

				ctx.activeTexture(ctx.TEXTURE0 + unit);
				ctx.bindTexture(ctx.TEXTURE_2D, texture.impl.id);
			}
		} else {
			boundTextures[unit] = null;

			ctx.activeTexture(ctx.TEXTURE0 + unit);
			ctx.bindTexture(ctx.TEXTURE_2D, null);
		}
	}

	/**
	 * Creates a new {@link GL.Rect} and returns it.
	 *
	 * @memberof GL
	 * @instance
	 * @param {number} x X coordinate.
	 * @param {number} y Y coordinate.
	 * @param {number} z Z coordinate.
	 * @param {number} hw Half of the width.
	 * @param {number} hh Half of the height.
	 * @param {number} stscale A scale that is applied to the texture coordinates.
	 * @returns {GL.Rect} The rectangle.
	 */
	function createRect(x, y, z, hw, hh, stscale) {
		return new Rect(ctx, x, y, z, hw, hh, stscale);
	}

	/**
	 * Creates a new {@link GL.Cube} and returns it.
	 *
	 * @memberof GL
	 * @instance
	 * @param {number} x1 Minimum X coordinate.
	 * @param {number} y1 Minimum Y coordinate.
	 * @param {number} z1 Minimum Z coordinate.
	 * @param {number} x2 Maximum X coordinate.
	 * @param {number} y2 Maximum Y coordinate.
	 * @param {number} z2 Maximum Z coordinate.
	 * @returns {GL.Cube} The cube.
	 */
	function createCube(x1, y1, z1, x2, y2, z2) {
		return new Cube(ctx, x1, y1, z1, x2, y2, z2);
	}

	/**
	 * Creates a new {@link GL.Sphere} and returns it.
	 *
	 * @memberof GL
	 * @instance
	 * @param {number} x X coordinate.
	 * @param {number} y Y coordinate.
	 * @param {number} z Z coordinate.
	 * @param {number} latitudeBands Latitude bands.
	 * @param {number} longitudeBands Longitude bands.
	 * @param {number} radius The sphere radius.
	 * @returns {GL.Sphere} The sphere.
	 */
	function createSphere(x, y, z, latitudeBands, longitudeBands, radius) {
		return new Sphere(ctx, x, y, z, latitudeBands, longitudeBands, radius);
	}

	/**
	 * Creates a new {@link GL.Cylinder} and returns it.
	 *
	 * @memberof GL
	 * @instance
	 * @param {number} x X coordinate.
	 * @param {number} y Y coordinate.
	 * @param {number} z Z coordinate.
	 * @param {number} r The cylinder radius.
	 * @param {number} h The cylinder height.
	 * @param {number} bands Number of bands..
	 * @returns {GL.Cylinder} The cylinder.
	 */
	function createCylinder(x, y, z, r, h, bands) {
		return new Cylinder(ctx, x, y, z, r, h, bands);
	}

	/**
	 * Registers an external handler for an unsupported texture type.
	 *
	 * @memberof GL
	 * @instance
	 * @param {string} fileType The file format the handler handles.
	 * @param {function} textureHandler
	 */
	function registerTextureHandler(fileType, textureHandler) {
		textureHandlers[fileType] = textureHandler;
	}
	
	textureHandlers[".png"] = NativeTexture;
	textureHandlers[".gif"] = NativeTexture;
	textureHandlers[".jpg"] = NativeTexture;

	return {
		setPerspective: setPerspective,
		setOrtho: setOrtho,
		loadIdentity: loadIdentity,
		translate: translate,
		rotate: rotate,
		scale: scale,
		lookAt: lookAt,
		multMat: multMat,
		pushMatrix: pushMatrix,
		popMatrix: popMatrix,
		createShader: createShader,
		shaderStatus: shaderStatus,
		bindShader: bindShader,
		getViewProjectionMatrix: getViewProjectionMatrix,
		getProjectionMatrix: getProjectionMatrix,
		getViewMatrix: getViewMatrix,
		setProjectionMatrix: setProjectionMatrix,
		setViewMatrix: setViewMatrix,
		loadTexture: loadTexture,
		removeTexture: removeTexture,
		textureLoaded: textureLoaded,
		textureOptions: textureOptions,
		bindTexture: bindTexture,
		createRect: createRect,
		createSphere: createSphere,
		createCube: createCube,
		createCylinder: createCylinder,
		ctx: ctx,
		registerTextureHandler: registerTextureHandler
	};
}
function Camera() {
    this.viewport = vec4.create();
    this.fov = 0.7853981633974483;
    this.aspect = 1;
    this.near = 0.1;
    this.far = 100000;
    this.projection = mat4.create();
    this.location = vec3.create();
    this.target = vec3.create();
    this.originalTarget = vec3.create();
    this.panVector = vec3.create();
    this.view = mat4.create();
    this.viewProjection = mat4.create();
    this.inverseViewProjection = mat4.create();
    this.inverseView = mat4.create();
    this.inverseRotation = mat4.create();
    this.theta = 0;
    this.phi = 0;
    // The first four vector describe a rectangle, the last three describe scale vectors
    this.rect = [vec3.fromValues(-1, -1, 0), vec3.fromValues(-1, 1, 0), vec3.fromValues(1, 1, 0), vec3.fromValues(1, -1, 0), vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 1)];
    this.billboardedRect = [vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create()];
    this.dirty = true;
    
    this.heap1 = vec3.create();
    this.heap2 = vec3.create();
    
    this.reset();
}

Camera.prototype = {
    reset: function () {
        vec3.set(this.panVector, 0, 0, -300);
        vec3.set(this.target, 0, 0, 0);
        vec3.set(this.originalTarget, 0, 0, 0);
        
        this.theta = 5.5;
        this.phi = 4;  
        
        this.dirty = true;
    },
    
    update: function () {
        if (this.dirty) {
            var view = this.view,
                projection = this.projection,
                viewProjection = this.viewProjection,
                location = this.location,
                inverseView = this.inverseView,
                inverseRotation = this.inverseRotation,
                theta = this.theta,
                phi = this.phi,
                rect = this.rect,
                billboardedRect = this.billboardedRect,
                i;
            
            mat4.perspective(projection, this.fov, this.aspect, this.near, this.far);
            
            mat4.identity(view);
            mat4.translate(view, view, this.panVector);
            mat4.rotateX(view, view, theta);
            mat4.rotateZ(view, view, phi);
            mat4.translate(view, view, this.target);
            
            mat4.multiply(viewProjection, projection, view);
            mat4.invert(this.inverseViewProjection, viewProjection);
            
            mat4.identity(inverseRotation);
            mat4.rotateZ(inverseRotation, inverseRotation, -phi);
            mat4.rotateX(inverseRotation, inverseRotation, -theta);

            mat4.invert(inverseView, view);
            vec3.transformMat4(location, vec3.UNIT_Z, inverseView);
            
            for (i = 0; i < 7; i++) {
                vec3.transformMat4(billboardedRect[i], rect[i], inverseRotation);
            }
            
            this.dirty = false;
            
            return true;
        }
        
        return false;
    },
    
    moveLocation: function (offset) {
        var location = this.location;
        
        vec3.add(location, location, offset);
        
        this.set(location, this.target);
    },
    
    moveTarget: function (offset) {
        var target = this.originalTarget;
        
        vec3.add(target, target, offset);
        
        this.set(this.location, target);
    },
    
    // Move both the location and target
    move: function (offset) {
        var target = this.target;
        
        vec3.sub(target, target, offset);
        
        this.dirty = true;
    },
    
    moveTo: function (target) {
        vec3.negate(this.target, target);
        
        this.dirty = true;
    },
    
    setLocation: function (location) {
        this.set(location, this.target);
    },
    
    setTarget: function (target) {
        this.set(this.location, target);
    },
    
    // This is equivalent to a look-at matrix, with the up vector implicitly being [0, 0, 1].
    set: function (location, target) {
        var sphericalCoordinate = computeSphericalCoordinates(location, target);
        
        vec3.copy(this.originalTarget, target);
        vec3.negate(this.target, target);
        vec3.set(this.panVector, 0, 0, -sphericalCoordinate[0]);
        
        this.theta = -sphericalCoordinate[2]
        this.phi = -sphericalCoordinate[1] - Math.PI / 2;
        
        this.dirty = true;
    },
    
    // Move the camera in camera space
    pan: function (pan) {
        var panVector = this.panVector;
        
        vec3.add(panVector, panVector, pan);
        
        this.dirty = true;
    },
    
    setPan: function (pan) {
        vec3.copy(this.panVector, pan);
        
        this.dirty = true;
    },
    
    rotate: function (theta, phi) {
        this.theta += theta;
        this.phi += phi;
        
        this.dirty = true;
    },
    
    setRotation: function (theta, phi) {
        this.theta = theta;
        this.phi = phi;
        
        this.dirty = true;
    },
    
    zoom: function (factor) {
        this.panVector[2] *= factor;
        
        this.dirty = true;
    },
    
    setZoom: function (zoom) {
        this.panVector[2] = zoom;
        
        this.dirty = true;
    },
    
    setFov: function (fov) {
        this.fov = fov;
        
        this.dirty = true;
    },
    
    setAspect: function (aspect) {
        this.aspect = aspect;
        
        this.dirty = true;
    },
    
    setNearPlane: function (near) {
        this.near = near;
        
        this.dirty = true;
    },
    
    setFarPlane: function (far) {
        this.far = far;
        
        this.dirty = true;
    },
    
    setViewport: function (viewport) {
        vec4.copy(this.viewport, viewport);
        
        this.aspect = viewport[2] / viewport[3];
        
        this.dirty = true;
    },
    
    // Given a 3D camera space offset, returns a 3D world offset.
    cameraToWorld: function (out, offset) {
        vec3.set(out, offset[0], offset[1], offset[2]);
        vec3.transformMat4(out, out, this.inverseRotation);
        
        return out;
    },
    
    // Given a 2D screen space coordinate, returns its 3D projection on the X-Y plane.
    screenToWorld: function (out, coordinate) {
        var a = this.heap1,
            b = this.heap2,
            x = coordinate[0],
            y = coordinate[1],
            inverseViewProjection = this.inverseViewProjection,
            viewport = this.viewport,
            zIntersection;
        
        vec3.unproject(a, x, y, 0, inverseViewProjection, viewport);
        vec3.unproject(b, x, y, 1, inverseViewProjection, viewport);
        
        zIntersection = -a[2] / (b[2] - a[2]);
        
        vec3.set(out, a[0] + (b[0] - a[0]) * zIntersection, a[1] + (b[1] - a[1]) * zIntersection, 0);
        
        return out;
    },
    
    worldToScreen: function (out, coordinate) {
        var a = this.heap1,
            viewProjection = this.viewProjection,
            viewport = this.viewport;
        
        vec3.transformMat4(a, coordinate, viewProjection);
        
        out[0] = Math.round(((a[0] + 1) / 2) * viewport[2]);
        out[1] = Math.round(((a[1] + 1) / 2) * viewport[3]);
        
        return out;
    }
};
/**
 * Used to add an asynchronous action queue to an object.
 *
 * @mixin
 * @name Async
 * @property {array} actions
 */
 function Async() {
     this.functors = [];
 }
 
Async.prototype = {
  /**
    * Adds a new action to the action queue.
    *
    * @memberof Async
    * @instance
    * @param {string} functor A function name.
    * @param {array} args The arguments that will be sent to the functor.
    */
    addFunctor: function (functor, args) {
        this.functors.push([functor, args]);
    },
  
  /**
    * Calls all the functors in the action queue, giving them their arguments.
    *
    * @memberof Async
    * @instance
    */
    runFunctors: function () {
        var functors = this.functors,
            functor,
            i,
            l;

        for (i = 0, l = functors.length; i < l; i++) {
            functor = functors[i];

            this[functor[0]].apply(this, functor[1]);
        }

        functors = [];
    }
};/**
 * Used to add spatial capabilities to an object.
 *
 * @mixin
 * @name Spatial
 * @property {mat4} worldMatrix
 * @property {mat4} localMatrix
 * @property {vec3} location
 * @property {quat} rotation
 * @property {vec3} eulerRotation
 * @property {vec3} scaling
 * @property {number} parentId
 * @property {number} attachmentId
 * @property {Node} parentNode
 */
function Spatial() {
    this.localMatrix = mat4.create();
    this.localLocation = vec3.create();
    this.localRotation = quat.create();
    this.worldMatrix = mat4.create();
    this.worldLocation = vec3.create();
    this.worldRotation = quat.create();
    this.scaling = vec3.fromValues(1, 1, 1);
    this.inverseScale = vec3.fromValues(1, 1, 1);
    this.theta = 0;
    this.phi = 0;
    this.parent = null;
}

Spatial.prototype = {
  /**
    * Recalculates the spatial's transformation.
    *
    * @memberof Spatial
    * @instance
    */
    recalculateTransformation: function () {
        var worldMatrix = this.worldMatrix,
            localMatrix = this.localMatrix,
            localRotation = this.localRotation,
            worldLocation = this.worldLocation,
            worldRotation = this.worldRotation,
            scaling = this.scaling,
            parent = this.parent;
        
        mat4.fromRotationTranslationScale(localMatrix, localRotation, this.localLocation, scaling);
        vec3.inverse(this.inverseScale, scaling);
        
        quat.copy(worldRotation, localRotation);
        
        mat4.identity(worldMatrix);

        if (parent) {
            mat4.copy(worldMatrix, parent.getTransformation());
            mat4.scale(worldMatrix, worldMatrix, parent.inverseScale);
            
            quat.mul(worldRotation, worldRotation, parent.worldRotation);
        }

        mat4.multiply(worldMatrix, worldMatrix, localMatrix);
        
        vec3.set(worldLocation, 0, 0, 0);
        vec3.transformMat4(worldLocation, worldLocation, worldMatrix);
    },

  /**
    * Moves a spatial.
    *
    * @memberof Spatial
    * @instance
    * @param {vec3} v A displacement vector.
    */
    move: function (v) {
        vec3.add(this.localLocation, this.localLocation, v);
        
        this.recalculateTransformation();
    },

  /**
    * Sets the location of a spatial.
    *
    * @memberof Spatial
    * @instance
    * @param {vec3} v A position vector.
    */
    setLocation: function (v) {
        vec3.copy(this.localLocation, v);

        this.recalculateTransformation();
    },

  /**
    * Gets a spatial's location.
    *
    * @memberof Spatial
    * @instance
    * @returns {vec3} The spatial's location.
    */
    getLocation: function () {
        return this.localLocation;
    },
    
  /**
    * Rotates a spatial.
    *
    * @memberof Spatial
    * @instance
    * @param {vec3} v A vector of euler angles.
    */
    rotate: function (theta, phi) {
        this.setRotation(this.theta + theta, this.phi + phi);
    },
    
    face: function (location) {
        var sphericalCoordinate = computeSphericalCoordinates(this.worldLocation, location);
        
        this.setRotation(sphericalCoordinate[1] - Math.PI, this.phi);
    },
    
  /**
    * Sets the rotation of a spatial.
    *
    * @memberof Spatial
    * @instance
    * @param {quat} v A vector of euler angles.
    */
    setRotation: function (theta, phi) {
        var rotation = this.localRotation;

        this.theta = theta;
        this.phi = phi;
        
        quat.identity(rotation);
        quat.rotateZ(rotation, rotation, theta);
        quat.rotateX(rotation, rotation, phi);

        this.recalculateTransformation();
    },

  /**
    * Gets a spatial's rotation as a vector of euler angles.
    *
    * @memberof Spatial
    * @instance
    * @returns {vec3} The spatial's euler angles.
    */
    getRotation: function () {
        return [this.theta, this.phi];
    },
    
    // Note: shouldn't be used by the client, unless you don't want to use spherical coordinates
    setRotationQuat: function (q) {
        quat.copy(this.localRotation, q);
        
        this.recalculateTransformation();
    },

  /**
    * Scales a spatial.
    *
    * @memberof Spatial
    * @instance
    * @param {number} n The scale factor.
    */
    scale: function (n) {
        vec3.scale(this.scaling, this.scaling, n);

        this.recalculateTransformation();
    },

  /**
    * Sets the scale of a spatial.
    *
    * @memberof Spatial
    * @instance
    * @param {number} n The scale factor.
    */
    setScale: function (n) {
        vec3.set(this.scaling, n, n, n);

        this.recalculateTransformation();
    },

  /**
    * Gets a spatial's scale.
    *
    * @memberof Spatial
    * @instance
    * @returns {number} The scale factor.
    */
    getScale: function () {
        return this.scaling[0];
    },

    setScaleVector: function (v) {
        vec3.copy(this.scaling, v);

        this.recalculateTransformation();
    },

    getScaleVector: function () {
        return this.scaling;
    },
  
  /**
    * Sets a spatial's parent.
    *
    * @memberof Spatial
    * @instance
    * @param {Node} parent The parent.
    * @param {number} [attahmcnet] An attachment.
    */
    setParent: function (parent) {
        this.parent = parent;
        
        this.recalculateTransformation();
    },
    //~ setParent: function (parent, attachment) {
        //~ if (parent) {
            //~ this.parentId = parent.id;
            //~ this.attachmentId = attachment;

            //~ parent.requestAttachment(this, attachment);
        //~ } else {
            //~ this.parentId = -1;
            //~ this.attachmentId = -1;
            //~ this.parentNode = null;
        //~ }
    //~ },

  // Called from the parent with the parent node.
    setParentNode: function (parent) {
        this.parent = parent;
    },

  /**
    * Gets a spatial's parent.
    *
    * @memberof Spatial
    * @instance
    * @returns {array} The parent and attachment.
    */
    getParent: function () {
        return this.parent;
    },

  /**
    * Gets a spatial's world transformation matrix.
    *
    * @memberof Spatial
    * @instance
    * @returns {mat4} The transformation matrix.
    */
    getTransformation: function () {
        return this.worldMatrix;
    }
};
window["BaseNode"] = function () {
    /// <field name="pivot" type="vec3"></param>
    /// <field name="localMatrix" type="mat4"></param>
    /// <field name="localLocation" type="vec3"></param>
    /// <field name="localRotation" type="quat"></param>
    /// <field name="worldMatrix" type="mat4"></param>
    /// <field name="worldLocation" type="vec3"></param>
    /// <field name="worldRotation" type="quat"></param>
    /// <field name="scale" type="vec3"></param>
    /// <field name="inverseScale" type="vec3"></param>
    this.pivot = vec3.create();
    this.localMatrix = mat4.create();
    this.localLocation = vec3.create();
    this.localRotation = quat.create();
    this.worldMatrix = mat4.create();
    this.worldLocation = vec3.create();
    this.worldRotation = quat.create();
    this.scale = vec3.create();
    this.inverseScale = vec3.create();
}

BaseNode.prototype = {
    // Copies the needed parameters from the parent
    setFromParent: function (parent) {
        var scale = this.scale;
        
        mat4.copy(this.worldMatrix, parent.worldMatrix);
        mat4.decomposeScale(scale, parent.worldMatrix);
        vec3.inverse(this.inverseScale, scale);
        vec3.copy(this.worldLocation, parent.worldLocation);
        quat.copy(this.worldRotation, parent.worldRotation);
    },

    // Updates this node with the parent world space values, and the local space arguments
    update: function (parent, rotation, translation, scale) {
        var localMatrix = this.localMatrix,
            worldMatrix = this.worldMatrix,
            worldLocation = this.worldLocation,
            selfScale = this.scale,
            pivot = this.pivot;
        
        // Local and world matrices
        mat4.fromRotationTranslationScaleOrigin(localMatrix, rotation, translation, scale, pivot);
        mat4.mul(worldMatrix, parent.worldMatrix, localMatrix);
        
        // Scale and inverse scale
        mat4.decomposeScale(selfScale, worldMatrix);
        vec3.inverse(this.inverseScale, selfScale);
        
        // Local location and rotation
        vec3.copy(this.localLocation, translation);
        quat.copy(this.localRotation, rotation);
        
        // World location
        vec3.copy(worldLocation, pivot);
        vec3.transformMat4(worldLocation, worldLocation, worldMatrix);
        
        // World rotation
        quat.mul(this.worldRotation, parent.worldRotation, rotation);
    }
};window["BaseSkeleton"] = function (numberOfBones, ctx) {
    /// <field name="rootNode" type="BaseNode"></param>
    /// <field name="nodes" type="array"></param>
    /// <field name="hwbones" type="Float32Array"></param>
    /// <field name="boneTexture" type="WebGLTexture"></param>
    /// <field name="boneTextureSize" type="number"></param>
    /// <field name="texelFraction" type="number"></param>
    /// <field name="matrixFraction" type="number"></param>
    this.rootNode = new BaseNode();
    this.nodes = [];
    this.hwbones = new Float32Array(16 * numberOfBones);
    this.boneTexture = ctx.createTexture();
    this.boneTextureSize = Math.max(2, Math.powerOfTwo(numberOfBones)) * 4;
    this.texelFraction = 1 / this.boneTextureSize;
    this.matrixFraction = this.texelFraction * 4;

    ctx.activeTexture(ctx.TEXTURE15);
    ctx.bindTexture(ctx.TEXTURE_2D, this.boneTexture);
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, this.boneTextureSize, 1, 0, ctx.RGBA, ctx.FLOAT, null);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
}

BaseSkeleton.prototype = {
    getNode: function (node) {
        if (node === -1) {
            return this.rootNode;
        }
        
        return this.nodes[node];
    },

    updateBoneTexture: function (ctx) {
        ctx.activeTexture(ctx.TEXTURE15);
        ctx.bindTexture(ctx.TEXTURE_2D, this.boneTexture);
        ctx.texSubImage2D(ctx.TEXTURE_2D, 0, 0, 0, this.hwbones.length / 4, 1, ctx.RGBA, ctx.FLOAT, this.hwbones);
    },

    bind: function (shader, ctx) {
        ctx.activeTexture(ctx.TEXTURE15);
        ctx.bindTexture(ctx.TEXTURE_2D, this.boneTexture);

        ctx.uniform1i(shader.variables.u_boneMap, 15);
        ctx.uniform1f(shader.variables.u_matrix_size, this.matrixFraction);
        ctx.uniform1f(shader.variables.u_texel_size, this.texelFraction);
    }
};/**
 * Creates a new BaseModel.
 *
 * @class A skeleton model. Can be used to help extending the viewer with new model types.
 * @name BaseModel
 * @param {object} textureMap An object with texture path -> absolute urls mapping.
 * @property {string} name
 * @property {array} meshes
 * @property {array} sequences
 * @property {array} textures
 * @property {array} cameras
 * @property {array} boundingShapes
 * @property {array} attachments
 * @property {object} textureMap
 */
window["BaseModel"] = function (textureMap) {
    this.name = "";
    this.meshes = [];
    this.sequences = [];
    this.textures = [];
    this.cameras = [];
    this.boundingShapes = [];
    this.attachments = [];
    this.textureMap = textureMap;
}

BaseModel.prototype = {
  /**
    * Render a model for some specific model instance.
    *
    * @param {BaseModelInstance} instance The instance that is getting rendered.
    * @param {object} context An object containing the global state of the viewer.
    */
    render: function(instance, context) {

    },

  /**
    * Render a model's particle emitters for some specific model instance.
    *
    * @param {BaseModelInstance} instance The instance that is getting rendered.
    * @param {object} context An object containing the global state of the viewer.
    */
    renderEmitters: function(instance, context) {

    },

  /**
    * Render a model's bounding shapes o for some specific model instance.
    *
    * @param {BaseModelInstance} instance The instance that is getting rendered.
    * @param {object} context An object containing the global state of the viewer.
    */
    renderBoundingShapes: function(instance, context) {

    },

  /**
    * Render a model with a specific color for some specific model instance.
    * This is used for color picking.
    *
    * @param {BaseModelInstance} instance The instance that is getting rendered.
    * @param {vec3} color A RGB color in which the model should be rendered.
    * @param {object} context An object containing the global state of the viewer.
    */
    renderColor: function(instance, color, context) {

    },

  /**
    * Gets the name of a model.
    *
    * @returns {string} The model's name.
    */
    getName: function() {
        return this.name;
    },
    
  /**
    * Gets a model's attachment.
    *
    * @param {number} id The id of the attachment.
    * @returns {Node} The attachment.
    */
    getAttachment: function(id) {
        return this.attachments[id];
    },
    
  /**
    * Gets a model's camera.
    *
    * @param {number} id The id of the camera.
    * @returns {Camera} The camera.
    */
    getCamera: function(id) {
        return this.cameras[id];
    },
    
  /**
    * Overrides a texture used by a model.
    *
    * @param {string} path The texture path that gets overriden.
    * @paran {string} override The new absolute path that will be used.
    */
    overrideTexture: function(path, override) {
        this.textureMap[path] = override;
    },

  /**
    * Gets a model's texture map.
    *
    * @returns {object} The texture map.
    */
    getTextureMap: function() {
        return this.textureMap;
    },

  /**
    * Gets a model's sequences list.
    *
    * @returns {array} The list of sequence names.
    */
    getSequences: function() {
        return this.sequences;
    },

  /**
    * Gets a model's attachments list.
    *
    * @returns {array} The list of attachment names.
    */
    getAttachments: function() {
        return this.attachments;
    },
  
  /**
    * Gets a model's bounding shapes list.
    *
    * @returns {array} The list of bounding shape names.
    */
    getBoundingShapes: function() {
        return this.boundingShapes;
    },
  
  /**
    * Gets a model's cameras list.
    *
    * @returns {array} The list of camera names.
    */
    getCameras: function() {
        return this.cameras;
    },

  /**
    * Gets a model's number of meshes.
    *
    * @returns {number} The number of meshes.
    */
    getMeshCount: function() {
        return this.meshes.length;
    },
    
    // Override in the model implementations
    getPolygonCount: function () {
        var meshes = this.meshes,
            polygons = 0;
        
        for (var i = 0, l = meshes.length; i < l; i++) {
            polygons += meshes[i].getPolygonCount();
        }
        
        return polygons;
    }
};/**
 * Creates a new BaseModelInstance.
 *
 * @class A skeleton model instance. Can be used to help extending the viewer with new model types.
 * @name BaseModelInstance
 * @param {BaseModel} model The model this instance points to.
 * @param {object} textureMap An object with texture path -> absolute urls mapping.
 * @property {BaseModel} model
 * @property {object} textureMap
 * @property {number} sequence
 * @property {number} frame
 * @property {number} sequenceLoopMode
 * @property {number} teamColor
 * @property {array} meshVisibilities
 */
window["BaseModelInstance"] = function (model, textureMap) {
    var i,
        l;

    this.model = model;
    this.textureMap = textureMap;
    this.sequence = -1;
    this.frame = 0;
    this.sequenceLoopMode = 0;
    this.teamColor = 0;
    this.meshVisibilities = [];

    for (i = 0, l = model.getMeshCount(); i < l; i++) {
        this.meshVisibilities[i] = true;
    }
}

BaseModelInstance.prototype = {
  /**
    * Updates a model instance.
    *
    * @param {mat4} worldMatrix The world matrix of the parent {@link AsyncModelInstance}.
    * @param {object} context An object containing the global state of the viewer.
    */
    update: function(worldMatrix, context) {

    },

  /**
    * Render the model a model instance points to.
    *
    * @param {object} context An object containing the global state of the viewer.
    */
    render: function(context) {
        this.model.render(this, context);
    },

  /**
    * Render the particle emitters of the model a model instance points to.
    *
    * @param {object} context An object containing the global state of the viewer.
    */
    renderEmitters: function(context) {
        this.model.renderEmitters(this, context);
    },

  /**
    * Render the bounding shapes of the model a model instance points to.
    *
    * @param {object} context An object containing the global state of the viewer.
    */
    renderBoundingShapes: function(context) {
        this.model.renderBoundingShapes(this, context);
    },

  /**
    * Render the model a model instance points to, with a specific color.
    *
    * @param {vec3} color A RGB color.
    * @param {object} context An object containing the global state of the viewer.
    */
    renderColor: function(color, context) {
        this.model.renderColor(this, color, context);
    },

  /**
    * Gets the name of the model a model instance points to.
    *
    * @returns {string} The model's name.
    */
    getName: function() {
        return this.model.getName();
    },

  /**
    * Overrides a texture used by a model instance.
    *
    * @param {string} path The texture path that gets overriden.
    * @paran {string} override The new absolute path that will be used.
    */
    overrideTexture: function(path, override) {
        this.textureMap[path] = override;
    },

  /**
    * Gets a model instance's texture map.
    *
    * @returns {object} The texture map.
    */
    getTextureMap: function() {
        return Object.copy(this.textureMap);
    },

  /**
    * Set the team color of a model instance.
    *
    * @param {number} id The team color.
    */
    setTeamColor: function(id) {

    },

  /**
    * Gets the team color of a model instance.
    *
    * @returns {number} The team.
    */
    getTeamColor: function() {
        return this.teamColor;
    },

  /**
    * Set the sequence of a model instance.
    *
    * @param {number} id The sequence.
    */
    setSequence: function(id) {

    },
    
    /**
        * Stop the current sequence.
        * Equivalent to setSequence(-1).
        */
    stopSequence: function () {
        this.setSequence(-1);
    },

  /**
    * Gets the sequence of a model instance.
    *
    * @returns {number} The sequence.
    */
    getSequence: function() {
        return this.sequence;
    },

  /**
    * Set the sequence loop mode of a model instance.
    *
    * @param {number} mode The sequence loop mode.
    */
    setSequenceLoopMode: function(mode) {
        this.sequenceLoopMode = mode;
    },

  /**
    * Gets the sequence loop mode of a model instance.
    *
    * @returns {number} The sequence loop mode.
    */
    getSequenceLoopMode: function() {
        return this.sequenceLoopMode;
    },

  /**
    * Gets a model instance's attachment.
    *
    * @param {number} id The id of the attachment.
    * @returns {Node} The attachment.
    */
    getAttachment: function(id) {

    },
  
  /**
    * Set a model instance's mesh's visibility.
    *
    * @param {number} id The mesh.
    * @param {boolean} mode The visibility mode
    */
    setMeshVisibility: function(id, mode) {
        this.meshVisibilities[id] = mode;
    },

  /**
    * Gets a model instance's mesh's visibility
    *
    * @param {number} id The mesh.
    * @returns {boolean} The mesh's visiblity.
    */
    getMeshVisibility: function(id) {
        return this.meshVisibilities[id];
    },
  
  /**
    * Gets all the mesh visibilities of a model instance.
    *
    * @returns {array} The mesh visibilities.
    */
    getMeshVisibilities: function() {
        return this.meshVisibilities;
    }
};/**
 * Creates a new AsyncModel.
 *
 * @class The parent of {@link BaseModel}. Takes care of all the asynchronous aspects of loading models.
 * @name AsyncModel
 * @mixes Async
 * @param {string} source The source url that this model will be loaded from.
 * @param {number} id The id of this model.
 * @param {object} textureMap An object with texture path -> absolute urls mapping.
 */
function AsyncModel(source, fileType, customPaths, isFromMemory, context) {
    var callbacks = context.callbacks;
    
    this.type = "model";
    this.ready = false;
    this.fileType = fileType;
    this.id = generateID();
    this.customPaths = customPaths;

    // All the instances owned by this model
    this.instances = [];

    Async.call(this);

    this.context = context;

    this.onerror = callbacks.onerror;
    this.onprogress = callbacks.onprogress;
    this.onload = callbacks.onload;

    callbacks.onloadstart(this);

    this.isFromMemory = isFromMemory;
    this.source = source;

    if (isFromMemory) {
        this.setupFromMemory(source);
    } else {
        this.request = getRequest(source, AsyncModel.handlers[fileType][1], this.setup.bind(this), callbacks.onerror.bind(undefined, this), callbacks.onprogress.bind(undefined, this));
    } 
}

AsyncModel.handlers = {};

AsyncModel.prototype = {
    abort: function () {
        if (this.request && this.request.readyState !== XMLHttpRequest.DONE) {
            this.request.abort();
            return true;
        }
        
        return false;
    },
    
  /**
    * Setup a model once it finishes loading.
    *
    * @memberof AsyncModel
    * @instance
    * @param {object} textureMap An object with texture path -> absolute urls mapping.
    * @param {XMLHttpRequestProgressEvent} e The XHR event.
    */
    setup: function (e) {
        var status = e.target.status;
        
        if (status === 200) {
            this.setupFromMemory(e.target.response);
        } else {
            this.onerror(this, "" + status);
        }
    },

    setupFromMemory: function (memory) {
        var model = new AsyncModel.handlers[this.fileType][0](memory, this.customPaths, this.context, this.onerror.bind(undefined, this));

        if (model.ready) {
            this.model = model;
            this.ready = true;

            this.runFunctors();

            this.onload(this);
        }
    },
 
  /**
    * Request a model to setup a model instance.
    *
    * @memberof AsyncModel
    * @instance
    * @param {AsyncModelInstance} instance The requester.
    * @param {object} textureMap The requester's texture map.
    */
    setupInstance: function (instance) {
        if (this.ready) {
            this.instances.push(instance);

            instance.setup(this.model);
        } else {
            this.addFunctor("setupInstance", arguments);
        }
    },
  
  /**
    * Gets the name of a model.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {string} The model's name.
    */
    getName: function () {
        if (this.ready) {
            return this.model.getName();
        }
    },

  /**
    * Gets the source that a model was loaded from.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {string} The model's source.
    */
    getSource: function () {
        return this.source;
    },
  
  /**
    * Gets a model's attachment.
    *
    * @memberof AsyncModel
    * @instance
    * @param {number} id The id of the attachment.
    * @returns {Node} The attachment.
    */
    getAttachment: function (id) {
        if (this.ready) {
            return this.model.getAttachment(id);
        }
    },
  
  /**
    * Gets a model's camera.
    *
    * @memberof AsyncModel
    * @instance
    * @param {number} id The id of the camera.
    * @returns {Camera} The camera.
    */
    getCamera: function (id) {
        if (this.ready) {
            return this.model.getCamera(id);
        }
    },
  
  /**
    * Overrides a texture used by a model.
    *
    * @memberof AsyncModel
    * @instance
    * @param {string} path The texture path that gets overriden.
    * @paran {string} override The new absolute path that will be used.
    */
    overrideTexture: function (path, override) {
        if (this.ready) {
            this.model.overrideTexture(path, override);
        } else {
            this.addFunctor("overrideTexture", arguments);
        }
    },
  
  /**
    * Gets a model's texture map.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {object} The texture map.
    */
    getTextureMap: function () {
        if (this.ready) {
            return this.model.getTextureMap();
        }
    },
  
  /**
    * Gets a model's sequences list.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {array} The list of sequence names.
    */
    getSequences: function () {
        if (this.ready) {
            return this.model.getSequences();
        }
    },
  
  /**
    * Gets a model's attachments list.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {array} The list of attachment names.
    */
    getAttachments: function () {
        if (this.ready) {
            return this.model.getAttachments();
        }
    },
  
  /**
    * Gets a model's bounding shapes list.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {array} The list of bounding shape names.
    */
    getBoundingShapes: function () {
        if (this.ready) {
            return this.model.getBoundingShapes();
        }
    },
  
  /**
    * Gets a model's cameras list.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {array} The list of camera names.
    */
    getCameras: function () {
        if (this.ready) {
            return this.model.getCameras();
        }
    },
  
  /**
    * Gets a model's number of meshes.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {number} The number of meshes.
    */
    getMeshCount: function () {
        if (this.ready) {
            return this.model.getMeshCount();
        }
    },
  
    getPolygonCount: function () {
        if (this.ready) {
            return this.model.getPolygonCount();
        }
    }
};

mixin(Async.prototype, AsyncModel.prototype);/**
 * Creates a new AsyncModelInstance.
 *
 * @class The parent of {@link BaseModelInstance}. Takes care of all the asynchronous aspects of loading model instances. 
 * @name AsyncModelInstance
 * @mixes Async
 * @mixes Spatial
 * @param {AsyncModel} model The model this instance points to.
 * @param {number} id The id of this instance.
 * @param {vec3} color The color this instance uses for {@link AsyncModelInstance.renderColor}.
 * @param {object} textureMap An object with texture path -> absolute urls mapping.
 */
function AsyncModelInstance(model, isInternal) {
    var context = model.context;
    var callbacks = context.callbacks;

    this.type = "instance";
    this.ready = false;
    this.id = generateID();
    this.color = decodeFloat3(this.id);
    this.tint = vec4.fromValues(1, 1, 1, 1);
    this.visible = 1;
    this.selectable = 1;
    this.customPaths = model.customPaths;

    // If the model is already ready, the onload message from setup() must be delayed, since this instance wouldn't be added to the cache yet.
    if ((model && model.ready) || isInternal) {
        this.delayOnload = true;
    }

    this.context = context;

    this.onload = callbacks.onload;

    Async.call(this);
    Spatial.call(this);

    // Don't report internal instances
    if (!isInternal) {
        callbacks.onloadstart(this);
    }
        
    this.model = model;
    this.fileType = model.fileType;
    this.source = model.source;
    this.isFromMemory = model.isFromMemory;

    model.setupInstance(this);
}

AsyncModelInstance.handlers = {};

AsyncModelInstance.prototype = {
  /**
    * Setup a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {BaseModel} model The model implementation this instance points to.
    * @param {object} textureMap An object with texture path -> absolute urls mapping.
    */
    setup: function (model) {
        this.instance = new AsyncModelInstance.handlers[this.fileType](model, this.customPaths, this.context);

        this.ready = true;

        this.runFunctors();

        this.recalculateTransformation();

        if (!this.delayOnload) {
            this.onload(this);
        }
    },
  
  /**
    * Updates a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {object} context An object containing the global state of the viewer.
    */
    update: function (context) {
        if (this.ready) {
            if (this.parent) {
                    this.recalculateTransformation();
            }
            
            this.instance.update(this, context);
        }
    },
  
  /**
    * Render a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {object} context An object containing the global state of the viewer.
    */
    render: function (context) {
        if (this.ready && this.visible) {
            this.instance.render(context, this.tint);
        }
    },
  
  /**
    * Render the particle emitters of a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {object} context An object containing the global state of the viewer.
    */
    renderEmitters: function (context) {
        if (this.ready && this.visible) {
            this.instance.renderEmitters(context);
        }
    },
  
  /**
    * Render the bounding shapes of a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {object} context An object containing the global state of the viewer.
    */
    renderBoundingShapes: function (context) {
        if (this.ready && this.visible) {
            this.instance.renderBoundingShapes(context);
        }
    },
  
  /**
    * Render a model instance with a specific color.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {object} context An object containing the global state of the viewer.
    */
    renderColor: function (context) {
        if (this.ready && this.visible && this.selectable) {
            this.instance.renderColor(this.color, context);
        }
    },
  
  /**
    * Gets the name of a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @returns {string} The instance's name.
    */
    getName: function () {
        if (this.ready) {
            return this.instance.getName() + "[" + this.id + "]";
        }
    },
  
  /**
    * Gets the source of the model a model instance points to.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @returns {string} The model's source.
    */
    getSource: function () {
        return this.model.source;
    },
  
  // Sets the parent value of a requesting Spatial.
    //setRequestedAttachment: function (requester, attachment) {
    //    requester.setParentNode(this.instance.getAttachment(attachment));
    //},
  
    //requestAttachment: function (requester, attachment) {
    //    if (this.ready) {
    //        return this.setRequestedAttachment(requester, attachment);
    //    } else {
    //        this.addFunctor("setRequestedAttachment", [requester, attachment]);
    //    }
    //},
  
  /**
    * Overrides a texture used by a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {string} path The texture path that gets overriden.
    * @paran {string} override The new absolute path that will be used.
    */
    overrideTexture: function (path, override) {
        if (this.ready) {
            this.instance.overrideTexture(path, override);
        } else {
            this.addFunctor("overrideTexture", [path, override]);
        }
    },
  
  /**
    * Gets a model instance's texture map.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @returns {object} The texture map.
    */
    getTextureMap: function () {
        if (this.ready) {
            return this.instance.getTextureMap();
        }
    },
  
  /**
    * Set the team color of a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {number} id The team color.
    */
    setTeamColor: function (id) {
        if (this.ready) {
            this.instance.setTeamColor(id);
        } else {
            this.addFunctor("setTeamColor", [id]);
        }
    },
  
  /**
    * Gets the team color of a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @returns {number} The team.
    */
    getTeamColor: function () {
        if (this.ready) {
            return this.instance.getTeamColor();
        }
    },
  
  /**
    * Set the sequence of a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {number} id The sequence.
    */
    setSequence: function (id) {
        if (this.ready) {
            this.instance.setSequence(id);
        } else {
            this.addFunctor("setSequence", [id]);
        }
    },
  
  /**
    * Gets the sequence of a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @returns {number} The sequence.
    */
    getSequence: function () {
        if (this.ready) {
            return this.instance.getSequence();
        }
    },
  
  /**
    * Set the sequence loop mode of a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {number} mode The sequence loop mode.
    */
    setSequenceLoopMode: function (mode) {
        if (this.ready) {
            this.instance.setSequenceLoopMode(mode);
        } else {
            this.addFunctor("setSequenceLoopMode", [mode]);
        }
    },
  
  /**
    * Gets the sequence loop mode of a model instance.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @returns {number} The sequence loop mode.
    */
    getSequenceLoopMode: function () {
        if (this.ready) {
            return this.instance.getSequenceLoopMode();
        }
    },
  
  /**
    * Gets a model instance's attachment.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {number} id The id of the attachment.
    * @returns {Node} The attachment.
    */
    getAttachment: function (id) {
        if (this.ready) {
            return this.instance.getAttachment(id);
        }
    },
  
  /**
    * Gets a model instance's camera.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {number} id The id of the camera.
    * @returns {Camera} The camera.
    */
    getCamera: function (id) {
        if (this.ready) {
            return this.model.getCamera(id);
        }
    },
  
  /**
    * Set a model instance's mesh's visibility.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {number} id The mesh.
    * @param {boolean} mode The visibility mode
    */
    setMeshVisibility: function (id, mode) {
        if (this.ready) {
            this.instance.setMeshVisibility(id, mode);
        } else {
            this.addFunctor("setMeshVisibility", [id, mode]);
        }
    },
  
  /**
    * Gets a model instance's mesh's visibility
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {number} id The mesh.
    * @returns {boolean} The mesh's visiblity.
    */
    getMeshVisibility: function (id) {
        if (this.ready) {
            return this.instance.getMeshVisibility(id);
        }
    },
  
  /**
    * Gets a model instance's mesh's visibility
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {number} id The mesh.
    * @returns {boolean} The mesh's visiblity.
    */
    getMeshVisibilities: function () {
        if (this.ready) {
            return this.instance.getMeshVisibilities();
        }
    },
  
  /**
    * Gets the sequences of a model a model instance points to.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @returns {array} The list of sequence names.
    */
    getSequences: function () {
        if (this.ready) {
            return this.model.getSequences();
        }
    },
  
  /**
    * Gets the attachments of a model a model instance points to.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @returns {array} The list of attachment names.
    */
    getAttachments: function () {
        if (this.ready) {
            return this.model.getAttachments();
        }
    },
  
  /**
    * Gets the bounding shapes of a model a model instance points to.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @returns {array} The list of bounding shape names.
    */
    getBoundingShapes: function() {
        if (this.ready) {
            return this.model.getBoundingShapes();
        }
    },
  
  /**
    * Gets the cameras of a model a model instance points to.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @returns {array} The list of camera names.
    */
    getCameras: function () {
        if (this.ready) {
            return this.model.getCameras();
        }
    },
  
  /**
    * Gets the number of meshes of a model a model instance points to.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @returns {number} The number of meshes.
    */
    getMeshCount: function () {
        if (this.ready) {
            return this.model.getMeshCount();
        }
    },
  
  /**
    * Sets a model instance's visibility.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @param {boolean} mode The visibility.
    */
    setVisibility: function (mode) {
        this.visible = mode;
    },
  
  /**
    * Gets a model instance's visibility.
    *
    * @memberof AsyncModelInstance
    * @instance
    * @returns {boolean} The visibility.
    */
    getVisibility: function () {
        return this.visible;
    },
  
    getPolygonCount: function () {
        if (this.ready) {
            return this.model.getPolygonCount();
        }
    }
};

mixin(Async.prototype, AsyncModelInstance.prototype);
mixin(Spatial.prototype, AsyncModelInstance.prototype);/**
 * @class The main model viewer object.
 * @name ModelViewer
 * @param {HTMLCanvasElement} canvas A canvas element.
 * @param {object} urls An object with the necessary methods to get urls from the server.
 * @param {boolean} debugMode If true, the viewer will log the loaded models and their parser to the console.
 */
window["ModelViewer"] = function (canvas, worldPaths) {
    var objectsNotReady = 0;

    function onabort(object) {
        dispatchEvent({type: "abort", target: object});
    }
  
    function onloadstart(object) {
        objectsNotReady += 1;
        
        dispatchEvent({type: "loadstart", target: object});
    }
    
    function onloadend(object) {
        objectsNotReady -= 1;
        
        dispatchEvent({type: "loadend", target: object});
    }
    
    function onload(object) {
        // If this model isn't in the cache yet, add it
        if (object.type === "model" && !modelCache[object.source]) {
            modelCache[object.source] = object;
        }
        
        dispatchEvent({type: "load", target: object});
        
        onloadend(object);
    }

    function onerror(object, error) {
        if (typeof error !== "string") {
            error = "" + error.target.status;
        }

        dispatchEvent({type: "error", error: error, target: object});
        
        onloadend(object);
    }
    
    function onprogress(object, e) {
        if (e.target.status === 200) {
            dispatchEvent({type: "progress", target: object, loaded: e.loaded, total: e.total, lengthComputable: e.lengthComputable});
        }
    }
  
    function onremove(object) {
        dispatchEvent({type: "remove", target: object});
    }

    var callbacks = {
        onabort: onabort,
        onloadstart: onloadstart,
        onloadend: onloadend,
        onload: onload,
        onerror: onerror,
        onprogress: onprogress,
        onremove: onremove
    };
  
    var listeners = {}
    var viewerObject = {};
    
    var gl = GL(canvas, callbacks);
    var ctx = gl.ctx;
    
    var groundPath = worldPaths("ground.png");
    var waterPath = worldPaths("water.png");
    var skyPath = worldPaths("sky.png");

    var modelArray = []; // All models
    var instanceArray = []; // All instances
    var modelInstanceMap = {}; // Referebce by ID. This is a map to support deletions.
    var modelMap = {}; // Reference by source
    // Much like modelMap, but isn't cleared when something is removeed.
    // It is used to make loading faster if a model was removeed, or clear was called, and then the model is requested to load again.
    var modelCache = {};
    
    var supportedModelFileTypes = {};
    var supportedTextureFileTypes = {".png":1, ".gif":1, ".jpg":1};
    var supportedFileTypes = {".png":1, ".gif":1, ".jpg":1};
  
    var context = {
        callbacks: callbacks,
        frameTime: 1000 / 60,
        frameTimeMS: 1000 / 30,
        frameTimeS: 1 / 30,
        skipFrames: 2,
        camera: new Camera([0, 0, canvas.clientWidth, canvas.clientHeight]),
        instanceCamera: [-1, -1],
        skyMode: 1,
        groundMode: 1,
        groundSize: 256,
        emittersMode: true,
        polygonMode: 1,
        teamColorsMode: true,
        boundingShapesMode: false,
        texturesMode: true,
        shader: 0,
        gl: gl,
        teamColors: [[255, 3, 3], [0, 66, 255], [28, 230, 185], [84, 0, 129], [255, 252, 1], [254, 138, 14], [32, 192, 0], [229, 91, 176], [149, 150, 151], [126, 191, 241], [16, 98, 70], [78, 42, 4], [40, 40, 40], [0, 0, 0]],
        shaders: [ "standard", "diffuse", "normals", "uvs", "normalmap", "specular", "specular_normalmap", "emissive", "unshaded", "unshaded_normalmap", "decal", "white"],
        lightPosition: [0, 0, 10000],
        loadInternalResource: loadInternalResource,
        uvOffset: [0, 0],
        uvSpeed: [Math.randomRange(-0.004, 0.004), Math.randomRange(-0.004, 0.004)],
        ground: gl.createRect(0, 0, -1, 256, 256, 6),
        sky: gl.createSphere(0, 0, 0, 5, 40, 50000)
    };
    
    //function saveContext() {
    //    var camera = context.camera,
    //        translation = Array.setFloatPrecision(camera[0], 0),
    //        rotation = Array.setFloatPrecision(Array.toDeg(camera[1]), 0);

    //    return [
    //        context.frameTime / 1000 * 60,
    //        [translation, rotation],
    //        context.instanceCamera,
    //        context.worldMode,
    //        context.groundSize,
    //        context.polygonMode,
    //        context.teamColorsMode & 1,
    //        context.boundingShapesMode & 1,
    //        context.texturesMode & 1,
    //        context.shader
    //    ];
    //}
  
    //function loadContext(object) {
    //    var camera = object[1],
    //        translation = camera[0],
    //        rotation = Array.toRad(camera[1]);

    //    context.frameTime = object[0] / 60 * 1000;
    //    context.camera = [translation, rotation],
    //    context.instanceCamera = object[2];
    //    context.worldMode = object[3];
    //    setGroundSize(object[4] * 2);
    //    context.polygonMode = object[6];
    //    context.teamColorsMode = !!object[7];
    //    context.boundingShapesMode = !!object[8];
    //    context.texturesMode = !!object[9];
    //    context.shader = object[10];
    //}
  
    function resetViewport() {
        var width = canvas.clientWidth,
            height = canvas.clientHeight;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        ctx.viewport(0, 0, width, height);
        
        context.camera.setViewport([0, 0, width, height]);
    }
    
    window.addEventListener("resize", resetViewport);
    resetViewport();
      
    gl.createShader("world", SHADERS.vsworld, SHADERS.psworld);
    gl.createShader("white", SHADERS.vswhite, SHADERS.pswhite);
    gl.createShader("texture", SHADERS.vstexture, SHADERS.pstexture);
    
    gl.loadTexture(groundPath, ".png");
    gl.loadTexture(waterPath, ".png");
    gl.loadTexture(skyPath, ".png");
    
    function setupColorFramebuffer(width, height) {
        // Color texture
        var color = ctx.createTexture();
        ctx.bindTexture(ctx.TEXTURE_2D, color);
        gl.textureOptions(ctx.REPEAT, ctx.REPEAT, ctx.NEAREST, ctx.NEAREST);
        ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, width, height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, null);

        // Depth render buffer
        var depth = ctx.createRenderbuffer();
        ctx.bindRenderbuffer(ctx.RENDERBUFFER, depth);
        ctx.renderbufferStorage(ctx.RENDERBUFFER, ctx.DEPTH_COMPONENT16, width, height);

        // FBO
        var fbo = ctx.createFramebuffer();
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, fbo);
        ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, color, 0);
        ctx.framebufferRenderbuffer(ctx.FRAMEBUFFER, ctx.DEPTH_ATTACHMENT, ctx.RENDERBUFFER, depth);

        ctx.bindTexture(ctx.TEXTURE_2D, null);
        ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);

        return fbo;
    }
  
    var colorFramebufferSize = 256;
    var colorFramebuffer = setupColorFramebuffer(colorFramebufferSize, colorFramebufferSize);
    var colorPixel = new Uint8Array(4);
    
    function updateCamera() {
        var camera = context.camera;
        
        camera.update();
        gl.setProjectionMatrix(camera.projection);
        gl.setViewMatrix(camera.view);
    }

    function update() {
        var i,
            l;
        
        for (i = 0, l = instanceArray.length; i < l; i++) {
            instanceArray[i].update(context);
        }
        
        updateCamera();
    }

    function renderGround(mode) {
        if (gl.shaderStatus("world")) {
            var shader = gl.bindShader("world");

            ctx.disable(ctx.CULL_FACE);

            ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());

            if (mode === 1) {
                ctx.uniform2fv(shader.variables.u_uv_offset, [0, 0]);
                ctx.uniform1f(shader.variables.u_a, 1);
                
                gl.bindTexture(groundPath, 0);
                context.ground.render(shader);
            } else {
                context.uvOffset[0] += context.uvSpeed[0];
                context.uvOffset[1] += context.uvSpeed[1];

                ctx.uniform2fv(shader.variables.u_uv_offset, context.uvOffset);
                ctx.uniform1f(shader.variables.u_a, 0.6);
                
                ctx.enable(ctx.BLEND);
                ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);

                gl.bindTexture(waterPath, 0);
                context.ground.render(shader);

                ctx.disable(ctx.BLEND);
            }
        }
    }
  
    function renderSky() {
        if (gl.shaderStatus("world")) {
            var shader = gl.bindShader("world");

            ctx.uniform2fv(shader.variables.u_uv_offset, [0, 0]);
            ctx.uniform1f(shader.variables.u_a, 1);
            ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getProjectionMatrix());

            gl.bindTexture(skyPath, 0);
            context.sky.render(shader);
        }
    }
    
    function render() {
        var i,
            l = instanceArray.length;

        // https://www.opengl.org/wiki/FAQ#Masking
        ctx.depthMask(1);
        
        ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
        
        if (context.skyMode) {
            renderSky();
        }
        
        if (context.groundMode === 1) {
            renderGround(context.groundMode);
        }

        // Render geometry
        if (context.polygonMode > 0) {
            for (i = 0; i < l; i++) {
                instanceArray[i].render(context);
            }
        }

        // Render particles
        if (context.emittersMode) {
            for (i = 0; i < l; i++) {
                instanceArray[i].renderEmitters(context);
            }
        }

        // Render bounding shapes
        if (context.boundingShapesMode) {
            for (i = 0; i < l; i++) {
                instanceArray[i].renderBoundingShapes(context);
            }
        }

        if (context.groundMode > 1) {
            renderGround(context.groundMode);
        }
        
        dispatchEvent("render");
    }
  
    function renderColor() {
        ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

        ctx.disable(ctx.CULL_FACE);

        for (var i = 0, l = instanceArray.length; i < l; i++) {
            instanceArray[i].renderColor(context);
        }

        ctx.enable(ctx.CULL_FACE);
    }
    
    var textureRect = gl.createRect(0, 0, 0, 1, 1, 2);
    function renderTexture(path, location, scale, isScreen) {
        var shader = gl.bindShader("texture");
        
        if (isScreen) {
            gl.setOrtho(0, canvas.width, 0, canvas.height, -10000, 10000);
        } else {
            gl.setProjectionMatrix(camera.projection);
            gl.setViewMatrix(camera.view);
        }
        
        gl.pushMatrix();
        
         if (isScreen) {
            gl.loadIdentity();
         }
         
        gl.translate(location);
        gl.scale(scale);
        ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());
        gl.popMatrix();
        
        gl.bindTexture(path, 0);
        
        ctx.depthMask(0);
        ctx.enable(ctx.BLEND);
        ctx.blendFunc(ctx.ONE, ctx.ONE);
        
        textureRect.render(shader);
        
        ctx.depthMask(1);
        ctx.disable(ctx.BLEND);
    }
    
    function loadModel(source, fileType, customPaths, isFromMemory) {
        // If the model is cached, but not in the model map, add it to the model map
        if (modelCache[source]) {
            if (!modelMap[source]) {
                modelMap[source] = modelCache[source];
            }
        // If the model isn't in the cache, it's also likely not in the model map, so do a real load
        } else {
            var model = new AsyncModel(source, fileType, customPaths, isFromMemory, context);

            modelMap[source] = model;
            modelArray.push(model);
            modelInstanceMap[model.id] = model;
        }

        return modelMap[source];
    }
  
    function loadInstance(source, isInternal) {
        var instance = new AsyncModelInstance(modelMap[source], isInternal);

        modelInstanceMap[instance.id] = instance;
        instanceArray.push(instance);

        if (instance.delayOnload) {
            onload(instance);
        }

        return instance;
    }
  
    // Load a model or texture from an absolute url, with an optional texture map, and an optional hidden parameter
    function loadResource(source, customPaths, fileType, isFromMemory, isInternal) {
        if (supportedModelFileTypes[fileType]) {
            loadModel(source, fileType, customPaths, isFromMemory);

            return loadInstance(source, isInternal);
        } else {
            return gl.loadTexture(source, fileType, isFromMemory, {});
        }
    }

    // Used by Mdx.ParticleEmitter since they don't need to be automatically updated and rendered
    function loadInternalResource(source, customPaths) {
        return loadResource(source, customPaths, ".mdx", false, true);
    }
  
    function removeInstance(instance, removeingModel) {
        var i,
            l,
            instances = instance.model.instances;

        // Remove from the instance array
        for (i = 0, l = instanceArray.length; i < l; i++) {
            if (instanceArray[i] === instance) {
                instanceArray.splice(i, 1);
            }
        }

        // Remove from the model-instance map
        delete modelInstanceMap[instance.id];

        // Don't remove from the model if the model itself is removeed
        if (!removeingModel) {
            // Remove from the instances list of the owning model
            for (i = 0, l = instances.length; i < l; i++) {
                if (instances[i] === instance) {
                    instances.splice(i, 1);
                }
            }
        }

        onremove(instance);
    }
  
    function removeModel(model) {
        var instances = model.instances,
            i,
            l;

        // If the model was still in the middle of loading, abort the XHR request.
        if (model.abort()) {
            onabort(model);
        }
        
        // Remove all instances owned by this model
        for (i = 0, l = instances.length; i < l; i++) {
            removeInstance(instances[i], true);
        }

        // Remove from the model array
        for (i = 0, l = modelArray.length; i < l; i++) {
            if (modelArray[i] === model) {
                modelArray.splice(i, 1);
            }
        }

        // Remove from the model-instance map
        delete modelInstanceMap[model.id];
        
        onremove(model);
    }
  
    function identityPaths(path) {
        return path;
    }

  // ---------------------
  // Model loading API
  // ---------------------
  
  /**
    * Loads a resource.
    *
    * @memberof ModelViewer
    * @instance
    * @param {string} source The source to load from. Can be an absolute url, a path to a file in the MPQ files of Warcraft 3 and Starcraft 2, a form of identifier to be used for headers, an AsyncModel object, or an AsyncModelInstance object.
    */
    function load(source, customPaths, overrideFileType, isFromMemory) {
        var fileType;

        if (typeof customPaths !== "function") {
            customPaths = identityPaths;
        }

        if (typeof source === "string" && !isFromMemory) {
            source = customPaths(source);
        }

        if (source.type === "model" || source.type === "instance") {
            customPaths = source.customPaths;
            fileType = source.fileType;
            isFromMemory = source.isFromMemory;
            source = source.source;
        }

        if (typeof overrideFileType === "string") {
            fileType = overrideFileType;
        } else if (typeof source === "string") {
            fileType = fileTypeFromPath(source);
        }

        if (supportedFileTypes[fileType]) {
            return loadResource(source, customPaths, fileType, isFromMemory);
        }
    }

  /**
    * removes a resource.
    *
    * @memberof ModelViewer
    * @instance
    * @param {(string|number)} source The source to remove from. Can be the source of a previously loaded resource, or a valid model or instance ID.
    */
    function remove(source) {
        var object,
            type;
        
        if (source) {
            type = source.type;
            
            if (type) {
                if (type === "model") {
                    removeModel(source);
                } else {
                    removeInstance(source);
                }
            } else if (typeof source === "number") {
                object = modelInstanceMap[source];
                
                if (object) {
                    type = object.type;
                    
                    if (type === "model") {
                        removeModel(object);
                    } else {
                        removeInstance(object);
                    }
                }
            } else {
                object = modelMap[source];

                if (object) {
                    removeModel(object);
                } else {
                    gl.removeTexture(source);
                } 
            }
        }
    }
  
    /**
       * Clears all of the model and instance maps.
      *
      * @memberof ModelViewer
      * @instance
      */
    function clear() {
        var keys = Object.keys(modelMap),
            i,
            l;
        
        for (i = 0, l = keys.length; i < l; i++) {
            removeModel(modelMap[keys[i]]);
        }
        
        Array.clear(modelArray);
        Array.clear(instanceArray);
        Object.clear(modelInstanceMap);
        Object.clear(modelMap);
    }
    
    function clearCache() {
        Object.clear(modelCache);
    }
    
    function loadingEnded() {
        return objectsNotReady === 0;
    }
    
    // TODO: Add a way to check for internal instances/models and their textures too.
    function dependenciesLoaded(object) {
        if (object) {
            var textureMap = {},
                keys,
                loaded = 0,
                total,
                i,
                l;
            
            if (object.type === "instance") {
                mixin(object.model.getTextureMap(), textureMap);
            }
            
            mixin(object.getTextureMap(), textureMap);
            
            keys = Object.keys(textureMap);
            total = keys.length;
            
            // If this object has no dependencies, just return 1.
            // See DNC models. They have no geosets, textures, nodes, particle emitters, ...
            // Not sure what their use is.
            if (total === 0) {
                return 1;
            }
            
            for (i = 0, l = total; i < l; i++) {
                if (gl.textureLoaded(textureMap[keys[i]])) {
                    loaded += 1;
                }
            }
            
            return loaded / total;
        }
    }
    
    function getModels() {
        return modelArray;
    }
    
    function getInstances() {
        return instanceArray;
    }
    
    function getCache() {
        return modelCache;
    }
    
  // -------------------
  // General settings
  // -------------------
  
  /**
    * Sets the animation speed.
    *
    * @memberof ModelViewer
    * @instance
    * @param {number} ratio The speed.
    */
    function setAnimationSpeed(ratio) {
        context.frameTime = ratio / 60 * 1000;
        context.frameTimeMS = context.frameTime * context.skipFrames;
        context.frameTimeS = context.frameTimeMS / 1000;
    }
  
  /**
    * Gets the animation speed.
    *
    * @memberof ModelViewer
    * @instance
    * @returns {number} The speed.
    */
    function getAnimationSpeed() {
        return context.frameTime / 1000 * 60;
    }

    function setSkipFrames(skipFrames) {
        skipFrames = Math.min(skipFrames, 1)

        context.skipFrames = skipFrames;
        context.frameTimeMS = context.frameTime * skipFrames;
        context.frameTimeS = context.frameTimeMS / 1000;
    }

    function getSkipFrames() {
        return context.skipFrames;
    }
  
    function setSkyMode(mode) {
        context.skyMode = mode;
    }
    
    function getSkyMode() {
        return context.skyMode;
    }
    
    function setGroundMode(mode) {
        context.groundMode = mode;
    }
    
    function getGroundMode() {
        return context.groundMode;
    }
    
  /**
    * Sets the ground size.
    *
    * @memberof ModelViewer
    * @instance
    * @param {number} size The ground size.
    */
    function setGroundSize(size) {
        context.groundSize = size;
        context.ground.resize(size, size);
    }
  
  /**
    * Gets the ground size.
    *
    * @memberof ModelViewer
    * @instance
    * @returns {number} The ground size.
    */
    function getGroundSize() {
        return context.groundSize;
    }
  
  /**
    * Sets the particle emitters mode. If false, no particle emitters will be shown.
    *
    * @memberof ModelViewer
    * @instance
    * @param {boolean} mode The mode.
    */
    function setEmittersMode(b) {
        context.emittersMode = b;
    }

  /**
    * Gets the particle emitters mode.
    *
    * @memberof ModelViewer
    * @instance
    * @returns {boolean} The mode.
    */
    function getEmittersMode() {
        return context.emittersMode;
    }
  
  /**
    * Sets the bounding shapes mode. If false, no bounding shapes will be shown.
    *
    * @memberof ModelViewer
    * @instance
    * @param {boolean} mode The mode.
    */
    function setBoundingShapesMode(b) {
        context.boundingShapesMode = b;
    }
  
  /**
    * Gets the bounding shapes mode.
    *
    * @memberof ModelViewer
    * @instance
    * @returns {boolean} The mode.
    */
    function getBoundingShapesMode() {
        return context.boundingShapesMode;
    }
  
  /**
    * Sets the team colors mode. If false, no team colors will be shown.
    *
    * @memberof ModelViewer
    * @instance
    * @param {boolean} mode The mode.
    */
    function setTeamColorsMode(b) {
        context.teamColorsMode = b;
    }
  
  /**
    * Gets the team colors mode.
    *
    * @memberof ModelViewer
    * @instance
    * @returns {boolean} The mode.
    */
    function getTeamColorsMode() {
        return context.teamColorsMode;
    }
  
  /**
    * Sets the polygon mode. 0 for none, 1 for normal, 2 for wireframe, 3 for both.
    *
    * @memberof ModelViewer
    * @instance
    * @param {boolean} mode The mode.
    */
    function setPolygonMode(mode) {
        context.polygonMode = mode;
    }
  
  /**
    * Gets the polygon mode.
    *
    * @memberof ModelViewer
    * @instance
    * @returns {boolean} The mode.
    */
    function getPolygonMode() {
        return context.polygonMode;
    }
  
  /**
    * Sets the shader.
    * Possible values are 0 for `standard`, 1 for `diffuse`, 2 for `normals`, 3 for `uvs`, 4 for `normal map`, 5 for `specular map`, 6 for `specular map + normal map`, 7 for `emissive`, 8 for `unshaded`, 9 for `unshaded + normal map`, 10 for `decal`, and finally 11 for `white`.
    * Note: only the normals, uvs, and white shaders affect Warcraft 3 models, the rest only affect Starcraft 2 models.
    *
    * @memberof ModelViewer
    * @instance
    * @param {number} id The shader.
    */
    function setShader(id) {
        context.shader = id;
    }
  
  /**
    * Gets the shader.
    *
    * @memberof ModelViewer
    * @instance
    * @returns {number} The shader.
    */
    function getShader() {
        return context.shader;
    }
  
  // ------
  // Misc
  // ------
  
  /**
    * Selects a model instance given a screen-space position.
    *
    * @memberof ModelViewer
    * @instance
    * @param {number} x X coordinate.
    * @param {number} y Y coordinate.
    * @returns {number} The ID of the selected model instance, or -1 if no model instance was selected.
    */
    function selectInstance(coordinate) {
        var x = Math.floor(coordinate[0] / (canvas.clientWidth / colorFramebufferSize)),
            y = Math.floor((canvas.clientHeight - coordinate[1]) / (canvas.clientHeight / colorFramebufferSize));
        
        ctx.viewport(0, 0, colorFramebufferSize, colorFramebufferSize);
        
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, colorFramebuffer);
        
        renderColor();
        ctx.readPixels(x, y, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, colorPixel);

        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
        
        ctx.viewport(0, 0, canvas.width, canvas.height);
        
        var id = encodeFloat3(colorPixel[0], colorPixel[1], colorPixel[2]);
        var object = modelInstanceMap[id];

        if (object && object.type === "instance") {
            return object;
        }
    }
  
  /**
    * Saves the scene as a JSON string.
    *
    * @memberof ModelViewer
    * @instance
    * @returns {string} The JSON string.
    */
    function saveScene() {
        var models = [],
            instances = [],
            object,
            i,
            l;

        for (i = 0, l = modelArray.length; i < l; i++) {
            object = modelArray[i];

            if (object.ready) {
                models.push(object);
            }
        }

        for (i = 0, l = instanceArray.length; i < l; i++) {
            object = instanceArray[i];

            if (object.ready) {
                instances.push(object);
            }
        }

        return JSON.stringify([saveContext(), models, instances]);
    }
  
  /**
    * Loads a scene from JSON string.
    *
    * @memberof ModelViewer
    * @instance
    * @param {string} scene The JSON string.
    */
    function loadScene(scene) {
        var idMap = [], // Map from object IDs in the scene to actual indices in the object array.
            id,
            models,
            instances,
            object,
            owningModel,
            instance,
            i,
            l;

        scene = JSON.parse(scene);

        loadContext(scene[0]);

        models = scene[1];
        instances = scene[2];

        // Load all the models
        for (i = 0, l = models.length; i < l; i++) {
            // object[0] = id
            // object[1] = source
            // object[2] = texture map
            object = models[i];

            loadModel(object[1], object[2]);

            idMap[object[0]] = idFactory;
        }

        // Load all the instances
        for (i = 0, l = instances.length; i < l; i++) {
            // object[0] = id
            // object[1] = model id
            // ...
            object = instances[i];

            owningModel = modelInstanceMap[idMap[object[1]]];

            instance = loadInstance(owningModel.getSource());
            instance.fromJSON(object);

            idMap[object[0]] = idFactory;
        }

        // The parenting must be applied after all instances are loaded
        for (i = 0, l = instances.length; i < l; i++) {
            // object[0] = id
            // object[8] = parent
            object = instances[i];
            parent = object[8];

            setParent(idMap[object[0]], idMap[parent[0]], parent[1]);
        }
    }
  
  /**
    * Registers external handlers for an unspported model type.
    *
    * @memberof ModelViewer
    * @instance
    * @param {string} fileType The file format the handlers handle.
    * @param {BaseModel} modelHandler A BaseModel-like object.
    * @param {BaseModelInstance} modelInstanceHandler A BaseModelInstance-like object.
    * @param {boolean} binary Determines what type of input the model handler will get - a string, or an ArrayBuffer.
    */
    function registerModelHandler(fileType, modelHandler, modelInstanceHandler, binary) {
        AsyncModel.handlers[fileType] = [modelHandler, !!binary];
        AsyncModelInstance.handlers[fileType] = modelInstanceHandler;

        supportedModelFileTypes[fileType] = 1;
        supportedFileTypes[fileType] = 1;
    }
  
  /**
    * Registers an external handler for an unsupported texture type.
    *
    * @memberof ModelViewer
    * @instance
    * @param {string} fileType The file format the handler handles.
    * @param {function} textureHandler
    */
    function registerTextureHandler(fileType, textureHandler) {
        gl.registerTextureHandler(fileType, textureHandler);

        supportedTextureFileTypes[fileType] = 1;
        supportedFileTypes[fileType] = 1;
    }
    
    function addEventListener(type, listener) {
        if (listeners[type] === undefined){
            listeners[type] = [];
        }

        listeners[type].push(listener);
    }
    
    function removeEventListener(type, listener) {
        if (listeners[type] !== undefined){
            var _listeners = listeners[type],
                i,
                l;
            
            for (i = 0, l = _listeners.length; i < l; i++){
                if (_listeners[i] === listener){
                    _listeners.splice(i, 1);
                    return;
                }
            }
        }
    }
    
    function dispatchEvent(event) {
        if (typeof event === "string") {
            event = {type: event};
        }
        
        if (!event.target) {
            event.target = viewerObject;
        }
        
        if (!event.type) {
            return;
        }
        
        if (listeners[event.type] !== undefined) {
            var _listeners = listeners[event.type],
                i,
                l;
            
            for (i = 0, l = _listeners.length; i < l; i++){
                _listeners[i].call(viewerObject, event);
            }
        }
    }
  
    function getWebGLContext() {
        return ctx;
    }
    
    function getCamera() {
        return context.camera;
    }
    
    var API = {
        // Resource API
        load: load,
        remove: remove,
        clear: clear,
        clearCache: clearCache,
        loadingEnded: loadingEnded,
        dependenciesLoaded: dependenciesLoaded,
        getModels: getModels,
        getInstances: getInstances,
        getCache: getCache,
        // General settings
        setAnimationSpeed: setAnimationSpeed,
        getAnimationSpeed: getAnimationSpeed,
        setSkipFrames: setSkipFrames,
        getSkipFrames: getSkipFrames,
        setSkyMode: setSkyMode,
        getSkyMode: getSkyMode,
        setGroundMode: setGroundMode,
        getGroundMode: getGroundMode,
        setGroundSize: setGroundSize,
        getGroundSize: getGroundSize,
        setEmittersMode: setEmittersMode,
        getEmittersMode: getEmittersMode,
        setBoundingShapesMode: setBoundingShapesMode,
        getBoundingShapesMode: getBoundingShapesMode,
        setTeamColorsMode: setTeamColorsMode,
        getTeamColorsMode: getTeamColorsMode,
        setPolygonMode: setPolygonMode,
        getPolygonMode: getPolygonMode,
        setShader: setShader,
        getShader: getShader,
        getWebGLContext: getWebGLContext,
        getCamera: getCamera,
        // Misc
        selectInstance: selectInstance,
        resetViewport: resetViewport,
        //saveScene: saveScene,
        //loadScene: loadScene,
        // Extending
        registerModelHandler: registerModelHandler,
        registerTextureHandler: registerTextureHandler,
        // Events
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        dispatchEvent: dispatchEvent,
        // Experiemental
        renderTexture: renderTexture
    };

    var skipFrames = 1;

    // The main loop of the viewer
    /*(function step() {
        skipFrames -= 1;

        if (skipFrames === 0) {
            skipFrames = context.skipFrames;

            update();
        }
        
        render();

        requestAnimationFrame(step);
    }());*/
        
    return mixin(API, viewerObject);
};
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
   Copyright 2011 notmasteryet

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// - The JPEG specification can be found in the ITU CCITT Recommendation T.81
//   (www.w3.org/Graphics/JPEG/itu-t81.pdf)
// - The JFIF specification can be found in the JPEG File Interchange Format
//   (www.w3.org/Graphics/JPEG/jfif3.pdf)
// - The Adobe Application-Specific JPEG markers in the Supporting the DCT Filters
//   in PostScript Level 2, Technical Note #5116
//   (partners.adobe.com/public/developer/en/ps/sdk/5116.DCT_Filter.pdf)

// NOTE: This file was edited to match the crude usage of the JPG format by Blizzard for their BLP1 format.

var JpegImage = (function jpegImage() {
  "use strict";
  var dctZigZag = new Int32Array([
     0,
     1,  8,
    16,  9,  2,
     3, 10, 17, 24,
    32, 25, 18, 11, 4,
     5, 12, 19, 26, 33, 40,
    48, 41, 34, 27, 20, 13,  6,
     7, 14, 21, 28, 35, 42, 49, 56,
    57, 50, 43, 36, 29, 22, 15,
    23, 30, 37, 44, 51, 58,
    59, 52, 45, 38, 31,
    39, 46, 53, 60,
    61, 54, 47,
    55, 62,
    63
  ]);

  var dctCos1  =  4017   // cos(pi/16)
  var dctSin1  =   799   // sin(pi/16)
  var dctCos3  =  3406   // cos(3*pi/16)
  var dctSin3  =  2276   // sin(3*pi/16)
  var dctCos6  =  1567   // cos(6*pi/16)
  var dctSin6  =  3784   // sin(6*pi/16)
  var dctSqrt2 =  5793   // sqrt(2)
  var dctSqrt1d2 = 2896  // sqrt(2) / 2

  function constructor() {
  }

  function buildHuffmanTable(codeLengths, values) {
    var k = 0, code = [], i, j, length = 16;
    while (length > 0 && !codeLengths[length - 1])
      length--;
    code.push({children: [], index: 0});
    var p = code[0], q;
    for (i = 0; i < length; i++) {
      for (j = 0; j < codeLengths[i]; j++) {
        p = code.pop();
        p.children[p.index] = values[k];
        while (p.index > 0) {
          p = code.pop();
        }
        p.index++;
        code.push(p);
        while (code.length <= i) {
          code.push(q = {children: [], index: 0});
          p.children[p.index] = q.children;
          p = q;
        }
        k++;
      }
      if (i + 1 < length) {
        // p here points to last code
        code.push(q = {children: [], index: 0});
        p.children[p.index] = q.children;
        p = q;
      }
    }
    return code[0].children;
  }

  function getBlockBufferOffset(component, row, col) {
    return 64 * ((component.blocksPerLine + 1) * row + col);
  }

  function decodeScan(data, offset,
                      frame, components, resetInterval,
                      spectralStart, spectralEnd,
                      successivePrev, successive) {
    var precision = frame.precision;
    var samplesPerLine = frame.samplesPerLine;
    var scanLines = frame.scanLines;
    var mcusPerLine = frame.mcusPerLine;
    var progressive = frame.progressive;
    var maxH = frame.maxH, maxV = frame.maxV;

    var startOffset = offset, bitsData = 0, bitsCount = 0;

    function readBit() {
      if (bitsCount > 0) {
        bitsCount--;
        return (bitsData >> bitsCount) & 1;
      }
      bitsData = data[offset++];
      if (bitsData == 0xFF) {
        var nextByte = data[offset++];
        if (nextByte) {
          throw "unexpected marker: " + ((bitsData << 8) | nextByte).toString(16);
        }
        // unstuff 0
      }
      bitsCount = 7;
      return bitsData >>> 7;
    }

    function decodeHuffman(tree) {
      var node = tree;
      var bit;
      while ((bit = readBit()) !== null) {
        node = node[bit];
        if (typeof node === 'number')
          return node;
        if (typeof node !== 'object')
          throw "invalid huffman sequence";
      }
      return null;
    }

    function receive(length) {
      var n = 0;
      while (length > 0) {
        var bit = readBit();
        if (bit === null) return;
        n = (n << 1) | bit;
        length--;
      }
      return n;
    }

    function receiveAndExtend(length) {
      var n = receive(length);
      if (n >= 1 << (length - 1))
        return n;
      return n + (-1 << length) + 1;
    }

    function decodeBaseline(component, offset) {
      var t = decodeHuffman(component.huffmanTableDC);
      var diff = t === 0 ? 0 : receiveAndExtend(t);
      component.blockData[offset] = (component.pred += diff);
      var k = 1;
      while (k < 64) {
        var rs = decodeHuffman(component.huffmanTableAC);
        var s = rs & 15, r = rs >> 4;
        if (s === 0) {
          if (r < 15)
            break;
          k += 16;
          continue;
        }
        k += r;
        var z = dctZigZag[k];
        component.blockData[offset + z] = receiveAndExtend(s);
        k++;
      }
    }

    function decodeDCFirst(component, offset) {
      var t = decodeHuffman(component.huffmanTableDC);
      var diff = t === 0 ? 0 : (receiveAndExtend(t) << successive);
      component.blockData[offset] = (component.pred += diff);
    }

    function decodeDCSuccessive(component, offset) {
      component.blockData[offset] |= readBit() << successive;
    }

    var eobrun = 0;
    function decodeACFirst(component, offset) {
      if (eobrun > 0) {
        eobrun--;
        return;
      }
      var k = spectralStart, e = spectralEnd;
      while (k <= e) {
        var rs = decodeHuffman(component.huffmanTableAC);
        var s = rs & 15, r = rs >> 4;
        if (s === 0) {
          if (r < 15) {
            eobrun = receive(r) + (1 << r) - 1;
            break;
          }
          k += 16;
          continue;
        }
        k += r;
        var z = dctZigZag[k];
        component.blockData[offset + z] = receiveAndExtend(s) * (1 << successive);
        k++;
      }
    }

    var successiveACState = 0, successiveACNextValue;
    function decodeACSuccessive(component, offset) {
      var k = spectralStart, e = spectralEnd, r = 0;
      while (k <= e) {
        var z = dctZigZag[k];
        switch (successiveACState) {
        case 0: // initial state
          var rs = decodeHuffman(component.huffmanTableAC);
          var s = rs & 15, r = rs >> 4;
          if (s === 0) {
            if (r < 15) {
              eobrun = receive(r) + (1 << r);
              successiveACState = 4;
            } else {
              r = 16;
              successiveACState = 1;
            }
          } else {
            if (s !== 1)
              throw "invalid ACn encoding";
            successiveACNextValue = receiveAndExtend(s);
            successiveACState = r ? 2 : 3;
          }
          continue;
        case 1: // skipping r zero items
        case 2:
          if (component.blockData[offset + z]) {
            component.blockData[offset + z] += (readBit() << successive);
          } else {
            r--;
            if (r === 0)
              successiveACState = successiveACState == 2 ? 3 : 0;
          }
          break;
        case 3: // set value for a zero item
          if (component.blockData[offset + z]) {
            component.blockData[offset + z] += (readBit() << successive);
          } else {
            component.blockData[offset + z] = successiveACNextValue << successive;
            successiveACState = 0;
          }
          break;
        case 4: // eob
          if (component.blockData[offset + z]) {
            component.blockData[offset + z] += (readBit() << successive);
          }
          break;
        }
        k++;
      }
      if (successiveACState === 4) {
        eobrun--;
        if (eobrun === 0)
          successiveACState = 0;
      }
    }

    function decodeMcu(component, decode, mcu, row, col) {
      var mcuRow = (mcu / mcusPerLine) | 0;
      var mcuCol = mcu % mcusPerLine;
      var blockRow = mcuRow * component.v + row;
      var blockCol = mcuCol * component.h + col;
      var offset = getBlockBufferOffset(component, blockRow, blockCol);
      decode(component, offset);
    }

    function decodeBlock(component, decode, mcu) {
      var blockRow = (mcu / component.blocksPerLine) | 0;
      var blockCol = mcu % component.blocksPerLine;
      var offset = getBlockBufferOffset(component, blockRow, blockCol);
      decode(component, offset);
    }

    var componentsLength = components.length;
    var component, i, j, k, n;
    var decodeFn;
    if (progressive) {
      if (spectralStart === 0)
        decodeFn = successivePrev === 0 ? decodeDCFirst : decodeDCSuccessive;
      else
        decodeFn = successivePrev === 0 ? decodeACFirst : decodeACSuccessive;
    } else {
      decodeFn = decodeBaseline;
    }

    var mcu = 0, marker;
    var mcuExpected;
    if (componentsLength == 1) {
      mcuExpected = components[0].blocksPerLine * components[0].blocksPerColumn;
    } else {
      mcuExpected = mcusPerLine * frame.mcusPerColumn;
    }
    if (!resetInterval) {
      resetInterval = mcuExpected;
    }

    var h, v;
    while (mcu < mcuExpected) {
      // reset interval stuff
      for (i = 0; i < componentsLength; i++) {
        components[i].pred = 0;
      }
      eobrun = 0;

      if (componentsLength == 1) {
        component = components[0];
        for (n = 0; n < resetInterval; n++) {
          decodeBlock(component, decodeFn, mcu);
          mcu++;
        }
      } else {
        for (n = 0; n < resetInterval; n++) {
          for (i = 0; i < componentsLength; i++) {
            component = components[i];
            h = component.h;
            v = component.v;
            for (j = 0; j < v; j++) {
              for (k = 0; k < h; k++) {
                decodeMcu(component, decodeFn, mcu, j, k);
              }
            }
          }
          mcu++;
        }
      }

      // find marker
      bitsCount = 0;
      marker = (data[offset] << 8) | data[offset + 1];
      if (marker <= 0xFF00) {
        throw "marker was not found";
      }

      if (marker >= 0xFFD0 && marker <= 0xFFD7) { // RSTx
        offset += 2;
      } else {
        break;
      }
    }

    return offset - startOffset;
  }

  // A port of poppler's IDCT method which in turn is taken from:
  //   Christoph Loeffler, Adriaan Ligtenberg, George S. Moschytz,
  //   "Practical Fast 1-D DCT Algorithms with 11 Multiplications",
  //   IEEE Intl. Conf. on Acoustics, Speech & Signal Processing, 1989,
  //   988-991.
  function quantizeAndInverse(component, blockBufferOffset, p) {
    var qt = component.quantizationTable;
    var v0, v1, v2, v3, v4, v5, v6, v7, t;
    var i;

    // dequant
    for (i = 0; i < 64; i++) {
      p[i] = component.blockData[blockBufferOffset + i] * qt[i];
    }

    // inverse DCT on rows
    for (i = 0; i < 8; ++i) {
      var row = 8 * i;

      // check for all-zero AC coefficients
      if (p[1 + row] == 0 && p[2 + row] == 0 && p[3 + row] == 0 &&
          p[4 + row] == 0 && p[5 + row] == 0 && p[6 + row] == 0 &&
          p[7 + row] == 0) {
        t = (dctSqrt2 * p[0 + row] + 512) >> 10;
        p[0 + row] = t;
        p[1 + row] = t;
        p[2 + row] = t;
        p[3 + row] = t;
        p[4 + row] = t;
        p[5 + row] = t;
        p[6 + row] = t;
        p[7 + row] = t;
        continue;
      }

      // stage 4
      v0 = (dctSqrt2 * p[0 + row] + 128) >> 8;
      v1 = (dctSqrt2 * p[4 + row] + 128) >> 8;
      v2 = p[2 + row];
      v3 = p[6 + row];
      v4 = (dctSqrt1d2 * (p[1 + row] - p[7 + row]) + 128) >> 8;
      v7 = (dctSqrt1d2 * (p[1 + row] + p[7 + row]) + 128) >> 8;
      v5 = p[3 + row] << 4;
      v6 = p[5 + row] << 4;

      // stage 3
      t = (v0 - v1+ 1) >> 1;
      v0 = (v0 + v1 + 1) >> 1;
      v1 = t;
      t = (v2 * dctSin6 + v3 * dctCos6 + 128) >> 8;
      v2 = (v2 * dctCos6 - v3 * dctSin6 + 128) >> 8;
      v3 = t;
      t = (v4 - v6 + 1) >> 1;
      v4 = (v4 + v6 + 1) >> 1;
      v6 = t;
      t = (v7 + v5 + 1) >> 1;
      v5 = (v7 - v5 + 1) >> 1;
      v7 = t;

      // stage 2
      t = (v0 - v3 + 1) >> 1;
      v0 = (v0 + v3 + 1) >> 1;
      v3 = t;
      t = (v1 - v2 + 1) >> 1;
      v1 = (v1 + v2 + 1) >> 1;
      v2 = t;
      t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
      v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
      v7 = t;
      t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
      v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
      v6 = t;

      // stage 1
      p[0 + row] = v0 + v7;
      p[7 + row] = v0 - v7;
      p[1 + row] = v1 + v6;
      p[6 + row] = v1 - v6;
      p[2 + row] = v2 + v5;
      p[5 + row] = v2 - v5;
      p[3 + row] = v3 + v4;
      p[4 + row] = v3 - v4;
    }

    // inverse DCT on columns
    for (i = 0; i < 8; ++i) {
      var col = i;

      // check for all-zero AC coefficients
      if (p[1*8 + col] == 0 && p[2*8 + col] == 0 && p[3*8 + col] == 0 &&
          p[4*8 + col] == 0 && p[5*8 + col] == 0 && p[6*8 + col] == 0 &&
          p[7*8 + col] == 0) {
        t = (dctSqrt2 * p[i+0] + 8192) >> 14;
        p[0*8 + col] = t;
        p[1*8 + col] = t;
        p[2*8 + col] = t;
        p[3*8 + col] = t;
        p[4*8 + col] = t;
        p[5*8 + col] = t;
        p[6*8 + col] = t;
        p[7*8 + col] = t;
        continue;
      }

      // stage 4
      v0 = (dctSqrt2 * p[0*8 + col] + 2048) >> 12;
      v1 = (dctSqrt2 * p[4*8 + col] + 2048) >> 12;
      v2 = p[2*8 + col];
      v3 = p[6*8 + col];
      v4 = (dctSqrt1d2 * (p[1*8 + col] - p[7*8 + col]) + 2048) >> 12;
      v7 = (dctSqrt1d2 * (p[1*8 + col] + p[7*8 + col]) + 2048) >> 12;
      v5 = p[3*8 + col];
      v6 = p[5*8 + col];

      // stage 3
      t = (v0 - v1 + 1) >> 1;
      v0 = (v0 + v1 + 1) >> 1;
      v1 = t;
      t = (v2 * dctSin6 + v3 * dctCos6 + 2048) >> 12;
      v2 = (v2 * dctCos6 - v3 * dctSin6 + 2048) >> 12;
      v3 = t;
      t = (v4 - v6 + 1) >> 1;
      v4 = (v4 + v6 + 1) >> 1;
      v6 = t;
      t = (v7 + v5 + 1) >> 1;
      v5 = (v7 - v5 + 1) >> 1;
      v7 = t;

      // stage 2
      t = (v0 - v3 + 1) >> 1;
      v0 = (v0 + v3 + 1) >> 1;
      v3 = t;
      t = (v1 - v2 + 1) >> 1;
      v1 = (v1 + v2 + 1) >> 1;
      v2 = t;
      t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
      v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
      v7 = t;
      t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
      v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
      v6 = t;

      // stage 1
      p[0*8 + col] = v0 + v7;
      p[7*8 + col] = v0 - v7;
      p[1*8 + col] = v1 + v6;
      p[6*8 + col] = v1 - v6;
      p[2*8 + col] = v2 + v5;
      p[5*8 + col] = v2 - v5;
      p[3*8 + col] = v3 + v4;
      p[4*8 + col] = v3 - v4;
    }

    // convert to 8-bit integers
    for (i = 0; i < 64; ++i) {
      var index = blockBufferOffset + i;
      var q = p[i];
      q = (q <= -2056) ? 0 : (q >= 2024) ? 255 : (q + 2056) >> 4;
      component.blockData[index] = q;
    }
  }

  function buildComponentData(frame, component) {
    var lines = [];
    var blocksPerLine = component.blocksPerLine;
    var blocksPerColumn = component.blocksPerColumn;
    var samplesPerLine = blocksPerLine << 3;
    var computationBuffer = new Int32Array(64);

    var i, j, ll = 0;
    for (var blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
      for (var blockCol = 0; blockCol < blocksPerLine; blockCol++) {
        var offset = getBlockBufferOffset(component, blockRow, blockCol)
        quantizeAndInverse(component, offset, computationBuffer);
      }
    }
    return component.blockData;
  }

  function clampToUint8(a) {
    return a <= 0 ? 0 : a >= 255 ? 255 : a | 0;
  }

  constructor.prototype = {
    load: function load(path) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = (function() {
        // TODO catch parse error
        var data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);
        this.parse(data);
        if (this.onload)
          this.onload();
      }).bind(this);
      xhr.send(null);
    },
    
    loadFromBuffer: function loadFromBuffer(arrayBuffer) {
      this.parse(arrayBuffer);
        if (this.onload)
          this.onload();
    },

    parse: function parse(data) {

      function readUint16() {
        var value = (data[offset] << 8) | data[offset + 1];
        offset += 2;
        return value;
      }

      function readDataBlock() {
        var length = readUint16();
        var array = data.subarray(offset, offset + length - 2);
        offset += array.length;
        return array;
      }

      function prepareComponents(frame) {
        var mcusPerLine = Math.ceil(frame.samplesPerLine / 8 / frame.maxH);
        var mcusPerColumn = Math.ceil(frame.scanLines / 8 / frame.maxV);
        for (var i = 0; i < frame.components.length; i++) {
          component = frame.components[i];
          var blocksPerLine = Math.ceil(Math.ceil(frame.samplesPerLine / 8) * component.h / frame.maxH);
          var blocksPerColumn = Math.ceil(Math.ceil(frame.scanLines  / 8) * component.v / frame.maxV);
          var blocksPerLineForMcu = mcusPerLine * component.h;
          var blocksPerColumnForMcu = mcusPerColumn * component.v;

          var blocksBufferSize = 64 * blocksPerColumnForMcu
                                    * (blocksPerLineForMcu + 1);
          component.blockData = new Int16Array(blocksBufferSize);
          component.blocksPerLine = blocksPerLine;
          component.blocksPerColumn = blocksPerColumn;
        }
        frame.mcusPerLine = mcusPerLine;
        frame.mcusPerColumn = mcusPerColumn;
      }

      var offset = 0, length = data.length;
      var jfif = null;
      var adobe = null;
      var pixels = null;
      var frame, resetInterval;
      var quantizationTables = [];
      var huffmanTablesAC = [], huffmanTablesDC = [];
      var fileMarker = readUint16();
      if (fileMarker != 0xFFD8) { // SOI (Start of Image)
        throw "SOI not found";
      }

      fileMarker = readUint16();
      while (fileMarker != 0xFFD9) { // EOI (End of image)
        var i, j, l;
        switch(fileMarker) {
          case 0xFFE0: // APP0 (Application Specific)
          case 0xFFE1: // APP1
          case 0xFFE2: // APP2
          case 0xFFE3: // APP3
          case 0xFFE4: // APP4
          case 0xFFE5: // APP5
          case 0xFFE6: // APP6
          case 0xFFE7: // APP7
          case 0xFFE8: // APP8
          case 0xFFE9: // APP9
          case 0xFFEA: // APP10
          case 0xFFEB: // APP11
          case 0xFFEC: // APP12
          case 0xFFED: // APP13
          case 0xFFEE: // APP14
          case 0xFFEF: // APP15
          case 0xFFFE: // COM (Comment)
            var appData = readDataBlock();
          
            if (fileMarker === 0xFFE0) {
              if (appData[0] === 0x4A && appData[1] === 0x46 && appData[2] === 0x49 &&
                appData[3] === 0x46 && appData[4] === 0) { // 'JFIF\x00'
                jfif = {
                  version: { major: appData[5], minor: appData[6] },
                  densityUnits: appData[7],
                  xDensity: (appData[8] << 8) | appData[9],
                  yDensity: (appData[10] << 8) | appData[11],
                  thumbWidth: appData[12],
                  thumbHeight: appData[13],
                  thumbData: appData.subarray(14, 14 + 3 * appData[12] * appData[13])
                };
              }
            }
            // TODO APP1 - Exif
            if (fileMarker === 0xFFEE) {
              if (appData[0] === 0x41 && appData[1] === 0x64 && appData[2] === 0x6F &&
                appData[3] === 0x62 && appData[4] === 0x65 && appData[5] === 0) { // 'Adobe\x00'
                adobe = {
                  version: appData[6],
                  flags0: (appData[7] << 8) | appData[8],
                  flags1: (appData[9] << 8) | appData[10],
                  transformCode: appData[11]
                };
              }
            }
            break;

          case 0xFFDB: // DQT (Define Quantization Tables)
            var quantizationTablesLength = readUint16();
            var quantizationTablesEnd = quantizationTablesLength + offset - 2;
            while (offset < quantizationTablesEnd) {
              var quantizationTableSpec = data[offset++];
              var tableData = new Int32Array(64);
              if ((quantizationTableSpec >> 4) === 0) { // 8 bit values
                for (j = 0; j < 64; j++) {
                  var z = dctZigZag[j];
                  tableData[z] = data[offset++];
                }
              } else if ((quantizationTableSpec >> 4) === 1) { //16 bit
                for (j = 0; j < 64; j++) {
                  var z = dctZigZag[j];
                  tableData[z] = readUint16();
                }
              } else
                throw "DQT: invalid table spec";
              quantizationTables[quantizationTableSpec & 15] = tableData;
            }
            break;

          case 0xFFC0: // SOF0 (Start of Frame, Baseline DCT)
          case 0xFFC1: // SOF1 (Start of Frame, Extended DCT)
          case 0xFFC2: // SOF2 (Start of Frame, Progressive DCT)
            if (frame) {
              throw "Only single frame JPEGs supported";
            }
            readUint16(); // skip data length
            frame = {};
            frame.extended = (fileMarker === 0xFFC1);
            frame.progressive = (fileMarker === 0xFFC2);
            frame.precision = data[offset++];
            frame.scanLines = readUint16();
            frame.samplesPerLine = readUint16();
            frame.components = [];
            frame.componentIds = {};
            var componentsCount = data[offset++], componentId;
            var maxH = 0, maxV = 0;
            for (i = 0; i < componentsCount; i++) {
              componentId = data[offset];
              var h = data[offset + 1] >> 4;
              var v = data[offset + 1] & 15;
              if (maxH < h) maxH = h;
              if (maxV < v) maxV = v;
              var qId = data[offset + 2];
              var l = frame.components.push({
                h: h,
                v: v,
                quantizationTable: quantizationTables[qId]
              });
              frame.componentIds[componentId] = l - 1;
              offset += 3;
            }
            frame.maxH = maxH;
            frame.maxV = maxV;
            prepareComponents(frame);
            break;

          case 0xFFC4: // DHT (Define Huffman Tables)
            var huffmanLength = readUint16();
            for (i = 2; i < huffmanLength;) {
              var huffmanTableSpec = data[offset++];
              var codeLengths = new Uint8Array(16);
              var codeLengthSum = 0;
              for (j = 0; j < 16; j++, offset++)
                codeLengthSum += (codeLengths[j] = data[offset]);
              var huffmanValues = new Uint8Array(codeLengthSum);
              for (j = 0; j < codeLengthSum; j++, offset++)
                huffmanValues[j] = data[offset];
              i += 17 + codeLengthSum;

              ((huffmanTableSpec >> 4) === 0 ?
                huffmanTablesDC : huffmanTablesAC)[huffmanTableSpec & 15] =
                buildHuffmanTable(codeLengths, huffmanValues);
            }
            break;

          case 0xFFDD: // DRI (Define Restart Interval)
            readUint16(); // skip data length
            resetInterval = readUint16();
            break;

          case 0xFFDA: // SOS (Start of Scan)
            var scanLength = readUint16();
            var selectorsCount = data[offset++];
            var components = [], component;
            for (i = 0; i < selectorsCount; i++) {
              var componentIndex = frame.componentIds[data[offset++]];
              component = frame.components[componentIndex];
              var tableSpec = data[offset++];
              component.huffmanTableDC = huffmanTablesDC[tableSpec >> 4];
              component.huffmanTableAC = huffmanTablesAC[tableSpec & 15];
              components.push(component);
            }
            var spectralStart = data[offset++];
            var spectralEnd = data[offset++];
            var successiveApproximation = data[offset++];
            var processed = decodeScan(data, offset,
              frame, components, resetInterval,
              spectralStart, spectralEnd,
              successiveApproximation >> 4, successiveApproximation & 15);
            offset += processed;
            break;
          default:
            if (data[offset - 3] == 0xFF &&
                data[offset - 2] >= 0xC0 && data[offset - 2] <= 0xFE) {
              // could be incorrect encoding -- last 0xFF byte of the previous
              // block was eaten by the encoder
              offset -= 3;
              break;
            }
            throw "unknown JPEG marker " + fileMarker.toString(16);
        }
        fileMarker = readUint16();
      }

      this.width = frame.samplesPerLine;
      this.height = frame.scanLines;
      this.jfif = jfif;
      this.adobe = adobe;
      this.components = [];
      for (var i = 0; i < frame.components.length; i++) {
        var component = frame.components[i];
        this.components.push({
          output: buildComponentData(frame, component),
          scaleX: component.h / frame.maxH,
          scaleY: component.v / frame.maxV,
          blocksPerLine: component.blocksPerLine,
          blocksPerColumn: component.blocksPerColumn
        });
      }
    },

    getData: function getData(width, height) {
      var scaleX = this.width / width, scaleY = this.height / height;

      var component, componentScaleX, componentScaleY;
      var x, y, i;
      var offset = 0;
      var Y, Cb, Cr, K, C, M, Ye, R, G, B;
      var colorTransform;
      var numComponents = this.components.length;
      var dataLength = width * height * numComponents;
      var data = new Uint8Array(dataLength);
      var componentLine;

      // lineData is reused for all components. Assume first component is
      // the biggest
      var lineData = new Uint8Array((this.components[0].blocksPerLine << 3) *
                                    this.components[0].blocksPerColumn * 8);

      // First construct image data ...
      for (i = 0; i < numComponents; i++) {
        component = this.components[i];
        var blocksPerLine = component.blocksPerLine;
        var blocksPerColumn = component.blocksPerColumn;
        var samplesPerLine = blocksPerLine << 3;

        var j, k, ll = 0;
        var lineOffset = 0;
        for (var blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
          var scanLine = blockRow << 3;
          for (var blockCol = 0; blockCol < blocksPerLine; blockCol++) {
            var bufferOffset = getBlockBufferOffset(component, blockRow, blockCol);
            var offset = 0, sample = blockCol << 3;
            for (j = 0; j < 8; j++) {
              var lineOffset = (scanLine + j) * samplesPerLine;
              for (k = 0; k < 8; k++) {
                lineData[lineOffset + sample + k] =
                  component.output[bufferOffset + offset++];
              }
            }
          }
        }

        componentScaleX = component.scaleX * scaleX;
        componentScaleY = component.scaleY * scaleY;
        offset = i;

        var cx, cy;
        var index;
        for (y = 0; y < height; y++) {
          for (x = 0; x < width; x++) {
            cy = 0 | (y * componentScaleY);
            cx = 0 | (x * componentScaleX);
            index = cy * samplesPerLine + cx;
            data[offset] = lineData[index];
            offset += numComponents;
          }
        }
      }
       
/*
      // ... then transform colors, if necessary
      switch (numComponents) {
        case 1: case 2: break;
        // no color conversion for one or two compoenents

        case 3:
          // The default transform for three components is true
          colorTransform = true;
          // The adobe transform marker overrides any previous setting
          if (this.adobe && this.adobe.transformCode)
            colorTransform = true;
          else if (typeof this.colorTransform !== 'undefined')
            colorTransform = !!this.colorTransform;
        
          if (colorTransform) {
            for (i = 0; i < dataLength; i += numComponents) {
              Y  = data[i    ];
              Cb = data[i + 1];
              Cr = data[i + 2];

              R = clampToUint8(Y - 179.456 + 1.402 * Cr);
              G = clampToUint8(Y + 135.459 - 0.344 * Cb - 0.714 * Cr);
              B = clampToUint8(Y - 226.816 + 1.772 * Cb);

              data[i    ] = R;
              data[i + 1] = G;
              data[i + 2] = B;
            }
          }
          break;
        case 4:
          console.log(this.colorTransform);
          if (!this.adobe)
            throw 'Unsupported color mode (4 components)';
          // The default transform for four components is false
          colorTransform = false;
          // The adobe transform marker overrides any previous setting
          if (this.adobe && this.adobe.transformCode)
            colorTransform = true;
          else if (typeof this.colorTransform !== 'undefined')
            colorTransform = !!this.colorTransform;

          if (colorTransform) {
            for (i = 0; i < dataLength; i += numComponents) {
              Y  = data[i];
              Cb = data[i + 1];
              Cr = data[i + 2];

              C = clampToUint8(434.456 - Y - 1.402 * Cr);
              M = clampToUint8(119.541 - Y + 0.344 * Cb + 0.714 * Cr);
              Y = clampToUint8(481.816 - Y - 1.772 * Cb);

              data[i    ] = C;
              data[i + 1] = M;
              data[i + 2] = Y;
              // K is unchanged
            }
          }
          break;
        default:
          throw 'Unsupported color mode';
      }
      */
      return data;
    },
    copyToImageData: function copyToImageData(imageData) {
      var width = imageData.width, height = imageData.height;
      var imageDataBytes = width * height * 4;
      var imageDataArray = imageData.data;
      var data = this.getData(width, height);
      var i = 0, j = 0, k0, k1;
      var Y, K, C, M, R, G, B;
      switch (this.components.length) {
        case 1:
          while (j < imageDataBytes) {
            Y = data[i++];

            imageDataArray[j++] = Y;
            imageDataArray[j++] = Y;
            imageDataArray[j++] = Y;
            imageDataArray[j++] = 255;
          }
          break;
        case 3:
          while (j < imageDataBytes) {
            R = data[i++];
            G = data[i++];
            B = data[i++];

            imageDataArray[j++] = R;
            imageDataArray[j++] = G;
            imageDataArray[j++] = B;
            imageDataArray[j++] = 255;
          }
          break;
        case 4:
          while (j < imageDataBytes) {
            C = data[i++];
            M = data[i++];
            Y = data[i++];
            K = data[i++];

            k0 = 255 - K;
            k1 = k0 / 255;


            R = clampToUint8(k0 - C * k1);
            G = clampToUint8(k0 - M * k1);
            B = clampToUint8(k0 - Y * k1);

            imageDataArray[j++] = R;
            imageDataArray[j++] = G;
            imageDataArray[j++] = B;
            imageDataArray[j++] = 255;
          }
          break;
        default:
          throw 'Unsupported color mode';
      }
    }
  };

  return constructor;
})();
var BLP1_MAGIC = 0x31504c42;
var BLP_JPG = 0x0;
var BLP_PALLETE = 0x1;

/**
 * @class A BLP1 texture decoder.
 * @name BLPTexture
 * @param {ArrayBuffer} arrayBuffer The raw texture data.
 * @param {object} options An object containing options.
 * @param {WebGLRenderingContext} ctx A WebGL context.
 * @param {function} onerror A function that allows to report errors.
 * @param {function} onload A function that allows to manually report a success at parsing.
 * @property {WebGLTexture} id
 * @property {boolean} ready
 */
window["BLPTexture"] = function BLPTexture(arrayBuffer, options, ctx, onerror, onload, compressedTextures) {
    var i;
    
    if (arrayBuffer.byteLength < 40) {
        onerror("BLP: Bad File");
        return;
    }
    
    // If compression=0, the header size is 40
    // If compression=1, the header size is 39
    // Might as well make one typed array for both
    var header = new Int32Array(arrayBuffer, 0, 40);

    if (header[0] !== BLP1_MAGIC) {
        onerror("BLP: Format");
        return;
    }

    var arrayData = new Uint8Array(arrayBuffer);
    var compression = header[1];
    var width = header[3];
    var height = header[4];
    var pictureType = header[5];
    var mipmapOffset = header[7];
    var mipmapSize = header[23];
    var rgba8888Data;

    if (compression === BLP_JPG) {
        var jpegHeaderSize = header[39];
        var jpegHeader = new Uint8Array(arrayBuffer, 160, jpegHeaderSize)
        var jpegData = new Uint8Array(jpegHeaderSize + mipmapSize);

        jpegData.set(jpegHeader);
        jpegData.set(arrayData.subarray(mipmapOffset, mipmapOffset + mipmapSize), jpegHeaderSize);

        var jpegImage = new JpegImage();

        jpegImage.loadFromBuffer(jpegData);

        rgba8888Data = jpegImage.getData(jpegImage.width, jpegImage.height);

        // BGR -> RGB
        //~ for (i = 0; i < rgba8888Data.length; i += 4) {
            //~ var b = rgba8888Data[i];

            //~ rgba8888Data[i] = rgba8888Data[i + 2];
            //~ rgba8888Data[i + 2] = b;
        //~ }
    } else {
        var pallete = new Uint8Array(arrayBuffer, 156, 1024);
        var size = width * height;
        var mipmapAlphaOffset = mipmapOffset + size;
        var dstI;
        var hasAlpha = pictureType === 3 || pictureType === 4;

        rgba8888Data = new Uint8Array(size * 4);

        for (var index = 0; index < size; index++) {
            i = arrayData[mipmapOffset + index] * 4;
            dstI = index * 4;

            // BGR -> RGB
            //~ rgba8888Data[dstI] = pallete[i + 2];
            //~ rgba8888Data[dstI + 1] = pallete[i + 1];
            //~ rgba8888Data[dstI + 2] = pallete[i];
            rgba8888Data[dstI] = pallete[i];
            rgba8888Data[dstI + 1] = pallete[i + 1];
            rgba8888Data[dstI + 2] = pallete[i + 2];
            
            if (hasAlpha) {
                rgba8888Data[dstI + 3] = arrayData[mipmapAlphaOffset + index]
            } else {
                rgba8888Data[dstI + 3] = 255 - pallete[i + 3];
            }
        }
    }

    var id = ctx.createTexture();
    ctx.bindTexture(ctx.TEXTURE_2D, id);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_LINEAR);
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, width, height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, rgba8888Data);
    ctx.generateMipmap(ctx.TEXTURE_2D);

    this.id = id;
    this.ready = true;
    
    onload();
};
// Note: This file is largely based on https://github.com/toji/webctx-texture-utils/blob/master/texture-util/dds.js

var DDS_MAGIC = 0x20534444;
  
var DDSD_MIPMAPCOUNT = 0x20000;

var DDPF_FOURCC = 0x4;

var FOURCC_DXT1 = 0x31545844;
var FOURCC_DXT3 = 0x33545844;
var FOURCC_DXT5 = 0x35545844;

function int32ToFourCC(value) {
    return String.fromCharCode(value & 0xff, (value >> 8) & 0xff,  (value >> 16) & 0xff, (value >> 24) & 0xff);
}

var int4to8 = 255 / 15;
var int5to8 = 255 / 31;
var int6to8 = 255 / 63;

// 4 bit alpha
function setRgba8888Dxt3(dst, i, int565, a) {
    dst[i] = Math.floor(((int565 >> 11) & 31) * int5to8);
    dst[i + 1] = Math.floor(((int565 >> 5) & 63) * int6to8);
    dst[i + 2] = Math.floor((int565 & 31) * int5to8);
    dst[i + 3] = Math.floor(a * int4to8);
}

// 8 bit alpha
function setRgba8888Dxt5(dst, i, int565, a) {
    dst[i] = Math.floor(((int565 >> 11) & 31) * int5to8);
    dst[i + 1] = Math.floor(((int565 >> 5) & 63) * int6to8);
    dst[i + 2] = Math.floor((int565 & 31) * int5to8);
    dst[i + 3] = a;
}

function dxt1ToRgb565(src, width, height) {
    var c = new Uint16Array(4),
        dst = new Uint16Array(width * height),
        m,
        dstI,
        i,
        r0, g0, b0, r1, g1, b1,
        blockWidth = width / 4,
        blockHeight = height / 4,
        blockY,
        blockX;
  
    for (blockY = 0; blockY < blockHeight; blockY++) {
        for (blockX = 0; blockX < blockWidth; blockX++) {
            i = 4 * (blockY * blockWidth + blockX);
            c[0] = src[i];
            c[1] = src[i + 1];
            r0 = c[0] & 0x1f;
            g0 = c[0] & 0x7e0;
            b0 = c[0] & 0xf800;
            r1 = c[1] & 0x1f;
            g1 = c[1] & 0x7e0;
            b1 = c[1] & 0xf800;

            if (c[0] > c[1]) {
                c[2] = ((5 * r0 + 3 * r1) >> 3) | (((5 * g0 + 3 * g1) >> 3) & 0x7e0) | (((5 * b0 + 3 * b1) >> 3) & 0xf800);
                c[3] = ((5 * r1 + 3 * r0) >> 3) | (((5 * g1 + 3 * g0) >> 3) & 0x7e0) | (((5 * b1 + 3 * b0) >> 3) & 0xf800);
            } else {
                c[2] = (c[0] + c[1]) >> 1;
                c[3] = 0;
            }

            m = src[i + 2];
            dstI = (blockY * 4) * width + blockX * 4;
            dst[dstI] = c[m & 0x3];
            dst[dstI + 1] = c[(m >> 2) & 0x3];
            dst[dstI + 2] = c[(m >> 4) & 0x3];
            dst[dstI + 3] = c[(m >> 6) & 0x3];
            dstI += width;
            dst[dstI] = c[(m >> 8) & 0x3];
            dst[dstI + 1] = c[(m >> 10) & 0x3];
            dst[dstI + 2] = c[(m >> 12) & 0x3];
            dst[dstI + 3] = c[(m >> 14)];
            m = src[i + 3];
            dstI += width;
            dst[dstI] = c[m & 0x3];
            dst[dstI + 1] = c[(m >> 2) & 0x3];
            dst[dstI + 2] = c[(m >> 4) & 0x3];
            dst[dstI + 3] = c[(m >> 6) & 0x3];
            dstI += width;
            dst[dstI] = c[(m >> 8) & 0x3];
            dst[dstI + 1] = c[(m >> 10) & 0x3];
            dst[dstI + 2] = c[(m >> 12) & 0x3];
            dst[dstI + 3] = c[(m >> 14)];
        }
    }

    return dst;
}

function dxt3ToRgba8888(src, width, height) {
    var c = new Uint16Array(4),
        dst = new Uint8Array(width * height * 4),
        m,
        a,
        dstI,
        i,
        r0, g0, b0, r1, g1, b1,
        blockWidth = width / 4,
        blockHeight = height / 4,
        widthBytes = width * 4,
        blockY,
        blockX;

    for (blockY = 0; blockY < blockHeight; blockY++) {
        for (blockX = 0; blockX < blockWidth; blockX++) {
            i = 8 * (blockY * blockWidth + blockX);
            c[0] = src[i + 4];
            c[1] = src[i + 5];
            r0 = c[0] & 0x1f;
            g0 = c[0] & 0x7e0;
            b0 = c[0] & 0xf800;
            r1 = c[1] & 0x1f;
            g1 = c[1] & 0x7e0;
            b1 = c[1] & 0xf800;
            c[2] = ((5 * r0 + 3 * r1) >> 3) | (((5 * g0 + 3 * g1) >> 3) & 0x7e0) | (((5 * b0 + 3 * b1) >> 3) & 0xf800);
            c[3] = ((5 * r1 + 3 * r0) >> 3) | (((5 * g1 + 3 * g0) >> 3) & 0x7e0) | (((5 * b1 + 3 * b0) >> 3) & 0xf800);

            m = src[i + 6];
            a = src[i];
            dstI = (blockY * 16) * width + blockX * 16;
            setRgba8888Dxt3(dst, dstI, c[m & 0x3], a & 0xf);
            setRgba8888Dxt3(dst, dstI + 4, c[(m >> 2) & 0x3], (a >> 4) & 0xf);
            setRgba8888Dxt3(dst, dstI + 8, c[(m >> 4) & 0x3], (a >> 8) & 0xf);
            setRgba8888Dxt3(dst, dstI + 12, c[(m >> 6) & 0x3], (a >> 12) & 0xf);
            a = src[i + 1];
            dstI += widthBytes;
            setRgba8888Dxt3(dst, dstI, c[(m >> 8) & 0x3], a & 0xf);
            setRgba8888Dxt3(dst, dstI + 4, c[(m >> 10) & 0x3], (a >> 4) & 0xf);
            setRgba8888Dxt3(dst, dstI + 8, c[(m >> 12) & 0x3], (a >> 8) & 0xf);
            setRgba8888Dxt3(dst, dstI + 12, c[m >> 14], (a >> 12) & 0xf);
            m = src[i + 7];
            a = src[i + 2];
            dstI += widthBytes;
            setRgba8888Dxt3(dst, dstI, c[m & 0x3], a & 0xf);
            setRgba8888Dxt3(dst, dstI + 4, c[(m >> 2) & 0x3], (a >> 4) & 0xf);
            setRgba8888Dxt3(dst, dstI + 8, c[(m >> 4) & 0x3], (a >> 8) & 0xf);
            setRgba8888Dxt3(dst, dstI + 12, c[(m >> 6) & 0x3], (a >> 12) & 0xf);
            a = src[i + 3];
            dstI += widthBytes;
            setRgba8888Dxt3(dst, dstI, c[(m >> 8) & 0x3], a & 0xf);
            setRgba8888Dxt3(dst, dstI + 4, c[(m >> 10) & 0x3], (a >> 4) & 0xf);
            setRgba8888Dxt3(dst, dstI + 8, c[(m >> 12) & 0x3], (a >> 8) & 0xf);
            setRgba8888Dxt3(dst, dstI + 12, c[m >> 14], (a >> 12) & 0xf);
        }
    }
  
    return dst;
}

function dxt5ToRgba8888(src, width, height) {
    var c = new Uint16Array(4),
        a = new Uint8Array(8),
        alphaBits,
        dst = new Uint8Array(width * height * 4),
        m,
        a,
        dstI,
        i,
        r0, g0, b0, r1, g1, b1,
        blockWidth = width / 4,
        blockHeight = height / 4,
        widthBytes = width * 4,
        blockY,
        blockX;
    
    for (blockY = 0; blockY < blockHeight; blockY++) {
        for (blockX = 0; blockX < blockWidth; blockX++) {
            i = 8 * (blockY * blockWidth + blockX);
            c[0] = src[i + 4];
            c[1] = src[i + 5];
            r0 = c[0] & 0x1f;
            g0 = c[0] & 0x7e0;
            b0 = c[0] & 0xf800;
            r1 = c[1] & 0x1f;
            g1 = c[1] & 0x7e0;
            b1 = c[1] & 0xf800;
            c[2] = ((5 * r0 + 3 * r1) >> 3) | (((5 * g0 + 3 * g1) >> 3) & 0x7e0) | (((5 * b0 + 3 * b1) >> 3) & 0xf800);
            c[3] = ((5 * r1 + 3 * r0) >> 3) | (((5 * g1 + 3 * g0) >> 3) & 0x7e0) | (((5 * b1 + 3 * b0) >> 3) & 0xf800);
            alphaBits = src[i + 1] + 65536 * (src[i + 2] + 65536 * src[i + 3]);
            a[0] = src[i] & 0xff;
            a[1] = src[i]  >> 8;

            if (a[0] > a[1]) {
                a[2] = (54 * a[0] + 9 * a[1]) >> 6;
                a[3] = (45 * a[0] + 18 * a[1]) >> 6;
                a[4] = (36 * a[0] + 27 * a[1]) >> 6;
                a[5] = (27 * a[0] + 36 * a[1]) >> 6;
                a[6] = (18 * a[0] + 45 * a[1]) >> 6;
                a[7] = (9 * a[0] + 54 * a[1]) >> 6;

                /*
                a[2] = (6 * a[0] + a[1]) / 7;
                a[3] = (5 * a[0] + 2 * a[1]) / 7;
                a[4] = (4 * a[0] + 3 * a[1]) / 7;
                a[5] = (3 * a[0] + 4 * a[1]) / 7;
                a[6] = (2 * a[0] + 5 * a[1]) / 7;
                a[7] = (a[0] + 6 * a[1]) / 7;
                //*/
            } else {
                a[2] = (12 * a[0] + 3 * a[1]) >> 4;
                a[3] = (9 * a[0] + 6 * a[1]) >> 4;
                a[4] = (6 * a[0] + 9 * a[1]) >> 4;
                a[5] = (3 * a[0] + 12 * a[1]) >> 4;
                a[6] = 0;
                a[7] = 1

                /*
                a[2] = (4 * a[0] + a[1]) / 5;
                a[3] = (3 * a[0] + 2 * a[1]) / 5;
                a[4] = (2 * a[0] + 3 * a[1]) / 5;
                a[5] = (a[0] + 4 * a[1]) / 5;
                a[6] = 0;
                a[7] = 1;
                //*/
            }

            m = src[i + 6];
            dstI = (blockY * 16) * width + blockX * 16;
            setRgba8888Dxt5(dst, dstI, c[m & 0x3], a[alphaBits & 0x7]);
            setRgba8888Dxt5(dst, dstI + 4, c[(m >> 2) & 0x3], a[(alphaBits >> 3) & 0x7]);
            setRgba8888Dxt5(dst, dstI + 8, c[(m >> 4) & 0x3], a[(alphaBits >> 6) & 0x7]);
            setRgba8888Dxt5(dst, dstI + 12, c[(m >> 6) & 0x3], a[(alphaBits >> 9) & 0x7]);
            dstI += widthBytes;
            setRgba8888Dxt5(dst, dstI, c[(m >> 8) & 0x3], a[(alphaBits >> 12) & 0x7]);
            setRgba8888Dxt5(dst, dstI + 4, c[(m >> 10) & 0x3], a[(alphaBits >> 15) & 0x7]);
            setRgba8888Dxt5(dst, dstI + 8, c[(m >> 12) & 0x3], a[(alphaBits >> 18) & 0x7]);
            setRgba8888Dxt5(dst, dstI + 12, c[m >> 14], a[(alphaBits >> 21) & 0x7]);
            m = src[i + 7];
            dstI += widthBytes;
            setRgba8888Dxt5(dst, dstI, c[m & 0x3], a[(alphaBits >> 24) & 0x7]);
            setRgba8888Dxt5(dst, dstI + 4, c[(m >> 2) & 0x3], a[(alphaBits >> 27) & 0x7]);
            setRgba8888Dxt5(dst, dstI + 8, c[(m >> 4) & 0x3], a[(alphaBits >> 30) & 0x7]);
            setRgba8888Dxt5(dst, dstI + 12, c[(m >> 6) & 0x3],a[(alphaBits >> 33) & 0x7]);
            dstI += widthBytes;
            setRgba8888Dxt5(dst, dstI, c[(m >> 8) & 0x3], a[(alphaBits >> 36) & 0x7]);
            setRgba8888Dxt5(dst, dstI + 4, c[(m >> 10) & 0x3], a[(alphaBits >> 39) & 0x7]);
            setRgba8888Dxt5(dst, dstI + 8, c[(m >> 12) & 0x3], a[(alphaBits >> 42) & 0x7]);
            setRgba8888Dxt5(dst, dstI + 12, c[m >> 14], a[(alphaBits >> 45) & 0x7]);
        }
    }

    return dst;
}

/**
 * @class A DDS texture decoder.
 * @name DDSTexture
 * @param {ArrayBuffer} arrayBuffer The raw texture data.
 * @param {object} options An object containing options.
 * @param {WebGLRenderingContext} ctx A WebGL context.
 * @param {function} onerror A function that allows to report errors.
 * @param {function} onload A function that allows to manually report a success at parsing.
 * @property {WebGLTexture} id
 * @property {boolean} ready
 */
window["DDSTexture"] = function DDSTexture(arrayBuffer, options, ctx, onerror, onload, compressedTextures) {
    var header = new Int32Array(arrayBuffer, 0, 31);

    if (header[0] !== DDS_MAGIC) {
        onerror("DDS: Format");
        return;
    }

    if (!header[20] & DDPF_FOURCC) {
        onerror("DDS: FourCC");
        return;
    }

    var fourCC = header[21];
    var blockBytes, internalFormat;

    if (fourCC === FOURCC_DXT1) {
        blockBytes = 8;
        internalFormat = compressedTextures ? compressedTextures.COMPRESSED_RGBA_S3TC_DXT1_EXT : null;
    } else if (fourCC === FOURCC_DXT3) {
        blockBytes = 16;
        internalFormat = compressedTextures ? compressedTextures.COMPRESSED_RGBA_S3TC_DXT3_EXT : null;
    } else if (fourCC === FOURCC_DXT5) {
        blockBytes = 16;
        internalFormat = compressedTextures ? compressedTextures.COMPRESSED_RGBA_S3TC_DXT5_EXT : null;
    } else {
        onerror("DDS: " + int32ToFourCC(fourCC));
        return;
    }

    var mipmapCount = 1;

    if (header[2] & DDSD_MIPMAPCOUNT) {
        mipmapCount = Math.max(1, header[7]);
    }

    var width = header[4];
    var height = header[3];
    var dataOffset = header[1] + 4;
    var dataLength, byteArray;
    var rgb565Data, rgba8888Data;

    var id = ctx.createTexture();
    ctx.bindTexture(ctx.TEXTURE_2D, id);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, options.clampS ? ctx.CLAMP_TO_EDGE : ctx.REPEAT);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, options.clampT ? ctx.CLAMP_TO_EDGE : ctx.REPEAT);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, mipmapCount > 1 ? ctx.LINEAR_MIPMAP_LINEAR : ctx.LINEAR);

    if (internalFormat) {
        var i;
        
        for (i = 0; i < mipmapCount; i++) {
            dataLength = Math.max(4, width) / 4 * Math.max( 4, height ) / 4 * blockBytes;
            byteArray = new Uint8Array(arrayBuffer, dataOffset, dataLength);
            ctx.compressedTexImage2D(ctx.TEXTURE_2D, i, internalFormat, width, height, 0, byteArray);
            dataOffset += dataLength;
            width *= 0.5;
            height *= 0.5;
        }
    } else {
        dataLength = Math.max(4, width) / 4 * Math.max( 4, height ) / 4 * blockBytes;
        byteArray = new Uint16Array(arrayBuffer, dataOffset);

        if (fourCC === FOURCC_DXT1) {
            rgb565Data = dxt1ToRgb565(byteArray, width, height);
            ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGB, width, height, 0, ctx.RGB, ctx.UNSIGNED_SHORT_5_6_5, rgb565Data);
        } else if (fourCC === FOURCC_DXT3) {
            rgba8888Data = dxt3ToRgba8888(byteArray, width, height);
            ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, width, height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, rgba8888Data);
        } else {
            rgba8888Data = dxt5ToRgba8888(byteArray, width, height);
            ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, width, height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, rgba8888Data);
        }

        ctx.generateMipmap(ctx.TEXTURE_2D);
    }

    this.id = id;
    this.ready = true;
    
    onload();
};
/**
 * @class A TGA texture decoder. Supports only simple 32bit TGA images.
 * @name TGATexture
 * @param {ArrayBuffer} arrayBuffer The raw texture data.
 * @param {object} options An object containing options.
 * @param {WebGLRenderingContext} ctx A WebGL context.
 * @param {function} onerror A function that allows to report errors.
 * @param {function} onload A function that allows to manually report a success at parsing.
 * @property {WebGLTexture} id
 * @property {boolean} ready
 */

window["TGATexture"] = function TGATexture(arrayBuffer, options, ctx, onerror, onload, compressedTextures) {
    var dataView = new DataView(arrayBuffer);
    var imageType = dataView.getUint8(2);

    if (imageType !== 2) {
        onerror("TGA: ImageType");
        return;
    }

    var width = dataView.getUint16(12, true);
    var height = dataView.getUint16(14, true);
    var pixelDepth = dataView.getUint8(16);
    var imageDescriptor = dataView.getUint8(17);

    if (pixelDepth !== 32) {
        onerror("TGA: PixelDepth");
        return;
    }

    var rgba8888Data = new Uint8Array(arrayBuffer, 18, width * height * 4);
    var index;
    var temp;
    var i;
    var l;
    
    // BGRA -> RGBA
    //~ for (i = 0, l = width * height; i < l; i++) {
        //~ index = i * 4;
        //~ temp = rgba8888Data[index];

        //~ rgba8888Data[index] = rgba8888Data[index + 2];
        //~ rgba8888Data[index + 2] = temp;
    //~ }

    var id = ctx.createTexture();
    ctx.bindTexture(ctx.TEXTURE_2D, id);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, options.clampS ? ctx.CLAMP_TO_EDGE : ctx.REPEAT);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, options.clampT ? ctx.CLAMP_TO_EDGE : ctx.REPEAT);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_LINEAR);
    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, 1);
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, width, height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, rgba8888Data);
    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, 0);
    ctx.generateMipmap(ctx.TEXTURE_2D);

    this.id = id;
    this.ready = true;
    
    onload();
};
var SHADERS = {
	"vsbonetexture":"uniform sampler2D u_boneMap;\nuniform float u_matrix_size;\nuniform float u_texel_size;\n\nmat4 boneAtIndex(float index) {\n    float offset = index * u_matrix_size;\n    return mat4(texture2D(u_boneMap, vec2(offset, 0)), texture2D(u_boneMap, vec2(offset + u_texel_size, 0)), texture2D(u_boneMap, vec2(offset + u_texel_size * 2.0, 0)), texture2D(u_boneMap, vec2(offset + u_texel_size * 3.0, 0)));\n}\n",
	"decodefloat":"vec2 decodeFloat2(float f) {\n    vec2 v;\n\n    v[1] = floor(f / 256.0);\n    v[0] = floor(f - v[1] * 256.0);\n\n    return v;\n}\n\nvec3 decodeFloat3(float f) {\n    vec3 v;\n\n    v[2] = floor(f / 65536.0);\n    v[1] = floor((f - v[2] * 65536.0) / 256.0);\n    v[0] = floor(f - v[2] * 65536.0 - v[1] * 256.0);\n\n    return v;\n}",
	"vsworld":"uniform mat4 u_mvp;\nuniform vec2 u_uv_offset;\n\nattribute vec3 a_position;\nattribute vec2 a_uv;\n\nvarying vec2 v_uv;\n\nvoid main() {\n    v_uv = a_uv + u_uv_offset;\n\n    gl_Position = u_mvp * vec4(a_position, 1);\n}\n",
	"vswhite":"uniform mat4 u_mvp;\n\nattribute vec3 a_position;\n\nvoid main() {\n    gl_Position = u_mvp * vec4(a_position, 1);\n}\n",
	"psworld":"uniform sampler2D u_texture;\nuniform float u_a;\n\nvarying vec2 v_uv;\n\nvoid main() {\n    gl_FragColor = vec4(texture2D(u_texture, v_uv).rgb, u_a);\n}\n",
	"pswhite":"void main() {\n    gl_FragColor = vec4(1);\n}\n",
	"pscolor":"uniform vec3 u_color;\n\nvoid main() {\n    gl_FragColor = vec4(u_color / 255.0, 1);\n}\n",
	"vstexture":"uniform mat4 u_mvp;\n\nattribute vec3 a_position;\nattribute vec2 a_uv;\n\nvarying vec2 v_uv;\n\nvoid main() {\n    v_uv = a_uv;\n\n    gl_Position = u_mvp * vec4(a_position, 1);\n}\n",
	"pstexture":"uniform sampler2D u_texture;\n\nvarying vec2 v_uv;\n\nvoid main() {\n    gl_FragColor = texture2D(u_texture, v_uv);\n}\n",
	"wvsmain":"uniform mat4 u_mvp;\nuniform vec3 u_uv_offset;\n\nattribute vec3 a_position;\nattribute vec3 a_normal;\nattribute vec2 a_uv;\nattribute vec4 a_bones;\nattribute float a_bone_number;\n\nvarying vec3 v_normal;\nvarying vec2 v_uv;\n\nvoid transform(vec3 inposition, vec3 innormal, float bone_number, vec4 bones, out vec3 outposition, out vec3 outnormal) {\n    vec4 position = vec4(inposition, 1);\n    vec4 normal = vec4(innormal, 0);\n    vec4 temp;\n\n    mat4 bone0 = boneAtIndex(bones[0]);\n    mat4 bone1 = boneAtIndex(bones[1]);\n    mat4 bone2 = boneAtIndex(bones[2]);\n    mat4 bone3 = boneAtIndex(bones[3]);\n\n    temp = vec4(0);\n    temp += bone0 * position;\n    temp += bone1 * position;\n    temp += bone2 * position;\n    temp += bone3 * position;\n    temp /= bone_number;\n    outposition = vec3(temp);\n\n    temp = vec4(0);\n    temp += bone0 * normal;\n    temp += bone1 * normal;\n    temp += bone2 * normal;\n    temp += bone3 * normal;\n    outnormal = normalize(vec3(temp));\n}\n\nvoid main() {\n    vec3 position, normal;\n\n    transform(a_position, a_normal, a_bone_number, a_bones, position, normal);\n\n    v_normal = normal;\n    v_uv = a_uv + u_uv_offset.xy;\n\n    gl_Position = u_mvp * vec4(position, 1);\n}\n",
	"wvsribbons":"uniform mat4 u_mvp;\nuniform vec3 u_uv_offset;\n\nattribute vec3 a_position;\nattribute vec2 a_uv;\n\nvarying vec2 v_uv;\n\nvoid main() {\n    v_uv = a_uv + u_uv_offset.xy;\n\n    gl_Position = u_mvp * vec4(a_position, 1);\n}\n",
	"wvsparticles":"uniform mat4 u_mvp;\nuniform vec2 u_dimensions;\n\nattribute vec3 a_position;\nattribute vec2 a_uva_rgb;\n\nvarying vec2 v_uv;\nvarying vec4 v_color;\n\nvoid main() {\n    vec3 uva = decodeFloat3(a_uva_rgb[0]);\n    vec3 rgb = decodeFloat3(a_uva_rgb[1]);\n\n    v_uv = uva.xy / u_dimensions;\n    v_color = vec4(rgb, uva.z) / 255.0;\n\n    gl_Position = u_mvp * vec4(a_position, 1);\n}\n",
	"wvscolor":"uniform mat4 u_mvp;\n\nattribute vec3 a_position;\nattribute vec4 a_bones;\nattribute float a_bone_number;\n\nvoid main() {\n    vec4 v = vec4(a_position, 1);\n    vec4 p = (boneAtIndex(a_bones[0]) * v + boneAtIndex(a_bones[1]) * v + boneAtIndex(a_bones[2]) * v + boneAtIndex(a_bones[3]) * v) / a_bone_number;\n\n    gl_Position = u_mvp * p ;\n}\n",
	"wvswhite":"uniform mat4 u_mvp;\n\nattribute vec3 a_position;\nattribute vec4 a_bones;\nattribute float a_bone_number;\n\nvoid transform(vec3 inposition, float bone_number, vec4 bones, out vec3 outposition) {\n    vec4 position = vec4(inposition, 1);\n    vec4 temp;\n\n    mat4 bone0 = boneAtIndex(bones[0]);\n    mat4 bone1 = boneAtIndex(bones[1]);\n    mat4 bone2 = boneAtIndex(bones[2]);\n    mat4 bone3 = boneAtIndex(bones[3]);\n\n    temp = vec4(0);\n    temp += bone0 * position;\n    temp += bone1 * position;\n    temp += bone2 * position;\n    temp += bone3 * position;\n    temp /= bone_number;\n    outposition = vec3(temp);\n}\n\nvoid main() {\n    vec3 position;\n\n    transform(a_position, a_bone_number, a_bones, position);\n\n    gl_Position = u_mvp * vec4(position, 1);\n}\n",
	"wpsmain":"uniform sampler2D u_texture;\nuniform bool u_alphaTest;\nuniform vec4 u_modifier;\nuniform vec4 u_tint;\n\nvarying vec3 v_normal;\nvarying vec2 v_uv;\n\nvoid main() {\n    #ifdef STANDARD_PASS\n    vec4 texel = texture2D(u_texture, v_uv).bgra;\n\n    // 1bit Alpha\n    if (u_alphaTest && texel.a < 0.75) {\n        discard;\n    }\n\n	gl_FragColor = texel * u_modifier * u_tint;\n    #endif\n\n    #ifdef UVS_PASS\n    gl_FragColor = vec4(v_uv, 0.0, 1.0);\n    #endif\n\n    #ifdef NORMALS_PASS\n    gl_FragColor = vec4(v_normal, 1.0);\n    #endif\n\n    #ifdef WHITE_PASS\n    gl_FragColor = vec4(1.0);\n    #endif\n}\n",
	"wpsparticles":"uniform sampler2D u_texture;\n\nvarying vec2 v_uv;\nvarying vec4 v_color;\n\nvoid main() {\n    gl_FragColor = texture2D(u_texture, v_uv).bgra * v_color;\n}\n",
	"svscommon":"vec3 TBN(vec3 vector, vec3 tangent, vec3 binormal, vec3 normal) {\n    vec3 transformed;\n\n    transformed.x = dot(vector, tangent);\n    transformed.y = dot(vector, binormal);\n    transformed.z = dot(vector, normal);\n\n    return transformed;\n}\n\nvec4 decodeVector(vec4 v) {\n    return ((v / 255.0) * 2.0) - 1.0;\n}\n",
	"svsstandard":"uniform mat4 u_mvp;\nuniform mat4 u_mv;\nuniform vec3 u_eyePos;\nuniform vec3 u_lightPos;\nuniform float u_firstBoneLookupIndex;\n\nattribute vec3 a_position;\nattribute vec4 a_normal;\nattribute vec2 a_uv0;\n\n#ifdef EXPLICITUV1\nattribute vec2 a_uv1;\n#endif\n#ifdef EXPLICITUV2\nattribute vec2 a_uv1;\nattribute vec2 a_uv2;\n#endif\n#ifdef EXPLICITUV3\nattribute vec2 a_uv1;\nattribute vec2 a_uv2;\nattribute vec2 a_uv3;\n#endif\n\nattribute vec4 a_tangent;\nattribute vec4 a_bones;\nattribute vec4 a_weights;\n\nvarying vec3 v_normal;\nvarying vec2 v_uv[4];\nvarying vec3 v_lightDir;\nvarying vec3 v_eyeVec;\nvarying vec3 v_halfVec;\n\nvoid transform(vec3 inposition, vec3 innormal, vec3 intangent, vec4 bones, vec4 weights, out vec3 outposition, out vec3 outnormal, out vec3 outtangent) {\n    vec4 position = vec4(inposition, 1);\n    vec4 normal = vec4(innormal, 0);\n    vec4 tangent = vec4(intangent, 0);\n    vec4 temp;\n\n    mat4 weightedBone0 = boneAtIndex(bones[0]) * weights[0];\n    mat4 weightedBone1 = boneAtIndex(bones[1]) * weights[1];\n    mat4 weightedBone2 = boneAtIndex(bones[2]) * weights[2];\n    mat4 weightedBone3 = boneAtIndex(bones[3]) * weights[3];\n\n    temp = vec4(0);\n    temp += weightedBone0 * position;\n    temp += weightedBone1 * position;\n    temp += weightedBone2 * position;\n    temp += weightedBone3 * position;\n    outposition = vec3(temp);\n\n    temp = vec4(0);\n    temp += weightedBone0 * normal;\n    temp += weightedBone1 * normal;\n    temp += weightedBone2 * normal;\n    temp += weightedBone3 * normal;\n    outnormal = normalize(vec3(temp));\n\n    temp = vec4(0);\n    temp += weightedBone0 * tangent;\n    temp += weightedBone1 * tangent;\n    temp += weightedBone2 * tangent;\n    temp += weightedBone3 * tangent;\n    outtangent = normalize(vec3(temp));\n}\n\nvoid main() {\n    vec4 decodedNormal = decodeVector(a_normal);\n    vec4 decodedTangent = decodeVector(a_tangent);\n    vec3 position, normal, tangent;\n\n    transform(a_position, vec3(decodedNormal), vec3(decodedTangent), a_bones + u_firstBoneLookupIndex, a_weights / 255.0, position, normal, tangent);\n\n    mat3 mv = mat3(u_mv);\n\n    vec3 position_mv = (u_mv * vec4(position, 1)).xyz;\n\n    vec3 n = normalize(mv * normal);\n    vec3 t = normalize(mv * tangent);\n    vec3 b = normalize(cross(n, t) * decodedNormal.w);\n\n    vec3 lightDir = normalize(u_lightPos - position_mv);\n    v_lightDir = normalize(TBN(lightDir, t, b, n));\n\n    vec3 eyeVec = normalize(u_eyePos - position_mv);\n    vec3 halfVec = normalize(eyeVec - u_lightPos);\n\n    v_eyeVec = TBN(eyeVec, t, b, n);\n    v_halfVec = TBN(halfVec, t, b, n);\n\n    v_normal = n;\n\n    v_uv[0] = a_uv0 / 2048.0;\n\n    v_uv[1] = vec2(0);\n    v_uv[2] = vec2(0);\n    v_uv[3] = vec2(0);\n\n    #ifdef EXPLICITUV1\n    v_uv[1] = a_uv1 / 2048.0;\n    #endif\n    #ifdef EXPLICITUV2\n    v_uv[1] = a_uv1 / 2048.0;\n    v_uv[2] = a_uv2 / 2048.0;\n    #endif\n    #ifdef EXPLICITUV3\n    v_uv[1] = a_uv1 / 2048.0;\n    v_uv[2] = a_uv2 / 2048.0;\n    v_uv[3] = a_uv3 / 2048.0;\n    #endif\n\n    gl_Position = u_mvp * vec4(position, 1);\n}\n",
	"svscolor":"uniform mat4 u_mvp;\nuniform float u_firstBoneLookupIndex;\n\nattribute vec3 a_position;\nattribute vec4 a_bones;\nattribute vec4 a_weights;\n\nvoid transform(vec3 inposition, vec4 bones, vec4 weights, out vec3 outposition) {\n    vec4 position = vec4(inposition, 1);\n    vec4 temp;\n\n    mat4 weightedBone0 = boneAtIndex(bones[0]) * weights[0];\n    mat4 weightedBone1 = boneAtIndex(bones[1]) * weights[1];\n    mat4 weightedBone2 = boneAtIndex(bones[2]) * weights[2];\n    mat4 weightedBone3 = boneAtIndex(bones[3]) * weights[3];\n\n    temp = vec4(0);\n    temp += weightedBone0 * position;\n    temp += weightedBone1 * position;\n    temp += weightedBone2 * position;\n    temp += weightedBone3 * position;\n    outposition = vec3(temp);\n}\n\nvoid main() {\n    vec3 position;\n\n    transform(a_position, a_bones + u_firstBoneLookupIndex, a_weights / 255.0, position);\n\n    gl_Position = u_mvp * vec4(position, 1);\n}\n",
	"spscommon":"uniform vec3 u_teamColor;\n\nvarying vec3 v_normal;\nvarying vec2 v_uv[4];\nvarying vec3 v_lightDir;\nvarying vec3 v_eyeVec;\nvarying vec3 v_halfVec;\n\nstruct LayerSettings {\n    bool enabled;\n    float op;\n    float channels;\n    float teamColorMode;\n    //vec3 multAddAlpha;\n    //bool useAlphaFactor;\n    bool invert;\n    //bool multColor;\n    //bool addColor;\n    bool clampResult;\n    //bool useConstantColor;\n    //vec4 constantColor;\n    //float uvSource;\n    float uvCoordinate;\n    //float fresnelMode;\n    //float fresnelTransformMode;\n    //mat4 fresnelTransform;\n    //bool fresnelClamp;\n    //vec3 fresnelExponentBiasScale;\n};\n\n#define SPECULAR_RGB 0.0\n#define SPECULAR_A_ONLY 1.0\n\n#define FRESNELMODE_NONE 0.0\n#define FRESNELMODE_STANDARD 1.0\n#define FRESNELMODE_INVERTED 2.0\n\n#define FRESNELTRANSFORM_NONE 0.0\n#define FRESNELTRANSFORM_SIMPLE 1.0\n#define FRESNELTRANSFORM_NORMALIZED 2.0\n\n#define UVMAP_EXPLICITUV0 0.0\n#define UVMAP_EXPLICITUV1 1.0\n#define UVMAP_REFLECT_CUBICENVIO 2.0\n#define UVMAP_REFLECT_SPHERICALENVIO 3.0\n#define UVMAP_PLANARLOCALZ 4.0\n#define UVMAP_PLANARWORLDZ 5.0\n#define UVMAP_PARTICLE_FLIPBOOK 6.0\n#define UVMAP_CUBICENVIO 7.0\n#define UVMAP_SPHERICALENVIO 8.0\n#define UVMAP_EXPLICITUV2 9.0\n#define UVMAP_EXPLICITUV3 10.0\n#define UVMAP_PLANARLOCALX 11.0\n#define UVMAP_PLANARLOCALY 12.0\n#define UVMAP_PLANARWORLDX 13.0\n#define UVMAP_PLANARWORLDY 14.0\n#define UVMAP_SCREENSPACE 15.0\n#define UVMAP_TRIPLANAR_LOCAL 16.0\n#define UVMAP_TRIPLANAR_WORLD 17.0\n#define UVMAP_TRIPLANAR_WORLD_LOCAL_Z 18.0\n\n#define CHANNELSELECT_RGB 0.0\n#define CHANNELSELECT_RGBA 1.0\n#define CHANNELSELECT_A 2.0\n#define CHANNELSELECT_R 3.0\n#define CHANNELSELECT_G 4.0\n#define CHANNELSELECT_B 5.0\n\n#define TEAMCOLOR_NONE 0.0\n#define TEAMCOLOR_DIFFUSE 1.0\n#define TEAMCOLOR_EMISSIVE 2.0\n\n#define LAYEROP_MOD 0.0\n#define LAYEROP_MOD2X 1.0\n#define LAYEROP_ADD 2.0\n#define LAYEROP_LERP 3.0\n#define LAYEROP_TEAMCOLOR_EMISSIVE_ADD 4.0\n#define LAYEROP_TEAMCOLOR_DIFFUSE_ADD 5.0\n#define LAYEROP_ADD_NO_ALPHA 6.0\n/*\nfloat calculateFresnelTerm(vec3 normal, vec3 eyeToVertex, float exponent, mat4 fresnelTransform, float fresnelTransformMode, bool fresnelClamp) {\n  vec3 fresnelDir = eyeToVertex;\n  float result;\n  \n  if (fresnelTransformMode != FRESNELTRANSFORM_NONE) {\n    fresnelDir = (fresnelTransform * vec4(fresnelDir, 1.0)).xyz;\n    \n    if (fresnelTransformMode == FRESNELTRANSFORM_NORMALIZED) {\n      fresnelDir = normalize(fresnelDir);\n    }\n  }\n  \n  if (fresnelClamp) {\n    result = 1.0 - clamp(-dot(normal, fresnelDir), 0.0, 1.0);\n  } else {\n    result = 1.0 - abs(dot(normal, fresnelDir));\n  }\n  \n  result = max(result, 0.0000001);\n  \n  return pow(result, exponent);\n}\n*/\nvec3 combineLayerColor(vec4 color, vec3 result, LayerSettings layerSettings) {\n    if (layerSettings.op == LAYEROP_MOD) {\n        result *= color.rgb;\n    } else if (layerSettings.op == LAYEROP_MOD2X) {\n        result *= color.rgb * 2.0;\n    } else if (layerSettings.op == LAYEROP_ADD) {\n        result += color.rgb * color.a;\n    } else if (layerSettings.op == LAYEROP_ADD_NO_ALPHA) {\n        result += color.rgb;\n    } else if (layerSettings.op == LAYEROP_LERP) {\n        result = mix(result, color.rgb, color.a);\n    } else if (layerSettings.op == LAYEROP_TEAMCOLOR_EMISSIVE_ADD) {\n        result += color.a * (u_teamColor / 255.0);\n    } else if (layerSettings.op == LAYEROP_TEAMCOLOR_DIFFUSE_ADD) {\n        result += color.a * (u_teamColor / 255.0);\n    }\n\n    return result;\n}\n\nvec4 chooseChannel(float channel, vec4 texel) {\n    if (channel == CHANNELSELECT_R) {\n        texel = texel.rrrr;\n    } else if (channel == CHANNELSELECT_G) {\n        texel = texel.gggg;\n    } else if (channel == CHANNELSELECT_B) {\n        texel = texel.bbbb;\n    } else if (channel == CHANNELSELECT_A) {\n        texel = texel.aaaa;\n    } else if (channel == CHANNELSELECT_RGB) {\n        texel.a = 1.0;\n    }\n\n    return texel;\n}\n\nvec2 getUV(LayerSettings layerSettings) {\n    if (layerSettings.uvCoordinate == 1.0) {\n        return v_uv[1];\n    } else if (layerSettings.uvCoordinate == 2.0) {\n        return v_uv[2];\n    } else if (layerSettings.uvCoordinate == 3.0) {\n        return v_uv[3];\n    }\n\n    return v_uv[0];\n}\n\nvec4 sampleLayer(sampler2D layer, LayerSettings layerSettings) {\n      /*\n      if (layerSettings.useConstantColor && false) {\n        return layerSettings.constantColor;\n      }\n      */\n      return texture2D(layer, getUV(layerSettings));\n}\n\nvec4 computeLayerColor(sampler2D layer, LayerSettings layerSettings) {\n    vec4 texel = sampleLayer(layer, layerSettings);\n    vec4 result = chooseChannel(layerSettings.channels, texel);\n    /*\n    if (layerSettings.useAlphaFactor && false) {\n    result.a *= layerSettings.multAddAlpha.z;\n    }\n    */\n    if (layerSettings.teamColorMode == TEAMCOLOR_DIFFUSE) {\n        result = vec4(mix(u_teamColor / 255.0, result.rgb, texel.a), 1);\n    } else if (layerSettings.teamColorMode == TEAMCOLOR_EMISSIVE) {\n        result = vec4(mix(u_teamColor / 255.0, result.rgb, texel.a), 1);\n    }\n\n    if (layerSettings.invert) {\n        result = vec4(1) - result;\n    }\n    /*\n    if (layerSettings.multColor && false) {\n    result *= layerSettings.multAddAlpha.x;\n    }\n\n    if (layerSettings.addColor && false) {\n    result += layerSettings.multAddAlpha.y;\n    }\n    */\n    if (layerSettings.clampResult) {\n        result = clamp(result, 0.0, 1.0);\n    }\n    /*\n    if (layerSettings.fresnelMode != FRESNELMODE_NONE) {\n    float fresnelTerm = calculateFresnelTerm(v_normal, v_eyeVec, layerSettings.fresnelExponentBiasScale.x, layerSettings.fresnelTransform, layerSettings.fresnelTransformMode, layerSettings.fresnelClamp);\n\n    if (layerSettings.fresnelMode == FRESNELMODE_INVERTED) {\n    fresnelTerm = 1.0 - fresnelTerm;\n    }\n\n    fresnelTerm = clamp(fresnelTerm * layerSettings.fresnelExponentBiasScale.z + layerSettings.fresnelExponentBiasScale.y, 0.0, 1.0);\n\n    result *= fresnelTerm;\n    }\n    */\n    return result;\n}\n\nvec3 decodeNormal(sampler2D map) {\n    vec4 texel = texture2D(map, v_uv[0]);\n    vec3 normal;\n\n    normal.xy = 2.0 * texel.wy - 1.0;\n    normal.z = sqrt(max(0.0, 1.0 - dot(normal.xy, normal.xy)));\n\n    return normal;\n}\n\nvec4 computeSpecular(sampler2D specularMap, LayerSettings layerSettings, float specularity, float specMult, vec3 normal) {\n    vec4 color;\n\n    if (layerSettings.enabled) {\n        color = computeLayerColor(specularMap, layerSettings);\n    } else {\n        color = vec4(0);\n    }\n\n    float factor = pow(max(-dot(v_halfVec, normal), 0.0), specularity) * specMult;\n\n    return color * factor;\n}\n",
	"spsstandard":"uniform float u_specularity;\nuniform float u_specMult;\nuniform float u_emisMult;\nuniform vec4 u_lightAmbient;\n\nuniform LayerSettings u_diffuseLayerSettings;\nuniform sampler2D u_diffuseMap;\nuniform LayerSettings u_decalLayerSettings;\nuniform sampler2D u_decalMap;\nuniform LayerSettings u_specularLayerSettings;\nuniform sampler2D u_specularMap;\nuniform LayerSettings u_glossLayerSettings;\nuniform sampler2D u_glossMap;\nuniform LayerSettings u_emissiveLayerSettings;\nuniform sampler2D u_emissiveMap;\nuniform LayerSettings u_emissive2LayerSettings;\nuniform sampler2D u_emissive2Map;\nuniform LayerSettings u_evioLayerSettings;\nuniform sampler2D u_evioMap;\nuniform LayerSettings u_evioMaskLayerSettings;\nuniform sampler2D u_evioMaskMap;\nuniform LayerSettings u_alphaLayerSettings;\nuniform sampler2D u_alphaMap;\nuniform LayerSettings u_alphaMaskLayerSettings;\nuniform sampler2D u_alphaMaskMap;\nuniform LayerSettings u_normalLayerSettings;\nuniform sampler2D u_normalMap;\nuniform LayerSettings u_heightLayerSettings;\nuniform sampler2D u_heightMap;\nuniform LayerSettings u_lightMapLayerSettings;\nuniform sampler2D u_lightMapMap;\nuniform LayerSettings u_aoLayerSettings;\nuniform sampler2D u_aoMap;\n\nvoid main() {\n    vec3 color;\n    vec4 final = u_lightAmbient;\n    vec3 normal;\n    vec3 lightMapDiffuse;\n\n    if (u_normalLayerSettings.enabled) {\n        normal = decodeNormal(u_normalMap);\n    } else {\n        normal = v_normal;\n    }\n\n    float lambertFactor = max(dot(normal, v_lightDir), 0.0);\n\n    if (lambertFactor > 0.0) {\n        if (u_diffuseLayerSettings.enabled) {\n            vec4 diffuseColor = computeLayerColor(u_diffuseMap, u_diffuseLayerSettings);\n\n            color = combineLayerColor(diffuseColor, color, u_diffuseLayerSettings);\n        }\n\n        if (u_decalLayerSettings.enabled) {\n            vec4 decalColor = computeLayerColor(u_decalMap, u_decalLayerSettings);\n\n            color = combineLayerColor(decalColor, color, u_decalLayerSettings);\n        }\n\n        vec4 specularColor = computeSpecular(u_specularMap, u_specularLayerSettings, u_specularity, u_specMult, normal);\n\n        if (u_lightMapLayerSettings.enabled) {\n            vec4 lightMapColor = computeLayerColor(u_lightMapMap, u_lightMapLayerSettings) * 2.0;\n\n            lightMapDiffuse = lightMapColor.rgb;\n        }\n\n        //final.rgb = color * lightMapDiffuse + specularColor.rgb;\n        final.rgb = (color + specularColor.rgb) * lambertFactor;\n\n        bool addEmissive = false;\n        vec3 emissiveColor;\n        vec4 tempColor;\n\n        if (u_emissiveLayerSettings.enabled) {\n            tempColor = computeLayerColor(u_emissiveMap, u_emissiveLayerSettings);\n\n            if (u_emissiveLayerSettings.op == LAYEROP_MOD || u_emissiveLayerSettings.op == LAYEROP_MOD2X || u_emissiveLayerSettings.op == LAYEROP_LERP) {\n                final.rgb = combineLayerColor(tempColor, final.rgb, u_emissiveLayerSettings);\n            } else {\n                emissiveColor = combineLayerColor(tempColor, emissiveColor, u_emissiveLayerSettings);\n                addEmissive = true;\n            }\n        }\n\n        if (u_emissive2LayerSettings.enabled) {\n            tempColor = computeLayerColor(u_emissive2Map, u_emissive2LayerSettings);\n\n            if (!addEmissive && (u_emissive2LayerSettings.op == LAYEROP_MOD || u_emissive2LayerSettings.op == LAYEROP_MOD2X || u_emissive2LayerSettings.op == LAYEROP_LERP)) {\n                final.rgb = combineLayerColor(tempColor, final.rgb, u_emissive2LayerSettings);\n            } else {\n                emissiveColor = combineLayerColor(tempColor, emissiveColor, u_emissive2LayerSettings);\n                addEmissive = true;\n            }\n        }\n\n        if (addEmissive) {\n            final.rgb += emissiveColor * u_emisMult;\n        }\n    }\n\n    gl_FragColor = final;\n}\n",
	"svswhite":"uniform mat4 u_mvp;\nuniform float u_firstBoneLookupIndex;\n\nattribute vec3 a_position;\nattribute vec4 a_bones;\nattribute vec4 a_weights;\n\nvoid transform(vec3 inposition, vec4 bones, vec4 weights, out vec3 outposition) {\n    vec4 position = vec4(inposition, 1);\n    vec4 temp;\n\n    mat4 weightedBone0 = boneAtIndex(bones[0]) * weights[0];\n    mat4 weightedBone1 = boneAtIndex(bones[1]) * weights[1];\n    mat4 weightedBone2 = boneAtIndex(bones[2]) * weights[2];\n    mat4 weightedBone3 = boneAtIndex(bones[3]) * weights[3];\n\n    temp = vec4(0);\n    temp += weightedBone0 * position;\n    temp += weightedBone1 * position;\n    temp += weightedBone2 * position;\n    temp += weightedBone3 * position;\n    outposition = vec3(temp);\n}\n\nvoid main() {\n    vec3 position;\n\n    transform(a_position, a_bones + u_firstBoneLookupIndex, a_weights / 255.0, position);\n    \n    gl_Position = u_mvp * vec4(position, 1);\n}\n",
	"spsspecialized":"#ifdef DIFFUSE_PASS\nuniform LayerSettings u_diffuseLayerSettings;\nuniform sampler2D u_diffuseMap;\n#endif\n#ifdef UV_PASS\nuniform LayerSettings u_diffuseLayerSettings;\nuniform sampler2D u_diffuseMap;\n#endif\n#ifdef SPECULAR_PASS\nuniform LayerSettings u_specularLayerSettings;\nuniform sampler2D u_specularMap;\nuniform float u_specularity;\nuniform float u_specMult;\n#endif\n#ifdef HIGHRES_NORMALS\nuniform LayerSettings u_normalLayerSettings;\nuniform sampler2D u_normalMap;\n#endif\n#ifdef EMISSIVE_PASS\nuniform LayerSettings u_emissiveLayerSettings;\nuniform sampler2D u_emissiveMap;\nuniform LayerSettings u_emissive2LayerSettings;\nuniform sampler2D u_emissive2Map;\nuniform float u_emisMult;\n#endif\n#ifdef DECAL_PASS\nuniform LayerSettings u_decalLayerSettings;\nuniform sampler2D u_decalMap;\n#endif\n\nvoid main() {\n    vec4 color = vec4(0.0);\n    vec3 normal;\n\n    #ifdef HIGHRES_NORMALS\n    normal = decodeNormal(u_normalMap);\n    #else\n    normal = v_normal;\n    #endif\n\n    #ifdef DIFFUSE_PASS\n    color = computeLayerColor(u_diffuseMap, u_diffuseLayerSettings);\n    #endif\n\n    #ifdef NORMALS_PASS\n    color = vec4(normal, 1);\n    #endif\n\n    #ifdef UV_PASS\n    color = vec4(getUV(u_diffuseLayerSettings), 0, 1);\n    #endif\n\n    #ifdef SPECULAR_PASS\n    color = computeSpecular(u_specularMap, u_specularLayerSettings, u_specularity, u_specMult, normal);\n    #endif\n\n    #ifdef EMISSIVE_PASS\n    bool addEmissive = false;\n    vec3 emissiveColor = vec3(0);\n    vec4 tempColor;\n\n    if (u_emissiveLayerSettings.enabled) {\n        tempColor = computeLayerColor(u_emissiveMap, u_emissiveLayerSettings);\n\n        if (u_emissiveLayerSettings.op == LAYEROP_MOD || u_emissiveLayerSettings.op == LAYEROP_MOD2X || u_emissiveLayerSettings.op == LAYEROP_LERP) {\n            color.rgb = combineLayerColor(tempColor, color.rgb, u_emissiveLayerSettings);\n        } else {\n            emissiveColor = combineLayerColor(tempColor, emissiveColor, u_emissiveLayerSettings);\n            addEmissive = true;\n        }\n    }\n\n    if (u_emissive2LayerSettings.enabled) {\n        tempColor = computeLayerColor(u_emissive2Map, u_emissive2LayerSettings);\n\n        if (!addEmissive && (u_emissive2LayerSettings.op == LAYEROP_MOD || u_emissive2LayerSettings.op == LAYEROP_MOD2X || u_emissive2LayerSettings.op == LAYEROP_LERP)) {\n            color.rgb = combineLayerColor(tempColor, color.rgb, u_emissive2LayerSettings);\n        } else {\n            emissiveColor = combineLayerColor(tempColor, emissiveColor, u_emissive2LayerSettings);\n            addEmissive = true;\n        }\n    }\n\n    if (addEmissive) {\n        color.rgb += emissiveColor.rgb * u_emisMult;\n    }\n    #endif\n\n    #ifdef UNSHADED_PASS\n    float lambertFactor = max(dot(normal, v_lightDir), 0.0);\n\n    color = vec4(lambertFactor, lambertFactor, lambertFactor, 1);\n    #endif\n\n    #ifdef DECAL_PASS\n    if (u_decalLayerSettings.enabled) {\n        vec4 decalColor = computeLayerColor(u_decalMap, u_decalLayerSettings);\n\n        color.rgb = combineLayerColor(decalColor, color.rgb, u_decalLayerSettings);\n        color.a = 1.0;\n    }\n    #endif\n\n    #ifdef WHITE_PASS\n    color = vec4(1.0);\n    #endif\n\n    gl_FragColor = color;\n}\n",
	"svsparticles":"uniform mat4 u_mvp;\n\nattribute vec3 a_position;\n\nvoid main() {\n    gl_Position = u_mvp * vec4(a_position, 1);\n}\n",
	"spsparticles":"void main() {\n    gl_FragColor = vec4(1);\n}\n"
};window["Mdx"] = {};
Mdx.Parser = (function () {
    // Mapping from track tags to their type and default value
    var tagToTrack = {
        // LAYS
        KMTF: [readUint32, [0]],
        KMTA: [readFloat32, [1]],
        // TXAN
        KTAT: [readVector3, [0, 0, 0]],
        KTAR: [readVector4, [0, 0, 0, 1]],
        KTAS: [readVector3, [1, 1, 1]],
        // GEOA
        KGAO: [readFloat32, [1]],
        KGAC: [readVector3, [0, 0, 0]],
        // LITE
        KLAS: [readFloat32, [0]],
        KLAE: [readFloat32, [0]],
        KLAC: [readVector3, [0, 0, 0]],
        KLAI: [readFloat32, [0]],
        KLBI: [readFloat32, [0]],
        KLBC: [readVector3, [0, 0, 0]],
        KLAV: [readFloat32, [1]],
        // ATCH
        KATV: [readFloat32, [1]],
        // PREM
        KPEE: [readFloat32, [0]],
        KPEG: [readFloat32, [0]],
        KPLN: [readFloat32, [0]],
        KPLT: [readFloat32, [0]],
        KPEL: [readFloat32, [0]],
        KPES: [readFloat32, [0]],
        KPEV: [readFloat32, [1]],
        // PRE2
        KP2S: [readFloat32, [0]],
        KP2R: [readFloat32, [0]],
        KP2L: [readFloat32, [0]],
        KP2G: [readFloat32, [0]],
        KP2E: [readFloat32, [0]],
        KP2N: [readFloat32, [0]],
        KP2W: [readFloat32, [0]],
        KP2V: [readFloat32, [1]],
        // RIBB
        KRHA: [readFloat32, [0]],
        KRHB: [readFloat32, [0]],
        KRAL: [readFloat32, [1]],
        KRCO: [readVector3, [0, 0, 0]],
        KRTX: [readUint32, [0]],
        KRVS: [readFloat32, [1]],
        // CAMS
        KCTR: [readVector3, [0, 0, 0]],
        KTTR: [readVector3, [0, 0, 0]],
        KCRL: [readUint32, [0]],
        // NODE
        KGTR: [readVector3, [0, 0, 0]],
        KGRT: [readVector4, [0, 0, 0, 1]],
        KGSC: [readVector3, [1, 1, 1]]
    };

    // Read elements with unknown sizes
    function readUnknownElements(reader, size, Func, nodes) {
        var totalSize = 0,
            elements = [],
            element;
        
        while (totalSize !== size) {
            element = new Func(reader, nodes, elements.length);

            totalSize += element.size;

            elements.push(element);
        }

        return elements;
    }

    // Read elements with known sizes
    function readKnownElements(reader, count, Func) {
        var elements = [];

        for (var i = 0; i < count; i++) {
            elements[i] = new Func(reader, i);
        }

        return elements;
    }

    // Read a node, and also push it to the nodes array
    function readNode(reader, nodes) {
        var node = new Node(reader, nodes.length);

        nodes.push(node);

        return node;
    }

    function Extent(reader) {
        this.radius = readFloat32(reader);
        this.min = readVector3(reader);
        this.max = readVector3(reader);
    }

    function SDTrack(reader, interpolationType, Func) {
        this.frame = readInt32(reader);
        this.data = Func(reader);

        if (interpolationType > 1) {
            this.inTan = Func(reader);
            this.outTan = Func(reader);
        }
    }

    function SD(reader) {
        this.tag = read(reader, 4);

        var tracks = readUint32(reader);

        this.interpolationType = readUint32(reader);
        this.globalSequenceId = readInt32(reader);
        this.tracks = [];

        var sdTrackInfo = tagToTrack[this.tag];

        for (var i = 0; i < tracks; i++) {
            this.tracks[i] = new SDTrack(reader, this.interpolationType, sdTrackInfo[0])
        }

        this.defval = sdTrackInfo[1];

        var elementsPerTrack = 1 + this.defval.length * (this.interpolationType > 1 ? 3 : 1);

        this.size = 16 + tracks * elementsPerTrack * 4;
    }

    function SDContainer(reader, size) {
        this.sd = {};

        var sd = readUnknownElements(reader, size, SD);

        for (var i = 0, l = sd.length; i < l; i++) {
            this.sd[sd[i].tag] = sd[i];
        }
    }

    function Node(reader, index) {
        this.index = index;
        this.size = readUint32(reader);
        this.name = read(reader, 80);
        this.objectId = readUint32(reader);
        this.parentId = readInt32(reader);
        this.flags = readUint32(reader);
        this.tracks = new SDContainer(reader, this.size - 96);

        var flags = this.flags;

        this.dontInheritTranslation = flags & 1;
        this.dontInheritRotation = flags & 2;
        this.dontInheritScaling = flags & 4;
        this.billboarded = flags & 8;
        this.billboardedX = flags & 16;
        this.billboardedY = flags & 32;
        this.billboardedZ = flags & 64;
        this.cameraAnchored = flags & 128;
        this.bone = flags & 256;
        this.light = flags & 512;
        this.eventObject = flags & 1024;
        this.attachment = flags & 2048;
        this.particleEmitter = flags & 4096;
        this.collisionShape = flags & 8192;
        this.ribbonEmitter = flags & 16384;
        this.emitterUsesMdlOrUnshaded = flags & 32768;
        this.emitterUsesTgaOrSortPrimitivesFarZ = flags & 65536;
        this.lineEmitter = flags & 131072;
        this.unfogged = flags & 262144;
        this.modelSpace = flags & 524288;
        this.xYQuad = flags & 1048576;
    }

    function VersionChunk(reader, tag, size, nodes) {
        this.version = readUint32(reader);
    }

    function ModelChunk(reader, tag, size, nodes) {
        this.name = read(reader, 80);
        this.animationPath = read(reader, 260);
        this.extent = new Extent(reader);
        this.blendTime = readUint32(reader);
    }

    function Sequence(reader, index) {
        this.index = index;
        this.name = read(reader, 80);
        this.interval = readUint32Array(reader, 2);
        this.moveSpeed = readFloat32(reader);
        this.flags = readUint32(reader);
        this.rarity = readFloat32(reader);
        this.syncPoint = readUint32(reader);
        this.extent = new Extent(reader);
    }

    function GlobalSequence(reader, index) {
        this.index = index;
        this.data = readUint32(reader);
    }

    function Texture(reader, index) {
        this.index = index;
        this.replaceableId = readUint32(reader);
        this.path = read(reader, 260);
        this.flags = readUint32(reader);
    }
    /*
    // Note: this chunk was reverse engineered from the game executable itself, but was never seen in any resource
    function SoundTrack(reader, index) {
        this.index = index;
        this.path = read(reader, 260);
        this.volume = readFloat32(reader);
        this.pitch = readFloat32(reader);
        this.flags = readUint32(reader);
    }
    */
    function Layer(reader, index) {
        this.index = index;
        this.size = readUint32(reader);
        this.filterMode = readUint32(reader);
        this.flags = readUint32(reader);
        this.textureId = readUint32(reader);
        this.textureAnimationId = readInt32(reader);
        this.coordId = readUint32(reader);
        this.alpha = readFloat32(reader);
        this.tracks = new SDContainer(reader, this.size - 28);

        var flags = this.flags;

        this.unshaded = flags & 1;
        this.sphereEnvironmentMap = flags & 2;
        this.twoSided = flags & 16;
        this.unfogged = flags & 32;
        this.noDepthTest = flags & 64;
        this.noDepthSet = flags & 128;
    }

    function Material(reader, nodes, index) {
        this.index = index;
        this.size = readUint32(reader);
        this.priorityPlane = readUint32(reader);
        this.flags = readUint32(reader);
        skip(reader, 4); // LAYS
        this.layers = readKnownElements(reader, readUint32(reader), Layer);
    }

    function TextureAnimation(reader, nodes, index) {
        this.index = index;
        this.size = readUint32(reader);
        this.tracks = new SDContainer(reader, this.size - 4);
    }

    function Geoset(reader, nodes, index) {
        this.index = index;
        this.size = readUint32(reader);

        skip(reader, 4); // VRTX
        this.vertices = readFloat32Array(reader, readUint32(reader) * 3);

        skip(reader, 4); // NRMS
        this.normals = readFloat32Array(reader, readUint32(reader) * 3);

        skip(reader, 4); // PTYP
        this.faceTypeGroups = readUint32Array(reader, readUint32(reader));

        skip(reader, 4); // PCNT
        this.faceGroups = readUint32Array(reader, readUint32(reader));

        skip(reader, 4); // PVTX
        this.faces = readUint16Array(reader, readUint32(reader));

        skip(reader, 4); // GNDX
        this.vertexGroups = readUint8Array(reader, readUint32(reader));

        skip(reader, 4); // MTGC
        this.matrixGroups = readUint32Array(reader, readUint32(reader));

        skip(reader, 4); // MATS
        this.matrixIndexes = readUint32Array(reader, readUint32(reader));

        this.materialId = readUint32(reader);
        this.selectionGroup = readUint32(reader);
        this.selectionFlags = readUint32(reader);
        this.extent =  new Extent(reader);
        this.extents = readKnownElements(reader, readUint32(reader), Extent);

        skip(reader, 4); // UVAS

        this.textureCoordinateSets = [];

        for (var i = 0, l = readUint32(reader); i < l; i++) {
            skip(reader, 4); // UVBS
            this.textureCoordinateSets[i] = readFloat32Array(reader, readUint32(reader) * 2);
        }
    }

    function GeosetAnimation(reader, nodes, index) {
        this.index = index;
        this.size = readUint32(reader);
        this.alpha = readFloat32(reader);
        this.flags = readUint32(reader);
        this.color = readVector3(reader);
        this.geosetId = readUint32(reader);
        this.tracks = new SDContainer(reader, this.size - 28);
    }

    function Bone(reader, nodes, index) {
        this.node = readNode(reader, nodes);
        this.geosetId = readUint32(reader);
        this.geosetAnimationId = readUint32(reader);
        this.size = this.node.size + 8;
    }

    function Light(reader, nodes, index) {
        this.index = index;
        this.size = readUint32(reader);
        this.node = readNode(reader, nodes);
        this.type = readUint32(reader);
        this.attenuation = readUint32Array(reader, 2);
        this.color = readVector3(reader);
        this.intensity = readFloat32(reader);
        this.ambientColor = readVector3(reader);
        this.ambientIntensity = readFloat32(reader);
        this.tracks = new SDContainer(reader, this.size - this.node.size - 48);
    }

    function Helper(reader, nodes, index) {
        this.index = index;
        this.node = readNode(reader, nodes);
        this.size = this.node.size;
    }

    function Attachment(reader, nodes, index) {
        this.index = index;
        this.size = readUint32(reader);
        this.node = readNode(reader, nodes);
        this.path = read(reader, 260);
        this.attachmentId = readUint32(reader);
        this.tracks = new SDContainer(reader, this.size - this.node.size - 268);
    }

    function PivotPoint(reader, index) {
        this.index = index;
        this.data = readFloat32Array(reader, 3);
    }

    function ParticleEmitter(reader, nodes, index) {
        this.index = index;
        this.size = readUint32(reader);
        this.node = readNode(reader, nodes);
        this.emissionRate = readFloat32(reader);
        this.gravity = readFloat32(reader);
        this.longitude = readFloat32(reader);
        this.latitude = readFloat32(reader);
        this.path = read(reader, 260);
        this.lifespan = readFloat32(reader);
        this.speed = readFloat32(reader);
        this.tracks = new SDContainer(reader, this.size - this.node.size - 288);
    }

    function ParticleEmitter2(reader, nodes, index) {
        this.index = index;
        this.size = readUint32(reader);
        this.node = readNode(reader, nodes);
        this.speed = readFloat32(reader);
        this.variation = readFloat32(reader);
        this.latitude = readFloat32(reader);
        this.gravity = readFloat32(reader);
        this.lifespan = readFloat32(reader);
        this.emissionRate = readFloat32(reader);
        this.width = readFloat32(reader);
        this.length = readFloat32(reader);
        this.filterMode = readUint32(reader);
        this.rows = readUint32(reader);
        this.columns = readUint32(reader);
        this.headOrTail = readUint32(reader);
        this.tailLength = readFloat32(reader);
        this.timeMiddle = readFloat32(reader);
        this.segmentColor = readFloat32Matrix(reader, 3, 3);
        this.segmentAlpha = readUint8Array(reader, 3);
        this.segmentScaling = readFloat32Array(reader, 3);
        this.headInterval = readUint32Array(reader, 3);
        this.headDecayInterval = readUint32Array(reader, 3);
        this.tailInterval = readUint32Array(reader, 3);
        this.tailDecayInterval = readUint32Array(reader, 3);
        this.textureId = readUint32(reader);
        this.squirt = readUint32(reader);
        this.priorityPlane = readUint32(reader);
        this.replaceableId = readUint32(reader);
        this.tracks = new SDContainer(reader, this.size - this.node.size - 175);
    }

    function RibbonEmitter(reader, nodes, index) {
        this.index = index;
        this.size = readUint32(reader);
        this.node = readNode(reader, nodes);
        this.heightAbove = readFloat32(reader);
        this.heightBelow = readFloat32(reader);
        this.alpha = readFloat32(reader);
        this.color = readVector3(reader);
        this.lifespan = readFloat32(reader);
        this.textureSlot = readUint32(reader);
        this.emissionRate = readUint32(reader);
        this.rows = readUint32(reader);
        this.columns = readUint32(reader);
        this.materialId = readUint32(reader);
        this.gravity = readFloat32(reader);
        this.tracks = new SDContainer(reader, this.size - this.node.size - 56);
    }

    function EventObject(reader, nodes, index) {
        this.index = index;
        this.node = readNode(reader, nodes);
        
        skip(reader, 4); // KEVT
        
        var count = readUint32(reader);

        this.globalSequenceId = readInt32(reader);
        this.tracks = readUint32Array(reader, count);
        this.size = this.node.size + 12 + count * 4;
    }

    function Camera(reader, nodes, index) {
        this.index = index;
        this.size = readUint32(reader);
        this.name = read(reader, 80);
        this.position = readVector3(reader);
        this.fov = readFloat32(reader);
        this.farClippingPlane = readFloat32(reader);
        this.nearClippingPlane = readFloat32(reader);
        this.targetPosition = readVector3(reader);
        this.tracks = new SDContainer(reader, this.size - 120);
    }
    
    function CollisionShape(reader, nodes, index) {
        this.index = index;
        this.node = readNode(reader, nodes);
        this.type = readUint32(reader);

        var type = this.type,
            size = this.node.size + 4;
        
        if (type === 0 || type === 1 || type === 3) {
            this.vertices = readFloat32Array(reader, 6);
            size += 24;
        } else if (type === 2) {
            this.vertices = readVector3(reader);
            size += 12;
        }

        if (type === 2 || type === 3) {
            this.radius = readFloat32(reader);
            size += 4;
        }

        this.size = size;
    }

    // Chunks that have elements with known sizes
    var tagToKnownChunk = {
        SEQS: [Sequence, 132],
        GLBS: [GlobalSequence, 4],
        TEXS: [Texture, 268],
        PIVT: [PivotPoint, 12]
    };

    // Chunks that have elements with unknown sizes
    var tagToUnknownChunk = {
        MTLS: Material,
        TXAN: TextureAnimation,
        GEOS: Geoset,
        GEOA: GeosetAnimation,
        BONE: Bone,
        LITE: Light,
        HELP: Helper,
        ATCH: Attachment,
        PREM: ParticleEmitter,
        PRE2: ParticleEmitter2,
        RIBB: RibbonEmitter,
        EVTS: EventObject,
        CAMS: Camera,
        CLID: CollisionShape
    };

    function GenericKnownChunk(reader, tag, size, nodes) {
        var tagInfo = tagToKnownChunk[tag];

        this.elements = readKnownElements(reader, size / tagInfo[1], tagInfo[0]);

    }

    function GenericUnknownChunk(reader, tag, size, nodes) {
        var tagInfo = tagToUnknownChunk[tag];

        this.elements = readUnknownElements(reader, size, tagInfo, nodes);
    }
    
    var tagToFunc = {
        VERS: VersionChunk,
        MODL: ModelChunk,
        SEQS: GenericKnownChunk,
        GLBS: GenericKnownChunk,
        TEXS: GenericKnownChunk,
        //SNDS: GenericKnownChunk,
        MTLS: GenericUnknownChunk,
        TXAN: GenericUnknownChunk,
        GEOS: GenericUnknownChunk,
        GEOA: GenericUnknownChunk,
        BONE: GenericUnknownChunk,
        LITE: GenericUnknownChunk,
        HELP: GenericUnknownChunk,
        ATCH: GenericUnknownChunk,
        PIVT: GenericKnownChunk,
        PREM: GenericUnknownChunk,
        PRE2: GenericUnknownChunk,
        RIBB: GenericUnknownChunk,
        EVTS: GenericUnknownChunk,
        CAMS: GenericUnknownChunk,
        CLID: GenericUnknownChunk
    };

    function Parser(reader) {
        var tag,
            size,
            Func,
            chunks = {},
            nodes = [];

        while (remaining(reader) > 0) {
            tag = read(reader, 4);
            size = readUint32(reader);
            Func = tagToFunc[tag];

            if (Func) {
                chunks[tag] = new Func(reader, tag, size, nodes);
            } else {
                //console.log("Didn't parse chunk " + tag);
                skip(reader, size);
            }
        }

        this.chunks = chunks;
        this.nodes = nodes;
    }

    return (function (reader) {
        if (read(reader, 4) === "MDLX") {
            return new Parser(reader);
        }
    });
}());
Mdx.SD = function (tracks, model) {
    var i, l, arr, keys;
    
    this.defval = tracks.defval;
    this.interpolationType = tracks.interpolationType;
    this.globalSequenceId = tracks.globalSequenceId;
    this.globalSequences = model.globalSequences;
    this.sequences = model.sequences;
    
    arr = tracks.tracks;
    l = arr.length;

    keys = [];
    keys.length = l;


    for (i = 0; i < l; i++) {
        keys[i] = arr[i].frame;
    }

    this.tracks = arr;
    this.keys = keys;

    // Avoid heap allocations in getInterval()
    this.interval = [0, 0];
    
    this.tempVector = new Float32Array(this.defval.length);

    this.fillSequences();
};

Mdx.SD.prototype = {
    insertFrame: function (frame, frame0) {
        var defval = this.defval,
            tracks = this.tracks,
            keys = this.keys,
            l = keys.length,
            key;
        
        for (var i = 0; i < l; i++) {
            key = keys[i];
            
            if (key === frame) {
                return;
            }
            
            if (key > frame) {
                keys.splice(i, 0, frame);
                tracks.splice(i, 0, {frame: frame, data: frame0, inTan: frame0, outTan: frame0});
                return;
            }
        }
        
        keys.splice(l, 0, frame);
        tracks.splice(l, 0, { frame: frame, data: frame0, inTan: frame0, outTan: frame0 });
    },
    
    calculateFirstSeqFrame: function (firstFrames, interval) {
        var keys = this.keys;
        var tracks = this.tracks;
        
        if (tracks[0].frame === 0) {
            firstFrames.push(tracks[0].data);
            return;
        }
        
        for (var i = 0, l = keys.length; i < l; i++) {
            if (keys[i] >= interval[0] && keys[i] <= interval[1]) {
                firstFrames.push(tracks[i].data);
                return;
            }
        }
        
        firstFrames.push(this.defval);
    },
    
    calculateFirstFrames: function () {
        var sequences = this.sequences;
        var interval;
        var firstFrames = [];
        
        for (var i = 0, l = sequences.length; i < l; i++) {
            interval = sequences[i].interval;
            
            this.calculateFirstSeqFrame(firstFrames, interval);
        }
        
        return firstFrames;
    },
    
    fillSequences: function () {
        var sequences = this.sequences;
        var interval;
        var firstFrames = this.calculateFirstFrames();
        
        for (var i = 0, l = sequences.length; i < l; i++) {
            interval = sequences[i].interval;
            
            this.insertFrame(interval[0], firstFrames[i]);
            this.insertFrame(interval[1], firstFrames[i]);
        }
    },
    
    getInterval: function (frame, start, end, interval) {
        //~ var keys = this.keys;
        //~ var length = keys.length;
        //~ var a = length;
        //~ var b = 0;

        //~ while (b !== length && frame > keys[b]) {
            //~ a = b;
            //~ b++;
        //~ }

        //~ if ((a !== length) && (keys[a] < start)) {
            //~ a = length;
        //~ }

        //~ if ((b !== length) && (keys[b] > end)) {
            //~ b = length;
        //~ }

        //~ interval[0] = a;
        //~ interval[1] = b;
        
        var keys = this.keys;
        var i;
        var l = keys.length;
        
        if (frame < start) {
            for (i = 0; i < l; i++) {
                if (keys[i] === start) {
                    interval[0] = i;
                    interval[1] = i;
                    return;
                }
            }
        }
        
        if (frame > end) {
             for (i = 0; i < l; i++) {
                if (keys[i] === end) {
                    interval[0] = i;
                    interval[1] = i;
                    return;
                }
            }
        }
        
        for (i = 0; i < l; i++) {
            if (keys[i] > frame) {
                interval[0] = i - 1;
                interval[1] = i;
                return;
            }
        }
    },

    getValueAtTime: function (frame, start, end) {
        var interval = this.interval;

        this.getInterval(frame, start, end, interval);
        
        if (interval[0] === -1) {
            interval[0] = 0;
        }
        
        if (interval[1] === -1) {
            interval[1] = 0;
        }
        
        //~ var tracks = this.tracks;
        //~ var length = tracks.length;
        //~ var a = interval[0];
        //~ var b = interval[1];

        //~ if (a === length) {
            //~ return this.defval;
        //~ }
        
        //~ if (b === length) {
            //~ return tracks[a].vector;
        //~ }

        //~ a = tracks[a];
        //~ b = tracks[b];

        //~ if (a.frame >= b.frame) {
            //~ return a.vector;
        //~ }
        
        var tracks = this.tracks;
        var a = tracks[interval[0]];
        var b = tracks[interval[1]];
        var t;
        
        if (b.frame - a.frame > 0) {
            t = Math.clamp((frame - a.frame) / (b.frame - a.frame), 0, 1);
        } else {
            t = 0;
        }
        
        return interpolator(this.tempVector, a.data, a.outTan, b.inTan, b.data, t, this.interpolationType);
    },

    getDefval: function () {
        var tempVector = this.tempVector,
            defval = this.defval,
            length = defval.length;

        if (length === 1) {
            return defval[0];
        } else if (length === 3) {
            vec3.copy(tempVector, defval);
        } else if (length === 4) {
            vec4.copy(tempVector, defval);
        }

        return tempVector;
    },

    // The frame argument is the current animation frame
    // The counter argument is a counter that always goes up to infinity, and is used for global sequences
    getValue: function (sequence, frame, counter) {
        if (this.globalSequenceId !== -1 && this.globalSequences) {
            var duration = this.globalSequences[this.globalSequenceId].data;

            return this.getValueAtTime(counter % duration , 0, duration);
        } else if (sequence !== -1) {
            var interval = this.sequences[sequence].interval;
            return this.getValueAtTime(frame, interval[0], interval[1]);
        } else {
            return this.getDefval();
        }
    }
};

Mdx.SDContainer = function (container, model) {
    var tracks = container.sd;
    var keys = Object.keys(tracks || {});
    var sd = {};
    var type;

    for (var i = 0, l = keys.length; i < l; i++) {
        type = keys[i];

        sd[type] = new Mdx.SD(tracks[type], model);
    }

    this.sd = sd;
};

Mdx.SDContainer.prototype = {
    getValue: function (sd, sequence, frame, counter, defval) {
        if (sd) {
            return sd.getValue(sequence, frame, counter);
        }

        return defval;
    },

    getKMTF: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KMTF, sequence, frame, counter, defval);
    },

    getKMTA: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KMTA, sequence, frame, counter, defval);
    },

    getKTAT: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KTAT, sequence, frame, counter, defval);
    },

    getKTAR: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KTAR, sequence, frame, counter, defval);
    },

    getKTAS: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KTAS, sequence, frame, counter, defval);
    },

    getKGAO: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KGAO, sequence, frame, counter, defval);
    },

    getKGAC: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KGAC, sequence, frame, counter, defval);
    },

    getKLAS: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KLAS, sequence, frame, counter, defval);
    },

    getKLAE: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KLAE, sequence, frame, counter, defval);
    },

    getKLAC: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KLAC, sequence, frame, counter, defval);
    },

    getKLAI: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KLAI, sequence, frame, counter, defval);
    },

    getKLBI: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KLBI, sequence, frame, counter, defval);
    },

    getKLBC: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KLBC, sequence, frame, counter, defval);
    },

    getKLAV: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KLAV, sequence, frame, counter, defval);
    },

    getKATV: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KATV, sequence, frame, counter, defval);
    },

    getKPEE: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KPEE, sequence, frame, counter, defval);
    },

    getKPEG: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KPEG, sequence, frame, counter, defval);
    },

    getKPLN: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KPLN, sequence, frame, counter, defval);
    },

    getKPLT: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KPLT, sequence, frame, counter, defval);
    },

    getKPEL: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KPEL, sequence, frame, counter, defval);
    },

    getKPES: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KPES, sequence, frame, counter, defval);
    },

    getKPEV: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KPEV, sequence, frame, counter, defval);
    },

    getKP2S: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KP2S, sequence, frame, counter, defval);
    },

    getKP2R: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KP2R, sequence, frame, counter, defval);
    },

    getKP2L: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KP2L, sequence, frame, counter, defval);
    },

    getKP2G: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KP2G, sequence, frame, counter, defval);
    },

    getKP2E: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KP2E, sequence, frame, counter, defval);
    },

    getKP2N: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KP2N, sequence, frame, counter, defval);
    },

    getKP2W: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KP2W, sequence, frame, counter, defval);
    },

    getKP2V: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KP2V, sequence, frame, counter, defval);
    },

    getKRHA: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KRHA, sequence, frame, counter, defval);
    },

    getKRHB: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KRHB, sequence, frame, counter, defval);
    },

    getKRAL: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KRAL, sequence, frame, counter, defval);
    },

    getKRCO: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KRCO, sequence, frame, counter, defval);
    },

    getKRTX: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KRTX, sequence, frame, counter, defval);
    },

    getKRVS: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KRVS, sequence, frame, counter, defval);
    },

    getKCTR: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KCTR, sequence, frame, counter, defval);
    },

    getKTTR: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KTTR, sequence, frame, counter, defval);
    },

    getKCRL: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KCRL, sequence, frame, counter, defval);
    },

    getKGTR: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KGTR, sequence, frame, counter, defval);
    },

    getKGRT: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KGRT, sequence, frame, counter, defval);
    },

    getKGSC: function (sequence, frame, counter, defval) {
        return this.getValue(this.sd.KGSC, sequence, frame, counter, defval);
    }
};
Mdx.Skeleton = function (model, ctx) {
    var nodes = model.nodes,
        bones = model.bones;

    // This list is used to access all the nodes in a loop while keeping the hierarchy in mind.
    this.hierarchy = this.setupHierarchy([], nodes, -1);

    BaseSkeleton.call(this, bones.length + 1, ctx);

    // Shallow nodes referencing the actual nodes in the model
    for (var i = 0, l = nodes.length; i < l; i++) {
        this.nodes[i] = new Mdx.ShallowNode(nodes[i]);
    }

    // The sorted version of the nodes, for straight iteration in update()
    this.sortedNodes = [];
    for (i = 0, l = nodes.length; i < l; i++) {
        this.sortedNodes[i] = this.nodes[this.hierarchy[i]];
    }

    // The sorted version of the bone references in the model, for straight iteration in updateHW()
    this.sortedBones = [];
    for (i = 0, l = bones.length; i < l; i++) {
        this.sortedBones[i] = this.nodes[bones[i].node.index];
    }

    // To avoid heap allocations
    this.rotationQuat = quat.create();
    this.rotationQuat2 = quat.create();
};

Mdx.Skeleton.prototype = extend(BaseSkeleton.prototype, {
    setupHierarchy: function (hierarchy, nodes, parent) {
        var node;

        for (var i = 0, l = nodes.length; i < l; i++) {
            node = nodes[i];

            if (node.parentId === parent) {
                hierarchy.push(i);

                this.setupHierarchy(hierarchy, nodes, node.objectId);
            }
        }

        return hierarchy;
    },

    update: function (sequence, frame, counter, instance, context) {
        var nodes = this.sortedNodes;
        var hierarchy = this.hierarchy;

        this.rootNode.setFromParent(instance);

        for (var i = 0, l = hierarchy.length; i < l; i++) {
            this.updateNode(nodes[i], sequence, frame, counter, context);
        }

        this.updateHW(context.gl.ctx);
    },

    updateNode: function (node, sequence, frame, counter, context) {
        var parent = this.getNode(node.parentId);
        var nodeImpl = node.nodeImpl;
        var translation = nodeImpl.getTranslation(sequence, frame, counter);
        var rotation = nodeImpl.getRotation(sequence, frame, counter);
        var scale = nodeImpl.getScale(sequence, frame, counter);
        var finalRotation = this.rotationQuat;
        
        if (nodeImpl.billboarded) {
            quat.set(finalRotation, 0, 0, 0, 1);
            quat.mul(finalRotation, finalRotation, quat.conjugate(this.rotationQuat2, parent.worldRotation));
            quat.rotateZ(finalRotation, finalRotation, -context.camera.phi - Math.PI / 2);
            quat.rotateY(finalRotation, finalRotation, -context.camera.theta - Math.PI / 2);
        } else {
            quat.copy(finalRotation, rotation);
        }
        
        node.update(parent, finalRotation, translation, scale);
    },

    updateHW: function (ctx) {
        var sortedBones = this.sortedBones,
            hwbones = this.hwbones;

        for (var i = 0, l = sortedBones.length; i < l; i++) {
            hwbones.set(sortedBones[i].worldMatrix, i * 16 + 16);
        }

        this.updateBoneTexture(ctx);
    }
});
Mdx.CollisionShape = function (collisionshape, model, gl) {
    this.node = collisionshape.node;

    var v = collisionshape.vertices;
    var radius = collisionshape.radius;
    var shape;

    if (collisionshape.type === 0) {
        shape = gl.createCube(v[0], v[1], v[2], v[0], v[1], v[2]);
        //} else if (collisionshape.type === 1) {
        //shape = gl.newPlane(v1[0], v1[1], v1[2], v2[0], v2[1], v2[2]);
    } else if (collisionshape.type === 2) {
        shape = gl.createSphere(v[0], v[1], v[2], 9, 9, radius);
        //} else {
        //shape = gl.newCylinder(v1[0], v1[1], v1[2], v2[0], v2[1], v2[2], 8, 2, boundsRadius);
    }

    this.shape = shape;
};

Mdx.CollisionShape.prototype = {
    render: function (skeleton, shader, gl) {
        var ctx = gl.ctx;

        if (this.shape) {
            gl.pushMatrix();

            gl.multMat(skeleton.nodes[this.node].worldMatrix);

            ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());

            this.shape.renderLines(shader);

            gl.popMatrix();
        }
    }
};
Mdx.Camera = function (camera, model) {
    this.name = camera.name;
    this.position = camera.position;
    this.fov = camera.fieldOfView;
    this.farClippingPlane = camera.farClippingPlane;
    this.nearClippingPlane = camera.nearClippingPlane;
    this.targetPosition = camera.targetPosition;
    this.sd = new Mdx.SDContainer(camera.tracks, model);
};

Mdx.Camera.prototype = {
    getPositionTranslation: function (sequence, frame, counter) {
        return this.sd.getKCTR(sequence, frame, counter, this.position);
    },

    getTargetTranslation: function (sequence, frame, counter) {
        return this.sd.getKTTR(sequence, frame, counter, this.targetPosition);
    },

    getRotation: function (sequence, frame, counter) {
        return this.sd.getKCRL(sequence, frame, counter, 0);
    }
};
Mdx.Model = function (arrayBuffer, customPaths, context, onerror) {
    BaseModel.call(this, {});

    var parser = Mdx.Parser(new BinaryReader(arrayBuffer));

    if (parser) {
        this.setup(parser, customPaths, context);
    }
};

Mdx.Model.prototype = extend(BaseModel.prototype, {
    setup: function (parser, customPaths, context) {
        var gl = context.gl;
        var objects, i, l, j, k;
        var chunks = parser.chunks;

        this.parser = parser;
        this.name = chunks.MODL.name;
        this.sequences = [];
        this.textures = [];
        this.meshes = [];
        this.cameras = [];
        this.particleEmitters = [];
        this.particleEmitters2 = [];
        this.ribbonEmitters = [];
        this.boundingShapes = [];
        this.attachments = [];

        if (chunks.TEXS) {
            objects = chunks.TEXS.elements;

            for (i = 0, l = objects.length; i < l; i++) {
                this.loadTexture(objects[i], gl, customPaths);
            }
        }

        if (chunks.SEQS) {
            this.sequences = chunks.SEQS.elements;
        }

        if (chunks.GLBS) {
            this.globalSequences = chunks.GLBS.elements;
        }

        var nodes = parser.nodes;
        var pivots;

        if (chunks.PIVT) {
            pivots = chunks.PIVT.elements;
        } else {
            pivots = [[0, 0, 0]];
        }

        this.nodes = [];

        for (i = 0, l = nodes.length; i < l; i++) {
            this.nodes[i] = new Mdx.Node(nodes[i], this, pivots);
        }

        if (this.nodes.length === 0) {
            this.nodes[0] = new Mdx.Node({ objectId: 0, parentId: 0xFFFFFFFF }, this, pivots);
        }

        if (chunks.BONE) {
            this.bones = chunks.BONE.elements;
        } else {
            // If there are no bones, reference the injected root node, since the shader requires at least one bone
            this.bones = [{ node: { objectId: 0, index: 0 } }];
        }

        var materials;
        var fakeMaterials;
        var layers;
        var layer;
        var geosets;
        var geoset;
        var groups;
        var mesh;

        if (chunks.MTLS) {
            objects = chunks.MTLS.elements;
            materials = [];

            this.layers = [];

            for (i = 0, l = objects.length; i < l; i++) {
                layers = objects[i].layers;

                materials[i] = [];

                for (j = 0, k = layers.length; j < k; j++) {
                    layer = new Mdx.Layer(layers[j], this);

                    materials[i][j] = layer;
                    this.layers.push(layer);
                }
            }

            this.materials = materials;
        }

        if (chunks.GEOS) {
            geosets = chunks.GEOS.elements;
            groups = [[], [], [], []];

            for (i = 0, l = geosets.length; i < l; i++) {
                geoset = geosets[i];
                layers = materials[geoset.materialId];

                mesh = new Mdx.Geoset(geoset, i, gl.ctx);

                this.meshes.push(mesh);

                for (j = 0, k = layers.length; j < k; j++) {
                    layer = layers[j];

                    groups[layer.renderOrder].push(new Mdx.ShallowLayer(layer, mesh));
                }
            }

            // This is an array of geoset + shallow layer batches
            this.batches = groups[0].concat(groups[1]).concat(groups[2]).concat(groups[3]);

            this.calculateExtent();
        }

        this.cameras = this.transformElements(chunks.CAMS, Mdx.Camera);
        this.geosetAnimations = this.transformElements(chunks.GEOA, Mdx.GeosetAnimation);
        this.textureAnimations = this.transformElements(chunks.TXAN, Mdx.TextureAnimation);

        if (chunks.PREM) {
            this.particleEmitters = chunks.PREM.elements;
        }

        if (chunks.PRE2) {
            this.particleEmitters2 = chunks.PRE2.elements;
        }

        if (chunks.RIBB) {
            this.ribbonEmitters = chunks.RIBB.elements;
        }

        this.boundingShapes = this.transformElements(chunks.CLID, Mdx.CollisionShape, gl);
        this.attachments = this.transformElements(chunks.ATCH, Mdx.Attachment);

        if (chunks.EVTS) {
            this.eventObjects = chunks.EVTS.elements;
        }

        // Avoid heap allocations in render()
        this.modifier = vec4.create();
        this.uvoffset = vec3.create();

        this.ready = true;

        this.setupShaders(chunks, gl);
        this.setupTeamColors(gl, customPaths);
    },

    transformElements: function (chunk, Func, gl) {
        var output = [];

        if (chunk) {
            var elements = chunk.elements;
            

            for (var i = 0, l = elements.length; i < l; i++) {
                output[i] = new Func(elements[i], this, gl);
            }
        }

        return output;
    },

    setupShaders: function (chunks, gl) {
        var psmain = SHADERS["wpsmain"];

        if ((chunks.GEOS || chunks.PREM) && !gl.shaderStatus("wstandard")) {
            gl.createShader("wstandard", SHADERS.vsbonetexture + SHADERS.wvsmain, psmain, ["STANDARD_PASS"]);
            gl.createShader("wuvs", SHADERS.vsbonetexture + SHADERS.wvsmain, psmain, ["UVS_PASS"]);
            gl.createShader("wnormals", SHADERS.vsbonetexture + SHADERS.wvsmain, psmain, ["NORMALS_PASS"]);
            gl.createShader("wwhite", SHADERS.vsbonetexture + SHADERS.wvswhite, SHADERS.pswhite);
        }

        // Load the particle emitters type 2 shader if it is needed
        if (chunks.PRE2 && !gl.shaderStatus("wparticles")) {
            gl.createShader("wparticles", SHADERS.decodefloat + SHADERS.wvsparticles, SHADERS.wpsparticles);
        }

        // Load the ribbon emitters shader if it is needed
        if (chunks.RIBB && !gl.shaderStatus("wribbons")) {
            gl.createShader("wribbons", SHADERS.wvsribbons, psmain, ["STANDARD_PASS"]);
        }

        // Load the color shader if it is needed
        if (!gl.shaderStatus("wcolor")) {
            gl.createShader("wcolor", SHADERS.vsbonetexture + SHADERS.wvscolor, SHADERS.pscolor);
        }
    },

    setupTeamColors: function (gl, customPaths) {
        var i,
            number;

        for (i = 0; i < 13; i++) {
            number = ((i < 10) ? "0" + i : i);

            gl.loadTexture(customPaths("replaceabletextures/teamcolor/teamcolor" + number + ".blp"), ".blp");
            gl.loadTexture(customPaths("replaceabletextures/teamglow/teamglow" + number + ".blp"), ".blp");
        }
    },

    loadTexture: function (texture, gl, customPaths) {
        var path = texture.path;
        var replaceableId = texture.replaceableId;

        if (replaceableId !== 0) {
            path = "replaceabletextures/" + Mdx.replaceableIdToName[replaceableId] + ".blp";
        }

        var realPath = customPaths(path);

        this.textures.push(path);
        this.textureMap[path] = realPath;

        var fileType = fileTypeFromPath(path);

        gl.loadTexture(realPath, fileType);
    },

    calculateExtent: function () {
        var meshes = this.meshes;
        var mesh;
        var min, max;
        var x, y, z;
        var minX = 1E9, minY = 1E9, minZ = 1E9;
        var maxX = -1E9, maxY = -1E9, maxZ = -1E9;
        var dX, dY, dZ;
        var i, l;

        for (i = 0, l = meshes.length; i < l; i++) {
            mesh = meshes[i];
            min = mesh.min;
            max = mesh.max;
            x = min[0];
            y = min[1];
            z = min[2];

            if (x < minX) {
                minX = x;
            }

            if (y < minY) {
                minY = y;
            }

            if (z < minZ) {
                minZ = z;
            }

            x = max[0];
            y = max[1];
            z = max[2];

            if (x > maxX) {
                maxX = x;
            }

            if (y > maxY) {
                maxY = y;
            }

            if (z > maxZ) {
                maxZ = z;
            }
        }

        dX = maxX - minX;
        dY = maxY - minY;
        dZ = maxZ - minZ;

        this.extent = {radius: Math.sqrt(dX * dX + dY * dY + dZ * dZ) / 2, min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
    },

    render: function (instance, context, tint) {
        var gl = context.gl;
        var ctx = gl.ctx;
        var i, l, v;
        var sequence = instance.sequence;
        var frame = instance.frame;
        var counter = instance.counter;
        var shaderName = context.shaders[context.shader];

        if (shaderName !== "uvs" && shaderName !== "normals" && shaderName !== "white") {
            shaderName = "standard";
        }

        var realShaderName = "w" + shaderName
        var shader;
        var batches = this.batches;
        var polygonMode = context.polygonMode;
        var renderGeosets = (polygonMode === 1 || polygonMode === 3);
        var renderWireframe = (polygonMode === 2 || polygonMode === 3);

        if (batches) {
            var geoset;
            var batch;
            var layer;

            if (renderGeosets && gl.shaderStatus(realShaderName)) {
                var modifier = this.modifier;
                var uvoffset = this.uvoffset;
                var textureId;
                var textures = this.textures;

                shader = gl.bindShader(realShaderName);

                if (shaderName === "standard") {
                    ctx.uniform4fv(shader.variables.u_tint, tint);
                }

                ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());
                ctx.uniform1i(shader.variables.u_texture, 0);

                instance.skeleton.bind(shader, ctx);

                for (i = 0, l = batches.length; i < l; i++) {
                    batch = batches[i];
                    geoset = batch.geoset;
                    layer = batch.layer;

                    if (instance.meshVisibilities[geoset.index] && this.shouldRender(sequence, frame, counter, geoset, layer)) {
                        modifier[0] = 1;
                        modifier[1] = 1;
                        modifier[2] = 1;
                        modifier[3] = 1;

                        uvoffset[0] = 0;
                        uvoffset[1] = 0;
                        uvoffset[2] = 0;

                        layer.bind(shader, ctx);

                        textureId = layer.getTextureId(sequence, frame, counter);

                        this.bindTexture(textures[textureId], 0, instance.textureMap, context);

                        if (this.geosetAnimations) {
                            for (var j = this.geosetAnimations.length; j--;) {
                                var geosetAnimation = this.geosetAnimations[j];

                                if (geosetAnimation.geosetId === geoset.index) {
                                    var tempVec3 = geosetAnimation.getColor(sequence, frame, counter);

                                    modifier[0] = tempVec3[2];
                                    modifier[1] = tempVec3[1];
                                    modifier[2] = tempVec3[0];
                                }
                            }
                        }

                        modifier[3] = layer.getAlpha(sequence, frame, counter);

                        ctx.uniform4fv(shader.variables.u_modifier, modifier);

                        if (layer.textureAnimationId !== -1 && this.textureAnimations) {
                            var textureAnimation = this.textureAnimations[layer.textureAnimationId];

                            if (textureAnimation) {
                                // What is Z used for?
                                uvoffset = textureAnimation.getTranslation(sequence, frame, counter);
                            }

                        }

                        ctx.uniform3fv(shader.variables.u_uv_offset, uvoffset);

                        geoset.render(layer.coordId, shader, context.polygonMode, ctx);

                        layer.unbind(shader, ctx);
                    }
                }
            }

            if (renderWireframe && gl.shaderStatus("wwhite")) {
                shader = gl.bindShader("wwhite");

                ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());
                ctx.uniform1i(shader.variables.u_texture, 0);

                instance.skeleton.bind(shader, ctx);

                ctx.depthMask(1);
                ctx.disable(ctx.BLEND);
                ctx.enable(ctx.CULL_FACE);

                for (i = 0, l = layers.length; i < l; i++) {
                    layer = layers[i];

                    if (instance.meshVisibilities[layer.geosetId] && layer.shouldRender(sequence, frame, counter) && this.shouldRenderGeoset(sequence, frame, counter, layer)) {
                        geoset = geosets[layer.geosetId];

                        geoset.renderWireframe(shader, ctx);
                    }
                }
            }
        }

        if (context.emittersMode && instance.particleEmitters && gl.shaderStatus(realShaderName)) {
            for (i = 0, l = instance.particleEmitters.length; i < l; i++) {
                instance.particleEmitters[i].render(context);
            }
        }

        ctx.depthMask(1);
        ctx.disable(ctx.BLEND);
        ctx.enable(ctx.CULL_FACE);
        ctx.enable(ctx.DEPTH_TEST);
    },

    renderEmitters: function (instance, context) {
        var gl = context.gl;
        var ctx = gl.ctx;
        var i, l;
        var sequence = instance.sequence;
        var frame = instance.frame;
        var counter = instance.counter;
        var shader;

        if (instance.ribbonEmitters && gl.shaderStatus("wribbons")) {
            ctx.depthMask(1);
            ctx.disable(ctx.CULL_FACE);

            shader = gl.bindShader("wribbons");
            ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());
            ctx.uniform1i(shader.variables.u_texture, 0);

            for (i = 0, l = instance.ribbonEmitters.length; i < l; i++) {
                instance.ribbonEmitters[i].render(sequence, frame, counter, instance.textureMap, shader, context);
            }
        }

        if (instance.particleEmitters2 && gl.shaderStatus("wparticles")) {
            ctx.depthMask(0);
            ctx.enable(ctx.BLEND);
            ctx.disable(ctx.CULL_FACE);

            shader = gl.bindShader("wparticles");

            ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());
            ctx.uniform1i(shader.variables.u_texture, 0);

            for (i = 0, l = instance.particleEmitters2.length; i < l; i++) {
                instance.particleEmitters2[i].render(instance.textureMap, shader, context);
            }

            ctx.depthMask(1);
        }

        ctx.depthMask(1);
        ctx.disable(ctx.BLEND);
        ctx.enable(ctx.CULL_FACE);
    },

    renderBoundingShapes: function (instance, context) {
        var gl = context.gl;
        var shader;

        if (this.boundingShapes && gl.shaderStatus("white")) {
            shader = gl.bindShader("white");

            for (i = 0, l = this.boundingShapes.length; i < l; i++) {
                this.boundingShapes[i].render(instance.skeleton, shader, gl);
            }
        }
    },

    renderColor: function (instance, color, context) {
        var gl = context.gl;
        var ctx = gl.ctx;
        var i, l;
        var sequence = instance.sequence;
        var frame = instance.frame;
        var counter = instance.counter;
        var layer, geoset, texture;
        var shader;
        var batch;
        var batches = this.batches;
        var textures = this.textures;

        if (batches && gl.shaderStatus("wcolor")) {
            shader = gl.bindShader("wcolor");

            ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());
            ctx.uniform3fv(shader.variables.u_color, color);

            instance.skeleton.bind(shader, ctx);

            for (i = 0, l = batches.length; i < l; i++) {
                batch = batches[i];
                geoset = batch.geoset;
                layer = batch.layer;

                if (instance.meshVisibilities[geoset.index] && this.shouldRenderGeoset(sequence, frame, counter, geoset)) {
                    texture = textures[layer.textureId];

                    // Layers with team glows tend to be big planes that aren't parts of the actual geometry, so avoid selecting them
                    if (texture !== "replaceabletextures/teamglow/teamglow00.blp") {
                        geoset.renderColor(shader, ctx);
                    }
                }
            }
        }
    },

    shouldRender: function (sequence, frame, counter, geoset, layer) {
        var i, l, geosetAnimation, geosetAnimations = this.geosetAnimations;

        if (layer.getAlpha(sequence, frame, counter) < 0.75) {
            return false;
        }

        if (geosetAnimations) {
            for (i = 0, l = geosetAnimations.length; i < l; i++) {
                geosetAnimation = geosetAnimations[i];

                if (geosetAnimation.geosetId === geoset.index) {
                    if (geosetAnimation.getAlpha(sequence, frame, counter) < 0.75) {
                        return false;
                    }
                }
            }
        }

        return true;
    },

    bindTexture: function (source, unit, textureMap, context) {
        var texture = source;

        // Must be checked against undefined, because empty strings evaluate to false
        if (this.textureMap[source] !== undefined) {
            texture = this.textureMap[source];
        }

        // Must be checked against undefined, because empty strings evaluate to false
        if (textureMap[source] !== undefined) {
            texture = textureMap[source];
        }

        if (!context.teamColorsMode && source.endsWith("00.blp")) {
            texture = null;
        }

       // console.log(source, texture);

        context.gl.bindTexture(texture, unit);
    }
});
Mdx.ModelInstance = function (model, customPaths, context) {
    BaseModelInstance.call(this, model, {});

    this.setup(model, customPaths, context);
}

Mdx.ModelInstance.prototype = extend(BaseModelInstance.prototype, {
    setup: function (model, customPaths, context) {
        var gl = context.gl;
        var ctx = gl.ctx;
        var i, l, objects;

        // Need to reference context.urls in setTeamColor
        this.context = context;

        this.counter = 0;
        this.skeleton = new Mdx.Skeleton(model, ctx);

        if (model.particleEmitters && model.particleEmitters.length > 0) {
            objects = model.particleEmitters;

            this.particleEmitters = [];

            for (i = 0, l = objects.length; i < l; i++) {
                this.particleEmitters[i] = new Mdx.ParticleEmitter(objects[i], model, this, context, customPaths);
            }
        }

        if (model.particleEmitters2 && model.particleEmitters2.length > 0) {
            objects = model.particleEmitters2;

            this.particleEmitters2 = [];

            for (i = 0, l = objects.length; i < l; i++) {
                this.particleEmitters2[i] = new Mdx.ParticleEmitter2(objects[i], model, this, ctx);
            }
        }

        if (model.ribbonEmitters && model.ribbonEmitters.length > 0) {
            objects = model.ribbonEmitters;

            this.ribbonEmitters = [];

            for (i = 0, l = objects.length; i < l; i++) {
                this.ribbonEmitters[i] = new Mdx.RibbonEmitter(objects[i], model, this, ctx);
            }
        }
        
        this.attachmentInstances = [];
        this.attachments = [];
        this.attachmentVisible = [];
        
        for (i = 0, l = model.attachments.length; i < l; i++) {
            var path = model.attachments[i].path.replace(/\\/g, "/").toLowerCase().replace(".mdl", ".mdx");
            
            // Second condition is against custom resources using arbitrary paths...
            if (path !== "" && path.indexOf(".mdx") != -1) {
                var instance = context.loadInternalResource(customPaths(path));
                instance.setSequence(0);
                instance.setSequenceLoopMode(2);
                instance.setParent(this.getAttachment(model.attachments[i].attachmentId));
                
                this.attachmentInstances.push(instance);
                this.attachments.push(model.attachments[i]);
                this.attachmentVisible.push(true);
            }
        }
        
        
        if (model.eventObjects) {
            objects = model.eventObjects;
            
            this.eventObjectEmitters = [];
            
            for (i = 0, l = objects.length; i < l; i++) {
                this.eventObjectEmitters[i] = new Mdx.EventObjectEmitter(objects[i], model, this, context, customPaths);
            }
        }
    },

    updateEmitters: function (emitters, allowCreate, context) {
        if (emitters) {
            for (var i = 0, l = emitters.length; i < l; i++) {
                emitters[i].update(allowCreate, this.sequence, this.frame, this.counter, context);
            }
        }
    },

    update: function (instance, context) {
        var allowCreate = false;

        if (this.sequence !== -1) {
            var sequence = this.model.sequences[this.sequence];

            this.frame += context.frameTimeMS;
            this.counter += context.frameTimeMS;

            allowCreate = true;

            if (this.frame >= sequence.interval[1]) {
                if (this.sequenceLoopMode === 2 || (this.sequenceLoopMode === 0 && sequence.flags === 0)) {
                    this.frame = sequence.interval[0];
                    allowCreate = true;
                } else {
                    this.frame = sequence.interval[1];
                    this.counter -= context.frameTimeMS;
                    allowCreate = false;
                }
            }
        }

        this.skeleton.update(this.sequence, this.frame, this.counter, instance, context);

        this.updateEmitters(this.particleEmitters, allowCreate, context);
        this.updateEmitters(this.particleEmitters2, allowCreate, context);
        this.updateEmitters(this.ribbonEmitters, allowCreate, context);
        this.updateEmitters(this.eventObjectEmitters, allowCreate, context);
        
        var attachmentInstances = this.attachmentInstances;
        var attachments = this.attachments;
        var attachmentVisible = this.attachmentVisible;
        var attachment;
        
        for (var i = 0, l = attachments.length; i < l; i++) {
            attachment = attachments[i];

            attachmentVisible[i] = attachment.getVisibility(this.sequence, this.frame, this.counter) > 0.1;
            
            if (attachmentVisible[i]) {
                this.attachmentInstances[i].update(context);
            }
        }
    },
    
    render: function(context, tint) {
        if (this.eventObjectEmitters) {
            var emitters = this.eventObjectEmitters;
            
            for (i = 0, l = emitters.length; i < l; i++) {
                emitters[i].render(context);
            }
        }
        
        this.model.render(this, context, tint);
        
        var attachmentInstances = this.attachmentInstances;
        var attachmentVisible = this.attachmentVisible;
        
        for (var i = 0, l = attachmentInstances.length; i < l; i++) {
            if (attachmentVisible[i]) {
                attachmentInstances[i].render(context);
            }
        }
    },
    
    renderEmitters: function(context) {
        if (this.eventObjectEmitters) {
            var emitters = this.eventObjectEmitters;
            
            for (i = 0, l = emitters.length; i < l; i++) {
                emitters[i].renderEmitters(context);
            }
        }
        
        this.model.renderEmitters(this, context);
        
        var attachmentInstances = this.attachmentInstances;
        var attachmentVisible = this.attachmentVisible;
        
        for (var i = 0, l = attachmentInstances.length; i < l; i++) {
            if (attachmentVisible[i]) {
                attachmentInstances[i].renderEmitters(context);
            }
        }
    },
    
    setTeamColor: function (id) {
        var idString = ((id < 10) ? "0" + id : id);

        this.overrideTexture("replaceabletextures/teamcolor/teamcolor00.blp", this.context.urls.mpqFile("replaceabletextures/teamcolor/teamcolor" + idString + ".blp"));
        this.overrideTexture("replaceabletextures/teamglow/teamglow00.blp", this.context.urls.mpqFile("replaceabletextures/teamglow/teamglow" + idString + ".blp"));
        this.teamColor = id;
    },

    setSequence: function (id) {
        var sequences = this.model.sequences.length;
        
        if (id < sequences) {
            this.sequence = id;

            if (id === -1) {
                this.frame = 0;
            } else {
                var sequence = this.model.sequences[id];

                this.frame = sequence.interval[0];
            }
        }
    },

    getAttachment: function (id) {
        var attachment = this.model.attachments[id];

        if (attachment) {
            return this.skeleton.nodes[attachment.node];
        } else {
            return this.skeleton.nodes[0];
        }
    }
});
Mdx.replaceableIdToName = {
    1: "TeamColor/TeamColor00",
    2: "TeamGlow/TeamGlow00",
    11: "Cliff/Cliff0",
    //21: "", // Used by UndeadCursor, what is this???
    31: "LordaeronTree/LordaeronSummerTree",
    32: "AshenvaleTree/AshenTree",
    33: "BarrensTree/BarrensTree",
    34: "NorthrendTree/NorthTree",
    35: "Mushroom/MushroomTree",
    36: "RuinsTree/RuinsTree",
    37: "OutlandMushroomTree/MushroomTree"
};
Mdx.Geoset = function (geoset, index, ctx) {
    var i, l, j, k;
    var positions = geoset.vertices;
    var normals = geoset.normals;
    var textureCoordinateSets = geoset.textureCoordinateSets;
    var uvsetSize = textureCoordinateSets[0].length * 2;
    var vertices = positions.length / 3;
    var uvs = new Float32Array(textureCoordinateSets.length * uvsetSize);
    var boneIndices = new Uint8Array(vertices * 4);
    var boneNumbers = new Uint8Array(vertices);
    var faces = geoset.faces;
    var edges = new Uint16Array(faces.length * 2);
    var matrixGroups = [];
    var minX = 1E9, minY = 1E9, minZ = 1E9;
    var maxX = -1E9, maxY = -1E9, maxZ = -1E9;
    var x, y, z;
    
    this.index = index;
    this.materialId = geoset.materialId;
    
    for (i = 0, l = positions.length; i < l; i += 3) {
        x = positions[i];
        y = positions[i + 1];
        z = positions[i + 2];
        
        if (x > maxX) {
            maxX = x;
        }
        
        if (x < minX) {
            minX = x;
        }
        
        if (y > maxY) {
            maxY = y;
        }
        
        if (y < minY) {
            minY = y;
        }
        
        if (z > maxZ) {
            maxZ = z;
        }
        
        if (z < minZ) {
            minZ = z;
        }
    }
    
    for (i = 0, l = faces.length, k = 0; i < l; i += 3, k += 6) {
        edges[k + 0] = faces[i + 0];
        edges[k + 1] = faces[i + 1];
        edges[k + 2] = faces[i + 1];
        edges[k + 3] = faces[i + 2];
        edges[k + 4] = faces[i + 2];
        edges[k + 5] = faces[i + 0];
    }
  
    // Make one typed array for the texture coordinates, in case there are multiple ones
    for (i = 0, l = textureCoordinateSets.length; i < l; i++) {
        uvs.set(textureCoordinateSets[i], i * uvsetSize);
    }
  
    // Parse the bone indices
    for (i = 0, l = geoset.matrixGroups.length, k = 0; i < l; i++) {
        matrixGroups.push(geoset.matrixIndexes.subarray(k, k + geoset.matrixGroups[i]));
        k += geoset.matrixGroups[i];
    }
  
    for (i = 0, l = vertices, k = 0; i < l; i++) {
        var matrixGroup = matrixGroups[geoset.vertexGroups[i]];
        var count = 0;

        // 1 is added to every index for shader optimization.
        for (j = 0; j < 4; j++) {
            if (matrixGroup && j < matrixGroup.length) {
                boneIndices[k] = matrixGroup[j] + 1;
                count += 1;
            } else {
                boneIndices[k] = 0;
            }

            k += 1;
        }

        boneNumbers[i] = count;
    }
  
    var normalsOffset = positions.byteLength;
    var uvsOffset = normalsOffset + normals.byteLength;
    var boneIndicesOffset = uvsOffset + uvs.byteLength;
    var boneNumbersOffset = boneIndicesOffset + boneIndices.byteLength;
    var bufferSize = boneNumbersOffset + boneNumbers.byteLength;

    var arrayBuffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, arrayBuffer);
    ctx.bufferData(ctx.ARRAY_BUFFER,  bufferSize, ctx.STATIC_DRAW);
    ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, positions);
    ctx.bufferSubData(ctx.ARRAY_BUFFER, normalsOffset, normals);
    ctx.bufferSubData(ctx.ARRAY_BUFFER, uvsOffset, uvs);
    ctx.bufferSubData(ctx.ARRAY_BUFFER, boneIndicesOffset, boneIndices);
    ctx.bufferSubData(ctx.ARRAY_BUFFER, boneNumbersOffset, boneNumbers);

    var elementBuffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, elementBuffer);
    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, faces, ctx.STATIC_DRAW);

    var edgeBuffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, edgeBuffer);
    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, edges, ctx.STATIC_DRAW);

    this.offsets = [0, normalsOffset, uvsOffset, boneIndicesOffset, boneNumbersOffset];
    this.uvsetSize = uvsetSize * 4;
    this.arrayBuffer = arrayBuffer;
    this.elementBuffer = elementBuffer;
    this.edgeBuffer = edgeBuffer;
    this.elements = faces.length;
    this.min = [minX, minY, minZ];
    this.max = [maxX, maxY, maxZ];
};

Mdx.Geoset.prototype = {
    bindCommon: function (shader, ctx) {
        var offsets = this.offsets;

        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.arrayBuffer);

        ctx.vertexAttribPointer(shader.variables.a_position, 3, ctx.FLOAT, false, 12, offsets[0]);
        ctx.vertexAttribPointer(shader.variables.a_bones, 4, ctx.UNSIGNED_BYTE, false, 4, offsets[3]);
        ctx.vertexAttribPointer(shader.variables.a_bone_number, 1, ctx.UNSIGNED_BYTE, false, 1, offsets[4]);
    },

    render: function (coordId, shader, polygonMode, ctx) {
        var offsets = this.offsets;

        this.bindCommon(shader, ctx);

        ctx.vertexAttribPointer(shader.variables.a_normal, 3, ctx.FLOAT, false, 12, offsets[1]);
        ctx.vertexAttribPointer(shader.variables.a_uv, 2, ctx.FLOAT, false, 8, offsets[2] + coordId * this.uvsetSize);
        
        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
        ctx.drawElements(ctx.TRIANGLES, this.elements, ctx.UNSIGNED_SHORT, 0);
    },
    
    renderWireframe: function (shader, ctx) {
        this.bindCommon(shader, ctx);

        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.edgeBuffer);
        ctx.drawElements(ctx.LINES, this.elements * 2, ctx.UNSIGNED_SHORT, 0);
    },

    renderColor: function (shader, ctx) {
        this.bindCommon(shader, ctx);

        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
        ctx.drawElements(ctx.TRIANGLES, this.elements, ctx.UNSIGNED_SHORT, 0);
    },
    
    getPolygonCount: function () {
        return this.elements / 3;
    }
};
Mdx.ShallowLayer = function (layer, geoset) {
    this.layer = layer;
    this.geoset = geoset;
};

var filterModeToRenderOrder = {
    0: 0, // Opaque
    1: 1, // 1bit Alpha
    2: 2, // 8bit Alpha
    3: 3, // Additive
    4: 3, // Add Alpha (according to Magos)
    5: 3, // Modulate
    6: 3  // Modulate 2X
};

Mdx.Layer = function (layer, model) {
    var filterMode = Math.min(layer.filterMode, 6);
    
    this.filterMode = filterMode;
    this.twoSided = layer.twoSided;
    this.noDepthTest = layer.noDepthTest;
    this.noDepthSet = layer.noDepthSet;
    this.textureId = layer.textureId;
    this.textureAnimationId = layer.textureAnimationId;
    this.coordId = layer.coordId;
    this.alpha = layer.alpha;
    this.renderOrder = filterModeToRenderOrder[filterMode];
    this.sd = new Mdx.SDContainer(layer.tracks, model);
};

Mdx.Layer.prototype = {
    bind: function (shader, ctx) {
        ctx.uniform1f(shader.variables.u_alphaTest, 0);

        switch (this.filterMode) {
            case 0:
                ctx.depthMask(1);
                ctx.disable(ctx.BLEND);
                break;
            case 1:
                ctx.depthMask(1);
                ctx.disable(ctx.BLEND);
                ctx.uniform1f(shader.variables.u_alphaTest, 1);
                break;
            case 2:
                ctx.depthMask(0);
                ctx.enable(ctx.BLEND);
                ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
                break;
            case 3:
                ctx.depthMask(0);
                ctx.enable(ctx.BLEND);
                ctx.blendFunc(ctx.ONE, ctx.ONE);
                break;
            case 4:
                ctx.depthMask(0);
                ctx.enable(ctx.BLEND);
                ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE);
                break;
            case 5:
                ctx.depthMask(0);
                ctx.enable(ctx.BLEND);
                ctx.blendFunc(ctx.ZERO, ctx.SRC_COLOR);
                break;
            case 6:
                ctx.depthMask(0);
                ctx.enable(ctx.BLEND);
                ctx.blendFunc(ctx.DST_COLOR, ctx.SRC_COLOR);
                break;
        }
        
        if (this.twoSided) {
            ctx.disable(ctx.CULL_FACE);
        } else {
            ctx.enable(ctx.CULL_FACE);
        }
        
        if (this.noDepthTest) {
            ctx.disable(ctx.DEPTH_TEST);
        } else {
            ctx.enable(ctx.DEPTH_TEST);
        }
        
        if (this.noDepthSet) {
            ctx.depthMask(0);
        }
    },

    unbind: function (shader, ctx) {
        ctx.uniform1f(shader.variables.u_alphaTest, 0);

        ctx.depthMask(1);
        ctx.disable(ctx.BLEND);
        ctx.enable(ctx.CULL_FACE);
        ctx.enable(ctx.DEPTH_TEST);
    },

    getAlpha: function (sequence, frame, counter) {
        return this.sd.getKMTA(sequence, frame, counter, this.alpha);
    },

    getTextureId: function (sequence, frame, counter) {
        return this.sd.getKMTF(sequence, frame, counter, this.textureId);
    }
};
Mdx.GeosetAnimation = function (geosetAnimation, model) {
    var color = geosetAnimation.color;

    this.alpha = geosetAnimation.alpha;
    this.color = [color[2], color[1], color[0]];
    this.geosetId = geosetAnimation.geosetId;
    this.sd = new Mdx.SDContainer(geosetAnimation.tracks, model);
};

Mdx.GeosetAnimation.prototype = {
    getAlpha: function (sequence, frame, counter) {
        // The alpha variable doesn't seem to actually be used by the game?
        return this.sd.getKGAO(sequence, frame, counter, 1);
    },

    getColor: function (sequence, frame, counter) {
        return this.sd.getKGAC(sequence, frame, counter, this.color);
    }
};
Mdx.TextureAnimation = function (textureAnimation, model) {
    this.sd = new Mdx.SDContainer(textureAnimation.tracks, model);
    this.defaultTranslation = vec3.create();
    this.defaultRotation = quat.create();
    this.defaultScale = vec3.fromValues(1, 1, 1);
};

Mdx.TextureAnimation.prototype = {
    getTranslation: function (sequence, frame, counter) {
        return this.sd.getKTAT(sequence, frame, counter, this.defaultTranslation);
    },

    getRotation: function (sequence, frame, counter) {
        return this.sd.getKTAR(sequence, frame, counter, this.defaultRotation);
    },

    getScale: function (sequence, frame, counter) {
        return this.sd.getKTAS(sequence, frame, counter, this.defaultScale);
    }
};
var defaultTransformations = {
    translation: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    scaling: [1, 1, 1]
};

Mdx.Node = function (object, model, pivots) {
    var pivot = pivots[object.objectId];

    this.name = object.name;
    this.objectId = object.objectId;
    this.parentId = object.parentId;
    this.pivot = pivot ? pivot.data : [0, 0, 0];
    this.billboarded = object.billboarded;
    this.modelSpace = object.modelSpace;
    this.xYQuad = object.xYQuad;
    this.sd = new Mdx.SDContainer(object.tracks, model);

    if (object.objectId === object.parentId) {
        this.parentId = -1;
    }
};

Mdx.Node.prototype = {
    getTranslation: function (sequence, frame, counter) {
        return this.sd.getKGTR(sequence, frame, counter, defaultTransformations.translation);
    },

    getRotation: function (sequence, frame, counter) {
        return this.sd.getKGRT(sequence, frame, counter, defaultTransformations.rotation);
    },

    getScale: function (sequence, frame, counter) {
        return this.sd.getKGSC(sequence, frame, counter, defaultTransformations.scaling);
    }  
};

// Used by each copy of a skeleton to hold the node hierarchy
// Keeps a reference to the actual node containing the animation data, that the model owns
Mdx.ShallowNode = function (node) {
    BaseNode.call(this);

    this.nodeImpl = node;
    this.objectId = node.objectId;
    this.parentId = node.parentId;
    
    vec3.copy(this.pivot, node.pivot);
    
    this.externalWorldMatrix = mat4.create();
}

Mdx.ShallowNode.prototype = extend(BaseNode.prototype, {
    getTransformation: function () {
        var m = this.externalWorldMatrix;

        mat4.copy(m, this.worldMatrix);
        mat4.translate(m, m, this.pivot);

        return m;
    }
});
Mdx.Attachment = function (attachment, model) {
    this.node = attachment.node;
    this.path = attachment.path;
    this.attachmentId = attachment.attachmentId;
    this.sd = new Mdx.SDContainer(attachment.tracks, model);
}

Mdx.Attachment.prototype = {
    getVisibility: function (sequence, frame, counter) {
        return this.sd.getKATV(sequence, frame, counter, 1);
    }
};
Mdx.EventObjectSpn = function (emitter, context, customPaths) {
    var instance = context.loadInternalResource(customPaths(emitter.path), customPaths);
    
    console.log(emitter.node.worldLocation);

    instance.setSequence(0);
    instance.setLocation(emitter.node.worldLocation);
    instance.setScale(emitter.node.scale[0]); // Assuming uniform scale
    instance.setRotationQuat(emitter.node.worldRotation);
    
    this.instance = instance;
};

Mdx.EventObjectSpn.prototype = {
    update: function (emitter, context) {
        this.instance.update(context);
    },
    
    render: function (emitter, context) {
        this.instance.render(context);
    },
    
    renderEmitters: function (emitter, context) {
        this.instance.renderEmitters(context);
    },
    
    ended: function () {
        var instance = this.instance;
        
        if (instance.ready && instance.instance.frame >= instance.instance.model.sequences[0].interval[1]) {
            return true;
        }
        
        return false;
    }
};
Mdx.EventObjectSpl = function (emitter, context) {
    var ctx = context.gl.ctx;
    
    this.emitter = emitter;

    if (!emitter.buffer) {
        emitter.buffer = ctx.createBuffer();
        emitter.data = new Float32Array(30);

        ctx.bindBuffer(ctx.ARRAY_BUFFER, emitter.buffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, emitter.data, ctx.DYNAMIC_DRAW);
    }
    
    this.time = 0;
    this.endTime = emitter.firstIntervalTime + emitter.secondIntervalTime;
    this.location = vec3.clone(emitter.node.worldLocation);
    this.scale = vec3.clone(emitter.node.scale);
    this.color = vec4.create();
    this.index = 0;
};

Mdx.EventObjectSpl.prototype = {
    update: function (emitter, context) {
        var dt = context.frameTime / 100;
        
        this.time = Math.min(this.time + dt, this.endTime);
        
        var time = this.time;
        var first = emitter.firstIntervalTime;
        var second = emitter.secondIntervalTime;
        var tempFactor;
        var index;
        var color = this.color;
        
        if (time < first) {
            tempFactor = time / first;
            
            vec4.lerp(color, emitter.colors[0], emitter.colors[1], tempFactor);
            index = Math.lerp(emitter.firstInterval[0], emitter.firstInterval[1], tempFactor);
        } else {
            tempFactor = (time - first) / second;
            
            vec4.lerp(color, emitter.colors[1], emitter.colors[2], tempFactor);
            index = Math.lerp(emitter.secondInterval[0], emitter.secondInterval[1], tempFactor);
        }
        
        this.index = Math.floor(index);
    },
    
    updateHW: function (emitter, context) {
        var columns = emitter.columns;
        var position = this.location;
        var nodeScale = this.scale;
        var scale = emitter.scale;
        var index = this.index
        var left = index % columns;
        var top = Math.floor(index / columns);
        var right = left + 1;
        var bottom = top + 1;
        var color = this.color;
        var r = Math.floor(color[0]);
        var g = Math.floor(color[1]);
        var b = Math.floor(color[2]);
        var a = Math.floor(color[3]);
        var px = position[0];
        var py = position[1];
        var pz = position[2];
        var v1x = px - scale * nodeScale[0];
        var v1y = py - scale * nodeScale[1];
        var v1z = pz;
        var v2x = px - scale * nodeScale[0];
        var v2y = py + scale * nodeScale[1];
        var v2z = pz;
        var v3x = px + scale * nodeScale[0];
        var v3y = py + scale * nodeScale[1];
        var v3z = pz;
        var v4x = px + scale * nodeScale[0];
        var v4y = py - scale * nodeScale[1];
        var v4z = pz;
        var lta = encodeFloat3(left, top, a);
        var lba = encodeFloat3(left, bottom, a);
        var rta = encodeFloat3(right, top, a);
        var rba = encodeFloat3(right, bottom, a);
        var rgb = encodeFloat3(r, g, b);
        var data = this.emitter.data;
        
        data[0] = v1x;
        data[1] = v1y;
        data[2] = v1z;
        data[3] = lta;
        data[4] = rgb;

        data[5] = v2x;
        data[6] = v2y;
        data[7] = v2z;
        data[8] = lba;
        data[9] = rgb;

        data[10] = v3x;
        data[11] = v3y;
        data[12] = v3z;
        data[13] = rba;
        data[14] = rgb;

        data[15] = v1x;
        data[16] = v1y;
        data[17] = v1z;
        data[18] = lta;
        data[19] = rgb;

        data[20] = v3x;
        data[21] = v3y;
        data[22] = v3z;
        data[23] = rba;
        data[24] = rgb;

        data[25] = v4x;
        data[26] = v4y;
        data[27] = v4z;
        data[28] = rta;
        data[29] = rgb;
    },
    
    render: function (emitter, context) {
        var gl = context.gl;
        var ctx = gl.ctx;
        
        var shader = gl.bindShader("wparticles");

        ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());
        ctx.uniform1i(shader.variables.u_texture, 0);
        
        ctx.disable(ctx.CULL_FACE);
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthMask(0);
        ctx.enable(ctx.BLEND);
        
        switch (this.blendMode) {
            // Blend
            case 0:
                ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
                break;
            // Additive
            case 1:
                ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE);
                break;
            // Modulate
            case 2:
                ctx.blendFunc(ctx.ZERO, ctx.SRC_COLOR);
                break;
            // Modulate 2X
            case 3:
                ctx.blendFunc(ctx.DEST_COLOR, ctx.SRC_COLOR);
                break;
            // Alpha Key
            case 4:
                // ??
                break;
        }
        
        context.gl.bindTexture(emitter.texture, 0);
        
        ctx.uniform2fv(shader.variables.u_dimensions, emitter.dimensions);

        this.updateHW(emitter, context);

        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.emitter.buffer);
        ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, this.emitter.data);

        ctx.vertexAttribPointer(shader.variables.a_position, 3, ctx.FLOAT, false, 20, 0);
        ctx.vertexAttribPointer(shader.variables.a_uva_rgb, 2, ctx.FLOAT, false, 20, 12);

        ctx.drawArrays(ctx.TRIANGLES, 0, 6);
    },
    
    renderEmitters: function (emitter, context) {
        
    },
    
    ended: function () {
        return (this.time >= this.endTime);
    }
};
Mdx.EventObjectUbr = function (emitter, context) {
    var ctx = context.gl.ctx;
    
    this.emitter = emitter;

    if (!emitter.buffer) {
        emitter.buffer = ctx.createBuffer();
        emitter.data = new Float32Array(30);

        ctx.bindBuffer(ctx.ARRAY_BUFFER, emitter.buffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, emitter.data, ctx.DYNAMIC_DRAW);
    }

    this.time = 0;
    this.endTime = emitter.firstIntervalTime + emitter.secondIntervalTime + emitter.thirdIntervalTime;
    this.location = vec3.clone(emitter.node.worldLocation);
    this.scale = vec3.clone(emitter.node.scale);
    this.color = vec4.create();
    this.index = 0;
};

Mdx.EventObjectUbr.prototype = {
    update: function (emitter, context) {
        var dt = context.frameTime / 100;
        
        this.time = Math.min(this.time + dt, this.endTime);
        
        var time = this.time;
        var first = emitter.firstIntervalTime;
        var second = emitter.secondIntervalTime;
        var third = emitter.thirdIntervalTime;
        var tempFactor;
        var index;
        var color = this.color;
        
        if (time < first) {
            tempFactor = time / first;
            
            vec4.lerp(color, emitter.colors[0], emitter.colors[1], tempFactor);
        } else if (time < first + second) {
            vec4.copy(color, emitter.colors[1]);
        } else {
            tempFactor = (time - first - second) / third;
            
            vec4.lerp(color, emitter.colors[1], emitter.colors[2], tempFactor);
        }
    },
    
    updateHW: Mdx.EventObjectSpl.prototype.updateHW,    
    render: Mdx.EventObjectSpl.prototype.render,
    renderEmitters: Mdx.EventObjectSpl.prototype.renderEmitters,
    ended: Mdx.EventObjectSpl.prototype.ended
};
Mdx.EventObjectEmitter = function (eventObject, model, instance, context, customPaths) {
    var node = instance.skeleton.nodes[eventObject.node.index];
    var name = node.nodeImpl.name;
    var type = name.substring(0, 3);
    var path = name.substring(4);
    
    if (type === "FPT") {
        type = "SPL";
    }
    
    this.model = model;
    this.instance = instance;
    this.type = type;
    this.node = node;
    this.globalSequenceId = eventObject.globalSequenceId;
    this.globalSequences = model.globalSequences;
    this.sequences = model.sequences;
    this.tracks = eventObject.tracks;
    this.lastTrack = vec3.create();
    this.eventObjects = [];
    
    this.customPaths = customPaths;

    if (type === "SPN") {
        this.ready = 1;
        
        this.path = eventObjectPaths[type][path];
    } else if (type === "SPL") {
        var slkLine = eventObjectPaths[type][path];
        
        if (slkLine) {
            this.ready = 1;
            
            this.texture = customPaths("replaceabletextures/splats/splat01mature.blp");
            this.rows = slkLine[0];
            this.columns = slkLine[1];
            this.blendMode = slkLine[2];
            this.scale = slkLine[3];
            this.firstIntervalTime = slkLine[4];
            this.secondIntervalTime = slkLine[5];
            this.firstInterval = [slkLine[6], slkLine[7], slkLine[8]];
            this.secondInterval = [slkLine[9], slkLine[10], slkLine[11]];
            this.colors = [[slkLine[12], slkLine[13], slkLine[14], slkLine[15]], [slkLine[16], slkLine[17], slkLine[18], slkLine[19]], [slkLine[20], slkLine[21], slkLine[22], slkLine[23]]];
            
            this.dimensions = [this.columns, this.rows];
            
            context.gl.loadTexture(this.texture, ".blp");
        }
    } else if (type === "UBR") {
        var slkLine = eventObjectPaths[type][path];
        
        if (slkLine) {
            this.ready = 1;
            
            this.texture = customPaths("replaceabletextures/splats/" + slkLine[0] + ".blp");
            this.blendMode = slkLine[1];
            this.scale = slkLine[2];
            this.firstIntervalTime = slkLine[3];
            this.secondIntervalTime = slkLine[4];
            this.thirdIntervalTime = slkLine[5];
            this.colors = [[slkLine[6], slkLine[7], slkLine[8], slkLine[9]], [slkLine[10], slkLine[11], slkLine[12], slkLine[13]], [slkLine[14], slkLine[15], slkLine[16], slkLine[17]]];
            
            this.dimensions = [1, 1];
            this.columns = 1;
            
            context.gl.loadTexture(this.texture, ".blp");
        }
    }
    
    this.track = vec3.create();
};

Mdx.EventObjectEmitter.prototype = {
    update: function (allowCreate, sequence, frame, counter, context) {
        if (this.ready) {
            var eventObjects = this.eventObjects;
            var eventObject;
            var track = this.getValue(sequence, frame, counter, this.track);
            
            if (track[0] === 1 && (track[0] !== this.lastTrack[0] || track[1] !== this.lastTrack[1])) {
                switch (this.type) {
                    case "SPN":
                        eventObject = new Mdx.EventObjectSpn(this, context, this.customPaths);
                        break;
                    case "SPL":
                        eventObject = new Mdx.EventObjectSpl(this, context);
                        break;
                    case "UBR":
                        eventObject = new Mdx.EventObjectUbr(this, context);
                        break;
                }
                
                eventObjects.push(eventObject);
            }
            
            this.lastTrack[0] = track[0];
            this.lastTrack[1] = track[1];
            
            for (var i = 0, l = eventObjects.length; i < l; i++) {
                eventObjects[i].update(this, context);
            }
            
            if (eventObjects.length) {
                if (eventObjects[0].ended()) {
                    eventObjects.shift();
                }
            }
        }
    },

    render: function (context) {
        if (this.ready) {
            var eventObjects = this.eventObjects;
            
            for (var i = 0, l = eventObjects.length; i < l; i++) {
                eventObjects[i].render(this, context);
            }
        }
    },
    
    renderEmitters: function (context) {
        if (this.ready) {
            var eventObjects = this.eventObjects;
            
            for (var i = 0, l = eventObjects.length; i < l; i++) {
                eventObjects[i].renderEmitters(this, context);
            }
        }
    },
    
    getValue: function (sequence, frame, counter, out) {
        if (this.globalSequenceId !== -1 && this.globalSequences) {
            var duration = this.globalSequences[this.globalSequenceId];

            return this.getValueAtTime(counter % duration , 0, duration, out);
        } else if (sequence !== -1) {
            var interval = this.sequences[sequence].interval;

            return this.getValueAtTime(frame, interval[0], interval[1], out);
        } else {
            out[0] = 0;
            out[1] = 0;
            return out;
        }
    },
    
    getValueAtTime: function (frame, start, end, out) {
        var tracks = this.tracks;
        
        if (frame < start || frame > end) {
            out[0] = 0;
            out[1] = 0;
            return out;
        }
        
        for (var i = tracks.length - 1; i > -1; i--) {
            if (tracks[i] < start) {
                out[0] = 0;
                out[1] = i;
                return out;
            } else if (tracks[i] <= frame) {
                out[0] = 1;
                out[1] = i;
                return out;
            }
        }
        
        out[0] = 0;
        out[1] = 0;
        return out;
    }
};

var eventObjectPaths = {
    SPN: {
        UEGG: "Objects/Spawnmodels/Undead/CryptFiendEggsack/CryptFiendEggsack.mdx",
        GCBL: "Objects/Spawnmodels/Undead/GargoyleCrumble/GargoyleCrumble.mdx",
        UDIS: "Objects/Spawnmodels/Undead/UndeadDissipate/UndeadDissipate.mdx",
        EDIS: "Objects/Spawnmodels/NightElf/NightelfDissipate/NightElfDissipate.mdx",
        DDIS: "Objects/Spawnmodels/Demon/DemonDissipate/DemonDissipate.mdx",
        ODIS: "Objects/Spawnmodels/Orc/OrcDissipate/OrcDissipate.mdx",
        HDIS: "Objects/Spawnmodels/Human/HumanDissipate/HumanDissipate.mdx",
        HBS0: "Objects/Spawnmodels/Human/HumanBlood/HumanBloodSmall0.mdx",
        HBS1: "Objects/Spawnmodels/Human/HumanBlood/HumanBloodSmall1.mdx",
        HBL0: "Objects/Spawnmodels/Human/HumanBlood/HumanBloodLarge0.mdx",
        HBL1: "Objects/Spawnmodels/Human/HumanBlood/HumanBloodLarge1.mdx",
        EENT: "Objects/Spawnmodels/NightElf/EntBirthTarget/EntBirthTarget.mdx",
        DNAM: "Objects/Spawnmodels/NightElf/NEDeathMedium/NEDeath.mdx",
        DNAS: "Objects/Spawnmodels/NightElf/NEDeathSmall/NEDeathSmall.mdx",
        DUME: "Objects/Spawnmodels/Undead/UDeathMedium/UDeath.mdx",
        DUSM: "Objects/Spawnmodels/Undead/UDeathSmall/UDeathSmall.mdx",
        INFR: "Objects/Spawnmodels/Demon/InfernalMeteor/InfernalMeteor.mdx",
        INFL: "Objects/Spawnmodels/Demon/InfernalMeteor/InfernalMeteor2.mdx",
        INFU: "Objects/Spawnmodels/Demon/InfernalMeteor/InfernalMeteor3.mdx",
        HBF0: "Objects/Spawnmodels/Human/HumanBlood/HumanBloodFootman.mdx",
        HBK0: "Objects/Spawnmodels/Human/HumanBlood/HumanBloodKnight.mdx",
        HBM0: "Objects/Spawnmodels/Human/HumanBlood/HumanBloodMortarTeam.mdx",
        HBP0: "Objects/Spawnmodels/Human/HumanBlood/HumanBloodPeasant.mdx",
        HBPR: "Objects/Spawnmodels/Human/HumanBlood/HumanBloodPriest.mdx",
        HBR0: "Objects/Spawnmodels/Human/HumanBlood/HumanBloodRifleman.mdx",
        HBSR: "Objects/Spawnmodels/Human/HumanBlood/HumanBloodSorceress.mdx",
        HBNE: "Objects/Spawnmodels/Undead/UndeadBlood/UndeadBloodNecromancer.mdx",
        NBVW: "Objects/Spawnmodels/Other/NPCBlood/NpcBloodVillagerWoman.mdx",
        OBHE: "Objects/Spawnmodels/Orc/Orcblood/OrcBloodHeadhunter.mdx",
        OBHS: "Objects/Spawnmodels/Orc/Orcblood/OrcBloodHellScream.mdx",
        OBFS: "Objects/Spawnmodels/Orc/Orcblood/OrcBloodHeroFarSeer.mdx",
        OBTC: "Objects/Spawnmodels/Orc/Orcblood/OrcBloodHeroTaurenChieftain.mdx",
        OBKB: "Objects/Spawnmodels/Orc/Orcblood/OrcBloodKotoBeast.mdx",
        OBWD: "Objects/Spawnmodels/Orc/Orcblood/OrcBloodWitchDoctor.mdx",
        OBWR: "Objects/Spawnmodels/Orc/Orcblood/OrcBloodWolfrider.mdx",
        OBWY: "Objects/Spawnmodels/Orc/Orcblood/OrdBloodWyvernRider.mdx",
        OBWV: "Objects/Spawnmodels/Orc/Orcblood/OrcBloodRiderlessWyvernRider.mdx",
        OBT0: "Objects/Spawnmodels/Orc/Orcblood/OrcBloodTauren.mdx",
        OBG0: "Objects/Spawnmodels/Orc/Orcblood/OrcBloodGrunt.mdx",
        OBP0: "Objects/Spawnmodels/Orc/Orcblood/OrcBloodPeon.mdx",
        OKBP: "Objects/Spawnmodels/Orc/KodoBeastPuke/KodoBeastPuke.mdx",
        UBGA: "Objects/Spawnmodels/Undead/UndeadBlood/UndeadBloodGargoyle.mdx",
        UBGH: "Objects/Spawnmodels/Undead/UndeadBlood/UndeadBloodGhoul.mdx",
        UBAB: "Objects/Spawnmodels/Undead/UndeadBlood/UndeadBloodAbomination.mdx",
        UBAC: "Objects/Spawnmodels/Undead/UndeadBlood/UndeadBloodAcolyte.mdx",
        DBCR: "Objects/Spawnmodels/Undead/UndeadBlood/UndeadBloodCryptFiend.mdx",
        NBAR: "Objects/Spawnmodels/NightElf/NightElfBlood/NightElfBloodArcher.mdx",
        NBDC: "Objects/Spawnmodels/NightElf/NightElfBlood/NightElfBloodDruidoftheClaw.mdx",
        NBDT: "Objects/Spawnmodels/NightElf/NightElfBlood/NightElfBloodDruidoftheTalon.mdx",
        NBDR: "Objects/Spawnmodels/NightElf/NightElfBlood/NightElfBloodDryad.mdx",
        NBHU: "Objects/Spawnmodels/NightElf/NightElfBlood/NightElfBloodHuntress.mdx",
        NBDB: "Objects/Spawnmodels/NightElf/NightElfBlood/NightElfBloodDruidBear.mdx",
        NBDA: "Objects/Spawnmodels/NightElf/NightElfBlood/NightElfBloodDruidRaven.mdx",
        NBDH: "Objects/Spawnmodels/NightElf/NightElfBlood/NightElfBloodHeroDemonHunter.mdx",
        NBKG: "Objects/Spawnmodels/NightElf/NightElfBlood/NightElfBloodHeroKeeperoftheGrove.mdx",
        NBMP: "Objects/Spawnmodels/NightElf/NightElfBlood/NightElfBloodHeroMoonPriestess.mdx",
        NBCH: "Objects/Spawnmodels/NightElf/NightElfBlood/NightElfBloodChimaera.mdx",
        NBHG: "Objects/Spawnmodels/NightElf/NightElfBlood/NightElfBloodHippogryph.mdx",
        DBPT: "Objects/Spawnmodels/Demon/DemonBlood/DemonBloodPitlord.mdx",
        DNBL: "Objects/Spawnmodels/Other/NeutralBuildingExplosion/NeutralBuildingExplosion.mdx",
        CLID: "Objects/Spawnmodels/Undead/ImpaleTargetDust/ImpaleTargetDust.mdx",
        HFSS: "Objects/Spawnmodels/Human/SmallFlameSpawn/SmallFlameSpawn.mdx",
        UBSC: "Objects/Spawnmodels/Undead/UndeadBlood/ObsidianStatueCrumble.mdx",
        UBCC: "Objects/Spawnmodels/Undead/UndeadBlood/ObsidianStatueCrumble2.mdx",
        HBBM: "Objects/Spawnmodels/Human/HumanBlood/HeroBloodElfBlood.mdx",
        HBSB: "Objects/Spawnmodels/Human/HumanBlood/BloodElfSpellThiefBlood.mdx",
        NBMF: "Objects/Spawnmodels/NightElf/NightElfBlood/Blood/MALFurion_Blood.mdx",
        OBBT: "Objects/Spawnmodels/Orc/Orcblood/BattrollBlood.mdx",
        OBSH: "Objects/Spawnmodels/Orc/Orcblood/HeroShadowHunterBlood.mdx",
        DBPB: "Objects/Spawnmodels/Other/PandarenBrewmasterBlood/PandarenBrewmasterBlood.mdx",
        DBBM: "Objects/Spawnmodels/Other/BeastmasterBlood/BeastmasterBlood.mdx",
        PEFI: "Abilities/Spells/Other/ImmolationRed/ImmolationREDTarget.mdx",
        DNBD: "Objects/Spawnmodels/Naga/NagaDeath/NagaDeath.mdx",
        FTSO: "Objects/Spawnmodels/Other/FlameThrower/FlameThrowerSpawnObj.mdx",
        TOBO: "Objects/Spawnmodels/Other/ToonBoom/ToonBoom.mdx",
        CBAL: "Objects/Spawnmodels/Critters/Albatross/CritterBloodAlbatross.mdx",
        IFP0: "Objects/Spawnmodels/Other/IllidanFootprint/IllidanSpawnFootPrint0.mdx",
        IFP1: "Objects/Spawnmodels/Other/IllidanFootprint/IllidanSpawnFootPrint1.mdx",
        IFPW: "Objects/Spawnmodels/Other/IllidanFootprint/IllidanWaterSpawnFootPrint.mdx",
        HBCE: "Objects/Spawnmodels/Other/HumanBloodCinematicEffect/HumanBloodCinematicEffect.mdx",
        OBCE: "Objects/Spawnmodels/Other/OrcBloodCinematicEffect/OrcBloodCinematicEffect.mdx",
        FRBS: "Objects/Spawnmodels/Human/FragmentationShards/FragBoomSpawn.mdx",
        PBSX: "Objects/Spawnmodels/Other/PandarenBrewmasterExplosionUltimate/PandarenBrewmasterExplosionUltimate.mdx",
        GDCR: "UI/Feedback/GoldCredit/GoldCredit.mdx",
        NBWS: "Objects/Spawnmodels/Naga/NagaBlood/NagaBloodWindserpent.mdx"
    },
    
    SPL: {
        //INIT: [16, 16, 0, 25, 2, 120, 0, 3, 1, 3, 3, 1, 255, 255, 255, 255, 255, 255, 255, 255, 100, 100, 100, 0],
        DBL0: [16, 16, 1, 50, 2, 120, 0, 15, 1, 15, 15, 1, 60, 120, 20, 255, 60, 120, 20, 200, 60, 120, 20, 0],
        DBL1: [16, 16, 1, 50, 2, 120, 16, 31, 1, 31, 31, 1, 60, 120, 20, 255, 60, 120, 20, 200, 60, 120, 20, 0],
        DBL2: [16, 16, 1, 50, 2, 120, 32, 47, 1, 47, 47, 1, 60, 120, 20, 255, 60, 120, 20, 200, 60, 120, 20, 0],
        DBL3: [16, 16, 1, 50, 2, 120, 48, 63, 1, 63, 63, 1, 60, 120, 20, 255, 60, 120, 20, 200, 60, 120, 20, 0],
        DBS0: [16, 16, 1, 25, 2, 120, 0, 15, 1, 15, 15, 1, 60, 120, 20, 255, 60, 120, 20, 200, 60, 120, 20, 0],
        DBS1: [16, 16, 1, 25, 2, 120, 16, 31, 1, 31, 31, 1, 60, 120, 20, 255, 60, 120, 20, 200, 60, 120, 20, 0],
        DBS2: [16, 16, 1, 25, 2, 120, 32, 47, 1, 47, 47, 1, 60, 120, 20, 255, 60, 120, 20, 200, 60, 120, 20, 0],
        DBS3: [16, 16, 1, 25, 2, 120, 48, 63, 1, 63, 63, 1, 60, 120, 20, 255, 60, 120, 20, 200, 60, 120, 20, 0],
        EBL0: [16, 16, 0, 50, 2, 120, 0, 15, 1, 15, 15, 1, 60, 3, 35, 255, 60, 3, 35, 200, 60, 3, 35, 0],
        EBL1: [16, 16, 0, 50, 2, 120, 16, 31, 1, 31, 31, 1, 60, 3, 35, 255, 60, 3, 35, 200, 60, 3, 35, 0],
        EBL2: [16, 16, 0, 50, 2, 120, 32, 47, 1, 47, 47, 1, 60, 3, 35, 255, 60, 3, 35, 200, 60, 3, 35, 0],
        EBL3: [16, 16, 0, 50, 2, 120, 48, 63, 1, 63, 63, 1, 60, 3, 35, 255, 60, 3, 35, 200, 60, 3, 35, 0],
        EBS0: [16, 16, 0, 25, 2, 120, 0, 15, 1, 15, 15, 1, 60, 3, 35, 255, 60, 3, 35, 200, 60, 3, 35, 0],
        EBS1: [16, 16, 0, 25, 2, 120, 16, 31, 1, 31, 31, 1, 60, 3, 35, 255, 60, 3, 35, 200, 60, 3, 35, 0],
        EBS2: [16, 16, 0, 25, 2, 120, 32, 47, 1, 47, 47, 1, 60, 3, 35, 255, 60, 3, 35, 200, 60, 3, 35, 0],
        EBS3: [16, 16, 0, 25, 2, 120, 48, 63, 1, 63, 63, 1, 60, 3, 35, 255, 60, 3, 35, 200, 60, 3, 35, 0],
        FAL0: [16, 16, 0, 14, 2, 5, 88, 88, 1, 88, 88, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FAL1: [16, 16, 0, 20, 2, 5, 88, 88, 1, 88, 88, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FAL2: [16, 16, 0, 32, 2, 5, 88, 88, 1, 88, 88, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FAL3: [16, 16, 0, 48, 2, 5, 88, 88, 1, 88, 88, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FAR0: [16, 16, 0, 14, 2, 5, 89, 89, 1, 89, 89, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FAR1: [16, 16, 0, 20, 2, 5, 89, 89, 1, 89, 89, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FAR2: [16, 16, 0, 32, 2, 5, 89, 89, 1, 89, 89, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FAR3: [16, 16, 0, 48, 2, 5, 89, 89, 1, 89, 89, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FBL0: [16, 16, 0, 14, 2, 5, 80, 80, 1, 80, 80, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FBL1: [16, 16, 0, 20, 2, 5, 80, 80, 1, 80, 80, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FBL2: [16, 16, 0, 14, 2, 5, 82, 82, 1, 82, 82, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FBL3: [16, 16, 0, 20, 2, 5, 82, 82, 1, 82, 82, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FBL4: [16, 16, 0, 32, 2, 5, 82, 82, 1, 82, 82, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FBR0: [16, 16, 0, 14, 2, 5, 81, 81, 1, 81, 81, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FBR1: [16, 16, 0, 20, 2, 5, 81, 81, 1, 81, 81, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FBR2: [16, 16, 0, 14, 2, 5, 83, 83, 1, 83, 83, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FBR3: [16, 16, 0, 20, 2, 5, 83, 83, 1, 83, 83, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FBR4: [16, 16, 0, 32, 2, 5, 83, 83, 1, 83, 83, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FCR0: [16, 16, 0, 12, 2, 5, 87, 87, 1, 87, 87, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FCL0: [16, 16, 0, 12, 2, 5, 86, 86, 1, 86, 86, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FCL1: [16, 16, 0, 28, 2, 5, 86, 86, 1, 86, 86, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FCR1: [16, 16, 0, 28, 2, 5, 87, 87, 1, 87, 87, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FCL3: [16, 16, 0, 36, 2, 5, 86, 86, 1, 86, 86, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FCR3: [16, 16, 0, 36, 2, 5, 87, 87, 1, 87, 87, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FCL2: [16, 16, 0, 6, 2, 5, 86, 86, 1, 86, 86, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FCR2: [16, 16, 0, 6, 2, 5, 87, 87, 1, 87, 87, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FHL0: [16, 16, 0, 12, 2, 5, 84, 84, 1, 84, 84, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FHL1: [16, 16, 0, 20, 2, 5, 84, 84, 1, 84, 84, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FHR0: [16, 16, 0, 12, 2, 5, 85, 85, 1, 85, 85, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FHR1: [16, 16, 0, 20, 2, 5, 85, 85, 1, 85, 85, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FPL0: [16, 16, 0, 12, 2, 5, 93, 93, 1, 93, 93, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FPL1: [16, 16, 0, 20, 2, 5, 93, 93, 1, 93, 93, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FPR0: [16, 16, 0, 12, 2, 5, 92, 92, 1, 92, 92, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FPR1: [16, 16, 0, 20, 2, 5, 92, 92, 1, 92, 92, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FRL0: [16, 16, 0, 48, 2, 5, 100, 100, 1, 100, 100, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FRR0: [16, 16, 0, 48, 2, 5, 101, 101, 1, 101, 101, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FRL1: [16, 16, 0, 24, 2, 5, 100, 100, 1, 100, 100, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FRR1: [16, 16, 0, 24, 2, 5, 101, 101, 1, 101, 101, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FTL0: [16, 16, 0, 22, 2, 5, 90, 90, 1, 90, 90, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FTR0: [16, 16, 0, 22, 2, 5, 91, 91, 1, 91, 91, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FWL0: [16, 16, 0, 30, 2, 5, 97, 97, 1, 97, 97, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FWR0: [16, 16, 0, 30, 2, 5, 96, 96, 1, 96, 96, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FWL1: [16, 16, 0, 30, 2, 5, 99, 99, 1, 99, 99, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FWR1: [16, 16, 0, 30, 2, 5, 98, 98, 1, 98, 98, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FML0: [16, 16, 0, 20, 2, 5, 104, 104, 1, 104, 104, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FMR0: [16, 16, 0, 20, 2, 5, 105, 105, 1, 105, 105, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FPL2: [16, 16, 0, 30, 2, 5, 102, 102, 1, 102, 102, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FPR2: [16, 16, 0, 30, 2, 5, 103, 103, 1, 103, 103, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FSL0: [16, 16, 0, 18, 2, 5, 106, 106, 1, 106, 106, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FSR0: [16, 16, 0, 18, 2, 5, 107, 107, 1, 107, 107, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FSL1: [16, 16, 0, 30, 2, 5, 106, 106, 1, 106, 106, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FSR1: [16, 16, 0, 30, 2, 5, 107, 107, 1, 107, 107, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FFL0: [16, 16, 0, 14, 2, 5, 108, 108, 5, 108, 108, 15, 255, 255, 255, 128, 255, 150, 50, 128, 0, 0, 0, 0],
        FFR0: [16, 16, 0, 14, 2, 5, 109, 109, 5, 109, 109, 15, 255, 255, 255, 128, 255, 150, 50, 128, 0, 0, 0, 0],
        FFL1: [16, 16, 0, 35, 2, 5, 108, 108, 5, 108, 108, 15, 255, 255, 255, 128, 255, 150, 50, 128, 0, 0, 0, 0],
        FFR1: [16, 16, 0, 35, 2, 5, 109, 109, 5, 109, 109, 15, 255, 255, 255, 128, 255, 150, 50, 128, 0, 0, 0, 0],
        FKL0: [16, 16, 0, 18, 2, 5, 110, 110, 1, 110, 110, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FKR0: [16, 16, 0, 18, 2, 5, 111, 111, 1, 111, 111, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FKL1: [16, 16, 0, 32, 2, 5, 110, 110, 1, 110, 110, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FKR1: [16, 16, 0, 32, 2, 5, 111, 111, 1, 111, 111, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FKL2: [16, 16, 0, 50, 2, 5, 110, 110, 1, 110, 110, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FKR2: [16, 16, 0, 50, 2, 5, 111, 111, 1, 111, 111, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FLSL: [16, 16, 0, 16, 2, 5, 112, 112, 1, 112, 112, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FLSR: [16, 16, 0, 16, 2, 5, 113, 113, 1, 113, 113, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FLLL: [16, 16, 0, 28, 2, 5, 112, 112, 1, 112, 112, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FLLR: [16, 16, 0, 28, 2, 5, 113, 113, 1, 113, 113, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FSSL: [16, 16, 0, 40, 2, 5, 114, 114, 1, 114, 114, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FSSR: [16, 16, 0, 40, 2, 5, 115, 115, 1, 115, 115, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FSLL: [16, 16, 0, 64, 2, 5, 114, 114, 1, 114, 114, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FSLR: [16, 16, 0, 64, 2, 5, 115, 115, 1, 115, 115, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FDSL: [16, 16, 0, 32, 2, 5, 116, 116, 1, 116, 116, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FDSR: [16, 16, 0, 32, 2, 5, 117, 117, 1, 117, 117, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FDLL: [16, 16, 0, 55, 2, 5, 116, 116, 1, 116, 116, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        FDLR: [16, 16, 0, 55, 2, 5, 117, 117, 1, 117, 117, 1, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255, 0],
        HBL0: [16, 16, 0, 50, 2, 120, 0, 15, 1, 15, 15, 1, 200, 10, 10, 255, 190, 10, 10, 200, 120, 10, 10, 0],
        HBL1: [16, 16, 0, 50, 2, 120, 16, 31, 1, 31, 31, 1, 200, 10, 10, 255, 190, 10, 10, 200, 120, 10, 10, 0],
        HBL2: [16, 16, 0, 50, 2, 120, 32, 47, 1, 47, 47, 1, 200, 10, 10, 255, 190, 10, 10, 200, 120, 10, 10, 0],
        HBS0: [16, 16, 0, 25, 2, 120, 48, 63, 1, 63, 63, 1, 200, 10, 10, 255, 190, 10, 10, 200, 120, 10, 10, 0],
        HBS1: [16, 16, 0, 25, 2, 120, 0, 15, 1, 15, 15, 1, 200, 10, 10, 255, 190, 10, 10, 200, 120, 10, 10, 0],
        HBS2: [16, 16, 0, 25, 2, 120, 16, 31, 1, 31, 31, 1, 200, 10, 10, 255, 190, 10, 10, 200, 120, 10, 10, 0],
        HBS3: [16, 16, 0, 25, 2, 120, 32, 47, 1, 47, 47, 1, 200, 10, 10, 255, 190, 10, 10, 200, 120, 10, 10, 0],
        HBL3: [16, 16, 0, 50, 2, 120, 48, 63, 1, 63, 63, 1, 200, 10, 10, 255, 190, 10, 10, 200, 120, 10, 10, 0],
        OBL0: [16, 16, 0, 50, 2, 120, 48, 63, 1, 63, 63, 1, 60, 3, 3, 255, 60, 3, 3, 200, 60, 3, 3, 0],
        OBL1: [16, 16, 0, 50, 2, 120, 0, 15, 1, 15, 15, 1, 60, 3, 3, 255, 60, 3, 3, 200, 60, 3, 3, 0],
        OBL2: [16, 16, 0, 50, 2, 120, 16, 31, 1, 31, 31, 1, 60, 3, 3, 255, 60, 3, 3, 200, 60, 3, 3, 0],
        OBL3: [16, 16, 0, 50, 2, 120, 32, 47, 1, 47, 47, 1, 60, 3, 3, 255, 60, 3, 3, 200, 60, 3, 3, 0],
        OBS0: [16, 16, 0, 25, 2, 120, 48, 63, 1, 63, 63, 1, 60, 3, 3, 255, 60, 3, 3, 200, 60, 3, 3, 0],
        OBS1: [16, 16, 0, 25, 2, 120, 0, 15, 1, 15, 15, 1, 60, 3, 3, 255, 60, 3, 3, 200, 60, 3, 3, 0],
        OBS2: [16, 16, 0, 25, 2, 120, 16, 31, 1, 31, 31, 1, 60, 3, 3, 255, 60, 3, 3, 200, 60, 3, 3, 0],
        OBS3: [16, 16, 0, 25, 2, 120, 32, 47, 1, 47, 47, 1, 60, 3, 3, 255, 60, 3, 3, 200, 60, 3, 3, 0],
        UBL0: [16, 16, 0, 50, 2, 120, 0, 15, 1, 15, 15, 1, 100, 0, 30, 255, 20, 0, 30, 200, 20, 0, 30, 0],
        UBL1: [16, 16, 0, 50, 2, 120, 16, 31, 1, 31, 31, 1, 100, 0, 30, 255, 20, 0, 30, 200, 20, 0, 30, 0],
        UBL2: [16, 16, 0, 50, 2, 120, 32, 47, 1, 47, 47, 1, 100, 0, 30, 255, 20, 0, 30, 200, 20, 0, 30, 0],
        UBL3: [16, 16, 0, 50, 2, 120, 48, 63, 1, 63, 63, 1, 100, 0, 30, 255, 20, 0, 30, 200, 20, 0, 30, 0],
        UBS0: [16, 16, 0, 25, 2, 120, 0, 15, 1, 15, 15, 1, 100, 0, 30, 255, 20, 0, 30, 200, 20, 0, 30, 0],
        UBS1: [16, 16, 0, 25, 2, 120, 16, 31, 1, 31, 31, 1, 100, 0, 30, 255, 20, 0, 30, 200, 20, 0, 30, 0],
        UBS2: [16, 16, 0, 25, 2, 120, 32, 47, 1, 47, 47, 1, 100, 0, 30, 255, 20, 0, 30, 200, 20, 0, 30, 0],
        UBS3: [16, 16, 0, 25, 2, 120, 48, 63, 1, 63, 63, 1, 100, 0, 30, 255, 20, 0, 30, 200, 20, 0, 30, 0],
        WSL0: [16, 16, 0, 60, 0.5, 0.5, 128, 135, 1, 136, 143, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0],
        WSL1: [16, 16, 0, 60, 0.5, 0.5, 144, 151, 1, 152, 159, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0],
        WSS0: [16, 16, 0, 35, 0.5, 0.5, 128, 135, 1, 136, 143, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0],
        WSS1: [16, 16, 0, 35, 0.5, 0.5, 144, 151, 1, 152, 159, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0],
        WHL0: [16, 16, 0, 100, 2, 30, 160, 169, 1, 170, 175, 60, 200, 10, 10, 255, 190, 10, 10, 200, 120, 10, 10, 0],
        WHL1: [16, 16, 0, 100, 2, 30, 176, 185, 1, 186, 191, 60, 200, 10, 10, 255, 190, 10, 10, 200, 120, 10, 10, 0],
        WHS0: [16, 16, 0, 60, 2, 30, 160, 169, 1, 170, 175, 60, 200, 10, 10, 255, 190, 10, 10, 200, 120, 10, 10, 0],
        WHS1: [16, 16, 0, 60, 2, 30, 176, 185, 1, 186, 191, 60, 200, 10, 10, 255, 190, 10, 10, 200, 120, 10, 10, 0],
        WOL0: [16, 16, 0, 100, 2, 30, 160, 169, 1, 170, 175, 60, 60, 3, 3, 255, 60, 3, 3, 200, 60, 3, 3, 0],
        WOL1: [16, 16, 0, 100, 2, 30, 176, 185, 1, 186, 191, 60, 60, 3, 3, 255, 60, 3, 3, 200, 60, 3, 3, 0],
        WOS0: [16, 16, 0, 60, 2, 30, 160, 169, 1, 170, 175, 60, 60, 3, 3, 255, 60, 3, 3, 200, 60, 3, 3, 0],
        WOS1: [16, 16, 0, 60, 2, 30, 176, 185, 1, 186, 191, 60, 60, 3, 3, 255, 60, 3, 3, 200, 60, 3, 3, 0],
        WEL0: [16, 16, 0, 100, 2, 30, 160, 169, 1, 170, 175, 60, 60, 3, 35, 255, 60, 3, 35, 200, 60, 3, 35, 0],
        WEL1: [16, 16, 0, 100, 2, 30, 176, 185, 1, 186, 191, 60, 60, 3, 35, 255, 60, 3, 35, 200, 60, 3, 35, 0],
        WES0: [16, 16, 0, 60, 2, 30, 160, 169, 1, 170, 175, 60, 60, 3, 35, 255, 60, 3, 35, 200, 60, 3, 35, 0],
        WES1: [16, 16, 0, 60, 2, 30, 176, 185, 1, 186, 191, 60, 60, 3, 35, 255, 60, 3, 35, 200, 60, 3, 35, 0],
        WUL0: [16, 16, 0, 100, 2, 30, 160, 169, 1, 170, 175, 60, 100, 0, 30, 255, 20, 0, 30, 200, 20, 0, 30, 0],
        WUL1: [16, 16, 0, 100, 2, 30, 176, 185, 1, 186, 191, 60, 100, 0, 30, 255, 20, 0, 30, 200, 20, 0, 30, 0],
        WUS0: [16, 16, 0, 60, 2, 30, 160, 169, 1, 170, 175, 60, 100, 0, 30, 255, 20, 0, 30, 200, 20, 0, 30, 0],
        WUS1: [16, 16, 0, 60, 2, 30, 176, 185, 1, 186, 191, 60, 100, 0, 30, 255, 20, 0, 30, 200, 20, 0, 30, 0],
        WDL0: [16, 16, 1, 100, 2, 30, 160, 169, 1, 170, 175, 60, 60, 120, 20, 255, 60, 120, 20, 200, 60, 120, 20, 0],
        WDL1: [16, 16, 1, 100, 2, 30, 176, 185, 1, 186, 191, 60, 60, 120, 20, 255, 60, 120, 20, 200, 60, 120, 20, 0],
        WDS0: [16, 16, 1, 60, 2, 30, 160, 169, 1, 170, 175, 60, 60, 120, 20, 255, 60, 120, 20, 200, 60, 120, 20, 0],
        WDS1: [16, 16, 1, 60, 2, 30, 176, 185, 1, 186, 191, 60, 60, 120, 20, 255, 60, 120, 20, 200, 60, 120, 20, 0],
        WSX0: [16, 16, 0, 1, 1, 1, 106, 106, 1, 106, 106, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        WSX1: [16, 16, 0, 1, 1, 1, 107, 107, 1, 107, 107, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    
    UBR: {
        //INIT: ["TEST", 0, 1, 1, 50, 10, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        TEST: ["TestUberSplat", 0, 100, 1, 5, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        LSDS: ["DirtUberSplat", 0, 110, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        LSDM: ["DirtUberSplat", 0, 200, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        LSDL: ["DirtUberSplat", 0, 240, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        HCRT: ["CraterUberSplat", 0, 75, 0.2, 7, 6, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        UDSU: ["DarkSummonSpecial", 0, 200, 1, 0, 5, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DNCS: ["ScorchedUberSplat", 0, 200, 0.2, 300, 600, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        HMTP: ["TeleportTarget", 0, 200, 0.2, 0, 5, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        SCTP: ["TeleportTarget", 0, 200, 0.2, 0, 5, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        AMRC: ["TeleportTarget", 0, 200, 0.2, 0, 5, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DRKC: ["AuraRune9b", 0, 100, 0.2, 0, 5, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DOSB: ["ScorchedUberSplat", 0, 130, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DOMB: ["ScorchedUberSplat", 0, 200, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DOLB: ["ScorchedUberSplat", 0, 300, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DHSB: ["ScorchedUberSplat", 0, 130, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DHMB: ["ScorchedUberSplat", 0, 200, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DHLB: ["ScorchedUberSplat", 0, 300, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DUSB: ["ScorchedUberSplat", 0, 130, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DUMB: ["ScorchedUberSplat", 0, 200, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DULB: ["ScorchedUberSplat", 0, 300, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DNSB: ["ScorchedUberSplat", 0, 130, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DNMB: ["ScorchedUberSplat", 0, 200, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DNSA: ["ScorchedUberSplat", 0, 130, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DNMA: ["ScorchedUberSplat", 0, 200, 0.2, 5, 20, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        HSMA: ["HumanUberSplat", 0, 110, 1, 0, 10, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        HMED: ["HumanUberSplat", 0, 190, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        HLAR: ["HumanUberSplat", 0, 230, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        OSMA: ["OrcUberSplat", 0, 110, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        OMED: ["OrcUberSplat", 0, 200, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        OLAR: ["OrcUberSplat", 0, 240, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        USMA: ["UndeadUberSplat", 0, 170, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        UMED: ["UndeadUberSplat", 0, 200, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        ULAR: ["UndeadUberSplat", 0, 240, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        ESMA: ["AncientUberSplat", 0, 120, 5, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        EMDA: ["AncientUberSplat", 0, 200, 5, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        ESMB: ["NightElfUberSplat", 0, 110, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        EMDB: ["NightElfUberSplat", 0, 180, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        HTOW: ["HumanTownHallUberSplat", 0, 230, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        HCAS: ["HumanCastleUberSplat", 0, 230, 0.2, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        NGOL: ["GoldmineUberSplat", 0, 180, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        THND: ["ThunderClapUbersplat", 1, 280, 0.2, 2, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        NDGS: ["DemonGateUberSplat", 1, 375, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        CLTS: ["ThornyShieldUberSplat", 0, 200, 0.5, 30, 10, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        HFS1: ["FlameStrike1", 1, 300, 0.25, 0.1, 0.9, 255, 128, 128, 0, 255, 255, 192, 256, 256, 0, 0, 0],
        HFS2: ["FlameStrike2", 1, 300, 0.25, 0.1, 0.9, 0, 255, 128, 0, 128, 255, 192, 255, 256, 0, 0, 0],
        USBR: ["BurrowSplat", 0, 100, 0.5, 30, 10, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        NLAR: ["NagaTownHallUberSplat", 0, 230, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        NMED: ["NagaTownHallUberSplat", 0, 180, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DPSW: ["DarkPortalUberSplatSW", 0, 400, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0],
        DPSE: ["DarkPortalUberSplatSE", 0, 400, 1, 0, 2, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0]
    }
};
Mdx.Particle = function  () {
    this.position = vec3.create();
    this.velocity = vec3.create();
    this.orientation = 0;
    this.gravity = 0;
};

Mdx.Particle.prototype = {
    reset: function (emitter, sequence, frame, counter) {
        var scale = emitter.node.scale;
        var speed = emitter.getSpeed(sequence, frame, counter);
        var latitude = emitter.getLatitude(sequence, frame, counter);
        var longitude = emitter.getLongitude(sequence, frame, counter);
        var lifespan = emitter.getLifespan(sequence, frame, counter);
        var gravity = emitter.getGravity(sequence, frame, counter) * scale[2];
        var position = this.position;
        var worldMatrix = emitter.node.worldMatrix;

        this.alive = true;
        this.health = lifespan;

        vec3.transformMat4(position, emitter.node.pivot, emitter.node.worldMatrix);

        var velocity = emitter.heapVelocity;
        var rotation = emitter.heapMat;
        var velocityStart = emitter.heapVel1;
        var velocityEnd = emitter.heapVel2;

        mat4.identity(rotation);
        mat4.rotateZ(rotation, rotation, Math.randomRange(-Math.PI, Math.PI));
        mat4.rotateY(rotation, rotation, Math.randomRange(-latitude, latitude));

        vec3.transformMat4(velocity, vec3.UNIT_Z, rotation);
        vec3.normalize(velocity, velocity);

        vec3.add(velocityEnd, position, velocity);

        vec3.transformMat4(velocityStart, position, worldMatrix);
        vec3.transformMat4(velocityEnd, velocityEnd, worldMatrix);

        vec3.subtract(velocity, velocityEnd, velocityStart);
        vec3.normalize(velocity, velocity);
        vec3.scale(velocity, velocity, speed);

        vec3.multiply(this.velocity, velocity, scale);

        this.orientation = Math.randomRange(0, Math.PI * 2);
        this.gravity = gravity;
    },

    update: function (emitter, sequence, frame, counter, context) {
        if (this.alive) {
            this.health -= context.frameTimeS;

            this.velocity[2] -= this.gravity * context.frameTimeS;

            vec3.scaleAndAdd(this.position, this.position, this.velocity, context.frameTimeS);
        }
    }
};
Mdx.ParticleEmitter = function (emitter, model, instance, context, customPaths) {
    var i, l;
    var keys = Object.keys(emitter);

    for (i = keys.length; i--;) {
        this[keys[i]] = emitter[keys[i]];
    }

    this.lastCreation = 0;

    var path = emitter.path.replace(/\\/g, "/").toLowerCase().replace(".mdl", ".mdx");

    this.spawnModel = context.loadInternalResource(customPaths(path));
    this.spawnModel.setSequence(0);

    var particles;

    // This is the maximum number of particles that are going to exist at the same time
    if (emitter.tracks.emissionRate) {
        var tracks = emitter.tracks.emissionRate;
        var biggest = 0;

        for (i = 0, l = tracks.length; i < l; i++) {
            var track = tracks[i];

            if (track.vector > biggest) {
                biggest = track.vector;
            }
        }
        // For a reason I can't understand, biggest*lifespan isn't enough for emission rate tracks, multiplying by 2 seems to be the lowest reasonable value that works
        particles = Math.round(biggest * Math.ceil(emitter.lifespan) * 2);
    } else {
        particles = Math.round(emitter.emissionRate * Math.ceil(emitter.lifespan));
    }

    this.particles = [];
    this.reusables = [];

    for (i = particles; i--;) {
        this.particles[i] = new Mdx.Particle();
        this.reusables.push(i);
    }

    this.node = instance.skeleton.nodes[emitter.node.index];
    this.sd = new Mdx.SDContainer(emitter.tracks, model);

    // To avoid heap alocations
    this.heapVelocity = vec3.create();
    this.heapMat = mat4.create();
    this.heapVel1 = vec3.create();
    this.heapVel3 = vec3.create();
};

Mdx.ParticleEmitter.prototype = {
    update: function (allowCreate, sequence, frame, counter, context) {
        var i, l;

        if (this.spawnModel) {
            this.spawnModel.update(context);
        }

        for (i = 0, l = this.particles.length; i < l; i++) {
            var particle = this.particles[i];

            if (particle.alive) {
                if (particle.health <= 0) {
                    particle.alive = false;

                    this.reusables.push(i);
                } else {
                    particle.update(this, sequence, frame, counter, context);
                }
            }
        }

        if (allowCreate && this.shouldRender(sequence, frame, counter)) {
            this.lastCreation += 1;

            var amount = this.getEmissionRate(sequence, frame, counter) * context.frameTimeS * this.lastCreation;

            if (amount >= 1) {
                this.lastCreation = 0;

                for (i = 0; i < amount; i++) {
                    if (this.reusables.length > 0) {
                        this.particles[this.reusables.pop()].reset(this, sequence, frame, counter);
                    }
                }
            }
        }
    },

    render: function (context) {
        var gl = context.gl;
        var spawnModel = this.spawnModel;

        if (spawnModel) {
            for (var i = 0, l = this.particles.length; i < l; i++) {
                var particle = this.particles[i];

                if (particle.health > 0) {
                    var p = particle.position;

                    gl.pushMatrix();
                    gl.translate(p);
                    gl.rotate(particle.orientation, vec3.UNIT_Z);

                    spawnModel.setScaleVector(this.node.scale);
                    spawnModel.render(context);

                    gl.popMatrix();
                }
            }
        }
    },

    shouldRender: function (sequence, frame, counter) {
        return this.getVisibility(sequence, frame, counter) > 0.75;
    },

    getSpeed: function (sequence, frame, counter) {
        return this.sd.getKPES(sequence, frame, counter, this.speed);
    },

    getLatitude: function (sequence, frame, counter) {
        return this.sd.getKPLT(sequence, frame, counter, this.latitude);
    },

    getLongitude: function (sequence, frame, counter) {
        return this.sd.getKPLN(sequence, frame, counter, this.longitude);
    },

    getLifespan: function (sequence, frame, counter) {
        return this.sd.getKPEL(sequence, frame, counter, this.lifespan);
    },

    getGravity: function (sequence, frame, counter) {
        return this.sd.getKPEG(sequence, frame, counter, this.gravity);
    },

    getEmissionRate: function (sequence, frame, counter) {
        return this.sd.getKPEE(sequence, frame, counter, this.emissionRate);
    },

    getVisibility: function (sequence, frame, counter) {
        return this.sd.getKPEV(sequence, frame, counter, 1);
    }
};
Mdx.Particle2 = function () {
    this.id = 0;
    this.health = 0;
    this.head = true;
    this.position = [];
    this.worldLocation = [];
    this.velocity = [];
    this.color = [];
    this.gravity = 0;
    this.scale = 1;
    this.index = 0;
};

Mdx.Particle2.prototype = {
    reset: function (emitter, head, id, sequence, frame, counter) {
        var pivot = emitter.node.pivot;
        var worldMatrix = emitter.node.worldMatrix;
        var scale = emitter.node.scale;
        var width = emitter.getWidth(sequence, frame, counter) * 0.5 * scale[0];
        var length = emitter.getLength(sequence, frame, counter) * 0.5 * scale[1];
        var speed = emitter.getSpeed(sequence, frame, counter) + Math.randomRange(-emitter.variation, emitter.variation);
        var latitude = Math.toRad(emitter.getLatitude(sequence, frame, counter));
        var gravity = emitter.getGravity(sequence, frame, counter) * scale[2];
        var color = emitter.colors[0];
        var localPosition = emitter.particleLocalPosition;
        var position = emitter.particlePosition;
        var rotation = emitter.particleRotation;
        var velocity = emitter.particleVelocity;
        var velocityStart = emitter.particleVelocityStart;
        var velocityEnd = emitter.particleVelocityEnd;
        var modelSpace = emitter.modelSpace;
        
        localPosition[0] = pivot[0] + Math.randomRange(-width, width);
        localPosition[1] = pivot[1] + Math.randomRange(-length, length);
        localPosition[2] = pivot[2];
        
        if (modelSpace) {
            vec3.copy(position, localPosition);
        } else {
            vec3.transformMat4(position, localPosition, worldMatrix);
        }
        
        mat4.identity(rotation);
        mat4.rotateZ(rotation, rotation, Math.randomRange(-Math.PI, Math.PI));
        mat4.rotateY(rotation, rotation, Math.randomRange(-latitude, latitude));

        vec3.transformMat4(velocity, vec3.UNIT_Z, rotation);
        vec3.normalize(velocity, velocity);
        
        if (emitter.node.nodeImpl.modelSpace) {
            vec3.scale(velocity, velocity, speed);
        } else {
            vec3.add(velocityEnd, position, velocity);

            vec3.transformMat4(velocityStart, position, worldMatrix);
            vec3.transformMat4(velocityEnd, velocityEnd, worldMatrix);

            vec3.subtract(velocity, velocityEnd, velocityStart);
            vec3.normalize(velocity, velocity);
            vec3.scale(velocity, velocity, speed);
        }
        
        if (!head) {
            var tailLength = emitter.tailLength * 0.5;

            vec3.scaleAndAdd(position, velocity, -tailLength);
        }

        this.id = id;
        this.health = emitter.lifespan;
        this.head = head;

        vec3.copy(this.position, position);
        vec3.multiply(this.velocity, velocity, scale);
        vec4.copy(this.color, color);

        this.gravity = gravity;
        this.scale = 1;
        this.index = 0;
    },

    update: function (emitter, sequence, frame, counter, context) {
        var dt = context.frameTimeS;
        var position = this.position;

        this.health -= dt;
        this.velocity[2] -= this.gravity * dt;
        
        vec3.scaleAndAdd(position, position, this.velocity, dt);
        
        if (emitter.modelSpace) {
            vec3.transformMat4(this.worldLocation, position, emitter.node.worldMatrix);
        } else {
            vec3.copy(this.worldLocation, position);
        }
        
        var lifeFactor = (emitter.lifespan - this.health) / emitter.lifespan;
        var tempFactor;
        var scale;
        var index;
        
        if (lifeFactor < emitter.timeMiddle) {
            tempFactor = lifeFactor / emitter.timeMiddle;
        
            scale = Math.lerp(emitter.segmentScaling[0], emitter.segmentScaling[1], tempFactor);
            vec4.lerp(this.color, emitter.colors[0], emitter.colors[1], tempFactor);
            
            if (this.head) {
                index = Math.lerp(emitter.headInterval[0], emitter.headInterval[1], tempFactor);
            } else {
                index = Math.lerp(emitter.tailInterval[0], emitter.tailInterval[1], tempFactor);
            }
        } else {
            tempFactor = (lifeFactor - emitter.timeMiddle) / (1 - emitter.timeMiddle);
            
            scale = Math.lerp(emitter.segmentScaling[1], emitter.segmentScaling[2], tempFactor);
            vec4.lerp(this.color, emitter.colors[1], emitter.colors[2], tempFactor);
            
            if (this.head) {
                index = Math.lerp(emitter.headDecayInterval[0], emitter.headDecayInterval[1], tempFactor);
            } else {
                index = Math.lerp(emitter.tailDecayInterval[0], emitter.tailDecayInterval[1], tempFactor);
            }
        }

        this.index = Math.floor(index);
        this.scale = scale;
    }
};
Mdx.ParticleEmitter2 = function (emitter, model, instance, ctx) {
    var i, l;
    var keys = Object.keys(emitter);

    for (i = keys.length; i--;) {
        this[keys[i]] = emitter[keys[i]];
    }

    this.emitter = emitter;
    this.model = model;
    this.texture = model.textures[this.textureId];

    var particles;

    // This is the maximum number of particles that are going to exist at the same time
    if (this.tracks.emissionRate) {
        var tracks = this.tracks.emissionRate.tracks;
        var biggest = 0;

        for (i = 0, l = tracks.length; i < l; i++) {
            var track = tracks[i];

            if (track.vector > biggest) {
                biggest = track.vector;
            }
        }
        // For a reason I can't understand, biggest*lifespan isn't enough for emission rate tracks, multiplying by 2 seems to be the lowest reasonable value that works
        particles = Math.ceil(biggest) * Math.ceil(this.lifespan) * 2;
    } else {
        // +3 because for some reason rate*lifespan isn't working properly
        // Do I have a problem with the update loop?
        particles = Math.ceil(this.emissionRate) * Math.ceil(this.lifespan) + 3;
    }

    this.head = (this.headOrTail === 0 || this.headOrTail === 2);
    this.tail = (this.headOrTail === 1 || this.headOrTail === 2);

    if (this.head && this.tail) {
        particles *= 2;
    }

    if (!emitter.buffer) {
        emitter.buffer = ctx.createBuffer();
        emitter.data = new Float32Array(30 * particles);

        ctx.bindBuffer(ctx.ARRAY_BUFFER, emitter.buffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, emitter.data, ctx.DYNAMIC_DRAW);
    }

    this.particles = [];
    this.reusables = [];
    this.activeParticles = [];

    for (i = 0, l = particles; i < l; i++) {
        this.particles[i] = new Mdx.Particle2();
        this.reusables.push(particles - i - 1);
    }

    this.cellWidth = 1 / this.columns;
    this.cellHeight = 1 / this.rows;
    this.colors = [];

    var colors = this.segmentColor;
    var alpha = this.segmentAlpha;

    for (i = 0; i < 3; i++) {
        this.colors[i] = [Math.floor(colors[i][0] * 255), Math.floor(colors[i][1] * 255), Math.floor(colors[i][2] * 255), alpha[i]];
    }

    this.node = instance.skeleton.nodes[this.node.index];
    this.sd = new Mdx.SDContainer(emitter.tracks, model);

    // Avoid heap alocations in Particle2.reset
    this.particleLocalPosition = vec3.create();
    this.particlePosition = vec3.create();
    this.particleRotation = mat4.create();
    this.particleVelocity = vec3.create();
    this.particleVelocityStart = vec3.create();
    this.particleVelocityEnd = vec3.create();

    this.xYQuad = this.node.nodeImpl.xYQuad;

    this.dimensions = [this.columns, this.rows];

    this.modelSpace = this.node.nodeImpl.modelSpace;
    this.currentEmission = 0;
};

Mdx.ParticleEmitter2.prototype = {
    update: function (allowCreate, sequence, frame, counter, context) {
        var particles = this.particles;
        var reusables = this.reusables;
        var activeParticles = this.activeParticles;
        var activeParticlesCount = activeParticles.length;
        var i, l;
        var particle;

        if (activeParticles.length > 0) {
            // First stage: remove dead particles.
            // The used particles array is a queue, dead particles will always come first.
            // As of the time of writing, the easiest and fastest way to implement a queue in Javascript is a normal array.
            // To add items, you push, to remove items, the array is reversed and you pop.
            // So the first stage reverses the array, and then keeps checking the last element for its health.
            // As long as we hit a dead particle, pop, and check the new last element.

            // Ready for pop mode
            activeParticles.reverse();

            particle = particles[activeParticles[activeParticles.length - 1]];

            while (particle && particle.health <= 0) {
                activeParticles.pop();
                this.reusables.push(particle.id);

                // Need to recalculate the length each time
                particle = particles[activeParticles[activeParticles.length - 1]];
            }

            // Ready for push mode
            activeParticles.reverse()

            // Second stage: update the living particles.
            // All the dead particles were removed, so a simple loop is all that's required.
            for (i = 0, l = activeParticles.length; i < l; i++) {
                particle = particles[activeParticles[i]];

                particle.update(this, sequence, frame, counter, context);
            }
        }

        // Third stage: create new particles if needed.
        if (allowCreate && this.shouldRender(sequence, frame, counter)) {
            this.currentEmission += this.getEmissionRate(sequence, frame, counter) * context.frameTimeS;

            if (this.currentEmission >= 1) {
                var amount = Math.floor(this.currentEmission);
                var index;

                for (i = 0; i < amount; i++) {
                    if (this.head && reusables.length > 0) {
                        index = reusables.pop();

                        particles[index].reset(this, true, index, sequence, frame, counter);
                        activeParticles.push(index);
                    }

                    if (this.tail && reusables.length > 0) {
                        index = reusables.pop();

                        particles[index].reset(this, false, index, sequence, frame, counter);
                        activeParticles.push(index);
                    }

                    this.currentEmission -= 1;
                }
            }
        }
    },

    updateHW: function (baseParticle, billboardedParticle) {
        var activeParticles = this.activeParticles;
        var data = this.emitter.data;
        var particles = this.particles;
        var columns = this.columns;
        var particle, index, position, color;
        var pv1, pv2, pv3, pv4, csx, csy, csz;
        var rect;

        // Choose between a default rectangle or billboarded one
        if (this.xYQuad) {
            rect = baseParticle;
        } else {
            rect = billboardedParticle;
        }

        pv1 = rect[0];
        pv2 = rect[1];
        pv3 = rect[2];
        pv4 = rect[3];
        csx = rect[4];
        csy = rect[5];
        csz = rect[6];

        var scale, textureIndex, left, top, right, bottom, r, g, b, a, px, py, pz;
        var v1x, v1y, v1z, v2x, v2y, v2z, v3x, v3y, v3z, v4x, v4y, v4z;
        var lta, lba, rta, rba, rgb;
        var nodeScale = this.node.scale;

        for (var i = 0, l = activeParticles.length; i < l; i++) {
            particle = particles[activeParticles[i]];
            index = i * 30;
            position = particle.worldLocation;
            scale = particle.scale;
            textureIndex = particle.index;
            left = textureIndex % columns;
            top = Math.floor(textureIndex / columns);
            right = left + 1;
            bottom = top + 1;
            color = particle.color;
            r = Math.floor(color[0]);
            g = Math.floor(color[1]);
            b = Math.floor(color[2]);
            a = Math.floor(color[3]);
            px = position[0];
            py = position[1];
            pz = position[2];

            if (particle.head) {
                v1x = px + pv1[0] * scale * nodeScale[0];
                v1y = py + pv1[1] * scale * nodeScale[1];
                v1z = pz + pv1[2] * scale * nodeScale[2];
                v2x = px + pv2[0] * scale * nodeScale[0];
                v2y = py + pv2[1] * scale * nodeScale[1];
                v2z = pz + pv2[2] * scale * nodeScale[2];
                v3x = px + pv3[0] * scale * nodeScale[0];
                v3y = py + pv3[1] * scale * nodeScale[1];
                v3z = pz + pv3[2] * scale * nodeScale[2];
                v4x = px + pv4[0] * scale * nodeScale[0];
                v4y = py + pv4[1] * scale * nodeScale[1];
                v4z = pz + pv4[2] * scale * nodeScale[2];
            } else {
                var tailLength = this.tailLength;
                var v = particle.velocity;
                var offsetx = tailLength * v[0];
                var offsety = tailLength * v[1];
                var offsetz = tailLength * v[2];

                var px2 = px + offsetx;
                var py2 = py + offsety;
                var pz2 = pz + offsetz;

                px -= offsetx;
                py -= offsety;
                pz -= offsetz;
                /*
                v1x = px2 - csx[0] * scale + csz[0] * scale;
                v1y = py2 - csx[1] * scale + csz[1] * scale;
                v1z = pz2 - csx[2] * scale + csz[2] * scale;

                v2x = px - csx[0] * scale - csz[0] * scale;
                v2y = py - csx[1] * scale - csz[1] * scale;
                v2z = pz - csx[2] * scale - csz[2] * scale;
                v3x = px + csx[0] * scale - csz[0] * scale;
                v3y = py + csx[1] * scale - csz[1] * scale;
                v3z = pz + csx[2] * scale - csz[2] * scale;
                v4x = px2 + csx[0] * scale + csz[0] * scale;
                v4y = py2 + csx[1] * scale + csz[1] * scale;
                v4z = pz2 + csx[2] * scale + csz[2] * scale;
                */
                v1x = px2 - csx[0] * scale * nodeScale[0];
                v1y = py2 - csx[1] * scale * nodeScale[1];
                v1z = pz2 - csx[2] * scale * nodeScale[2];

                v2x = px - csx[0] * scale * nodeScale[0];
                v2y = py - csx[1] * scale * nodeScale[1];
                v2z = pz - csx[2] * scale * nodeScale[2];

                v3x = px + csx[0] * scale * nodeScale[0];
                v3y = py + csx[1] * scale * nodeScale[1];
                v3z = pz + csx[2] * scale * nodeScale[2];

                v4x = px2 + csx[0] * scale * nodeScale[0];
                v4y = py2 + csx[1] * scale * nodeScale[1];
                v4z = pz2 + csx[2] * scale * nodeScale[2];
            }

            lta = encodeFloat3(left, top, a);
            lba = encodeFloat3(left, bottom, a);
            rta = encodeFloat3(right, top, a);
            rba = encodeFloat3(right, bottom, a);
            rgb = encodeFloat3(r, g, b);

            data[index + 0] = v1x;
            data[index + 1] = v1y;
            data[index + 2] = v1z;
            data[index + 3] = lta;
            data[index + 4] = rgb;

            data[index + 5] = v2x;
            data[index + 6] = v2y;
            data[index + 7] = v2z;
            data[index + 8] = lba;
            data[index + 9] = rgb;

            data[index + 10] = v3x;
            data[index + 11] = v3y;
            data[index + 12] = v3z;
            data[index + 13] = rba;
            data[index + 14] = rgb;

            data[index + 15] = v1x;
            data[index + 16] = v1y;
            data[index + 17] = v1z;
            data[index + 18] = lta;
            data[index + 19] = rgb;

            data[index + 20] = v3x;
            data[index + 21] = v3y;
            data[index + 22] = v3z;
            data[index + 23] = rba;
            data[index + 24] = rgb;

            data[index + 25] = v4x;
            data[index + 26] = v4y;
            data[index + 27] = v4z;
            data[index + 28] = rta;
            data[index + 29] = rgb;
        }
    },

    render: function (textureMap, shader, context) {
        var ctx = context.gl.ctx;
        var particles = this.activeParticles.length;

        if (particles > 0) {
            ctx.disable(ctx.CULL_FACE);
            ctx.enable(ctx.DEPTH_TEST);
            ctx.depthMask(0);
            ctx.enable(ctx.BLEND);

            switch (this.filterMode) {
                // Blend
                case 0:
                    ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
                    break;
                    // Additive
                case 1:
                    ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE);
                    break;
                    // Modulate
                case 2:
                    ctx.blendFunc(ctx.ZERO, ctx.SRC_COLOR);
                    break;
                    // Modulate 2X
                case 3:
                    ctx.blendFunc(ctx.DEST_COLOR, ctx.SRC_COLOR);
                    break;
                    // Add Alpha
                case 4:
                    ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE);
                    break;
            }

            this.model.bindTexture(this.texture, 0, textureMap, context);

            ctx.uniform2fv(shader.variables.u_dimensions, this.dimensions);

            this.updateHW(context.camera.rect, context.camera.billboardedRect);

            ctx.bindBuffer(ctx.ARRAY_BUFFER, this.emitter.buffer);
            ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, this.emitter.data.subarray(0, particles * 30 + 1));

            ctx.vertexAttribPointer(shader.variables.a_position, 3, ctx.FLOAT, false, 20, 0);
            ctx.vertexAttribPointer(shader.variables.a_uva_rgb, 2, ctx.FLOAT, false, 20, 12);

            ctx.drawArrays(ctx.TRIANGLES, 0, particles * 6);
        }
    },

    shouldRender: function (sequence, frame, counter) {
        return this.getVisibility(sequence, frame, counter) > 0.75;
    },

    getWidth: function (sequence, frame, counter) {
        return this.sd.getKP2W(sequence, frame, counter, this.width);
    },

    getLength: function (sequence, frame, counter) {
        return this.sd.getKP2N(sequence, frame, counter, this.length);
    },

    getSpeed: function (sequence, frame, counter) {
        return this.sd.getKP2S(sequence, frame, counter, this.speed);
    },

    getLatitude: function (sequence, frame, counter) {
        return this.sd.getKP2L(sequence, frame, counter, this.latitude);
    },


    getGravity: function (sequence, frame, counter) {
        return this.sd.getKP2G(sequence, frame, counter, this.gravity);
    },

    getEmissionRate: function (sequence, frame, counter) {
        return this.sd.getKP2E(sequence, frame, counter, this.emissionRate);
    },

    getVisibility: function (sequence, frame, counter) {
        return this.sd.getKP2V(sequence, frame, counter, 1);
    }

    //getVariation: function (sequence, frame, counter) {
    //    return this.sd.getKP2R(sequence, frame, counter, ?);
    //}
};
Mdx.Ribbon = function (emitter, sequence, frame, counter) {
    this.alive = true;
    this.health = emitter.lifespan;

    var position = emitter.node.pivot;
    var heightBelow = emitter.getHeightBelow(sequence, frame, counter);
    var heightAbove = emitter.getHeightAbove(sequence, frame, counter);

    var p1 = [position[0], position[1] - heightBelow, position[2]];
    var p2 = [position[0], position[1] + heightAbove, position[2]];

    vec3.transformMat4(p1, p1, emitter.node.worldMatrix);
    vec3.transformMat4(p2, p2, emitter.node.worldMatrix);

    this.p1 = p1;
    this.p2 = p2;
};

Mdx.Ribbon.prototype = {
    update: function (emitter, context) {
        this.health -= context.frameTimeS;

        var zvelocity = emitter.gravity * context.frameTimeS * context.frameTimeS;

        this.p1[2] -= zvelocity;
        this.p2[2] -= zvelocity;
    }
};
Mdx.RibbonEmitter = function (emitter, model, instance, ctx) {
    var i, l;
    var keys = Object.keys(emitter);

    for (i = keys.length; i--;) {
        this[keys[i]] = emitter[keys[i]];
    }

    var ribbons = Math.ceil(this.emissionRate * this.lifespan);

    this.emitter = emitter;
    this.model = model;
    this.textures = model.textures;

    this.maxRibbons = ribbons;
    this.lastCreation = 0;
    this.ribbons = [];

    if (!emitter.buffer) {
        emitter.data = new Float32Array(ribbons * 10);
        emitter.buffer = ctx.createBuffer();

        ctx.bindBuffer(ctx.ARRAY_BUFFER, emitter.buffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, emitter.data, ctx.DYNAMIC_DRAW);
    }

    this.cellWidth = 1 / this.columns;
    this.cellHeight = 1 / this.rows;

    var groups = [[], [], [], []];
    var layers = model.materials[this.materialId];

    for (i = 0, l = layers.length; i < l; i++) {
        var layer = new Mdx.ShallowLayer(layers[i]);

        groups[layers[i].renderOrder].push(layer);
    }

    this.layers = groups[0].concat(groups[1]).concat(groups[2]).concat(groups[3]);

    this.node = instance.skeleton.nodes[this.node.index];
    this.sd = new Mdx.SDContainer(emitter.tracks, model);

    // Avoid heap allocations
    this.colorVec = vec3.create();
    this.modifierVec = vec4.create();
    this.uvoffsetVec = vec3.create();
    this.defaultUvoffsetVec = vec3.fromValues(0, 0, 0);
};

Mdx.RibbonEmitter.prototype = {
    update: function (allowCreate, sequence, frame, counter, context) {
        var i, l;

        for (i = 0, l = this.ribbons.length; i < l; i++) {
            this.ribbons[i].update(this, context);
        }

        while (this.ribbons.length > 0 && this.ribbons[0].health <= 0) {
            this.ribbons.shift();
        }

        if (allowCreate && this.shouldRender(sequence, frame, counter)) {
            this.lastCreation += 1;

            var amount = this.emissionRate * context.frameTimeS * this.lastCreation;

            if (amount >= 1) {
                this.lastCreation = 0;

                for (i = 0; i < amount; i++) {
                    this.ribbons.push(new Mdx.Ribbon(this, sequence, frame, counter));
                }
            }
        }
    },

    render: function (sequence, frame, counter, textureMap, shader, context) {
        var ctx = context.gl.ctx;
        var i, l;
        var ribbons = Math.min(this.ribbons.length, this.maxRibbons);

        if (ribbons > 2) {
            var textureSlot = this.getTextureSlot(sequence, frame, counter);
            //var uvOffsetX = (textureSlot % this.columns) / this.columns;
            var uvOffsetY = Math.floor(textureSlot / this.rows) / this.rows;
            var uvFactor = 1 / ribbons * this.cellWidth;
            var top = uvOffsetY;
            var bottom = uvOffsetY + this.cellHeight;
            var data = this.emitter.data;
            var index, ribbon, left, right, v1, v2;

            for (i = 0, l = ribbons; i < l; i++) {
                index = i * 10;
                ribbon = this.ribbons[i];
                left = (ribbons - i) * uvFactor;
                right = left - uvFactor;
                v1 = ribbon.p2;
                v2 = ribbon.p1;

                data[index + 0] = v1[0];
                data[index + 1] = v1[1];
                data[index + 2] = v1[2];
                data[index + 3] = left;
                data[index + 4] = top;

                data[index + 5] = v2[0];
                data[index + 6] = v2[1];
                data[index + 7] = v2[2];
                data[index + 8] = right;
                data[index + 9] = bottom;
            }

            ctx.bindBuffer(ctx.ARRAY_BUFFER, this.emitter.buffer);
            ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, this.emitter.data);

            ctx.vertexAttribPointer(shader.variables.a_position, 3, ctx.FLOAT, false, 20, 0);
            ctx.vertexAttribPointer(shader.variables.a_uv, 2, ctx.FLOAT, false, 20, 12);

            var textureId, color, uvoffset, modifier = this.modifierVec;
            var layer, layers = this.layers;
            
            for (i = 0, l = layers.length; i < l; i++) {
                layer = layers[i].layer;

                layer.bind(shader, ctx);

                textureId = layer.getTextureId(sequence, frame, counter);

                this.model.bindTexture(this.textures[textureId], 0, textureMap, context);

                color = this.getColor(sequence, frame, counter);
                uvoffset = this.defaultUvoffsetVec;

                modifier[0] = color[0];
                modifier[1] = color[1];
                modifier[2] = color[2];
                modifier[3] = this.getAlpha(sequence, frame, counter);

                ctx.uniform4fv(shader.variables.u_modifier, modifier);

                if (layer.textureAnimationId !== -1 && this.model.textureAnimations) {
                    var textureAnimation = this.model.textureAnimations[layer.textureAnimationId];
                    // What is Z used for?
                    uvoffset = textureAnimation.getTranslation(sequence, frame, counter);
                }

                ctx.uniform3fv(shader.variables.u_uv_offset, uvoffset);

                ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, ribbons * 2);

                layer.unbind(shader, ctx);
            }
        }
    },

    shouldRender: function (sequence, frame, counter) {
        return this.getVisibility(sequence, frame, counter) > 0.75;
    },

    getHeightBelow: function (sequence, frame, counter) {
        return this.sd.getKRHB(sequence, frame, counter, this.heightBelow);
    },

    getHeightAbove: function (sequence, frame, counter) {
        return this.sd.getKRHA(sequence, frame, counter, this.heightAbove);
    },

    getTextureSlot: function (sequence, frame, counter) {
        return this.sd.getKRTX(sequence, frame, counter, 0);
    },

    getColor: function (sequence, frame, counter) {
        return this.sd.getKRCO(sequence, frame, counter, this.color);
    },

    getAlpha: function (sequence, frame, counter) {
        return this.sd.getKRAL(sequence, frame, counter, this.alpha);
    },

    getVisibility: function (sequence, frame, counter) {
        return this.sd.getKRVS(sequence, frame, counter, 1);
    }
};
window["M3"] = {};
M3.Parser = (function () {
    var MD34_HEADER = 0x4d443334;

    function readColor(reader) {
        return readUint8Array(reader, 4);
    }

    function readUint16Pair(reader) {
        return readUint16Array(reader, 2);
    }

    function readBoundingSphere(reader) {
        return {minBorder: readVector3(reader), maxBorder: readVector3(reader), radius: readFloat32(reader)};
    }

    function parseReferenceString(reader, indexEntries) {
        var reference = new Reference(reader);
        var indexEntry = indexEntries[reference.index];
        var offset = tell(reader);
        var data;

        seek(reader, indexEntry.offset);

        data = read(reader, reference.entries);

        seek(reader, offset);

        return data;
    }

    function parseVertices(reader, indexEntries, uvSetCount) {
        var reference = new Reference(reader);
        var offset = tell(reader);
        var indexEntry = indexEntries[reference.index];
        var entries;

        seek(reader, indexEntry.offset);

        entries = readUint32Array(reader, reference.entries / 4);

        seek(reader, offset);

        return entries;
    }

    function parseSingleReference(reader, indexEntries, Func) {
        var reference = new Reference(reader);
        var indexEntry = indexEntries[reference.index];
        var offset = tell(reader);
        var entry;

        seek(reader, indexEntry.offset);

        entry = new Func(reader, indexEntries, indexEntry.version);

        seek(reader, offset);

        return entry;
    }

    function parseReference(reader, indexEntries, Func) {
        var reference = new Reference(reader);
        var indexEntry = indexEntries[reference.index];
        var offset = tell(reader);
        var entries = [];
        var entriesCount = reference.entries;

        seek(reader, indexEntry.offset);

        for (var i = 0, l = entriesCount; i < entriesCount; i++) {
            entries[i] = new Func(reader, indexEntries, indexEntry.version);
        }

        seek(reader, offset);

        return entries;
    }

    function parseReferenceByVal(reader, indexEntries, Func) {
        var reference = new Reference(reader);
        var indexEntry = indexEntries[reference.index];
        var offset = tell(reader);
        var entries = [];
        var entriesCount = reference.entries;

        seek(reader, indexEntry.offset);

        for (var i = 0, l = entriesCount; i < entriesCount; i++) {
            entries[i] = Func(reader, indexEntries, indexEntry.version);
        }

        seek(reader, offset);

        return entries;
    }

    // Parse by value using a typed array
    function parseReferenceByValTyped(reader, indexEntries, Func) {
        var reference = new Reference(reader);
        var offset = tell(reader);
        var indexEntry = indexEntries[reference.index];
        var entries;

        seek(reader, indexEntry.offset);

        entries = Func(reader, reference.entries);

        seek(reader, offset);

        return entries;
    }

    function parseSeqeunceData(reader, indexEntries, Func) {
        var reference = new Reference(reader);
        var indexEntry = indexEntries[reference.index];
        var offset = tell(reader);
        var entries = [];

        seek(reader, indexEntry.offset);

        for (var i = 0, l = reference.entries; i < l; i++) {
            entries[i] = SD(reader, indexEntries, Func);
        }

        seek(reader, offset);

        return entries;
    }

    function readEvent(reader, indexEntries, version) {
        var e = {};

        e.version = version;
        e.name = parseReferenceString(reader, indexEntries);
        e.unknown0 = readInt32(reader);
        e.unknown1 = readInt16(reader);
        e.unknown2 = readUint16(reader);
        e.matrix = readMatrix(reader);
        e.unknown3 = readInt32(reader);
        e.unknown4 = readInt32(reader);
        e.unknown5 = readInt32(reader);

        if (version > 0) {
            e.unknown6 = readInt32(reader);
            e.unknown7 = readInt32(reader);
        }

        if (version > 1) {
            e.unknown8 = readInt32(reader);
        }

        return e;
    }

    function SD(reader, indexEntries, Func) {
        var keys = parseReferenceByValTyped(reader, indexEntries, readInt32Array);
        var flags = readUint32(reader);
        var biggestKey = readUint32(reader);
        var values = parseReferenceByVal(reader, indexEntries, Func);

        return {keys: keys, flags: flags, biggestKey: biggestKey, values: values};
    }

    function AnimationReference(reader, Func) {
        this.interpolationType = readUint16(reader);
        this.animFlags = readUint16(reader);
        this.animId = readUint32(reader);
        this.initValue = Func(reader);
        this.nullValue = Func(reader);
        this.unknown0 = readFloat32(reader);
    }
    /*
    function TMD(reader, indexEntries, version) {
        this.version = version;
    }

    function BBSC(reader, indexEntries, version) {
        this.version = version;
    }

    function AttachmentVolume(reader, indexEntries, version) {
        this.version = version;
        this.bone0 = readUint32(reader);
        this.bone1 = readUint32(reader);
        this.type = readUint32(reader);
        this.bone2 = readUint32(reader);
        this.matrix = readMatrix(reader);
        this.unknown0 = parseReferenceByVal(reader, indexEntries, readVector3);
        this.unknown1 = parseReferenceByValTyped(reader, indexEntries, readUint16Array);
        this.size = readVector3(reader);
    }
    */
    function BoundingShape(reader) {
        this.shape = readUint32(reader); // 0: cube
                                          // 1: sphere
                                          // 2: cylinder
        this.bone = readInt16(reader);
        this.unknown0 = readUint16(reader);
        this.matrix = readMatrix(reader);
        this.unknown1 = readUint32(reader);
        this.unknown2 = readUint32(reader);
        this.unknown3 = readUint32(reader);
        this.unknown4 = readUint32(reader);
        this.unknown5 = readUint32(reader);
        this.unknown6 = readUint32(reader);
        this.size = readVector3(reader);
    }
    /*
    function TRGD(reader, indexEntries, version) {
        this.version = version;
        this.unknown0 = parseReferenceByValTyped(reader, indexEntries, readUint32Array);
        this.name = parseReferenceString(reader, indexEntries);
    }

    function PATU(reader, indexEntries, version) {
        this.version = version;
    }

    function IKJT(reader, indexEntries, version) {
        this.version = version;
    }

    function PhysicsJoint(reader, indexEntries, version) {
        this.version = version;
    }

    function DMSE(reader, indexEntries, version) {
        this.version = version;
        this.unknown0 = readUint8(reader);
        this.i0 = readUint8(reader);
        this.i1 = readUint8(reader);
        this.i2 = readUint8(reader);
    }

    function PhysicsShape(reader, indexEntries, version) {
        this.version = version;
        this.matrix = readMatrix(reader);

        if (version < 2) {
            this.unknown0 = readUint32(reader);
        }

        this.shape = readUint8(reader); // 0 box
                                  // 1 sphere
                                  // 2 capsule
                                  // 3 cylinder
                                  // 4 convex hull
                                  // 5 mesh
        this.unknown1 = readUint8(reader);
        this.unknown2 = readUint16(reader);

        if (version < 2) {
            this.vertices = parseReferenceByVal(reader, indexEntries, readVector3);
            this.unknown3 = parseReferenceByValTyped(reader, indexEntries, readUint8Array);
            this.triangles = parseReferenceByValTyped(reader, indexEntries, readUint16Array);
            this.planeEquations = parseReferenceByVal(reader, indexEntries, readVector4);
        }

        if (version > 2) {
            this.unknown4 = read(reader, 24);
        }

        this.size0 = readFloat32(reader);
        this.size1 = readFloat32(reader);
        this.size2 = readFloat32(reader);

        if (version > 2) {
            this.unknown5 = parseReferenceByVal(reader, indexEntries, readVector3);
            this.unknown6 = parseReferenceByVal(reader, indexEntries, readVector4);
            this.unknown7 = parseReference(reader, indexEntries, DMSE);
            this.unknown8 = parseReferenceByValTyped(reader, indexEntries, readUint8Array);
            this.unknown9 = new Reference(reader);
            this.unknown10 = readUint32(reader);
            this.unknown11 = readUint32(reader);
            this.unknown12 = readUint32(reader);
            this.unknown13 = readUint32(reader);
            this.unknown14 = readUint32(reader);
            this.unknown15 = read(reader, 84);
            this.unknown16 = readUint32(reader);
            this.unknown17 = readUint32(reader);
            this.unknown18 = readUint32(reader);
            this.unknown19 = readUint32(reader);
            this.unknown20 = readUint32(reader);
            this.unknown21 = readUint32(reader);
            this.unknown22 = readUint32(reader);
            this.unknown23 = readUint32(reader);
        }
    }

    function  RigidBody(reader, indexEntries, version) {
        this.version = version;

        if (version < 3) {
            this.unknown0To14 = readFloat32Array(reader, 15);
            this.bone = readUint16(reader);
            this.boneUnused = readUint16(reader);
            this.unknown15 = read(reader, 15);
        }

        if (version > 3) {
            this.unknown16 = readUint16(reader);
            this.unknown17 = readUint16(reader);
            this.unknown18 = readUint32(reader);
            this.bone = readUint32(reader);
            this.unknown19 = readFloat32(reader);
            this.unknown20 = readFloat32(reader);
            this.unknown21 = readFloat32(reader);
            this.unknown22 = readFloat32(reader);
            this.unknown23 = readFloat32(reader);
            this.unknown24 = readFloat32(reader);
            this.unknown25 = new AnimationReference(reader, readUint32); // Unknown reference type
            this.unknown26 = readFloat32(reader);
        }

        this.physicsShapes = parseReference(reader, indexEntries, PhysicsShape);
        this.flags = readUint32(reader); // 0x1 collidable
                                  // 0x2 walkable
                                  // 0x4 stackable
                                  // 0x8 simulateOnCollision
                                  // 0x10 ignoreLocalBodies
                                  // 0x20 alwaysExists
                                  // 0x80 doNotSimulate
        this.localForces = readUint16(reader); // 0x1 1
                                           // 0x2 2
                                           // 0x4 3
                                           // 0x8 4
                                           // 0x10 5
                                           // 0x20 6
                                           // 0x40 7
                                           // 0x80 8
                                           // 0x100 9
                                           // 0x200 10
                                           // 0x400 11
                                           // 0x800 12
                                           // 0x1000 13
                                           // 0x2000 14
                                           // 0x4000 15
                                           // 0x8000 16
        this.worldForces = readUint16(reader); // 0x1 wind
                                            // 0x2 explosion
                                            // 0x4 energy
                                            // 0x8 blood
                                            // 0x10 magnetic
                                            // 0x20 grass
                                            // 0x40 brush
                                            // 0x80 trees
        this.priority = readUint32(reader);
    }

    function Warp(reader, indexEntries, version) {
        this.version = version;
        this.unknown0 = readUint32(reader);
        this.bone = readUint32(reader);
        this.unknown1 = readUint32(reader);
        this.radius = new AnimationReference(reader, readFloat32);
        this.unknown2 = new AnimationReference(reader, readFloat32);
        this.compressionStrength = new AnimationReference(reader, readFloat32);
        this.unknown3 = new AnimationReference(reader, readFloat32);
        this.unknown4 = new AnimationReference(reader, readFloat32);
        this.unknown5 = new AnimationReference(reader, readFloat32);
    }

    function Force(reader, indexEntries, version) {
        this.version = version;
        this.type = readUint32(reader);
        this.unknown0 = readUint32(reader);
        this.unknown1 = readUint32(reader);
        this.bone = readUint32(reader);
        this.unknown2 = readUint32(reader);
        this.forceChannels = readUint32(reader);
        this.forceStrength = new AnimationReference(reader, readFloat32); 
        this.forceRange = new AnimationReference(reader, readFloat32); 
        this.unknown3 = new AnimationReference(reader, readFloat32); 
        this.unknown4 = new AnimationReference(reader, readFloat32); 
    }

    function Projection(reader, indexEntries, version) {
        this.version = version;
        this.unknown0 = readUint32(reader);
        this.bone = readUint32(reader);
        this.materialReferenceIndex = readUint32(reader); // Maybe?
        this.unknown1 = new AnimationReference(reader, readVector3); // Unknown reference type
        this.unknown2 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown3 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown4 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown5 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown6 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown7 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown8 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown9 = new AnimationReference(reader, readFloat32); 
        this.unknown10 = new AnimationReference(reader, readFloat32); 
        this.unknown11 = new AnimationReference(reader, readFloat32); 
        this.unknown12 = new AnimationReference(reader, readFloat32); 
        this.unknown13 = new AnimationReference(reader, readFloat32); 
        this.unknown14 = new AnimationReference(reader, readFloat32); 
        this.unknown15 = readUint32(reader);
        this.unknown16 = readFloat32(reader);
        this.unknown17 = readFloat32(reader);
        this.unknown18 = readFloat32(reader);
        this.unknown19 = readFloat32(reader);
        this.unknown20 = readUint32(reader);
        this.unknown21 = readFloat32(reader);
        this.unknown22 = readUint32(reader);
        this.unknown23 = readFloat32(reader);
        this.unknown24 = readUint32(reader);
        this.unknown25 = readFloat32(reader);
        this.unknown26 = new AnimationReference(reader, readUint32); 
        this.unknown27 = readUint32(reader);
        this.unknown28 = readUint32(reader);
        this.unknown29 = readUint32(reader);
        this.unknown30 = readUint32(reader);
    }

    function SRIB(reader, indexEntries, version) {
        this.version = version;
    }

    function RibbonEmitter(reader, indexEntries, version) {
        this.version = version;
        this.bone = readUint8(reader);
        this.short1 = readUint8(reader);
        this.short2 = readUint8(reader);
        this.short3 = readUint8(reader);
        this.materialReferenceIndex = readUint32(reader);

        if (version > 7) {
            this.unknown0 = readUint32(reader);
        }

        this.waveLength = new AnimationReference(reader, readFloat32); 
        this.unknown1 = new AnimationReference(reader, readUint32); // Unknown reference type

        if (version < 7) {
            this.unknown2 = readInt32(reader);
        }

        this.unknown3 = new AnimationReference(reader, readFloat32); 
        this.unknown4 = new AnimationReference(reader, readFloat32); 
        this.unknown5 = new AnimationReference(reader, readFloat32); 
        this.unknown6 = new AnimationReference(reader, readFloat32); 
        this.unknown7 = new AnimationReference(reader, readFloat32); 
        this.unknown8 = new AnimationReference(reader, readFloat32); 
        this.unknown9 = readUint32(reader);
        this.unknown10 = readUint32(reader);
        this.unknown11 = readFloat32(reader);
        this.unknown12 = readFloat32(reader);
        this.tipOffsetZ = readFloat32(reader);
        this.centerBias = readFloat32(reader);
        this.unknown13 = readFloat32(reader);
        this.unknown14 = readFloat32(reader);
        this.unknown15 = readFloat32(reader);

        if (version > 7) {
            this.unknown16 = new Reference(reader); // Reference?
        }

        this.radiusScale = new AnimationReference(reader, readVector3); 
        this.twist = new AnimationReference(reader, readFloat32); 
        this.unknown17 = readUint32(reader);
        this.unknown18 = readUint32(reader);
        this.unknown19 = readUint32(reader);
        this.unknown20 = readUint32(reader);
        this.baseColoring = new AnimationReference(reader, readColor);  
        this.centerColoring = new AnimationReference(reader, readColor);  
        this.tipColoring = new AnimationReference(reader, readColor);  
        this.stretchAmount = readFloat32(reader);

        if (version < 7) {
            this.unknown21 = readFloat32(reader);
        }

        if (version > 7) {
            this.unknown22 = readFloat32(reader);
        }

        this.stretchLimit = readFloat32(reader);
        this.unknown23 = readFloat32(reader);
        this.unknown24 = readFloat32(reader);
        this.unknown25 = readUint32(reader);

        if (version < 7) {
            this.unknown26 = readUint32(reader);
            this.unknown27 = readUint32(reader);
        }

        this.surfaceNoiseAmplitude = readFloat32(reader);
        this.surfaceNoiseNumberOfWaves = readFloat32(reader);
        this.surfaceNoiseFrequency = readFloat32(reader);
        this.surfaceNoiseScale = readFloat32(reader);
        this.unknown28 = readUint32(reader);
        this.ribbonType = readUint32(reader);
        this.unknown29 = readUint32(reader);
        this.ribbonDivisions = readFloat32(reader);
        this.ribbonSides = readUint32(reader);
        this.unknown30 = readFloat32(reader);
        this.ribbonLength = new AnimationReference(reader, readFloat32); 

        if (version < 7) {
            this.filler1 = readInt32(reader);
        }

        this.srib = parseReference(reader, indexEntries, SRIB);
        this.unknown31 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.flags = readUint32(reader); // 0x2 collideWithTerrain
                                  // 0x4 collideWithObjects
                                  // 0x8 edgeFalloff
                                  // 0x10 inheritParentVelocity
                                  // 0x20 smoothSize
                                  // 0x40 bezierSmoothSize
                                  // 0x80 useVertexAlpha
                                  // 0x100 scaleTimeByParent
                                  // 0x200 forceLegacy
                                  // 0x400 useLocaleTime
                                  // 0x800 simulateOnInitialization
                                  // 0x1000 useLengthAndTime
        this.unknown32 = readUint32(reader);
        this.unknown33 = readFloat32(reader);
        this.unknown34 = readUint32(reader);
        this.unknown35 = readUint32(reader);

        if (version > 7) {
            this.unknown36 = read(reader, 8);
        }

        this.directionVariationBool = readUint32(reader);
        this.directionVariationAmount = new AnimationReference(reader, readFloat32); 
        this.directionVariationFrequency = new AnimationReference(reader, readFloat32); 
        this.amplitudeVariationBool = readUint32(reader);
        this.amplitudeVariationAmount = new AnimationReference(reader, readFloat32); 
        this.amplitudeVariationFrequency = new AnimationReference(reader, readFloat32); 
        this.lengthVariationBool = readUint32(reader);
        this.lengthVariationAmount = new AnimationReference(reader, readFloat32); 
        this.lengthVariationFrequency = new AnimationReference(reader, readFloat32); 
        this.radiusVariationBool = readUint32(reader);
        this.radiusVariationAmount = new AnimationReference(reader, readFloat32); 
        this.radiusVariationFrequency = new AnimationReference(reader, readFloat32); 
        this.unknown37 = readInt32(reader);
        this.unknown38 = new AnimationReference(reader, readFloat32); 
        this.unknown39 = new AnimationReference(reader, readFloat32); 
        this.unknown40 = new AnimationReference(reader, readFloat32); 
        this.unknown41 = new AnimationReference(reader, readFloat32); 
    }

    function ParticleEmitterCopy(reader, indexEntries, version) {
    this.version = version;
    this.emissionRate = new AnimationReference(reader, readFloat32);
    this.partEmit = new AnimationReference(reader, readInt16);
    this.bone = readUint32(reader);
    }

    function ParticleEmitter(reader, indexEntries, version) {
        this.version = version;
        this.bone = readUint32(reader);
        this.materialReferenceIndex = readUint32(reader);

        if (version > 16) {
            this.additionalFlags = readUint32(reader); // 0x1 randomizeWithEmissionSpeed2
                                                       // 0x1 randomizeWithLifespan2
                                                       // 0x1 randomizeWithMass2
                                                       // 0x1 trailingEnabled
        }

        this.emissionSpeed1 = new AnimationReference(reader, readFloat32);
        this.emissionSpeed2 = new AnimationReference(reader, readFloat32);

        if (version < 13) {
            this.randomizeWithEmissionSpeed2 = readUint32(reader);
        }

        this.emissionAngleX = new AnimationReference(reader, readFloat32);
        this.emissionAngleY = new AnimationReference(reader, readFloat32);
        this.emissionSpreadX = new AnimationReference(reader, readFloat32);
        this.emissionSpreadY = new AnimationReference(reader, readFloat32);
        this.lifespan1 = new AnimationReference(reader, readFloat32);
        this.lifespan2 = new AnimationReference(reader, readFloat32);

        if (version < 13) {
            this.randomizeWithLifespan2 = readUint32(reader);
        }

        this.unknown0 = new Reference(reader);
        this.zAcceleration = readFloat32(reader);
        this.sizeAnimationMiddle = readFloat32(reader);
        this.colorAnimationMiddle = readFloat32(reader);
        this.alphaAnimationMiddle = readFloat32(reader);
        this.rotationAnimationMiddle = readFloat32(reader);

        if (version > 16) {
            this.sizeHoldTime = readFloat32(reader);
            this.colorHoldTime = readFloat32(reader);
            this.alphaHoldTime = readFloat32(reader);
            this.rotationHoldTime = readFloat32(reader);
        }

        this.particleSizes1 = new AnimationReference(reader, readVector3);
        this.rotationValues1 = new AnimationReference(reader, readVector3);
        this.initialColor1 = new AnimationReference(reader, readColor);
        this.middleColor1 = new AnimationReference(reader, readColor);
        this.finalColor1 = new AnimationReference(reader, readColor);
        this.slowdown = readFloat32(reader);
        this.mass = readFloat32(reader);
        this.mass2 = readFloat32(reader);
        this.unknown1 = readFloat32(reader);

        if (version < 13) {
            this.unknown2 = readUint32(reader);
            this.trailingEnabled = readUint32(reader);
        }

        this.localForceChannels = readUint16(reader);
        this.worldForceChannels = readUint16(reader);
        this.forceChannelsFillerBytes = readUint16(reader);
        this.worldForceChannelsCopy = readUint16(reader);
        this.noiseAmplitude = readFloat32(reader);
        this.noiseFrequency = readFloat32(reader);
        this.noiseCohesion = readFloat32(reader);
        this.noiseEdge = readFloat32(reader);
        this.indexPlusHighestIndex = readUint32(reader);
        this.maxParticles = readUint32(reader);
        this.emissionRate = new AnimationReference(reader, readFloat32);
        this.emissionAreaType = readUint32(reader);
        this.emissionAreaSize = new AnimationReference(reader, readVector3);
        this.emissionAreaCutoutSize = new AnimationReference(reader, readVector3);
        this.emissionAreaRadius = new AnimationReference(reader, readFloat32);
        this.emissionAreaCutoutRadius = new AnimationReference(reader, readFloat32);

        if (version > 16) {
            this.unknown3 = parseReferenceByVal(reader, indexEntries, readUint32);
        }

        this.emissionType = readUint32(reader);
        this.randomizeWithParticleSizes2 = readUint32(reader);
        this.particleSizes2 = new AnimationReference(reader, readVector3);
        this.randomizeWithRotationValues2 = readUint32(reader);
        this.rotationValues2 = new AnimationReference(reader, readVector3);
        this.randomizeWithColor2 = readUint32(reader);
        this.initialColor2 = new AnimationReference(reader, readColor);
        this.middleColor2 = new AnimationReference(reader, readColor);
        this.finalColor2 = new AnimationReference(reader, readColor);
        this.unknown4 = readUint32(reader);
        this.partEmit = new AnimationReference(reader, readInt16);
        this.phase1StartImageIndex = readUint8(reader);
        this.phase1EndImageIndex = readUint8(reader);
        this.phase2EndImageIndex = readUint8(reader);
        this.phase2StartImageIndex = readUint8(reader);
        this.relativePhase1Length = readFloat32(reader);
        this.numberOfColumns = readUint16(reader);
        this.numberOfRows = readUint16(reader);
        this.columnWidth = readFloat32(reader);
        this.rowHeight = readFloat32(reader);
        this.unknown5 = readFloat32(reader);
        this.unknown6 = readFloat32(reader);
        this.unknown7 = readInt32(reader);
        this.unknown8 = read(reader, 20);
        this.particleType = readUint32(reader); // 0, 2, 3, 4, 5 square billboards
                                            // 1 speed scaled and rotated billboards influenced by lengthWidhtRatio
                                            // 6 rectangular billboards using lengthWidhtRatio
                                            // 7 quads with normal speed
                                            // 9 quads that stretch between the spawn point and current location
        this.lengthWidthRatio = readFloat32(reader);
        this.unknown9 = read(reader, 8);
        this.unknown10 = readFloat32(reader);

        if (version > 16) {
            this.unknown11 = readFloat32(reader);
        }

        this.unknown12 = readUint32(reader);
        this.unknown13 = new AnimationReference(reader, readFloat32);
        this.unknown14 = new AnimationReference(reader, readFloat32);
        this.unknown15 = readUint32(reader);
        this.unknown16 = new AnimationReference(reader, readFloat32);
        this.unknown17 = new AnimationReference(reader, readFloat32);
        this.unknown18 = readUint32(reader);
        this.unknown19 = new AnimationReference(reader, readFloat32);
        this.unknown20 = new AnimationReference(reader, readFloat32);
        this.unknown21 = readUint32(reader);
        this.unknown22 = new AnimationReference(reader, readFloat32);
        this.unknown23 = new AnimationReference(reader, readFloat32);
        this.unknown24 = readUint32(reader);
        this.unknown25 = new AnimationReference(reader, readFloat32);
        this.unknown26 = new AnimationReference(reader, readFloat32);
        this.unknown27 = readUint32(reader);
        this.unknown28 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown29 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown30 = read(reader, 4);
        this.unknown31 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown32 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown33 = read(reader, 4);
        this.unknown34 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown35 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown36 = read(reader, 4);
        this.unknown37 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown38 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown39 = new AnimationReference(reader, readFloat32);

        if (version > 21) {
            this.unknown40 = new AnimationReference(reader, readUint32); // Unknown reference type
        }

        this.flags = readUint32(reader); // 0x1 sort
                                  // 0x2 collideTerrain
                                  // 0x4 collideObjects
                                  // 0x8 spawnOnBounce
                                  // 0x10 cutoutEmissionArea
                                  // 0x20 inheritEmissionParams
                                  // 0x40 inheritParentVel
                                  // 0x80 sortByZHeight
                                  // 0x100 reverseIteration
                                  // 0x200 smoothRotation
                                  // 0x400 bezSmoothRotation
                                  // 0x800 smoothSize
                                  // 0x1000 bezSmoothSize
                                  // 0x2000 smoothColor
                                  // 0x4000 bezSmoothColor
                                  // 0x8000 litParts
                                  // 0x10000 randFlipBookStart
                                  // 0x20000 multiplyByGravity
                                  // 0x40000 clampTailParts
                                  // 0x80000 spawnTrailingParts
                                  // 0x100000 fixLengthTailParts
                                  // 0x200000 useVertexAlpha
                                  // 0x400000 modelParts
                                  // 0x800000 swapYZonModelParts
                                  // 0x1000000 scaleTimeByParent
                                  // 0x2000000 useLocalTime
                                  // 0x4000000 simulateOnInit
                                  // 0x8000000 copy

        if (version > 17) {
            this.rotationFlags = readUint32(reader); // 0x2 relativeRotation
                                                // 0x4 alwaysSet
        }

        if (version > 16) {
            this.colorSmoothingType = readUint32(reader);      // 0 linear
            this.sizeSmoothingType = readUint32(reader);       // 1 smooth
            this.rotationSmoothingType = readUint32(reader); // 2 bezier
                                                                   // 3 linear hold
                                                                   // 4 bezier hold
            this.unknown41 = new AnimationReference(reader, readFloat32);
            this.unknown42 = new AnimationReference(reader, readVector2);
            this.unknown43 = new AnimationReference(reader, readVector3);
            this.unknown44 = new AnimationReference(reader, readVector2);
        }

        // NOTE: m3addon says this is an animation reference, but that causes parsing errors. Is this a reference?
        this.spawnPoints = parseReferenceByVal(reader, indexEntries, readVector3);//new AnimationReference(reader, readVector3);
        this.unknown45 = readFloat32(reader);
        this.unknown46 = readUint32(reader);
        this.unknown47 = readUint32(reader);
        this.unknown48 = new AnimationReference(reader, readUint32); // Unknown reference type
        this.unknown49 = new AnimationReference(reader, readFloat32);
        this.trailingParticlesIndex = readInt32(reader);
        this.trailingParticlesChance = readFloat32(reader);
        this.trailingParticlesRate = new AnimationReference(reader, readFloat32);
        this.unknown50 = read(reader, 8);
        this.usedModel = parseReferenceString(reader, indexEntries);
        this.copyIndices = parseReferenceByVal(reader, indexEntries, readUint32);
    }
    */
    function Layer(reader, indexEntries, version) {
        this.version = version;
        this.unknown0 = readUint32(reader);
        this.imagePath = parseReferenceString(reader, indexEntries);
        this.color = new AnimationReference(reader, readColor);
        this.flags = readUint32(reader); // 0x4 textureWrapX
                                  // 0x8 textureWrapY
                                  // 0x10 invertColor
                                  // 0x20 clamp
                                  // 0x100 useParticleFlipbook
                                  // 0x400 colorEnabled
        this.uvSource = readUint32(reader); // 0 explicitUnwrap1
                                         // 1 explicitUnwrap2
                                         // 2 reflectiveCubeEnv
                                         // 3 reflectiveSphereEnv
                                         // 4 planarLocalZ
                                         // 5 planarWorldZ
                                         // 6 Particle Flipbook
                                         // 7 cubicEnv
                                         // 8 sphereEnv
                                         // 9 explicitUnwrap3
                                         // 10 explicitUnwrap4
                                         // 11 planarLocalX
                                         // 12 planarLocalY
                                         // 13 planarWorldX
                                         // 14 planarWorldY
                                         // 15 screenSpace
                                         // 16 triPlanarLocal
                                         // 17 triPlanerWorld
                                         // 18 triPlayedWorldLocalZ
        this.colorChannels = readUint32(reader); // 0 RGB
                                               // 1 RGBA
                                               // 2 A
                                               // 3 R
                                               // 4 G
                                               // 5 B
        this.rgbMultiply = new AnimationReference(reader, readFloat32);
        this.rgbAdd = new AnimationReference(reader, readFloat32);
        this.unknown1 = readUint32(reader);
        this.unknown2 = readInt32(reader);
        this.unknown3 = readUint32(reader);
        this.replaceableChannel = readUint32(reader); // -1 noReplaceable
                                                       // 0 channel 1
                                                       // 1 channel 2
                                                       // 2 channel 3
                                                       // 3 channel 4
                                                       // 4 channel 5
                                                       // 5 channel 6
                                                       // 6 channel 7
        this.unknown4 = readInt32(reader);
        this.unknown5 = readUint32(reader);
        this.unknown6 = readUint32(reader);
        this.unknown7 = new AnimationReference(reader, readUint32);
        this.unknown8 = new AnimationReference(reader, readVector2);
        this.flipBook = new AnimationReference(reader, readInt16);
        this.uvOffset = new AnimationReference(reader, readVector2);
        this.uvAngle = new AnimationReference(reader, readVector3);
        this.uvTiling = new AnimationReference(reader,  readVector2);
        this.unknown9 = new AnimationReference(reader, readUint32);
        this.unknown10 = new AnimationReference(reader, readFloat32);
        this.brightness = new AnimationReference(reader, readFloat32);
        this.unknown11 = readInt32(reader);
        this.fresnelFlags = readUint32(reader); // 0x1 ?
                                             // 0x2 ?
                                             // 0x4 colorEnabled
        this.fresnelStrength = readFloat32(reader);
        this.fresnelStart = readFloat32(reader);
        this.triPlannarOffset = readVector3(reader);
        this.triPlannarScale = readVector3(reader);
    }
    /*
    function CreepMaterial(reader, indexEntries) {
        this.name = parseReferenceString(reader, indexEntries);
        this.creepLayer = parseSingleReference(reader, indexEntries, Layer);
    }

    function VolumeNoiseMaterial(reader, indexEntries, version) {
        this.version = version;
    }

    function VolumeMaterial(reader, indexEntries, version) {
        this.version = version;
        this.name = parseReferenceString(reader, indexEntries);
        this.unknown0 = readUint32(reader);
        this.unknown1 = readUint32(reader);
        this.volumeDensity = new AnimationReference(reader, readFloat32);
        this.colorDefiningLayer = parseSingleReference(reader, indexEntries, Layer);
        this.unknown2 = parseSingleReference(reader, indexEntries, Layer);
        this.unknown3 = parseSingleReference(reader, indexEntries, Layer);
        this.unknown4 = readUint32(reader);
        this.unknown5 = readUint32(reader);
    }

    function TerrainMaterial(reader, indexEntries, version) {
        this.version = version;
        this.name = parseReferenceString(reader, indexEntries);
        this.terrainLayer = parseSingleReference(reader, indexEntries, Layer);
    }

    function CompositeMaterialSection(reader, indexEntries, version) {
        this.version = version;
        this.materialReferenceIndex = readUint32(reader);
        this.alphaFactor = new AnimationReference(reader, readFloat32);
    }

    function CompositeMaterial(reader, indexEntries, version) {
        this.version = version;
        this.name = parseReferenceString(reader, indexEntries);
        this.unknown0 = readUint32(reader);
        this.sections = parseReference(reader, indexEntries, CompositeMaterialSection);
    }

    function DisplacementMaterial(reader, indexEntries, version) {
        this.version = version;
        this.name = parseReferenceString(reader, indexEntries);
        this.unknown0 = readUint32(reader);
        this.strengthFactor = new AnimationReference(reader, readFloat32);
        this.normalLayer = parseSingleReference(reader, indexEntries, Layer);
        this.strengthLayer = parseSingleReference(reader, indexEntries, Layer);
        this.flags = readUint32(reader);
        this.priority = readInt32(reader);
    }
    */
    function StandardMaterial(reader, indexEntries, version) {
        this.name = parseReferenceString(reader, indexEntries);
        this.specialFlags = readUint32(reader); // 0x1 useDepthBlend
                                            // 0x4 useVertexColor
                                            // 0x8 useVertexAlpha
                                            // 0x200 useTransparentShadows
        this.flags = readUint32(reader); // 0x1 useVertexColor
                                  // 0x2 useVertexAlpha
                                  // 0x4 unfogged
                                  // 0x8 twoSided
                                  // 0x10 unshaded
                                  // 0x20 noShadowsCast
                                  // 0x40 noHitTest
                                  // 0x80 noShadowsReceived
                                  // 0x100 depthPrepass
                                  // 0x200 useTerrainHDR
                                  // 0x800 splatUVfix
                                  // 0x1000 softBlending
                                  // 0x4000 transparentShadows
                                  // 0x8000 decalLighting
                                  // 0x10000 transparencyAffectsDepth
                                  // 0x20000 localLightsOnTransparencies
                                  // 0x40000 disableSoftDepthBlend
                                  // 0x80000 doubleLambert
                                  // 0x100000 hairLayerSorting
                                  // 0x200000 acceptsSplats
                                  // 0x400000 decalRequiredOnLowEnd
                                  // 0x800000 emissiveRequiredOnLowEnd
                                  // 0x1000000 specularRequiredOnLowEnd
                                  // 0x2000000 acceptSplatsOnly
                                  // 0x4000000 isBackgroundObject
                                  // 0x10000000 zfillRequiredOnLowEnd
                                  // 0x20000000 excludeFromHighlighting
                                  // 0x40000000 clampOutput
                                  // 0x80000000 visible
        this.blendMode = readUint32(reader); // 0 opaque
                                           // 1 blend
                                           // 2 additive
                                           // 3 probably addAlpha
                                           // 4 mod
                                           // 5 mod2x
                                           
        this.priority = readInt32(reader);
        this.unknown0 = readUint32(reader);
        this.specularity = readFloat32(reader);
        this.depthBlend = readFloat32(reader);
        this.alphaTestThreshold = readUint8(reader);
        this.unknown1 = readUint8(reader);
        this.unknown2 = readUint8(reader);
        this.unknown3 = readUint8(reader);
        this.specMult = readFloat32(reader);
        this.emisMult = readFloat32(reader);
        this.diffuseLayer = parseSingleReference(reader, indexEntries, Layer);
        this.decalLayer = parseSingleReference(reader, indexEntries, Layer);
        this.specularLayer = parseSingleReference(reader, indexEntries, Layer);

        if (version > 15) {
            this.glossLayer = parseSingleReference(reader, indexEntries, Layer);
        }

        this.emissiveLayer = parseSingleReference(reader, indexEntries, Layer);
        this.emissive2Layer = parseSingleReference(reader, indexEntries, Layer);
        this.evioLayer = parseSingleReference(reader, indexEntries, Layer);
        this.evioMaskLayer = parseSingleReference(reader, indexEntries, Layer);
        this.alphaMaskLayer = parseSingleReference(reader, indexEntries, Layer);
        this.alphaMask2Layer = parseSingleReference(reader, indexEntries, Layer);
        this.normalLayer = parseSingleReference(reader, indexEntries, Layer);
        this.heightLayer = parseSingleReference(reader, indexEntries, Layer);
        this.lightMapLayer = parseSingleReference(reader, indexEntries, Layer);
        this.ambientOcclusionLayer = parseSingleReference(reader, indexEntries, Layer);
        this.unknown4 = readUint32(reader);
        this.layerBlendType = readUint32(reader);
        this.emisBlendType = readUint32(reader);
        this.emisMode = readUint32(reader);
        this.specType = readUint32(reader);
        this.unknown5 = new AnimationReference(reader, readUint32);
        this.unknown6 = new AnimationReference(reader, readUint32);
    }

    function MaterialMap(reader) {
        this.materialType = readUint32(reader);
        this.materialIndex = readUint32(reader);
    }

    function Camera(reader, indexEntries, version) {
        this.version = version;
        this.bone = readUint32(reader);
        this.name = parseReferenceString(reader, indexEntries);
        this.fieldOfView = new AnimationReference(reader, readFloat32);
        this.unknown0 = readUint32(reader);
        this.farClip = new AnimationReference(reader, readFloat32);
        this.nearClip = new AnimationReference(reader, readFloat32);
        this.clip2 = new AnimationReference(reader, readFloat32);
        this.focalDepth = new AnimationReference(reader, readFloat32);
        this.falloffStart = new AnimationReference(reader, readFloat32);
        this.falloffEnd = new AnimationReference(reader, readFloat32);
        this.depthOfField = new AnimationReference(reader, readFloat32);
    }
    /*
    function SHBX(reader, indexEntries, version) {
    this.version = version;
    }
    */
    function Light(reader, indexEntries, version) {
        this.version = version;
        this.type = readUint8(reader);
        this.unknown0 = readUint8(reader);
        this.bone = readInt16(reader);
        this.flags = readUint32(reader); // 0x1 shadowCast
                                  // 0x2 specular
                                  // 0x4 unknown
                                  // 0x8 turnOn
        this.unknown1 = readUint32(reader);
        this.unknown2 = readInt32(reader);
        this.lightColor = new AnimationReference(reader, readVector3);
        this.lightIntensity = new AnimationReference(reader, readFloat32);
        this.specularColor = new AnimationReference(reader, readVector3);
        this.specularIntensity = new AnimationReference(reader, readFloat32);
        this.attenuationFar = new AnimationReference(reader, readFloat32);
        this.unknown3 = readFloat32(reader);
        this.attenuationNear = new AnimationReference(reader, readFloat32);
        this.hotSpot = new AnimationReference(reader, readFloat32);
        this.falloff = new AnimationReference(reader, readFloat32);
    }

    function AttachmentPoint(reader, indexEntries, version) {
        this.version = version;
        this.unknown = readInt32(reader);
        this.name = parseReferenceString(reader, indexEntries);
        this.bone = readUint32(reader);
    }

    function MSEC(reader) {
        this.unknown0 = readUint32(reader);
        this.boundings = new AnimationReference(reader, readBoundingSphere);
    }

    function Batch(reader) {
        this.unknown0 = readUint32(reader);
        this.regionIndex = readUint16(reader);
        this.unknown1 = readUint32(reader);
        this.materialReferenceIndex = readUint16(reader);
        this.unknown2 = readUint16(reader);
    }

    function Region(reader) {
        this.unknown0 = readUint32(reader);
        this.unknown1 = readUint32(reader);
        this.firstVertexIndex = readUint32(reader);
        this.verticesCount = readUint32(reader);
        this.firstTriangleIndex = readUint32(reader);
        this.triangleIndicesCount = readUint32(reader);
        this.bonesCount = readUint16(reader);
        this.firstBoneLookupIndex = readUint16(reader);
        this.boneLookupIndicesCount = readUint16(reader);
        this.unknown2 = readUint16(reader);
        this.boneWeightPairsCount = readUint8(reader);
        this.unknown3 = readUint8(reader);
        this.rootBoneIndex = readUint16(reader);
    }

    function Division(reader, indexEntries, version) {
        this.version = version;
        this.triangles = parseReferenceByValTyped(reader, indexEntries, readUint16Array);
        this.regions = parseReference(reader, indexEntries, Region);
        this.batches = parseReference(reader, indexEntries, Batch);
        this.MSEC = parseReference(reader, indexEntries, MSEC);
        this.unknown0 = readUint32(reader);
    }

    function Bone(reader, indexEntries, version) {
        this.version = version;
        this.unknown0 = readInt32(reader);
        this.name = parseReferenceString(reader, indexEntries);
        this.flags = readUint32(reader); // 0x1 inheritTranslation
                                  // 0x2 inheritScale
                                  // 0x4 inheritRotation
                                  // 0x10 billboard1
                                  // 0x40 billboard2
                                  // 0x100 twoDProjection
                                  // 0x200 animated
                                  // 0x400 inverseKinematics
                                  // 0x800 skinned
                                  // 0x2000 real -- what does this mean?
        this.parent = readInt16(reader);
        this.unknown1 = readUint16(reader);
        this.location = new AnimationReference(reader, readVector3);
        this.rotation = new AnimationReference(reader, readVector4);
        this.scale = new AnimationReference(reader, readVector3);
        this.visibility = new AnimationReference(reader, readUint32);
    }

    function STS(reader, indexEntries, version) {
        this.version = version;
        this.animIds = parseReferenceByValTyped(reader, indexEntries, readUint32Array);
        this.unknown0 = readInt32(reader);
        this.unknown1 = readInt32(reader);
        this.unknown2 = readInt32(reader);
        this.unknown3 = readInt16(reader);
        this.unknown4 = readUint16(reader);
    }

    function STG(reader, indexEntries, version) {
        this.version = version;
        this.name = parseReferenceString(reader, indexEntries);
        this.stcIndices = parseReferenceByValTyped(reader, indexEntries, readUint32Array);
    }

    function STC(reader, indexEntries, version) {
        this.version = version;
        this.name = parseReferenceString(reader, indexEntries);
        this.runsConcurrent = readUint16(reader);
        this.priority = readUint16(reader);
        this.stsIndex = readUint16(reader);
        this.stsIndexCopy = readUint16(reader);
        this.animIds = parseReferenceByValTyped(reader, indexEntries, readUint32Array);
        this.animRefs = parseReferenceByVal(reader, indexEntries, readUint16Pair);
        this.unknown0 = readUint32(reader);
        this.sd = [
            parseSeqeunceData(reader, indexEntries, readEvent),
            parseSeqeunceData(reader, indexEntries, readVector2),
            parseSeqeunceData(reader, indexEntries, readVector3),
            parseSeqeunceData(reader, indexEntries, readVector4),
            parseSeqeunceData(reader, indexEntries, readColor),
            parseSeqeunceData(reader, indexEntries, readFloat32),
            new Reference(reader),
            parseSeqeunceData(reader, indexEntries, readInt16),
            parseSeqeunceData(reader, indexEntries, readUint16),
            new Reference(reader),
            new Reference(reader),
            parseSeqeunceData(reader, indexEntries, readUint32),
            parseSeqeunceData(reader, indexEntries, readBoundingSphere)
        ];
    }

    function Sequence(reader, indexEntries, version) {
        this.version = version;
        this.unknown0 = readInt32(reader);
        this.unknown1 = readInt32(reader);
        this.name = parseReferenceString(reader, indexEntries);
        this.animationStart = readUint32(reader);
        this.animationEnd = readUint32(reader);
        this.movementSpeed = readFloat32(reader);
        this.flags = readUint32(reader); // 0x1 notLooping
                                  // 0x2 alwaysGlobal
                                  // 0x8 globalInPreviewer
        this.frequency = readUint32(reader);
        this.unknown2 = readUint32(reader);
        this.unknown3 = readUint32(reader);
        this.unknown4 = readUint32(reader);

        if (version < 2) {
            this.unknown5 = readUint32(reader);
        }

        this.boundingSphere = readBoundingSphere(reader);
        this.unknown6 = readUint32(reader);
        this.unknown7 = readUint32(reader);
        this.unknown8 = readUint32(reader);
    }

    function ModelHeader(reader, indexEntries, version) {
        this.version = version;
        this.name = parseReferenceString(reader, indexEntries);
        this.flags = readUint32(reader); // 0x100000 hasMesh
        this.sequences = parseReference(reader, indexEntries, Sequence);
        this.stc = parseReference(reader, indexEntries, STC);
        this.stg = parseReference(reader, indexEntries, STG);
        this.unknown0 = readFloat32(reader);
        this.unknown1 = readFloat32(reader);
        this.unknown2 = readFloat32(reader);
        this.unknown3 = readFloat32(reader);
        this.sts = parseReference(reader, indexEntries, STS);
        this.bones = parseReference(reader, indexEntries, Bone);
        this.skinBones = readUint32(reader);

        var vertexFlags = readUint32(reader);
        var uvSetCount = 1;

        if (vertexFlags & 0x40000) {
            uvSetCount = 2;
        } else if (vertexFlags & 0x80000) {
            uvSetCount = 3;
        } else if (vertexFlags & 0x100000) {
            uvSetCount = 4;
        }

        this.vertexFlags = vertexFlags;
        this.uvSetCount = uvSetCount;
        this.vertices = parseVertices(reader, indexEntries, uvSetCount);
        this.divisions = parseReference(reader, indexEntries, Division);
        this.boneLookup = parseReferenceByValTyped(reader, indexEntries, readUint16Array);
        this.boundings = readBoundingSphere(reader);
        this.unknown4To19 = readFloat32Array(reader, 16);
        this.attachmentPoints = parseReference(reader, indexEntries, AttachmentPoint);
        this.attachmentPointAddons = new Reference(reader);//parseReferenceByVal(reader, indexEntries, readUint16);
        this.ligts = parseReference(reader, indexEntries, Light);
        this.shbx = new Reference(reader);//parseReference(reader, indexEntries, SHBX);
        this.cameras = parseReference(reader, indexEntries, Camera);
        this.unknown20 = new Reference(reader);//parseReferenceByVal(reader, indexEntries, readUint16);
        this.materialMaps = parseReference(reader, indexEntries, MaterialMap);
        this.materials = [
            parseReference(reader, indexEntries, StandardMaterial),
             new Reference(reader),//parseReference(reader, indexEntries, DisplacementMaterial),
             new Reference(reader),//parseReference(reader, indexEntries, CompositeMaterial),
             new Reference(reader),//parseReference(reader, indexEntries, TerrainMaterial),
             new Reference(reader),//parseReference(reader, indexEntries, VolumeMaterial),
             new Reference(reader),//parseReference(reader, indexEntries, VolumeNoiseMaterial),
             new Reference(reader)//parseReference(reader, indexEntries, CreepMaterial)
        ];

        if (version > 24) {
            this.unknown21 = new Reference(reader);
        }

        if (version > 25) {
            this.unknown22 = new Reference(reader);
        }

        this.particleEmitters = new Reference(reader);//parseReference(reader, indexEntries, ParticleEmitter);
        this.particleEmitterCopies = new Reference(reader);//parseReference(reader, indexEntries, ParticleEmitterCopy);
        this.ribbonEmitters = new Reference(reader);//parseReference(reader, indexEntries, RibbonEmitter);
        this.projections = new Reference(reader);//parseReference(reader, indexEntries, Projection);
        this.forces = new Reference(reader);//parseReference(reader, indexEntries, Force);
        this.warps = new Reference(reader);//parseReference(reader, indexEntries, Warp);
        this.unknown23 = new Reference(reader);
        this.rigidBodies = new Reference(reader);//parseReference(reader, indexEntries, RigidBody);
        this.unknown24 = new Reference(reader);
        this.physicsJoints = new Reference(reader);//parseReference(reader, indexEntries, PhysicsJoint);
        this.unknown25 = new Reference(reader);
        this.ikjt = new Reference(reader);//parseReference(reader, indexEntries, IKJT);
        this.unknown26 = new Reference(reader);

        if (version > 24) {
            this.unknown27 = new Reference(reader);
        }

        this.patu = new Reference(reader);//parseReference(reader, indexEntries, PATU);
        this.trgd = new Reference(reader);//parseReference(reader, indexEntries, TRGD);
        this.initialReference = parseReferenceByVal(reader, indexEntries, readMatrix);
        this.tightHitTest = new BoundingShape(reader);
        this.fuzzyHitTestObjects = parseReference(reader, indexEntries, BoundingShape);
        this.attachmentVolumes = new Reference(reader);//parseReference(reader, indexEntries, AttachmentVolume);
        this.attachmentVolumesAddon0 = new Reference(reader);//parseReferenceByVal(reader, indexEntries, readUint16);
        this.attachmentVolumesAddon1 = new Reference(reader);//parseReferenceByVal(reader, indexEntries, readUint16);
        this.bbsc = new Reference(reader);//parseReference(reader, indexEntries, BBSC);
        this.tmd = new Reference(reader);//parseReference(reader, indexEntries, TMD);
        this.unknown28 = readUint32(reader);
        this.unknown29 = new Reference(reader);//parseReferenceByVal(reader, indexEntries, readUint32);
    }

    function Reference(reader) {
        this.entries = readUint32(reader);
        this.index = readUint32(reader);
        this.flags = readUint32(reader);
    }

    function IndexEntry(reader) {
        this.tag = readUint32(reader);
        this.offset = readUint32(reader);
        this.entries = readUint32(reader);
        this.version = readUint32(reader);
    }

    function MD34(reader) {
        this.indexOffset = readUint32(reader);
        this.entries = readUint32(reader);
        this.modelHeader = new Reference(reader);
    }

    return (function (reader, onprogress) {
        if (readUint32(reader) === MD34_HEADER) {
            var header = new MD34(reader)

            seek(reader, header.indexOffset);

            var indexEntries = [];

            for (var i = 0; i < header.entries; i++) {
                indexEntries[i] = new IndexEntry(reader);
            }

            var modelHeader = indexEntries[header.modelHeader.index];

            seek(reader, modelHeader.offset);

            return new ModelHeader(reader, indexEntries, modelHeader.version);
        }
    });
}());
M3.SD = function (sd) {
    this.sd = sd;

    // Avoid heap allocations in getInterval()
    this.interval = [0, 0];
};

M3.SD.prototype = {
    getValue: function (out, index, animationReference, frame, runsConcurrent) {
        var sd = this.sd[index];

        if (runsConcurrent === 1) {
            frame = frame % sd.biggestKey;
        }

        var interval = this.interval;
        var keys = sd.keys;
        var values = sd.values;

        this.getInterval(keys, frame, interval);

        var a = interval[0];
        var b = interval[1];
        var length = keys.length;

        if (a === length) {
            if (b === length) {
                return animationReference.initValue;
            } else {
                return values[b];
            }
        }

        if (b === length || a >= b) {
            return values[a];
        }

        var t = Math.clamp((frame - keys[a]) / (keys[b] - keys[a]), 0, 1);

        // M3 doesn't seem to have hermite/bezier interpolations, so just feed 0 to the in/out tangents since they are not used anyway
        return interpolator(out, values[a], 0, 0, values[b], t, animationReference.interpolationType);
    },

    getInterval: function (keys, frame, interval) {
        var a = keys.length;
        var b = 0;

        while (b !== keys.length && frame > keys[b]) {
            a = b;
            b++;
        }

        interval[0] = a;
        interval[1] = b;
    }
};
M3.STS = function (sts) {
    var i, l;
    var animIds = sts.animIds;

    this.animIds = {};

    // Allows direct checks instead of loops
    for (i = 0, l = animIds.length; i < l; i++) {
        this.animIds[animIds[i]] = i;
    }
};

M3.STS.prototype = {
    hasData: function (animationReference) {
        return !!this.animIds[animationReference.animId];
    }
};
M3.STC = function (stc) {
    var i, l;
    var animIds = stc.animIds;

    this.name = stc.name;
    this.runsConcurrent = stc.runsConcurrent;
    this.priority = stc.priority;
    this.stsIndex = stc.stsIndex;
    this.animIds = {};

    // Allows direct checks instead of loops
    for (i = 0, l = animIds.length; i < l; i++) {
        this.animIds[animIds[i]] = i;
    }

    this.animRefs = stc.animRefs;

    var sd = stc.sd;

    this.sd = [
        new M3.SD(sd[0]),
        new M3.SD(sd[1]),
        new M3.SD(sd[2]),
        new M3.SD(sd[3]),
        new M3.SD(sd[4]),
        new M3.SD(sd[5]),
        0, // Unknown M3.SD
        new M3.SD(sd[7]),
        new M3.SD(sd[8]),
        0, // Unknown M3.SD
        0, // Unknown M3.SD,
        new M3.SD(sd[11]),
        new M3.SD(sd[12])
    ];
};

M3.STC.prototype = {
    getValue: function (out, animationReference, frame) {
        var animRef = this.animRefs[this.animIds[animationReference.animId]];

        if (animRef) {
            return this.sd[animRef[1]].getValue(out, animRef[0], animationReference, frame, this.runsConcurrent);
        }

        return animationReference.initValue;
    }
};
M3.STG = function (stg, sts, stc) {
    this.name = stg.name;
    this.stcIndices = stg.stcIndices;
    this.sts = sts;
    this.stc = stc;
};

M3.STG.prototype = {
    getValue: function (out, animationReference, frame) {
        var i, l;
        var stcIndices = this.stcIndices;
        var stc;
        var sts;

        for (i = 0, l = stcIndices.length; i < l; i++) {
            stc = this.stc[stcIndices[i]];
            sts = this.sts[stc.stsIndex];

            // First check if this STC actually has data for this animation reference
            if (sts.hasData(animationReference)) {
                // Since this STC has data for this animation reference, return it
                return stc.getValue(out, animationReference, frame);
            }
        }

        // No STC referenced by the STG had data for this animation reference
        return animationReference.initValue;
    }
};
M3.ShallowBone = function (bone) {
    BaseNode.call(this);

    this.boneImpl = bone;
    this.parent = bone.parent;
    
    this.externalWorldMatrix = mat4.create();
};

M3.ShallowBone.prototype = extend(BaseNode.prototype, {
    getTransformation: function () {
        var m = this.externalWorldMatrix;

        mat4.copy(m, this.worldMatrix);
        // Remove the local rotation as far as external objects know
        mat4.rotateZ(m, m, -Math.PI / 2);

        return m;
    }
});

M3.Skeleton = function (model, ctx) {
    var i, l;
    var bones = model.bones;
    var boneLookup = model.boneLookup;

    this.initialReference = model.initialReference;
    this.sts = model.sts;
    this.stc = model.stc;
    this.stg = model.stg;

    this.boneLookup = boneLookup;

    BaseSkeleton.call(this, boneLookup.length, ctx);

    for (i = 0, l = bones.length; i < l; i++) {
        this.nodes[i] = new M3.ShallowBone(bones[i]);
    }

    this.localMatrix = mat4.create();
    this.rotationMatrix = mat4.create();

    this.locationVec = vec3.create();
    this.scaleVec = vec3.create();
    this.rotationQuat = quat.create();

    this.rootScaler = vec3.fromValues(100, 100, 100);
};

M3.Skeleton.prototype = extend(BaseSkeleton.prototype, {
    update: function (sequence, frame, instance, ctx) {
        var root = this.rootNode;

        mat4.copy(root.worldMatrix, instance.worldMatrix);

        // Transform the skeleton to approximately match the size of Warcraft 3 models, and to have the same rotation
        mat4.scale(root.worldMatrix, root.worldMatrix, this.rootScaler);
        mat4.rotateZ(root.worldMatrix, root.worldMatrix, Math.PI / 2);

        mat4.decomposeScale(root.scale, root.worldMatrix);
        vec3.inverse(root.inverseScale, root.scale);

        for (var i = 0, l = this.nodes.length; i < l; i++) {
            this.updateBone(this.nodes[i], sequence, frame);
        }

        this.updateHW(sequence, ctx);
    },

    getValue: function (out, animRef, sequence, frame) {
        if (sequence !== -1) {
            return this.stg[sequence].getValue(out, animRef, frame)
        }

        return animRef.initValue;
    },

    updateBone: function (bone, sequence, frame) {
        var parent = this.getNode(bone.parent);
        var location = this.getValue(this.locationVec, bone.boneImpl.location, sequence, frame);
        var rotation = this.getValue(this.rotationQuat, bone.boneImpl.rotation, sequence, frame);
        var scale = this.getValue(this.scaleVec, bone.boneImpl.scale, sequence, frame);
        
        bone.update(parent, rotation, location, scale);
    },

    updateHW: function (sequence, ctx) {
        var bones = this.nodes;
        var hwbones = this.hwbones;
        var initialReferences = this.initialReference;
        var boneLookup = this.boneLookup;
        var bone;
        var finalMatrix;

        if (sequence === -1) {
            finalMatrix = this.rootNode.worldMatrix;
        } else {
            finalMatrix = this.localMatrix;
        }

        for (var i = 0, l = boneLookup.length; i < l; i++) {
            if (sequence !== -1) {
                bone = boneLookup[i];
                mat4.multiply(finalMatrix, bones[bone].worldMatrix, initialReferences[bone]);
            } 

            hwbones.set(finalMatrix, i * 16);
        }

        this.updateBoneTexture(ctx);
    }
});
M3.BoundingShape = function (boundingshape, bones, gl) {
    this.bone = boundingshape.bone;
    this.matrix = boundingshape.matrix;
    this.name = bones[boundingshape.bone].name;

    var size = boundingshape.size;
    var shape;

    if (boundingshape.shape === 0) {
        shape = gl.createCube(-size[0], -size[1], -size[2], size[0], size[1], size[2]);
    } else if (boundingshape.shape === 1) {
        shape = gl.createSphere(0, 0, 0, 9, 9, size[0]);
    } else {
        shape = gl.createCylinder(0, 0, 0, size[0], size[1], 9);
    }

    this.shape = shape;
};

M3.BoundingShape.prototype = {
    render: function (shader, bones, gl) {
        var ctx = gl.ctx;

        if (this.shape) {
            gl.pushMatrix();

            gl.multMat(bones[this.bone].worldMatrix);
            gl.multMat(this.matrix);

            ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());

            gl.popMatrix();

            this.shape.renderLines(shader);
        }
    }
};
M3.Region = function (region, triangles, elementArray, edgeArray, offset) {
    var i, j, k;
    var firstVertexIndex = region.firstVertexIndex;
    var triangleIndicesCount = region.triangleIndicesCount;
    var firstTriangleIndex = region.firstTriangleIndex;

    // Note for implementors: the one original vertex indices array could be used with access to the base-vertex draw elements function.
    // See https://www.opengl.org/sdk/docs/man3/xhtml/glDrawElementsBaseVertex.xml
    // firstTriangleIndex is the indices offset.
    // firstVertexIndex is the base vertex.
    for (i = 0; i < triangleIndicesCount; i++) {
        elementArray[offset + i] = triangles[firstTriangleIndex + i] + firstVertexIndex;
    }

    for (i = 0, k = 0; i < triangleIndicesCount; i += 3, k += 6) {
        edgeArray[offset * 2 + k + 0] = triangles[firstTriangleIndex + i + 0] + firstVertexIndex;
        edgeArray[offset * 2 + k + 1] = triangles[firstTriangleIndex + i + 1] + firstVertexIndex;
        edgeArray[offset * 2 + k + 2] = triangles[firstTriangleIndex + i + 1] + firstVertexIndex;
        edgeArray[offset * 2 + k + 3] = triangles[firstTriangleIndex + i + 2] + firstVertexIndex;
        edgeArray[offset * 2 + k + 4] = triangles[firstTriangleIndex + i + 2] + firstVertexIndex;
        edgeArray[offset * 2 + k + 5] = triangles[firstTriangleIndex + i + 0] + firstVertexIndex;
    }

    this.firstBoneLookupIndex = region.firstBoneLookupIndex;
    this.offset = offset * 2;
    this.elements = triangleIndicesCount;
}

M3.Region.prototype = {
    render: function (shader, ctx) {
        ctx.uniform1f(shader.variables.u_firstBoneLookupIndex, this.firstBoneLookupIndex);
        
        ctx.drawElements(ctx.TRIANGLES, this.elements, ctx.UNSIGNED_SHORT, this.offset);
    },
    
    renderWireframe: function (shader, ctx) {
        ctx.uniform1f(shader.variables.u_firstBoneLookupIndex, this.firstBoneLookupIndex);
        
        ctx.drawElements(ctx.LINES, this.elements * 2, ctx.UNSIGNED_SHORT, this.offset * 2);
    },

    renderColor: function (shader, ctx) {
        ctx.uniform1f(shader.variables.u_firstBoneLookupIndex, this.firstBoneLookupIndex);

        ctx.drawElements(ctx.TRIANGLES, this.elements, ctx.UNSIGNED_SHORT, this.offset);
    },
    
    getPolygonCount: function () {
        return this.elements / 3;
    }
};
M3.Layer = function (layer, type, op, model, customPaths, gl) {
    this.active = false;

    // Since Gloss doesn't exist in all versions
    if (layer) {
        var uvSource = layer.uvSource;
        var flags = layer.flags;

        this.flags = flags;
        this.colorChannels = layer.colorChannels;

        this.model = model;
        this.type = type;
        this.op = op;

        var uvCoordinate = 0;

        if (uvSource === 1) {
            uvCoordinate = 1;
        } else if (uvSource === 9) {
            uvCoordinate = 2;
        } else if (uvSource === 10) {
            uvCoordinate = 3;
        }

        this.uvCoordinate = uvCoordinate;

        var uniform = "u_" + type;

        var settings = uniform + "LayerSettings.";

        this.uniforms = {
            map: uniform + "Map",
            enabled: settings + "enabled",
            op: settings + "op",
            channels: settings + "channels",
            teamColorMode: settings + "teamColorMode",
            invert: settings + "invert",
            clampResult: settings + "clampResult",
            uvCoordinate: settings + "uvCoordinate"
        };

        this.invert = flags & 0x10;
        this.clampResult = flags & 0x20;

        // I am not sure if the emissive team color mode is even used, since so far combineColors takes care of it.
        this.teamColorMode = (type === "diffuse") & 1;

        // The path is overrided with the lower case because some models have the same texture multiple times but with different letter cases, which causes multiple fetches = wasted bandwidth, memory and time.
        var source = layer.imagePath.toLowerCase();

        if (source !== "") {
            var realPath = customPaths(source);

            this.source = source;

            model.textureMap[source] = realPath;

            var fileType = fileTypeFromPath(source);

            gl.loadTexture(realPath, fileType, false, { clampS: !(flags & 0x4), clampT: !(flags & 0x8) });

            this.active = true;
        }
    }
};

M3.Layer.prototype = {
    bind: function (unit, sequence, frame, textureMap, shader, context) {
        var ctx = context.gl.ctx;
        var variables = shader.variables;
        var uniforms = this.uniforms;

        if (this.active) {
            ctx.uniform1i(variables[uniforms.map], unit);
            this.model.bindTexture(this.source, unit, textureMap, context);

            ctx.uniform1f(variables[uniforms.enabled], 1);
            ctx.uniform1f(variables[uniforms.op], this.op);
            ctx.uniform1f(variables[uniforms.channels], this.colorChannels);
            ctx.uniform1f(variables[uniforms.teamColorMode], this.teamColorMode);

            // Alpha is probably unknown12. Can this be confirmed?
            // Many of these flags seem to be incorrect
            //gl.setParameter(uniform + "multAddAlpha", [this.model.getValue(this.rgbMultiply, sequence, frame), this.model.getValue(this.rgbAdd, sequence, frame), 0]);
            //gl.setParameter(uniform + "useAlphaFactor", 0);

            ctx.uniform1f(variables[uniforms.invert], this.invert);

            //gl.setParameter(uniform + "multColor", 0);
            //gl.setParameter(uniform + "addColor", 0);

            ctx.uniform1f(variables[uniforms.clampResult], this.clampResult);

            //gl.setParameter(uniform + "useConstantColor", this.flags && 0x400);
            //gl.setParameter(uniform + "constantColor", this.model.getValue(this.color, sequence, frame));
            //gl.setParameter(settings + "uvSource", this.uvSource);

            ctx.uniform1f(variables[uniforms.uvCoordinate], this.uvCoordinate);
        } else {
            ctx.uniform1f(variables[uniforms.enabled], 0);
        }
    },

    unbind: function (shader, ctx) {
        if (this.active) {
            ctx.uniform1f(shader.variables[this.uniforms.enabled], 0);
        }
    }
};
M3.StandardMaterial = function (material, model, customPaths, gl) {
    this.name = material.name;
    this.specialFlags = material.specialFlags;
    this.flags = material.flags;
    this.blendMode = material.blendMode;
    this.priority = material.priority;
    this.specularity = material.specularity;
    this.specMult = material.specMult;
    this.emisMult = material.emisMult;
    this.layerBlendType = material.layerBlendType;
    this.emisBlendType = material.emisBlendType;
    this.emisMode = material.emisMode;

    this.layers = [
        new M3.Layer(material.diffuseLayer, "diffuse", 2, model, customPaths, gl),
        new M3.Layer(material.decalLayer, "decal", 2, model, customPaths, gl),
        new M3.Layer(material.specularLayer, "specular", 2, model, customPaths, gl),
        new M3.Layer(material.glossLayer, "gloss", 2, model, customPaths, gl),
        new M3.Layer(material.emissiveLayer, "emissive", material.emisBlendType, model, customPaths, gl),
        new M3.Layer(material.emissive2Layer, "emissive2", material.emisMode, model, customPaths, gl),
        new M3.Layer(material.evioLayer, "evio", 2, model, customPaths, gl),
        new M3.Layer(material.evioMaskLayer, "evioMask", 2, model, customPaths, gl),
        new M3.Layer(material.alphaMaskLayer, "alphaMask", 2, model, customPaths, gl),
        new M3.Layer(material.alphaMask2Layer, "alphaMask2", 2, model, customPaths, gl),
        new M3.Layer(material.normalLayer, "normal", 2, model, customPaths, gl),
        new M3.Layer(material.heightLayer, "heightMap", 2, model, customPaths, gl),
        new M3.Layer(material.lightMapLayer, "lightMap", 2, model, customPaths, gl),
        new M3.Layer(material.ambientOcclusionLayer, "ao", 2, model, customPaths, gl)
    ];
};

M3.StandardMaterial.prototype = {
    bindCommon: function (ctx) {
        if (this.blendMode === 1) {
            ctx.enable(ctx.BLEND);
            ctx.blendFunc(ctx.ONE, ctx.ONE);
        } else if (this.blendMode === 2) {
            ctx.enable(ctx.BLEND);
            ctx.blendFunc(ctx.ONE, ctx.ONE);
        } else {
            ctx.disable(ctx.BLEND);
        }

        if (this.flags & 0x8) {
            ctx.disable(ctx.CULL_FACE);
        } else {
            ctx.enable(ctx.CULL_FACE);
        }
    },

    bind: function (sequence, frame, textureMap, shader, context) {
        var ctx = context.gl.ctx;

        this.bindCommon(ctx);

        ctx.uniform1f(shader.variables.u_specularity, this.specularity);
        ctx.uniform1f(shader.variables.u_specMult, this.specMult);
        ctx.uniform1f(shader.variables.u_emisMult, this.emisMult);
        ctx.uniform4fv(shader.variables.u_lightAmbient, [0.02, 0.02, 0.02, 0]);

        var layers = this.layers;

        layers[0].bind(1, sequence, frame, textureMap, shader, context);
        layers[1].bind(2, sequence, frame, textureMap, shader, context);
        layers[2].bind(3, sequence, frame, textureMap, shader, context);
        layers[4].bind(5, sequence, frame, textureMap, shader, context);
        layers[5].bind(6, sequence, frame, textureMap, shader, context);
        layers[10].bind(11, sequence, frame, textureMap, shader, context);
        layers[12].bind(13, sequence, frame, textureMap, shader, context);
    },

    unbind: function (shader, ctx) {
        ctx.disable(ctx.BLEND);
        ctx.enable(ctx.CULL_FACE);

        var layers = this.layers;

        layers[0].unbind(shader, ctx);
        layers[1].unbind(shader, ctx);
        layers[2].unbind(shader, ctx);
        layers[4].unbind(shader, ctx);
        layers[5].unbind(shader, ctx);
        layers[10].unbind(shader, ctx);
        layers[12].unbind(shader, ctx);
    },

    bindDiffuse: function (sequence, frame, textureMap, shader, context) {
        var ctx = context.gl.ctx;

        this.bindCommon(ctx);

        this.layers[0].bind(1, sequence, frame, textureMap, shader, context);
    },

    bindSpecular: function (sequence, frame, textureMap, shader, context) {
        var ctx = context.gl.ctx;

        this.bindCommon(ctx);

        ctx.uniform1f(shader.variables.u_specularity, this.specularity, context);
        ctx.uniform1f(shader.variables.u_specMult, this.specMult, context);

        this.layers[2].bind(3, sequence, frame, textureMap, shader, context);
    },

    bindNormalMap: function (sequence, frame, textureMap, shader, context) {
        var ctx = context.gl.ctx;

        this.bindCommon(ctx);

        this.layers[10].bind(11, sequence, frame, textureMap, shader, context);
    },

    bindEmissive: function (sequence, frame, textureMap, shader, context) {
        var ctx = context.gl.ctx;

        this.bindCommon(ctx);

        ctx.uniform1f(shader.variables.u_emisMult, this.emisMult);

        this.layers[4].bind(5, sequence, frame, textureMap, shader, context);
        this.layers[5].bind(6, sequence, frame, textureMap, shader, context);
    },

    bindDecal: function (sequence, frame, textureMap, shader, context) {
        var ctx = context.gl.ctx;

        this.bindCommon(ctx);

        this.layers[1].bind(2, sequence, frame, textureMap, shader, context);
    }
};
M3.Model = function (arrayBuffer, customPaths, context, onerror) {
    BaseModel.call(this, {});

    var parser = M3.Parser(new BinaryReader(arrayBuffer));

    if (parser) {
        this.setup(parser, customPaths, context.gl);
        this.setupShaders(parser, context.gl);
    }
};

M3.Model.prototype = extend(BaseModel.prototype, {
    setup: function (parser, customPaths, gl) {
        var i, l;
        var material;
        var div = parser.divisions[0];

        this.parser = parser;
        this.name = fileNameFromPath(parser.name);

        this.setupGeometry(parser, div, gl.ctx);

        this.batches = [];
        this.materials = [[], []]; // 2D array for the possibility of adding more material types in the future
        this.materialMaps = parser.materialMaps;

        var materialMaps = parser.materialMaps;
        var materials = parser.materials;
        var batches = [];

        // Create concrete material objects for standard materials
        for (i = 0, l = materials[0].length; i < l; i++) {
            material = materials[0][i];

            this.materials[1][i] = new M3.StandardMaterial(material, this, customPaths, gl);
        }

        // Create concrete batch objects
        for (i = 0, l = div.batches.length; i < l; i++) {
            var batch = div.batches[i];
            var regionId = batch.regionIndex;
            var materialMap = materialMaps[batch.materialReferenceIndex];

            if (materialMap.materialType === 1) {
                batches.push({regionId: regionId, region: this.meshes[regionId], material: this.materials[1][materialMap.materialIndex]});
            }
        }

        /*
        var batchGroups = [[], [], [], [], [], []];

        for (i = 0, l = batches.length; i < l; i++) {
        var blendMode = batches[i].material.blendMode;

        batchGroups[blendMode].push(batches[i]);
        }

        function sortByPriority(a, b) {
        var a = a.material.priority;
        var b = b.material.priority;

        if (a < b) {
        return 1;
        } else if (a == b) {
        return 0;
        } else {
        return -1;
        }
        }

        for (i = 0; i < 6; i++) {
        batchGroups[i].sort(sortByPriority);
        }
        */
        /*
        // In the EggPortrait model the batches seem to be sorted by blend mode. Is this true for every model?
        this.batches.sort(function (a, b) {
        var ba = a.material.blendMode;
        var bb = b.material.blendMode;

        if (ba < bb) {
        return -1;
        } else if (ba == bb) {
        return 0;
        } else {
        return 1;
        }
        });
        */

        //this.batches = batchGroups[0].concat(batchGroups[1]).concat(batchGroups[2]).concat(batchGroups[3]).concat(batchGroups[4]).concat(batchGroups[5]);
        this.batches = batches;

        var sts = parser.sts;
        var stc = parser.stc;
        var stg = parser.stg;

        this.initialReference = parser.initialReference;
        this.bones = parser.bones;
        this.boneLookup = parser.boneLookup;
        this.sequences = parser.sequences;
        this.sts = [];
        this.stc = [];
        this.stg = [];

        for (i = 0, l = sts.length; i < l; i++) {
            this.sts[i] = new M3.STS(sts[i]);
        }

        for (i = 0, l = stc.length; i < l; i++) {
            this.stc[i] = new M3.STC(stc[i]);
        }

        for (i = 0, l = stg.length; i < l; i++) {
            this.stg[i] = new M3.STG(stg[i], this.sts, this.stc);
        }

        this.addGlobalAnims();

        if (parser.fuzzyHitTestObjects.length > 0) {
            for (i = 0, l = parser.fuzzyHitTestObjects.length; i < l; i++) {
                this.boundingShapes[i] = new M3.BoundingShape(parser.fuzzyHitTestObjects[i], parser.bones, gl);
            }
        }
        /*
        if (parser.particleEmitters.length > 0) {
        this.particleEmitters = [];

        for (i = 0, l = parser.particleEmitters.length; i < l; i++) {
        this.particleEmitters[i] = new M3.ParticleEmitter(parser.particleEmitters[i], this);
        }
        }
        */

        this.attachments = parser.attachmentPoints;
        this.cameras = parser.cameras;

        this.ready = true;
    },

    setupShaders: function (parser, gl) {
        // Shader setup
        var uvSetCount = this.uvSetCount;
        var uvSets = "EXPLICITUV" + (uvSetCount - 1);
        var vscommon = SHADERS.vsbonetexture + SHADERS.svscommon + "\n";
        var vsstandard = vscommon + SHADERS.svsstandard;
        var pscommon = SHADERS.spscommon + "\n";
        var psstandard = pscommon + SHADERS.spsstandard;
        var psspecialized = pscommon + SHADERS.spsspecialized;
        var NORMALS_PASS = "NORMALS_PASS";
        var HIGHRES_NORMALS = "HIGHRES_NORMALS";
        var SPECULAR_PASS = "SPECULAR_PASS";
        var UNSHADED_PASS = "UNSHADED_PASS";

        // Load all the M3 shaders.
        // All of them are based on the uv sets of this specific model.
        if (!gl.shaderStatus("sstandard" + uvSetCount)) {
            gl.createShader("sstandard" + uvSetCount, vsstandard, psstandard, [uvSets]);
        }

        if (!gl.shaderStatus("sdiffuse" + uvSetCount)) {
            gl.createShader("sdiffuse" + uvSetCount, vsstandard, psspecialized, [uvSets, "DIFFUSE_PASS"]);
        }

        if (!gl.shaderStatus("snormals" + uvSetCount)) {
            gl.createShader("snormals" + uvSetCount, vsstandard, psspecialized, [uvSets, NORMALS_PASS]);
        }

        if (!gl.shaderStatus("suvs" + uvSetCount)) {
            gl.createShader("suvs" + uvSetCount, vsstandard, psspecialized, [uvSets, "UV_PASS"]);
        }

        if (!gl.shaderStatus("snormalmap" + uvSetCount)) {
            gl.createShader("snormalmap" + uvSetCount, vsstandard, psspecialized, [uvSets, NORMALS_PASS, HIGHRES_NORMALS]);
        }

        if (!gl.shaderStatus("sspecular" + uvSetCount)) {
            gl.createShader("sspecular" + uvSetCount, vsstandard, psspecialized, [uvSets, SPECULAR_PASS]);
        }

        if (!gl.shaderStatus("sspecular_normalmap" + uvSetCount)) {
            gl.createShader("sspecular_normalmap" + uvSetCount, vsstandard, psspecialized, [uvSets, SPECULAR_PASS, HIGHRES_NORMALS]);
        }

        if (!gl.shaderStatus("semissive" + uvSetCount)) {
            gl.createShader("semissive" + uvSetCount, vsstandard, psspecialized, [uvSets, "EMISSIVE_PASS"]);
        }

        if (!gl.shaderStatus("sunshaded" + uvSetCount)) {
            gl.createShader("sunshaded" + uvSetCount, vsstandard, psspecialized, [uvSets, UNSHADED_PASS]);
        }

        if (!gl.shaderStatus("sunshaded_normalmap" + uvSetCount)) {
            gl.createShader("sunshaded_normalmap" + uvSetCount, vsstandard, psspecialized, [uvSets, UNSHADED_PASS, HIGHRES_NORMALS]);
        }

        if (!gl.shaderStatus("sdecal" + uvSetCount)) {
            gl.createShader("sdecal" + uvSetCount, vsstandard, psspecialized, [uvSets, "DECAL_PASS"]);
        }

        if (!gl.shaderStatus("swhite" + uvSetCount)) {
            gl.createShader("swhite" + uvSetCount, vscommon + SHADERS.svswhite, SHADERS.pswhite);
        }

        if (!gl.shaderStatus("sparticles" + uvSetCount)) {
            gl.createShader("sparticles" + uvSetCount, SHADERS.svsparticles, SHADERS.spsparticles);
        } 

        if (!gl.shaderStatus("scolor")) {
            gl.createShader("scolor", SHADERS.vsbonetexture + SHADERS.svscolor, SHADERS.pscolor);
        }
    },

    setupGeometry: function (parser, div, ctx) {
        var i, l;
        var uvSetCount = parser.uvSetCount;
        var regions = div.regions;
        var totalElements = 0;
        var offsets = [];

        for (i = 0, l = regions.length; i < l; i++) {
            offsets[i] = totalElements;
            totalElements += regions[i].triangleIndicesCount;
        }

        var elementArray = new Uint16Array(totalElements);
        var edgeArray = new Uint16Array(totalElements * 2);

        this.meshes = [];

        for (i = 0, l = regions.length; i < l; i++) {
            this.meshes.push(new M3.Region(regions[i], div.triangles, elementArray, edgeArray, offsets[i]));
        }

        this.elementBuffer = ctx.createBuffer();
        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
        ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, elementArray, ctx.STATIC_DRAW);

        this.edgeBuffer = ctx.createBuffer();
        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.edgeBuffer);
        ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, edgeArray, ctx.STATIC_DRAW);

        var arrayBuffer = ctx.createBuffer();
        ctx.bindBuffer(ctx.ARRAY_BUFFER, arrayBuffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, parser.vertices, ctx.STATIC_DRAW);

        this.arrayBuffer = arrayBuffer;
        this.vertexSize = (7 + uvSetCount) * 4;
        this.uvSetCount = uvSetCount;
    },

    mapMaterial: function (index) {
        var materialMap = this.materialMaps[index];

        return this.materials[materialMap.materialType][materialMap.materialIndex];
    },

    addGlobalAnims: function () {
    /*
    var i, l;
    var glbirth, glstand, gldeath;
    var stgs = this.stg;
    var stg, name;

    for (i = 0, l = stgs.length; i < l; i++) {
    stg = stgs[i];
    name = stg.name.toLowerCase(); // Because obviously there will be a wrong case in some model...

    if (name === "glbirth") {
    glbirth = stg;
    } else if (name === "glstand") {
    glstand = stg;
    } else if (name === "gldeath") {
    gldeath = stg;
    }
    }

    for (i = 0, l = stgs.length; i < l; i++) {
    stg = stgs[i];
    name = stg.name.toLowerCase(); // Because obviously there will be a wrong case in some model...

    if (name !== "glbirth" && name !== "glstand" && name !== "gldeath") {
    if (name.indexOf("birth") !== -1 && glbirth) {
    stg.stcIndices = stg.stcIndices.concat(glbirth.stcIndices);
    } else  if (name.indexOf("death") !== -1 && gldeath) {
    stg.stcIndices = stg.stcIndices.concat(gldeath.stcIndices);
    } else if (glstand) {
    stg.stcIndices = stg.stcIndices.concat(glstand.stcIndices);
    }
    }
    }
    */
    },

    getValue: function (animRef, sequence, frame) {
        if (sequence !== -1) {
            return this.stg[sequence].getValue(animRef, frame)
        } else {
            return animRef.initValue;
        }
    },

    bind: function (shader, ctx) {
        var vertexSize = this.vertexSize;
        var uvSetCount = this.uvSetCount;

        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.arrayBuffer);

        ctx.vertexAttribPointer(shader.variables.a_position, 3, ctx.FLOAT, false, vertexSize, 0);
        ctx.vertexAttribPointer(shader.variables.a_weights, 4, ctx.UNSIGNED_BYTE, false, vertexSize, 12);
        ctx.vertexAttribPointer(shader.variables.a_bones, 4, ctx.UNSIGNED_BYTE, false, vertexSize, 16);
        ctx.vertexAttribPointer(shader.variables.a_normal, 4, ctx.UNSIGNED_BYTE, false, vertexSize, 20);

        for (var i = 0; i < uvSetCount; i++) {
            ctx.vertexAttribPointer(shader.variables["a_uv" + i], 2, ctx.SHORT, false, vertexSize, 24 + i * 4);
        }

        ctx.vertexAttribPointer(shader.variables.a_tangent, 4, ctx.UNSIGNED_BYTE, false, vertexSize, 24 + uvSetCount * 4);

        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
    },
    
    bindWireframe: function (shader, ctx) {
        var vertexSize = this.vertexSize;

        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.arrayBuffer);

        ctx.vertexAttribPointer(shader.variables.a_position, 3, ctx.FLOAT, false, vertexSize, 0);
        ctx.vertexAttribPointer(shader.variables.a_weights, 4, ctx.UNSIGNED_BYTE, false, vertexSize, 12);
        ctx.vertexAttribPointer(shader.variables.a_bones, 4, ctx.UNSIGNED_BYTE, false, vertexSize, 16);
        
        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.edgeBuffer);
    },

    bindColor: function (shader, ctx) {
        var vertexSize = this.vertexSize;

        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.arrayBuffer);

        ctx.vertexAttribPointer(shader.variables.a_position, 3, ctx.FLOAT, false, vertexSize, 0);
        ctx.vertexAttribPointer(shader.variables.a_weights, 4, ctx.UNSIGNED_BYTE, false, vertexSize, 12);
        ctx.vertexAttribPointer(shader.variables.a_bones, 4, ctx.UNSIGNED_BYTE, false, vertexSize, 16);

        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
    },

    render: function (instance, context) {
        var gl = context.gl;
        var ctx = gl.ctx;
        var i, l;
        var sequence = instance.sequence;
        var frame = instance.frame;
        var tc;
        var teamId = instance.teamColor;
        var shaderName = context.shaders[context.shader];
        var uvSetCount = this.uvSetCount;
        var realShaderName = "s" + shaderName + uvSetCount;
        // Instance-based texture overriding
        var textureMap = instance.textureMap;
        var shader;
        
        var polygonMode = context.polygonMode;
        var renderGeosets = (polygonMode === 1 || polygonMode === 3);
        var renderWireframe = (polygonMode === 2 || polygonMode === 3);
        
        if (renderGeosets && gl.shaderStatus(realShaderName)) {
            // Use a black team color if team colors are disabled
            if (!context.teamColorsMode) {
                teamId = 13;
            }

            shader = gl.bindShader(realShaderName);

            instance.skeleton.bind(shader, ctx);

            ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());
            ctx.uniformMatrix4fv(shader.variables.u_mv, false, gl.getViewMatrix());

            ctx.uniform3fv(shader.variables.u_teamColor, context.teamColors[teamId]);
            ctx.uniform3fv(shader.variables.u_eyePos, context.camera.location);
            ctx.uniform3fv(shader.variables.u_lightPos, context.lightPosition);

            // Bind the vertices
            this.bind(shader, ctx);

            for (i = 0, l = this.batches.length; i < l; i++) {
                var batch = this.batches[i];

                if (instance.meshVisibilities[batch.regionId]) {
                    var region = batch.region;
                    var material = batch.material;

                    if (shaderName === "standard" || shaderName === "uvs") {
                        material.bind(sequence, frame, textureMap, shader, context);
                    } else if (shaderName === "diffuse") {
                        material.bindDiffuse(sequence, frame, textureMap, shader, context);
                    } else if (shaderName === "normalmap" || shaderName === "unshaded_normalmap") {
                        material.bindNormalMap(sequence, frame, textureMap, shader, context);
                    } else if (shaderName === "specular") {
                        material.bindSpecular(sequence, frame, textureMap, shader, context);
                    } else if (shaderName === "specular_normalmap") {
                        material.bindSpecular(sequence, frame, textureMap, shader, context);
                        material.bindNormalMap(sequence, frame, textureMap, shader, context);
                    } else if (shaderName === "emissive") {
                        material.bindEmissive(sequence, frame, textureMap, shader, context);
                    } else if (shaderName === "decal") {
                        material.bindDecal(sequence, frame, textureMap, shader, context);
                    }

                    region.render(shader, ctx, context.polygonMode);

                    material.unbind(shader, ctx); // This is required to not use by mistake layers from this material that were bound and are not overwritten by the next material
                }
            }
        }
        
        if (renderWireframe && gl.shaderStatus("swhite" + uvSetCount)) {
            shader = gl.bindShader("swhite" + uvSetCount);

            instance.skeleton.bind(shader, ctx);

            ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());

            // Bind the vertices
            this.bindWireframe(shader, ctx);

            for (i = 0, l = this.batches.length; i < l; i++) {
                var batch = this.batches[i];

                if (instance.meshVisibilities[batch.regionId]) {
                    var region = batch.region;
                    var material = batch.material;

                    region.renderWireframe(shader, ctx);
                }
            }
        }
    },

    renderEmitters: function (instance, context) {
    /*
    if (this.particleEmitters) {
    ctx.disable(ctx.CULL_FACE);

    for (i = 0, l = this.particleEmitters.length; i < l; i++) {
    gl.bindShader("particles");

    gl.bindMVP("u_mvp");

    this.particleEmitters[i].render();
    }

    ctx.enable(ctx.CULL_FACE);
    }
    */
    },

    renderBoundingShapes: function (instance, context) {
        var gl = context.gl,
            ctx = gl.ctx,
            shader,
            fuzzyHitTestObject;

        if (this.boundingShapes && gl.shaderStatus("white")) {
            ctx.depthMask(1);

            shader = gl.bindShader("white");

            for (i = 0, l = this.boundingShapes.length; i < l; i++) {
                this.boundingShapes[i].render(shader, instance.skeleton.bones, gl);
            }
        }
    },

    renderColor: function (instance, color, context) {
        var gl = context.gl;
        var ctx = gl.ctx;
        var i, l;
        var batch, region;

        if (gl.shaderStatus("scolor")) {
            var shader = gl.bindShader("scolor");

            instance.skeleton.bind(shader, ctx);

            ctx.uniformMatrix4fv(shader.variables.u_mvp, false, gl.getViewProjectionMatrix());
            ctx.uniform3fv(shader.variables.u_color, color);

            // Bind the vertices
            this.bindColor(shader, ctx);

            for (i = 0, l = this.batches.length; i < l; i++) {
                batch = this.batches[i];

                if (instance.meshVisibilities[batch.regionId]) {
                    region = batch.region;

                    region.renderColor(shader, ctx);
                }
            }
        }
    },

    bindTexture: function (source, unit, textureMap, context) {
        var texture;

        if (this.textureMap[source]) {
            texture = this.textureMap[source];
        }

        if (textureMap[source]) {
            texture = textureMap[source];   
        }

        context.gl.bindTexture(texture, unit);
    }
});
M3.ModelInstance = function (model, customPaths, context) {
    BaseModelInstance.call(this, model, {});

    this.setup(model, context);
};

M3.ModelInstance.prototype = extend(BaseModelInstance.prototype, {
    setup: function (model, context) {
        this.skeleton = new M3.Skeleton(model, context.gl.ctx);
    },

    update: function (worldMatrix, context) {
        var i, l;
        var sequenceId = this.sequence;
        var allowCreate = false;

        if (sequenceId !== -1) {
            var sequence = this.model.sequences[sequenceId];

            this.frame += context.frameTime;

            if (this.frame > sequence.animationEnd) {
                if ((this.sequenceLoopMode === 0 && !(sequence.flags & 0x1)) || this.sequenceLoopMode === 2) {
                    this.frame = 0;
                }
            }

            allowCreate = true;
        }

        this.skeleton.update(sequenceId, this.frame, worldMatrix, context.gl.ctx);

        /*
        if (this.particleEmitters) {
        for (i = 0, l = this.particleEmitters.length; i < l; i++) {
        this.particleEmitters[i].update(allowCreate, sequenceId, this.frame);
        }
        }
        */
    },

    setSequence: function (sequence) {
        this.sequence = sequence;
        this.frame = 0;
    },

    setTeamColor: function (id) {
        this.teamColor = id;
    },

    getAttachment: function (id) {
        var attachment = this.model.getAttachment(id);

        if (attachment) {
            return this.skeleton.nodes[attachment.bone];
        } else {
            return this.skeleton.root;
        }
    }
});
