import * as THREE from "../../components/three/build/three.module.js";

import Beuys from './variables.js';

//

export default function arrayCamera() {

  const ROWS = Math.floor(Math.sqrt(Beuys.cameras.length));
  const COLS = Math.ceil(Math.sqrt(Beuys.cameras.length));

  const WIDTH = ( window.innerWidth / COLS ) * window.devicePixelRatio;
  const HEIGHT = ( window.innerHeight / ROWS ) * window.devicePixelRatio;

  for ( let y = 0; y < ROWS; y ++ ) {

    for ( let x = 0; x < COLS; x ++ ) {

      let i = y * COLS + x;
      if (i == Beuys.cameras.length) break;

      Beuys.cameras[i].viewport = new THREE.Vector4( 
        Math.floor( x * WIDTH ), Math.floor( y * HEIGHT ), 
        Math.ceil( WIDTH ), Math.ceil( HEIGHT ) );
      Beuys.cameras[i].updateMatrixWorld();

    }

  }
  let cam = new THREE.ArrayCamera( Beuys.cameras );
  cam.name = 'ArrayCamera';
  return cam;

}