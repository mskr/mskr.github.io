import * as THREE from "../../components/three/build/three.module.js";

import Beuys from './variables.js';
import params from './params.js';

import updateCamera from './updateCamera.js';
import updateIndex from './updateIndex.js';
import render from './render.js';
import { name, thingName, getIndexByName, getPageOffset } from './access.js';

//

const clock = new THREE.Clock();

//

const vistas = {
  'B_Book': {
    point: '03 Westmensch 4'
  },
  'D_Sledge': {
    point: '05 Schlitten 4'
  },
  'F_Das_Kapiital': {
    point: '07 Das Kapital Raum 4'
  },
  'J_Capri': {
    point: '09 Capri Batterie 5'
  }
}

function updateVistas() {
  for (let name in vistas) {

    const vista = Beuys.scene.getObjectByName(name);
    const pageOffset = getPageOffset(getIndexByName(vistas[name].point));
    const info = {
      start: pageOffset,
      end: pageOffset + 10
    };
    
    if (Beuys.currentPageFloatIndex > info.start && Beuys.currentPageFloatIndex < info.end) {

      if (Beuys.currentPageFloatIndex <= info.start + 1) {
        vista.material.opacity = THREE.MathUtils.smoothstep((Beuys.currentPageFloatIndex - info.start) * 1.2, 0, 1);
      } else if (Beuys.currentPageFloatIndex >= info.end - 1) {
        vista.material.opacity = THREE.MathUtils.smoothstep(info.end - Beuys.currentPageFloatIndex, 0, 1);
      }
      vista.visible = true;
    } else {
      vista.material.opacity = 0;
      vista.visible = false;
    }

  }
}

export default function animate() {

  const y = window.scrollY;
  const dy = y - Beuys.currentY;
  const dt = clock.getDelta();

  requestAnimationFrame(animate);

  //

  updateCamera(y);

  // determines current index based on position and scroll direction

  updateIndex(y, dy, Beuys.pathCamera.position);

  handleEvent(Beuys.currentPageFloatIndex);

  updateVistas();

  // Timing editor

  // const graphPlane = Beuys.scene.getObjectByName('GraphPlane');
  // if (graphPlane) {
  // 	graphPlane.position.copy(new THREE.Vector3().addVectors(Beuys.pathCamera.position, new THREE.Vector3(0,0,-15).applyEuler(Beuys.pathCamera.rotation)));
  // 	graphPlane.rotation.copy(Beuys.pathCamera.rotation);
  // }

  //

  render(dt);

  // Frame time stats

  // if (Beuys.stats) {
  //   Beuys.stats.update();
  // }

  Beuys.currentY = y;

}

//

let lastStartPage = 0;

function handleEvent(pageFloatIndex) {

  const startPage = Math.floor(pageFloatIndex);
  const event = params.yEvents[startPage];

  if (event) {

    switch (event.type) {

      case 'video': 
      if (startPage !== lastStartPage) {
        handleVideoEvent(pageFloatIndex - startPage, event);
      }
      break;

      default: break;

    }

  }

  lastStartPage = startPage;
}

//

function handleVideoEvent(pageProgress, event) {

  const videoElement = document.getElementById(event.id);

  if (event.function == 'playPause') {

    if (videoElement.paused) {
      videoElement.play().catch((error) => console.log('Beuys video autoplay was blocked by browser!'));
      videoElement.currentTime = 15;
    }

  }
}