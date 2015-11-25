'use strict';

import THREE from 'three';
import NoiseShader from './NoiseShader';
import WindMeshShader from './WindMeshShader';
import WindParticleShader from './WindParticleShader';
import DDSLoader from '../loaders/DDSLoader';

export default class Grass extends THREE.Object3D {
  constructor() {
    super();

    this.clock = new THREE.Clock();
    this.height = 5.0;
    this.noiseSpeed = 0.046;
    this.noiseOffsetSpeed = 0.11;
    this.windDirection = new THREE.Vector3(1, 0, 0);
    this.loader = new THREE.TextureLoader();
    this.grasses = [];
    this.dustSettings = [];
    this.dustSystems = [];
    this.dustSystemMinX = -30;
    this.dustSystemMinY = 0;
    this.dustSystemMinZ = -30;
    this.dustSystemMaxX = 30;
    this.dustSystemMaxY = 20;
    this.dustSystemMaxZ = 30;
    this.loader.load(
      // resource URL
      'texture/grass.png',
      // Function when resource is loaded
      ( texture ) => {
        // do something with the texture

        this.grassTex = texture;

        let mat = new THREE.MeshPhongMaterial({map: this.grassTex});

        this.initNoiseShader();
        this.windMaterial = this.getWindMaterial();
        this.initTerrain();
        this.initGrass();
        this.initDust();
        console.log(this);
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
    let geometry = new THREE.BufferGeometry().fromGeometry(modelGeometry);
    let windFactors = new Float32Array( geometry.attributes.position.array.length );

    for (var i = 0, i3 = 0; i < geometry.attributes.position.array.length / 3; i++, i3 += 3) {
      let vertex = geometry.attributes.position.array[i3 + 1];
      let r = (vertex / height) + 0.5;
      windFactors[i] = r * r * r;
    };

    geometry.addAttribute( 'windFactor', new THREE.BufferAttribute( windFactors, 1 ) );
    let mesh = new THREE.Mesh( geometry, this.windMaterial );
    console.log(this.windMaterial.tWindForce)
    mesh.position.set( x, y, z );
    this.grasses.push(mesh);
    return mesh;
  }

  getWindMaterial() {
    let material, params, shader, uniforms;
    shader = new WindMeshShader();
    uniforms = shader.uniforms;
    params = {};
    params.uniforms = shader.uniforms;
    params.vertexShader = shader.vertexShader;
    params.fragmentShader = shader.fragmentShader;
    params.lights = true;
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

    return material;
  }

  initNoiseShader() {
    this.noiseMap  = new THREE.WebGLRenderTarget( 256, 256, {
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat 
    });
    this.noiseShader = new NoiseShader()
    this.noiseShader.uniforms.vScale.value.set(0.3,0.3)
    this.noiseScene = new THREE.Scene()
    this.noiseCameraOrtho = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
    this.noiseCameraOrtho.position.z = 100
    this.noiseScene.add( this.noiseCameraOrtho )

    this.noiseMaterial = new THREE.ShaderMaterial({
      fragmentShader: this.noiseShader.fragmentShader,
      vertexShader: this.noiseShader.vertexShader,
      uniforms: this.noiseShader.uniforms,
      lights:false,
    });

    this.noiseQuadTarget = new THREE.Mesh( new THREE.PlaneGeometry(window.innerWidth,window.innerHeight,100,100), this.noiseMaterial )
    this.noiseQuadTarget.position.z = -500
    this.noiseScene.add( this.noiseQuadTarget )
  }

  initTerrain() {
    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(60, 60, 2, 2), new THREE.MeshPhongMaterial({
      map: this.noiseMap,
      lights: false
    }));
    //this.plane = new THREE.Mesh( new THREE.PlaneGeometry(60, 60, 2, 2), new THREE.MeshPhongMaterial({ map: this.grassTex }));
    this.plane.rotation.x = -Math.PI/2;
    this.add( this.plane );
  }

  initDust() {
    for (var i = 0; i < 5; i++) {
      let shader = new WindParticleShader()
      let params = {}
      params.fragmentShader = shader.fragmentShader;
      params.vertexShader   = shader.vertexShader;
      params.uniforms       = shader.uniforms;

      let mat  = new THREE.ShaderMaterial(params);
      let loader = new THREE.DDSLoader();
      let matLoader = loader.load("texture/dust" + i + ".dds");
      matLoader.minFilter = matLoader.magFilter = THREE.LinearFilter;
      matLoader.anisotropy = 4;

      mat.map = shader.uniforms["map"].value = matLoader;
      mat.size = shader.uniforms["size"].value = Math.random();
      mat.scale = shader.uniforms["scale"].value = 300.0;
      mat.transparent = true;
      mat.sizeAttenuation = true;
      mat.blending = THREE.AdditiveBlending;
      shader.uniforms["tWindForce"].value      = this.noiseMap;
      shader.uniforms[ "windMin" ].value       = new THREE.Vector2(-30,-30 );
      shader.uniforms[ "windSize" ].value      = new THREE.Vector2( 60, 60 );
      shader.uniforms[ "windDirection" ].value = this.windDirection;

      let geom = new THREE.BufferGeometry();
      const num = 130;
      geom.vertices = [];
      let positions = new Float32Array( num * 3 );
      let speeds = new Float32Array( num );

      for (var k = 0, k3 = 0; k <= num; k++, k3 +=3) {
        let setting = {}

        let vert = new THREE.Vector3;
        vert.x = setting.startX = THREE.Math.randFloat(this.dustSystemMinX,this.dustSystemMaxX);
        vert.y = setting.startY = THREE.Math.randFloat(this.dustSystemMinY,this.dustSystemMaxY);
        vert.z = setting.startZ = THREE.Math.randFloat(this.dustSystemMinZ,this.dustSystemMaxZ);

        setting.speed = speeds[k] = 1 + Math.random() * 10;
        
        setting.sinX = Math.random();
        setting.sinXR = Math.random() < 0.5 ? 1 : -1;
        setting.sinY = Math.random();
        setting.sinYR = Math.random() < 0.5 ? 1 : -1;
        setting.sinZ = Math.random();
        setting.sinZR = Math.random() < 0.5 ? 1 : -1;

        setting.rangeX = Math.random() * 5;
        setting.rangeY = Math.random() * 5;
        setting.rangeZ = Math.random() * 5;

        setting.vert = vert;
        positions[ k3 + 0 ] = vert.x;
        positions[ k3 + 1 ] = vert.y;
        positions[ k3 + 2 ] = vert.z;
        this.dustSettings.push(setting);
      };

      geom.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
      geom.addAttribute( 'speed', new THREE.BufferAttribute( speeds, 1 ) );
      this.particleSystem = new THREE.Points( geom, mat );
      this.dustSystems.push( this.particleSystem );
      this.add(this.particleSystem);
    };
  }

  moveDust(delta) {
    for (var i = 0; i < this.dustSettings.length; i++) {
      let vert = this.dustSettings[i].vert
      this.dustSettings[i].sinX = this.dustSettings[i].sinX + (( 0.002 * this.dustSettings[i].speed) * this.dustSettings[i].sinXR)
      this.dustSettings[i].sinY = this.dustSettings[i].sinY + (( 0.002 * this.dustSettings[i].speed) * this.dustSettings[i].sinYR)
      this.dustSettings[i].sinZ = this.dustSettings[i].sinZ + (( 0.002 * this.dustSettings[i].speed) * this.dustSettings[i].sinZR) 

      vert.x = this.dustSettings[i].startX + ( Math.sin(this.dustSettings[i].sinX) * this.dustSettings[i].rangeX )
      vert.y = this.dustSettings[i].startY + ( Math.sin(this.dustSettings[i].sinY) * this.dustSettings[i].rangeY )
      vert.z = this.dustSettings[i].startZ + ( Math.sin(this.dustSettings[i].sinZ) * this.dustSettings[i].rangeZ )
    };
  }

  update() {
      // geometry.verticesNeedUpdate = true;
      // geometry.elementsNeedUpdate = true;
      // geometry.morphTargetsNeedUpdate = true;
      // geometry.uvsNeedUpdate = true;
      // geometry.normalsNeedUpdate = true;
      // geometry.colorsNeedUpdate = true;
      // geometry.tangentsNeedUpdate = true;
      if (typeof this.grasses != 'undefined') {
        for (var i = 0; i < this.grasses.length; i++) {
          //console.log(1);
          // this.grasses[i].geometry.verticesNeedUpdate = true;
          // this.grasses[i].geometry.elementsNeedUpdate = true;
          // this.grasses[i].geometry.morphTargetsNeedUpdate = true;
          // this.grasses[i].geometry.uvsNeedUpdate = true;
          // this.grasses[i].geometry.normalsNeedUpdate = true;
          // this.grasses[i].geometry.colorsNeedUpdate = true;
          // this.grasses[i].geometry.tangentsNeedUpdate = true;
          // this.grasses[i].geometry.dynamic = true;
        };
      };

      if (this.windDirection && typeof this.noiseShader != 'undefined') {
        let delta = this.clock.getDelta()

        this.noiseShader.uniforms[ "fTime" ].value += delta * this.noiseSpeed
        this.noiseShader.uniforms[ "vOffset" ].value.x -= (delta * this.noiseOffsetSpeed) * this.windDirection.x
        this.noiseShader.uniforms[ "vOffset" ].value.y += (delta * this.noiseOffsetSpeed) * this.windDirection.z

        this.moveDust(delta);
      }
  }
}