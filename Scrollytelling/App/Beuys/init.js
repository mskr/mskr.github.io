import * as THREE from '../../components/three/build/three.module.js';
import { FBXLoader } from '../../components/three/examples/jsm/loaders/FBXLoader.js';
import Stats from '../../components/three/examples/jsm/libs/stats.module.js';
import { CSS2DRenderer } from '../../components/three/examples/jsm/renderers/CSS2DRenderer.js';

import Beuys from './variables.js';
import onWindowResize from './onWindowResize.js';
import params from './params.js';

/**
 * Check the capabilities of the renderer, and maybe lower the quality if required.
 * @param {*} renderer 
 */
function checkWebGLCapabilities(renderer) {
  const capabilities = renderer.capabilities;

  if (capabilities.maxTextureSize < 4096) {
    currentDevice.tablet = true;
    currentDevice.deviceClass = 1;
    if (capabilities.maxTextureSize < 2048) {
      currentDevice.mobile = true;
      currentDevice.deviceClass = 2;
    }
  }
}

export default async function init() {

  // Add the canvas to the page, so we get debugging support with three.js extension in Chrome
  const renderContainer = document.getElementById('webglContainer');
  const renderCanvas = document.getElementById('webglCanvas');
  renderCanvas.style.position = 'fixed';

  Beuys.renderer = new THREE.WebGLRenderer({
    canvas: renderCanvas,
    antialias: true,
    logarithmicDepthBuffer: true
  });
  Beuys.renderer.setPixelRatio(window.devicePixelRatio);
  Beuys.renderer.setSize(window.innerWidth, window.innerHeight);

  checkWebGLCapabilities(Beuys.renderer);

  // Beuys.stats = new Stats();
  //renderContainer.appendChild(Beuys.stats.dom);

  // Beuys.labelRenderer = new CSS2DRenderer();
  // Beuys.labelRenderer.setSize(window.innerWidth, window.innerHeight);
  // Beuys.labelRenderer.domElement.id = 'CSS2DRenderer';
  // Beuys.labelRenderer.domElement.style.position = 'fixed';
  // Beuys.labelRenderer.domElement.style.top = '0';
  // document.body.appendChild(Beuys.labelRenderer.domElement);

  Beuys.scrollContainer = document.getElementById('zaubar');

  Beuys.statusBar = document.createElement('div');
  Beuys.statusBar.id = 'StatusBar';
  Beuys.statusBar.classList.add('statusbar');
  Beuys.statusBar.style.position = 'fixed';
  Beuys.statusBar.style.bottom = '0';
  Beuys.statusBar.style.width = '100%';
  Beuys.statusBar.style.height = '2em';
  Beuys.statusBar.style.background = 'black';
  Beuys.statusBar.style.color = 'white';
  Beuys.statusBar.style.display = 'none';// 'flex';
  Beuys.statusBar.style.justifyContent = 'space-between';
  Beuys.statusBar.style.padding = '.5em';
  Beuys.statusBar.style.font = 'menu';
  Beuys.statusBar.style.zIndex = 10;
  Beuys.statusBar.innerHTML = [
    '<i>Ready</i>',
    '<i>Edit Path</i>',
    '<i>Higher</i>',
    '<i>Lower</i>',
    '<i>Look at Thing</i>',
    '<i>Look Up</i> <i>Look Down</i>',
    '<i>Look Left</i> <i>Look Right</i>',
    '<i>Edit Timing</i>',
    '<i>In sync</i>'
  ].join('');
  document.body.appendChild(Beuys.statusBar);

  // camera

  Beuys.freeCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  Beuys.freeCamera.position.set(0, -100, 0);
  Beuys.freeCamera.lookAt(0, 0, 0);
  Beuys.freeCamera.name = 'FreeCamera';

  window.addEventListener('resize', onWindowResize);

  // scene

  Beuys.scene = new THREE.Scene();
  Beuys.scene.background = new THREE.Color(0x80daf1);

  // meshes

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({
      color: 0x00FF00,
      depthWrite: false,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 2;
  Beuys.groundPlane = ground;
  Beuys.scene.add(ground);

  const setLoadingManager = new THREE.LoadingManager();
  const setLoader = new FBXLoader(setLoadingManager);

  const vistaLoadingManager = new THREE.LoadingManager();
  const vistaLoader = new FBXLoader(vistaLoadingManager);

  const quotesLoadingManager = new THREE.LoadingManager();
  const quotesLoader = new FBXLoader(quotesLoadingManager);

  const fileLoader = new THREE.FileLoader();

  const futureSet = new Promise((resolve, reject) =>
    setLoader.load(Beuys.Set, resolve, setProgress, setProgress));

  const futureVistas = new Promise((resolve, reject) =>
    vistaLoader.load(Beuys.Vistas, resolve, vistaProgress, vistaProgress));

  const futureQuotes = new Promise((resolve, reject) =>
    quotesLoader.load(Beuys.Quotes, resolve, quotesProgress, quotesProgress));

  const futureJSON = new Promise((resolve, reject) =>
    fileLoader.load(Beuys.JSONsource, resolve, jsonProgress, jsonProgress));

  setLoadingManager.onProgress = setProgress
  vistaLoadingManager.onProgress = vistaProgress

  try {
    Beuys.scene.add(await futureSet);
  } catch (error) {
    console.error(error.message, error.stack);
  }

  try {
    Beuys.scene.add(await futureVistas);
  } catch (error) {
    console.error(error.message, error.stack);
  }

  try {
    Beuys.scene.add(await futureQuotes);
  } catch (error) {
    console.error(error.message, error.stack);
  }

  try {
    Beuys.JSON = JSON.parse(await futureJSON);
  } catch (error) {
    console.error(error.message, error.stack);
  }

  // lights

  Beuys.scene.add(new THREE.AmbientLight(0xFFFFFF));

  // video texture

  Beuys.videoElement = document.getElementById('beuysVideo');

  function handleEvent(event) {
    console.log('Beuys video', event.type);
  }

  Beuys.videoElement.addEventListener('loadstart', handleEvent);
  Beuys.videoElement.addEventListener('loadedmetadata', handleEvent);
  //Beuys.videoElement.addEventListener('progress', handleEvent);
  Beuys.videoElement.addEventListener('canplay', handleEvent);
  Beuys.videoElement.addEventListener('canplaythrough', handleEvent);

  Beuys.videoTexture = new THREE.VideoTexture(Beuys.videoElement);

  const videoMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, map: Beuys.videoTexture });

  const videoPlane = Beuys.scene.getObjectByName('A_Video_Plane');

  if (videoPlane) {
    videoPlane.material = videoMaterial;
  } else {
    console.log('Video plane not found');
  }

  // vistas

  for (let i in Beuys.VistaNames) {
    const vista = Beuys.scene.getObjectByName(Beuys.VistaNames[i]);
    if (!vista) {
      console.log('Vista missing: ', Beuys.VistaNames[i]);
      continue;
    }
    vista.material.transparent = true;
    vista.material.opacity = .1;
  }

  const bookVista = Beuys.scene.getObjectByName('B_Book');
  if (bookVista) {
    bookVista.scale.multiplyScalar(1.2);
    bookVista.position.x += (-0.3);
  } else {
    console.log('Book vista not found!');
  }

  const chefVista = Beuys.scene.getObjectByName('C_Der_Chef');
  if (chefVista) {
    chefVista.scale.multiplyScalar(1.4);
    chefVista.position.y -= 0.2;
  } else {
    console.log('Chef vista not found!');
  }

  const sledgeVista = Beuys.scene.getObjectByName('D_Sledge');
  if (sledgeVista) {
    sledgeVista.position.x -= 0.4;
  } else {
    console.log('Schlitten vista not found!');
  }

  const kapitalVista = Beuys.scene.getObjectByName('F_Das_Kapiital');
  if (kapitalVista) {
    kapitalVista.position.z += 0.17;
  } else {
    console.log('Schlitten vista not found!');
  }

  const capriVista = Beuys.scene.getObjectByName('J_Capri');
  if (capriVista) {
    capriVista.scale.multiplyScalar(1.1);
    capriVista.position.y += 0.17
    capriVista.position.z += 0.2
  } else {
    console.log('Capri vista not found!');
  }



}

