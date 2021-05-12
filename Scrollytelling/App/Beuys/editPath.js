import * as THREE from '../../components/three/build/three.module.js';
import {DragControls} from '../../components/three/examples/jsm/controls/DragControls.js';

import MyCurve3 from '../Scrollytelling/MyCurve3.js';
import CurveHelper from '../Scrollytelling/CurveHelper.js';

import Beuys from './variables.js';
import { name, position, getIndexByPage, getIndexByPoint, 
  setPosition, insertPoint, deletePoint } from './access.js';

let dragging = null;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//

export function enableEditPath() {
  Beuys.renderer.domElement.addEventListener('mousemove', mouseMove);
  Beuys.renderer.domElement.addEventListener('click', click);
}

export function disableEditPath() {
  document.removeEventListener('mousemove', mouseMove);
  document.removeEventListener('click', click);
}

//

export function updatePath() {

  Beuys.scene.remove(Beuys.scene.getObjectByName('path'));
  let path = CurveHelper.mesh(CurveHelper.tubeGeometry(Beuys.path));
  path.name = 'path';
  path.visible = true;
  Beuys.pathMesh = path;
  Beuys.scene.add(Beuys.pathMesh);

}

//

export function updatePoints() {

  Beuys.scene.remove(Beuys.scene.getObjectByName('points'));
  let points = new THREE.Object3D();
  points.name = 'points';

  for (let i = 0; i < Beuys.POIs.length; i++) {

    let color = new THREE.MeshLambertMaterial({ 
      color: 0xFF0000, 
      transparent: true, 
      opacity: 0.9,
      depthTest: false
    });

    let point = new THREE.Mesh(new THREE.SphereGeometry(1), color);

    point.position.copy(position(i));
    point.userData.index = i;
    point.visible = true;

    points.add(point);
  }

  Beuys.scene.add(points);
  
  const controls = new DragControls(points.children, Beuys.freeCamera, Beuys.renderer.domElement);
  controls.addEventListener('dragstart', dragStart);

}

//

function dragStart(event) {
  event.object.material.emissive.set(0xaaaaaa);
  dragging = event;
}

function mouseMove(event) {

  if (Beuys.EditPathScreenSize > 0.5) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, Beuys.freeCamera );

    const intersects = raycaster.intersectObjects( [Beuys.groundPlane] );

    for (let i = 0; i < intersects.length; i++) {

      const point = intersects[i].point;

      const index = getIndexByPoint(point);

      // console.log('Click to insert point at index ' + index);

    }

  }

}

//

function click(event) {

  if (Beuys.EditPathScreenSize > 0.5) {

    let index = 0;

    if (dragging) {

      index = dragging.object.userData.index;

      dragging.object.material.emissive.set( 0x000000 );

      if (event.shiftKey) {
        if (prompt('Delete point ' + index + '?', 'yes') == 'yes')
          deletePoint(index);
      } else {
        setPosition(index, dragging.object.position);
      }

      updatePath();
      updatePoints();

      dragging = null;

    } else {

      raycaster.setFromCamera( mouse, Beuys.freeCamera );

      const intersects = raycaster.intersectObjects([Beuys.groundPlane]);

      if (intersects[0]) {

        index = getIndexByPoint(intersects[0].point);

        insertPoint(index, intersects[0].point);

        updatePoints();

        updatePath();

      }

    }

    jump(index);

    Beuys.currentFloatIndex = index;

  }

}



//

function jump(i) {

  Beuys.pathCamera.position.copy(position(i));

  //TODO Autoscroll to POI
  // Store path offset in POIs
  // https://stackoverflow.com/questions/50257825/get-position-of-point-on-curve
  // Find y by path offset
  // Smooth scroll animation
  // Set camera position/rotation/fov by y (basically what already happens in animate.js)
}