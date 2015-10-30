'use strict';

import THREE from 'three';

export default class WindMeshShader {
	
	constructor() {
		this.attributes = {
			'windFactor': {
				type: 'f',
				value: []
			}
		}

		this.uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib["common"], THREE.UniformsLib["bump"], THREE.UniformsLib["normalmap"], THREE.UniformsLib["fog"], THREE.UniformsLib["lights"], THREE.UniformsLib["shadowmap"], {
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
          value: new THREE.Vector2()
        },
        "windSize": {
          type: "v2",
          value: new THREE.Vector2()
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
	}

}