import * as THREE from "../../components/three/build/three.module.js";
import { u } from '../Scrollytelling/mappings.js';
import Beuys from './variables.js';
import params from './params.js';
import { getIndexByPage, getPageOffset, getTotalPages, pages, motionType, thing } from '../Beuys/access.js';

//

function quaternionLookAt(position) {
  const clone = Beuys.pathCamera.clone();
  clone.lookAt(position);
  clone.updateProjectionMatrix();
  return clone.quaternion;
}

//

const MAGIC_NUMBER = 5;

export default function updateCamera(y) {

  if (y == Beuys.currentY) return;

  // position

  Beuys.pathCamera.position.copy(Beuys.path.getPointAt(THREE.MathUtils.clamp(u(y), 0, 1)));

  // rotation

  const page = y / window.innerHeight;

  const index = getIndexByPage(page);

  if (motionType(index) === 'turn') {

    const q1 = quaternionLookAt(thing(index - 1).position);
    const q2 = quaternionLookAt(thing(index).position);

    const progress = (page - getPageOffset(index)) / pages(index);

    Beuys.pathCamera.quaternion.copy(q1.slerp(q2, progress));

  } else {

    Beuys.pathCamera.lookAt(thing(index).position);

  }

  if (window.innerWidth < 750) {
    Beuys.pathCamera.fov = 70;
  } else {
    Beuys.pathCamera.fov = 40;
  }

  Beuys.pathCamera.updateProjectionMatrix();
}