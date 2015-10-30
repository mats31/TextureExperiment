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
    let positions = new Float32Array( modelGeometry.vertices.length * 3 );
    let faces = new Float32Array( modelGeometry.faces.length * 3 );
    let windFactors = new Float32Array( modelGeometry.vertices.length );

    for (var i = 0; i < modelGeometry.vertices.length; i++) {
      let vertex = modelGeometry.vertices[i];
      let faceVertex = modelGeometry.faces[i].normal;
      let r = (vertex.y / height) + 0.5;

      vertex.toArray(positions, i * 3);
      // faces[i *3+0] = modelGeometry.faces[i].a;
      // faces[i*3+1] = modelGeometry.faces[i].b;
      // faces[i*3+2] = modelGeometry.faces[i].c;
      faceVertex.toArray(faces, i * 3);
      windFactors[i] = r * r * r;
    };
    //console.log(modelGeometry.vertices);
    //console.log(positions);

    let geometry = new THREE.BufferGeometry();
    console.log(modelGeometry);
    console.log(geometry);

    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'normal', new THREE.BufferAttribute( faces, 3 ) );
    geometry.addAttribute( 'windFactor', new THREE.BufferAttribute( windFactors, 1 ) );
    // for (var i = 0; i < geometry.vertices.length; i++) {
    //   let v = geometry.vertices[i];
    //   let r = (v.y / height) + 0.5;
    //   this.material.attributes.windFactor.value[i] = r * r * r;
    // };
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