//

// Load progress trackers for set, vistas and json

//

function setProgress(chunk, itemsLoaded, itemsTotal) {

  if (typeof chunk === 'string') {

    console.log('Set chunk', itemsLoaded + ' / ' + itemsTotal, chunk);

    const event = new CustomEvent('zaubarSetLoading', {
      detail: {
        stage: 'textures',
        progress: (itemsLoaded / itemsTotal * 100)
      }
    });

    document.dispatchEvent(event);

    if (itemsLoaded === itemsTotal) {

      const event = new CustomEvent('zaubarSetLoading', {
        detail: {
          stage: 'finish',
          progress: 100
        }
      });

      document.dispatchEvent(event);

    }

  } else if (chunk.message && chunk.stack) {

    console.log(chunk.message + '\n' + chunk.stack);

  } else if (chunk.loaded <= chunk.total) {

    const event = new CustomEvent('zaubarSetLoading', {
      detail: {
        stage: 'geometry',
        progress: (chunk.loaded / chunk.total * 100)
      }
    });

    document.dispatchEvent(event);

  }
}

//

function vistaProgress(chunk, itemsLoaded, itemsTotal) {

  if (typeof chunk === 'string') {

    console.log('Vista chunk', itemsLoaded + ' / ' + itemsTotal, chunk);

    const event = new CustomEvent('zaubarVistaLoading', {
      detail: {
        stage: 'textures',
        progress: (itemsLoaded / itemsTotal * 100)
      }
    });

    document.dispatchEvent(event);

  } else if (chunk.message && chunk.stack) {

    console.log(chunk.message + '\n' + chunk.stack);

  } else if (chunk.loaded <= chunk.total) {

    const event = new CustomEvent('zaubarVistaLoading', {
      detail: {
        stage: 'geometry',
        progress: (chunk.loaded / chunk.total * 100)
      }
    });

    document.dispatchEvent(event);

  }
}

//

function quotesProgress(chunk, itemsLoaded, itemsTotal) {

  if (typeof chunk === 'string') {

    console.log('Quote chunk', itemsLoaded + ' / ' + itemsTotal, chunk);

    const event = new CustomEvent('zaubarQuoteLoading', {
      detail: {
        stage: 'textures',
        progress: (itemsLoaded / itemsTotal * 100)
      }
    });

    document.dispatchEvent(event);

  } else if (chunk.message && chunk.stack) {

    console.log(chunk.message + '\n' + chunk.stack);

  } else if (chunk.loaded <= chunk.total) {

    const event = new CustomEvent('zaubarQuoteLoading', {
      detail: {
        stage: 'geometry',
        progress: (chunk.loaded / chunk.total * 100)
      }
    });

    document.dispatchEvent(event);

  }
}

//

function jsonProgress(chunk) {

  if (chunk.message && chunk.stack) {

    console.log(chunk.message + '\n' + chunk.stack);

  } else if (chunk.loaded <= chunk.total) {

    const event = new CustomEvent('zaubarJSONLoading', {
      detail: {
        progress: (chunk.loaded / chunk.total * 100)
      }
    });

    document.dispatchEvent(event);

  }
}