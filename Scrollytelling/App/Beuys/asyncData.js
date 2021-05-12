import * as THREE from '../../components/three/build/three.module.js';
import { FBXLoader } from '../../components/three/examples/jsm/loaders/FBXLoader.js';
import { EffectComposer } from '../../components/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../../components/three/examples/jsm/postprocessing/RenderPass.js';

import mapScrollLength from '../Scrollytelling/mappings.js';
import MyCurve3 from '../Scrollytelling/MyCurve3.js';
import CurveHelper from '../Scrollytelling/CurveHelper.js';
import sortByName from '../Scrollytelling/sortBy.js';
import { u } from '../Scrollytelling/mappings.js';

import { name, getScrollOffset, getPageOffset, getTotalPages } from './access.js';
import Beuys from './variables.js';
import updateIndex from './updateIndex.js';
import gui from './gui.js';
import updateVfx from './updateVfx.js';
import { EffectManager, effectManager } from './VFX/effectManager.js';
import params from './params.js';


export default async function asyncData() {

  // Data flow:
  // asyncData -> points -> curve -> camera position u(y) -> updateIndex -> camera parameters

  // curve

  Beuys.POIs = Object.entries(Beuys.JSON).sort(sortByName);

  const fbxLoader = new FBXLoader();

  Beuys.path = new MyCurve3(Beuys.POIs.map(poi => new THREE.Vector3().fromArray(poi[1].position)));

  let fov = 45;

  if (window.innerWidth < 767) {
    fov = 70;
  }

  const farPlane = 200;

  Beuys.pathCamera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, farPlane);

  Beuys.pathCamera.position.copy(Beuys.path.getPointAt(THREE.MathUtils.clamp(u(window.scrollY), 0, 1)));

  window.scroll(0, 0);
  Beuys.currentY = 0;
  Beuys.currentFloatIndex = 0;

  // vfx

  Beuys.effectComposer = new EffectComposer(Beuys.renderer);

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

  // the RenderPass will only be used if more than one pass is active, see render.js
  const renderPass = new RenderPass(Beuys.scene, Beuys.pathCamera)
  Beuys.effectComposer.addPass(renderPass);
  Beuys.effectComposer.setPixelRatio(window.devicePixelRatio);

  effectManager.instance = new EffectManager(Beuys.effectComposer, renderPass);

  // also initializes Vfx
  updateIndex(window.scrollY, window.scrollY - Beuys.currentY, Beuys.pathCamera.position);

  mapScrollLength();

  // scroll index

  let eScrollIndex = document.getElementById('scroll-index');

  if (eScrollIndex) {

    let eStyle = document.createElement('style');
    const defaultStyle = 'input[name=control-point]' + '~ label { color: grey; cursor: pointer; }';
    const highlightStyle = 'input[name=control-point]:checked' + '~ label { color: white; }';
    eStyle.type = 'text/css';
    if (eStyle.styleSheet) eStyle.styleSheet.cssText = defaultStyle + '\n' + highlightStyle;
    else eStyle.appendChild(document.createTextNode(defaultStyle + '\n' + highlightStyle));
    eScrollIndex.parentElement.insertBefore(eStyle, eScrollIndex);

    let children = Beuys.POIs.map((p, i) => {

      const y_i = getScrollOffset(i);
      const id = 'scroll-index-' + i;

      return (
        '<div>' + [
          '<input id="' + id + '" type="radio" name="control-point" style="display:none">',
          '<label for="' + id + '" onclick="window.scroll(0, ' + y_i + ')">' + [
            '<div>' + name(i) + '</div>',
            '<div style="background: white; height: 2px; width:' + (u(y_i) * 100) + '%;"></div>'
          ].join('') + '</label>'
        ].join('') + '</div>');

    });

    eScrollIndex.innerHTML = children.join('');

    let eScrollIndicator = document.createElement('div');
    eScrollIndicator.style.position = 'fixed';
    eScrollIndicator.style.top = '0';
    eScrollIndicator.style.right = '0';
    eScrollIndicator.style.background = 'black';
    eScrollIndicator.style.color = 'white';
    eScrollIndicator.style.padding = '.1em';
    eScrollIndicator.style.font = 'menu';
    eScrollIndicator.style.zIndex = 11;
    eScrollIndex.parentElement.insertBefore(eScrollIndicator, eScrollIndex);

  }

  // Need some Vfx setup before gui
  updateVfx();

  // order the vfx passes
  effectManager.instance.updatePassOrdering();

  gui();
}