'use strict';

import THREE from 'three';
import WindMeshShader from './WindMeshShader';

export default class Grass extends THREE.Object3D {
  constructor() {
    super();

    this.height = 5.0;
    this.loader = new THREE.TextureLoader();
    this.loader.load(
      // resource URL
      'texture/grass.png',
      // Function when resource is loaded
      ( texture ) => {
        // do something with the texture
        this.windMaterial = this.getWindMaterial();
        this.grassTex = texture;

        this.initGrass();
        this.initTerrain();
      },
      // Function called when download errors
      function ( xhr ) {
        console.log( 'An error happened' );
      }
    );
  }

  initGrass() {
    let mat = new THREE.MeshPhongMaterial({map: this.grassTex});
    const num = 15;

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        let x = ((i/num) - 0.5) * 50 + THREE.Math.randFloat(-1,1)
        let y = ((j/num) - 0.5) * 50 + THREE.Math.randFloat(-1,1)
        this.add( this.instanceGrass( x, 2.5, y, this.height, mat ) )
      };
    };
  }

  instanceGrass(x,y,z,height,mat) {
    let modelGeometry = new THREE.CylinderGeometry( 0.9, 0.0, height, 3, 5 );
    let windFactors = new Float32Array( modelGeometry.vertices.length );

    for (var i = 0; i < modelGeometry.vertices.length; i++) {
      let vertex = modelGeometry.vertices[i];
      let r = (vertex.y / height) + 0.5;
      windFactors[i] = r * r * r;
    };

    let geometry = new THREE.BufferGeometry().fromGeometry(modelGeometry);

    geometry.addAttribute( 'windFactor', new THREE.BufferAttribute( windFactors, 1 ) );
    let mesh = new THREE.Mesh( geometry, this.windMaterial );
    mesh.position.set( x, y, z );
    
    return mesh;
  }



  getWindMaterial() {
    let material, params, shader, uniforms;
    shader = new WindMeshShader();
    uniforms = shader.uniforms;
    params = {};
    params.uniforms = shader.uniforms;
    params.light = true;
    //params.vertexShader = document.getElementById( 'vertexshader' ).textContent;
    //params.fragmentShader = document.getElementById( 'fragmentshader' ).textContent;
    material = new THREE.ShaderMaterial(params);
    uniforms["diffuse"].value = new THREE.Color(0xFFFFFF);
    uniforms["ambient"].value = new THREE.Color(0xCCCCCC);
    uniforms["specular"].value = new THREE.Color(0xFFFFFF);
    uniforms["map"].value = material.map = this.grassTex;
    uniforms["tWindForce"].value = this.noiseMap;
    uniforms["windScale"].value = 1;
    uniforms["windMin"].value = new THREE.Vector2(-30, -30);
    uniforms["windSize"].value = new THREE.Vector2(60, 60);
    uniforms["windDirection"].value = this.windDirection;
    console.log(material);

    return material;
  }

  initTerrain() {
    this.plane = new THREE.Mesh( new THREE.PlaneGeometry(60, 60, 2, 2), new THREE.MeshPhongMaterial({ map: this.grassTex }));
    this.plane.rotation.x = -Math.PI/2;
    this.add( this.plane );
  }

  update() {
  }
}