import * as THREE from "../../components/three/build/three.module.js";
import params from '../Beuys/params.js';
import Beuys from '../Beuys/variables.js';
import { getIndexByPage, getPageOffset, getTotalPages, pages, motionType } from '../Beuys/access.js';

//

export default function mapScrollLength() {
  Beuys.scrollContainer.style.height = "" + (getTotalPages() * window.innerHeight) + "px";
}

//

export function u(y) {

  const page = y / window.innerHeight;

  const index = getIndexByPage(Math.floor(page));

  const u_prev = Beuys.path.getU(index - 1);
  const u = Beuys.path.getU(index);

  const progress = (page - getPageOffset(index)) / pages(index);

  if (motionType(index) === 'turn') {
  	return u;
  } else {
  	return u_prev + (u - u_prev) * progress;
  }
}