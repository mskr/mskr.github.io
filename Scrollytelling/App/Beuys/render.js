import * as THREE from "../../components/three/build/three.module.js";

import Beuys from './variables.js';

//

export default function render(dt) {

  Beuys.renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
  Beuys.renderer.setScissorTest(true);
  Beuys.renderer.setSize(window.innerWidth, window.innerHeight);

  if (Beuys.pathCamera) {
    renderPathCamera(1);
  }

}

function renderPathCamera(size) {

  const width = Math.floor(window.innerWidth * size);
  const height = Math.floor(window.innerHeight * size);
  Beuys.renderer.setViewport(0, 0, width, height);
  Beuys.renderer.setScissor(0, 0, width, height);
  Beuys.renderer.setScissorTest(true);

  Beuys.pathCamera.aspect = width / height;
  Beuys.pathCamera.updateProjectionMatrix();
  if (Beuys.effectComposer && Beuys.effectComposer.passes.length > 1) {
    Beuys.effectComposer.render();
  } else {
    Beuys.renderer.render(Beuys.scene, Beuys.pathCamera);
  }

  // if (Beuys.labelRenderer) {
  //   Beuys.labelRenderer.render( Beuys.scene, Beuys.pathCamera );
  // }
}

function renderPathEditor(size) {
  const width = Math.floor(window.innerWidth * size);
  const height = Math.floor(window.innerHeight * size);
  Beuys.renderer.setViewport(0, 0, width, height);
  Beuys.renderer.setScissor(0, 0, width, height);
  Beuys.renderer.setScissorTest(true);

  Beuys.freeCamera.aspect = width / height;
  Beuys.freeCamera.updateProjectionMatrix();
  Beuys.renderer.render(Beuys.scene, Beuys.freeCamera);
}