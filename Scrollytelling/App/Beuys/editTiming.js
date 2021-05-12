import * as THREE from '../../components/three/build/three.module.js';
import {CSS2DObject} from '../../components/three/examples/jsm/renderers/CSS2DRenderer.js';

import { u } from '../Scrollytelling/mappings.js';

import Beuys from './variables.js';
import { name, position, setPosition, getIndexByPage } from './access.js';

// 

export function createGraph() {

  let graphPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 2),
    new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide,
      depthTest: false
    })
  );

  graphPlane.position.set(-10, 3, 0);
  graphPlane.name = 'GraphPlane';

  const zeroLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3( -10, 0, 0 ),
      new THREE.Vector3( 0, 0, 0 ),
      new THREE.Vector3( 10, 0, 0 )
    ]),
    new THREE.LineBasicMaterial({
      color: 0x000000,
      depthTest: false
    })
  );

  const samples = new THREE.Object3D();

  for (let y = 0; y < 10 * window.innerHeight; y++) {

    let coord = new THREE.Vector3(-6 + y / 1000, u(y), 0);
    
    // let coordOnPlane = new THREE.Vector3().addVectors(graphPlane.position, coord);
    
    if (y % 40 == 0) {

      let mesh = new THREE.Mesh(new THREE.SphereGeometry(0.01), new THREE.MeshLambertMaterial({ 
        color: 0x000000,
        depthTest: false
      }));
      mesh.position.copy(coord);
      samples.add(mesh);

    }

    if (y % window.innerHeight == 0) {

      // red point
      
      let mesh = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshLambertMaterial({ 
        color: 0xFF0000,
        depthTest: false
      }));
      mesh.position.copy(coord);

      // text label

      let label = document.createElement( 'div' );
      label.className = 'label';
      label.innerHTML = '' + name(getIndexByPage(Math.floor(y / window.innerHeight))).substr(0,10) + '<br>' +
        'Page ' + (y / window.innerHeight).toFixed() + '<br>' +
        '' + (coord.y * 100).toFixed() + '% travelled';
      label.style.marginTop = '3em';
      const labelObj = new CSS2DObject( label );
      labelObj.position.set( 0, 0, 0 );

      mesh.add(labelObj);
      samples.add(mesh);
    }

  }

  graphPlane.add(zeroLine);
  graphPlane.add(samples);
  Beuys.scene.add(graphPlane);

}