import * as THREE from "../../components/three/build/three.module.js";

import { GUI } from '../../components/three/examples/jsm/libs/dat.gui.module.js';

import PUT from '../utils/PUT.js';
import onScroll from '../utils/onScroll.js';

import Beuys from './variables.js';
import params from './params.js';
import {
  name, position, thing,
  setPosition, getIndexByPage, insertPoint
} from './access.js';
import { enableEditPath, disableEditPath, updatePoints, updatePath } from './editPath.js';
import { createGraph } from './editTiming.js';
import { LutPass, lutPass } from './VFX/lutPass.js';

// Dat gui

let enableDatGui = false;
let folderToneMap;
let folderLUT;

// Status bar

let enableStatusBar = false;
let eReady;
let eEditPath;
let eHigher;
let eLower;
let eLookAtThing;
let eLookUp;
let eLookDown;
let eLookLeft;
let eLookRight;
let eEditTiming;
let eSync;

//

// Dat gui

//

// Backdoor for last minute LUT changes
window.enableLutGui = (lutName, intensity, use2DLut) => {
  enableDatGui = true;
  params.enableLutGui = true;

  window.lutParams = params.vfx.lutPassParams;
  window.lutParams.lut = lutName || "(NONE)";
  window.lutParams.intensity = intensity || 1;
  window.lutParams.use2DLut = use2DLut || false;

  gui();
}

export default function gui() {

  if (enableStatusBar) statusBar();

  if (enableDatGui) {

    let gui = undefined;

    if (params.enableToneMapGui) {
      gui = new GUI({ width: 300 });

      document.getElementById('navbar').style.visibility = 'hidden';

      folderToneMap = gui.addFolder('Tone mapping');

      var toneMaps = {
        "None": THREE.NoToneMapping,
        "Linear": THREE.LinearToneMapping,
        "Reinhard": THREE.ReinhardToneMapping,
        "Cineon": THREE.CineonToneMapping,
        "ACESFilmic": THREE.ACESFilmicToneMapping,
        "Custom": THREE.CustomToneMapping
      };

      // For toneMapping "Custom"
      THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
        'vec3 CustomToneMapping( vec3 color ) { return color; }',
        `#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )
      float toneMappingWhitePoint = 1.0;
      vec3 CustomToneMapping( vec3 color ) {
          color *= toneMappingExposure;
          return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );
      }`
      );

      params.vfx.toneMappingParams.toneMapping = THREE.NoToneMapping;
      params.vfx.toneMappingParams.exposure = 1.;

      // disable scripted one (in params.js)
      params.vfx.toneMappingParams.enabled = false;

      folderToneMap.add(params.vfx.toneMappingParams, 'toneMapping', toneMaps).onChange(updateToneMap);
      folderToneMap.add(params.vfx.toneMappingParams, 'exposure', .5, 2).onChange(updateToneMap);

      updateToneMap();

    }

    if (params.enableLutGui) {
      if (lutPass.instance) {

        if (!gui) {
          gui = new GUI({ width: 300 });
        }

        folderLUT = gui.addFolder('LUT');

        // use for gui only
        if (!params.vfx.lutPassParams.lut) {
          params.vfx.lutPassParams.lut = "(NONE)";
          params.vfx.lutPassParams.intensity = 1;
          params.vfx.lutPassParams.use2DLut = false;
        } else {
          lutPass.instance.selectLut(params.vfx.lutPassParams.lut);
          lutPass.instance.setIntensity(params.vfx.lutPassParams.intensity);
          lutPass.instance.setUse2DLut(params.vfx.lutPassParams.use2DLut);
        }

        const luts = lutPass.instance.luts;
        folderLUT.add(params.vfx.lutPassParams, 'lut', luts).onChange(() => {
          lutPass.instance.selectLut(params.vfx.lutPassParams.lut);
        });

        folderLUT.add(params.vfx.lutPassParams, 'intensity', 0, 1.5).onChange(() => {
          lutPass.instance.setIntensity(params.vfx.lutPassParams.intensity);
        });

        folderLUT.add(params.vfx.lutPassParams, 'use2DLut').onChange(() => {
          lutPass.instance.setUse2DLut(params.vfx.lutPassParams.use2DLut);
        });

      }
    }
  }
}

const toneMappingOptions = [
  THREE.NoToneMapping,
  THREE.LinearToneMapping,
  THREE.ReinhardToneMapping,
  THREE.CineonToneMapping,
  THREE.ACESFilmicToneMapping,
  THREE.CustomToneMapping
];

