import * as THREE from "../../components/three/build/three.module.js";

import Beuys from './variables.js';
import params from './params.js';

export default function onWindowResize() {

  if (Beuys.pathCamera) {
    Beuys.pathCamera.aspect = window.innerWidth / window.innerHeight;
    Beuys.pathCamera.updateProjectionMatrix();
  }

  if (Beuys.freeCamera) {
    Beuys.freeCamera.aspect = window.innerWidth / window.innerHeight;
    Beuys.freeCamera.updateProjectionMatrix();
  }

  if (Beuys.renderer) {
    Beuys.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  if (Beuys.effectComposer) {

    let hiresFactor = 1;
    switch (currentDevice.deviceClass) {
      case 0:
        hiresFactor = params.vfx.hiresOnDesktop ? 2 : 1;
        break;
      case 1:
        hiresFactor = params.vfx.hiresOnDesktopLow ? 2 : 1;
        break;
      case 2:
        hiresFactor = params.vfx.hiresOnMobile ? 2 : 1;
        break;
    }

    Beuys.effectComposer.setSize(window.innerWidth * hiresFactor, window.innerHeight * hiresFactor);
  }


}