'use strict';

import THREE from 'three';

export default class WindMeshShader {
	
	constructor() {

		this.uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib[ "common" ],
      THREE.UniformsLib[ "aomap" ],
      THREE.UniformsLib[ "lightmap" ],
      THREE.UniformsLib[ "emissivemap" ],
      THREE.UniformsLib[ "bumpmap" ],
      THREE.UniformsLib[ "normalmap" ],
      THREE.UniformsLib[ "displacementmap" ],
      THREE.UniformsLib[ "fog" ],
      THREE.UniformsLib[ "lights" ],
      THREE.UniformsLib[ "shadowmap" ], {
        "ambient": {
          type: "c",
          value: new THREE.Color(0xffffff)
        },
        "emissive": {
          type: "c",
          value: new THREE.Color(0x000000)
        },
        "specular": {
          type: "c",
          value: new THREE.Color(0x111111)
        },
        "shininess": {
          type: "f",
          value: 30
        },
        "wrapRGB": {
          type: "v3",
          value: new THREE.Vector3(1, 1, 1)
        },
        "windMin": {
          type: "v2",
          value: new THREE.Vector2(-30, -30)
        },
        "windSize": {
          type: "v2",
          value: new THREE.Vector2(60, 60)
        },
        "windDirection": {
          type: "v3",
          value: new THREE.Vector3(1, 0, 0)
        },
        "tWindForce": {
          type: "t",
          value: null
        },
        "windScale": {
          type: "f",
          value: 1.0
        }
      }
    ])
    this.vertexShader = ["#define PHONG",

      "varying vec3 vViewPosition;",

      "#ifndef FLAT_SHADED",

      " varying vec3 vNormal;",

      "#endif",

      /* ----- Custom Shader --- */
      "uniform vec2 windMin;",
      "uniform vec2 windSize;",
      "uniform vec3 windDirection;",
      "uniform sampler2D tWindForce;",
      "uniform float windScale;",
      "varying float vWindForce;",
      "attribute float windFactor;",
      /* ----- End Custom Shader --- */

      THREE.ShaderChunk[ "common" ],
      THREE.ShaderChunk[ "uv_pars_vertex" ],
      THREE.ShaderChunk[ "uv2_pars_vertex" ],
      THREE.ShaderChunk[ "displacementmap_pars_vertex" ],
      THREE.ShaderChunk[ "envmap_pars_vertex" ],
      THREE.ShaderChunk[ "lights_phong_pars_vertex" ],
      THREE.ShaderChunk[ "color_pars_vertex" ],
      THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
      THREE.ShaderChunk[ "skinning_pars_vertex" ],
      THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
      THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

      "void main() {",

        THREE.ShaderChunk[ "uv_vertex" ],
        THREE.ShaderChunk[ "uv2_vertex" ],
        THREE.ShaderChunk[ "color_vertex" ],

        THREE.ShaderChunk[ "beginnormal_vertex" ],
        THREE.ShaderChunk[ "morphnormal_vertex" ],
        THREE.ShaderChunk[ "skinbase_vertex" ],
        THREE.ShaderChunk[ "skinnormal_vertex" ],
        THREE.ShaderChunk[ "defaultnormal_vertex" ],

      "#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

      " vNormal = normalize( transformedNormal );",

      "#endif",

        THREE.ShaderChunk[ "begin_vertex" ],
        THREE.ShaderChunk[ "displacementmap_vertex" ],
        THREE.ShaderChunk[ "morphtarget_vertex" ],
        THREE.ShaderChunk[ "skinning_vertex" ],
        THREE.ShaderChunk[ "project_vertex" ],
        THREE.ShaderChunk[ "logdepthbuf_vertex" ],
      /* ----- Custom Shader --- */
      "vUv = uv;",
      //vec4 wpos = modelMatrix * vec4( position, 1.0 );
      "vec4 wpos = modelMatrix * vec4( position, 1.0 );",

      "wpos.z = -wpos.z;",
      "vec2 totPos = wpos.xz - windMin;",
      "vec2 windUV = totPos / windSize;",
      "vWindForce = texture2D(tWindForce,windUV).x;",

      "float windMod = ((1.0 - vWindForce)* windFactor ) * windScale;",
      "vec4 pos = vec4(position , 1.0);",
      "pos.x += windMod * windDirection.x;",
      "pos.y += windMod * windDirection.y;",
      "pos.z += windMod * windDirection.z;",

      "mvPosition = modelViewMatrix *  pos;",

      "gl_Position = projectionMatrix * mvPosition;",
      /* -------- */

      " vViewPosition = - mvPosition.xyz;",

        THREE.ShaderChunk[ "worldpos_vertex" ],
        THREE.ShaderChunk[ "envmap_vertex" ],
        THREE.ShaderChunk[ "lights_phong_vertex" ],
        THREE.ShaderChunk[ "shadowmap_vertex" ],

      "}"

    ].join( "\n" );
    this.fragmentShader = [

      "#define PHONG",

      "uniform vec3 diffuse;",
      "uniform vec3 emissive;",
      "uniform vec3 specular;",
      "uniform float shininess;",
      "uniform float opacity;",

      THREE.ShaderChunk[ "common" ],
      THREE.ShaderChunk[ "color_pars_fragment" ],
      THREE.ShaderChunk[ "uv_pars_fragment" ],
      THREE.ShaderChunk[ "uv2_pars_fragment" ],
      THREE.ShaderChunk[ "map_pars_fragment" ],
      THREE.ShaderChunk[ "alphamap_pars_fragment" ],
      THREE.ShaderChunk[ "aomap_pars_fragment" ],
      THREE.ShaderChunk[ "lightmap_pars_fragment" ],
      THREE.ShaderChunk[ "emissivemap_pars_fragment" ],
      THREE.ShaderChunk[ "envmap_pars_fragment" ],
      THREE.ShaderChunk[ "fog_pars_fragment" ],
      THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
      THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
      THREE.ShaderChunk[ "bumpmap_pars_fragment" ],
      THREE.ShaderChunk[ "normalmap_pars_fragment" ],
      THREE.ShaderChunk[ "specularmap_pars_fragment" ],
      THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

      "void main() {",

      " vec3 outgoingLight = vec3( 0.0 );",
      " vec4 diffuseColor = vec4( diffuse, opacity );",
      " vec3 totalAmbientLight = ambientLightColor;",
      " vec3 totalEmissiveLight = emissive;",
      " vec3 shadowMask = vec3( 1.0 );",

        THREE.ShaderChunk[ "logdepthbuf_fragment" ],
        THREE.ShaderChunk[ "map_fragment" ],
        THREE.ShaderChunk[ "color_fragment" ],
        THREE.ShaderChunk[ "alphamap_fragment" ],
        THREE.ShaderChunk[ "alphatest_fragment" ],
        THREE.ShaderChunk[ "specularmap_fragment" ],
        THREE.ShaderChunk[ "normal_phong_fragment" ],
        THREE.ShaderChunk[ "lightmap_fragment" ],
        THREE.ShaderChunk[ "hemilight_fragment" ],
        THREE.ShaderChunk[ "aomap_fragment" ],
        THREE.ShaderChunk[ "emissivemap_fragment" ],

        THREE.ShaderChunk[ "lights_phong_fragment" ],
        THREE.ShaderChunk[ "shadowmap_fragment" ],

        "totalDiffuseLight *= shadowMask;",
        "totalSpecularLight *= shadowMask;",

        "#ifdef METAL",

        " outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) * specular + totalSpecularLight + totalEmissiveLight;",

        "#else",

        " outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) + totalSpecularLight + totalEmissiveLight;",

        "#endif",

        THREE.ShaderChunk[ "envmap_fragment" ],

        THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

        THREE.ShaderChunk[ "fog_fragment" ],

      " gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

      "}"

    ].join( "\n" )
    //console.log(this.vertexShader);
    //console.log(this.fragmentShader);
  }

}