function updateToneMap() {
  Beuys.renderer.toneMapping = toneMappingOptions[params.vfx.toneMappingParams.toneMapping];
  Beuys.renderer.toneMappingExposure = params.vfx.toneMappingParams.exposure;

  Beuys.scene.traverse(obj => {

    if (obj && obj.material) {
      obj.material.needsUpdate = true;
    }
  })
}




//

// Status bar

//

function statusBar() {
  eReady = Beuys.statusBar.children[0];
  eEditPath = Beuys.statusBar.children[1];
  eHigher = Beuys.statusBar.children[2];
  eLower = Beuys.statusBar.children[3];
  eLookAtThing = Beuys.statusBar.children[4];
  eLookUp = Beuys.statusBar.children[5];
  eLookDown = Beuys.statusBar.children[6];
  eLookLeft = Beuys.statusBar.children[7];
  eLookRight = Beuys.statusBar.children[8];
  eEditTiming = Beuys.statusBar.children[9];
  eSync = Beuys.statusBar.children[10];

  document.addEventListener('zaubarSetLoading', function (event) {
    const progress = event.detail.progress.toFixed();
    if (progress < 100) {
      eReady.textContent = 'Loading Set (' + progress + '%)';
    } else {
      eReady.textContent = 'Ready';
    }
  });

  document.addEventListener('zaubarVistaLoading', function (event) {
    const progress = event.detail.progress.toFixed();
    if (progress < 100) {
      eReady.textContent = 'Loading Vistas (' + progress + '%)';
    } else {
      eReady.textContent = 'Ready';
    }
  });

  document.addEventListener('zaubarJSONLoading', function (event) {
    const progress = event.detail.progress.toFixed();
    if (progress < 100) {
      eReady.textContent = 'Loading JSON (' + progress + '%)';
    } else {
      eReady.textContent = 'Ready';
    }
  });

  document.addEventListener('zaubarObjectLoading', function (event) {
    const progress = event.detail.progress.toFixed();
    const i = event.detail.index;
    if (progress < 100) {
      eReady.textContent = 'Loading Object ' + i + ' (' + progress + '%)';
    } else {
      eReady.textContent = 'Ready';
    }
  });

  eSync.style.cursor = 'pointer';
  eSync.addEventListener('click', sync);

  eEditPath.style.cursor = 'pointer';
  eEditPath.addEventListener('click', togglePathEditor);

  // eEditTiming.style.cursor = 'pointer';
  // eEditTiming.addEventListener('click', toggleTimingEditor);

  eHigher.style.cursor = 'pointer';
  eHigher.addEventListener('click', function (event) {
    const currentPosition = Beuys.pathCamera.position.clone();
    const newPosition = new THREE.Vector3(currentPosition.x, currentPosition.y + 0.1, currentPosition.z);
    alert('Not saved! This feature is unfinished.');
  });

  eLower.style.cursor = 'pointer';
  eLower.addEventListener('click', function (event) {
    const currentPosition = Beuys.pathCamera.position.clone();
    const newPosition = new THREE.Vector3(currentPosition.x, currentPosition.y - 0.1, currentPosition.z);
    alert('Not saved! This feature is unfinished.');
  });
}

//

function sync() {
  eSync.textContent = 'Syncing...';
  PUT(JSON.stringify(Beuys.JSON, null, '  '), Beuys.backend + 'PUT.php').then((response) => {
    if (response.ok) {
      eSync.textContent = 'In sync';
    } else {
      eSync.textContent = 'Sync failed [' + response.status + ']';
    }
  });
}

//

function togglePathEditor() {
  if (Beuys.EditPathScreenSize < 0.5) {

    enableEditPath();
    updatePoints();
    updatePath();

    Beuys.EditPathScreenSize = 1.0;
    Beuys.scrollContainer.style.display = 'none';
    Beuys.labelRenderer.domElement.style.display = 'none';

    Beuys.scene.getObjectByName('points').visible = true;
    Beuys.pathMesh.visible = true;

  } else {

    disableEditPath();

    Beuys.EditPathScreenSize = 0.1;
    Beuys.scrollContainer.style.display = 'block';

    Beuys.scene.getObjectByName('points').visible = false;
    Beuys.pathMesh.visible = false;
  }
}

function toggleTimingEditor() {
  const graphPlane = Beuys.scene.getObjectByName('GraphPlane');
  if (!graphPlane) {
    createGraph();
    Beuys.labelRenderer.domElement.style.display = 'block';
  } else {
    Beuys.scene.remove(graphPlane);
    Beuys.scrollContainer.style.display = 'block';
    Beuys.labelRenderer.domElement.style.display = 'none';
  }
}
