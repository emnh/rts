uniform sampler2D u_boneMap;
uniform float u_matrix_size;
uniform float u_texel_size;
uniform float u_frame_size;
uniform float u_frame;

highp mat4 transpose(in highp mat4 inMatrix) {
  highp vec4 i0 = inMatrix[0];
  highp vec4 i1 = inMatrix[1];
  highp vec4 i2 = inMatrix[2];
  highp vec4 i3 = inMatrix[3];

  highp mat4 outMatrix = mat4(
                   vec4(i0.x, i1.x, i2.x, i3.x),
                   vec4(i0.y, i1.y, i2.y, i3.y),
                   vec4(i0.z, i1.z, i2.z, i3.z),
                   vec4(i0.w, i1.w, i2.w, i3.w)
                   );
  return outMatrix;
}

mat4 boneAtIndex(float index) {
    float offset = index * u_matrix_size;
    float frame = fract(u_frame * u_frame_size);
    mat4 ret = mat4(
        texture2D(u_boneMap, vec2(offset, frame)),
        texture2D(u_boneMap, vec2(offset + u_texel_size, frame)),
        texture2D(u_boneMap, vec2(offset + u_texel_size * 2.0, frame)),
        texture2D(u_boneMap, vec2(offset + u_texel_size * 3.0, frame)));
    return ret;
}

vec3 TBN(vec3 vector, vec3 tangent, vec3 binormal, vec3 normal) {
    vec3 transformed;

    transformed.x = dot(vector, tangent);
    transformed.y = dot(vector, binormal);
    transformed.z = dot(vector, normal);

    return transformed;
}

vec4 decodeVector(vec4 v) {
    return ((v / 255.0) * 2.0) - 1.0;
}

#define u_mvp projectionMatrix * modelViewMatrix
#define u_mv modelViewMatrix
uniform vec3 u_eyePos;
uniform vec3 u_lightPos;
uniform float u_firstBoneLookupIndex;

attribute vec3 a_position;
attribute vec4 a_normal;
attribute vec2 a_uv0;

#ifdef EXPLICITUV1
attribute vec2 a_uv1;
#endif
#ifdef EXPLICITUV2
attribute vec2 a_uv1;
attribute vec2 a_uv2;
#endif
#ifdef EXPLICITUV3
attribute vec2 a_uv1;
attribute vec2 a_uv2;
attribute vec2 a_uv3;
#endif

attribute vec4 a_tangent;
attribute vec4 a_bones;
attribute vec4 a_weights;

varying vec3 v_normal;
varying vec2 v_uv[4];
varying vec3 v_lightDir;
varying vec3 v_eyeVec;
varying vec3 v_halfVec;

void transform(vec3 inposition, vec3 innormal, vec3 intangent, vec4 bones, vec4 weights, out vec3 outposition, out vec3 outnormal, out vec3 outtangent) {
    vec4 position = vec4(inposition, 1);
    vec4 normal = vec4(innormal, 0);
    vec4 tangent = vec4(intangent, 0);
    vec4 temp;

    mat4 weightedBone0 = boneAtIndex(bones[0]) * weights[0];
    mat4 weightedBone1 = boneAtIndex(bones[1]) * weights[1];
    mat4 weightedBone2 = boneAtIndex(bones[2]) * weights[2];
    mat4 weightedBone3 = boneAtIndex(bones[3]) * weights[3];

    temp = vec4(0);
    temp += weightedBone0 * position;
    temp += weightedBone1 * position;
    temp += weightedBone2 * position;
    temp += weightedBone3 * position;
    outposition = vec3(temp);

    temp = vec4(0);
    temp += weightedBone0 * normal;
    temp += weightedBone1 * normal;
    temp += weightedBone2 * normal;
    temp += weightedBone3 * normal;
    outnormal = normalize(vec3(temp));

    temp = vec4(0);
    temp += weightedBone0 * tangent;
    temp += weightedBone1 * tangent;
    temp += weightedBone2 * tangent;
    temp += weightedBone3 * tangent;
    outtangent = normalize(vec3(temp));
}

void main() {
    vec4 decodedNormal = decodeVector(a_normal);
    vec4 decodedTangent = decodeVector(a_tangent);
    vec3 position, normal, tangent;

    transform(a_position, vec3(decodedNormal), vec3(decodedTangent), a_bones + u_firstBoneLookupIndex, a_weights / 255.0, position, normal, tangent);

    mat3 mv = mat3(u_mv);

    vec3 position_mv = (u_mv * vec4(position, 1)).xyz;

    vec3 n = normalize(mv * normal);
    vec3 t = normalize(mv * tangent);
    vec3 b = normalize(cross(n, t) * decodedNormal.w);

    vec3 lightDir = normalize(u_lightPos - position_mv);
    v_lightDir = normalize(TBN(lightDir, t, b, n));

    vec3 eyeVec = normalize(u_eyePos - position_mv);
    vec3 halfVec = normalize(eyeVec - u_lightPos);

    v_eyeVec = TBN(eyeVec, t, b, n);
    v_halfVec = TBN(halfVec, t, b, n);

    v_normal = n;

    v_uv[0] = a_uv0 / 2048.0;

    v_uv[1] = vec2(0);
    v_uv[2] = vec2(0);
    v_uv[3] = vec2(0);

    #ifdef EXPLICITUV1
    v_uv[1] = a_uv1 / 2048.0;
    #endif
    #ifdef EXPLICITUV2
    v_uv[1] = a_uv1 / 2048.0;
    v_uv[2] = a_uv2 / 2048.0;
    #endif
    #ifdef EXPLICITUV3
    v_uv[1] = a_uv1 / 2048.0;
    v_uv[2] = a_uv2 / 2048.0;
    v_uv[3] = a_uv3 / 2048.0;
    #endif

    gl_Position = u_mvp * vec4(position, 1);
    //gl_Position = u_mvp * vec4(a_position, 1);
}
