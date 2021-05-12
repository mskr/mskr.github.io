import * as THREE from "../../components/three/build/three.module.js";

import Beuys from './variables.js';
import params from './params.js';

//

export default function onPOIChange() {

  Beuys.scrollContainer.style.pointerEvents = null;

  if (params.ArrayCamera) {

    Beuys.camera = Beuys.arrayCamera;

  } else if (params.FreeCamera) {

    Beuys.camera = Beuys.freeCamera;
    Beuys.scrollContainer.style.pointerEvents = 'none';

  } else {

    Beuys.camera = Beuys.pathCamera;

  }

  Beuys.camera.viewport = new THREE.Vector4(0, 0, window.innerWidth, window.innerHeight);
  Beuys.renderer.setViewport(Beuys.camera.viewport);
  Beuys.camera.updateMatrixWorld();
}