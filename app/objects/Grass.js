'use strict';

import THREE from 'three';

export default class Grass extends THREE.Object3D {
  constructor() {
    super();

    this.loader = new THREE.TextureLoader();
    this.loader.load(
      // resource URL
      'texture/grass.png',
      // Function when resource is loaded
      ( texture ) => {
        console.log(texture);
        // do something with the texture
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
        this.add( this.instanceGrass( x, 2.5, y, 5.0, mat ) )
      };
    };
  }

  instanceGrass(x,y,z,height,mat) {
    let geometry = new THREE.CylinderGeometry( 0.9, 0.0, height, 3, 5 );
    let windMaterial = new THREE.ShaderMaterial();
    for (var i = 0; i < geometry.vertices.length; i++) {
      let v = geometry.vertices[i];
      let r = (v.y / height) + 0.5;
      windMaterial.attributes.windFactor.value[i] = r * r * r;
    };
    let mesh = new THREE.Mesh( geometry, windMaterial );
    mesh.position.set( x, y, z );
    
    return mesh;
  }

  initTerrain() {
    this.plane = new THREE.Mesh( new THREE.PlaneGeometry(60, 60, 2, 2), new THREE.MeshPhongMaterial({ map: this.grassTex }));
    this.plane.rotation.x = -Math.PI/2;
    this.add( this.plane );
  }

  update() {
  }
}