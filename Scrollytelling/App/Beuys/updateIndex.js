import * as THREE from "../../components/three/build/three.module.js";

import Beuys from './variables.js';
import params from './params.js';
import { name, position, getIndexByPage, getTotalPages } from './access.js';
import updateVfx from './updateVfx.js';

//

export default function updateIndex(y, dy, p) {

  // determine current point taking only neighbors into account
  // use euclidean distanceTo instead of arc length because its faster
  // it is also a crude approximation that will need prove itself

  //TODO find a non-relative/analytic method

  const currentIndex = getIndexByPage(y / window.innerHeight);

  const nextIndex = THREE.MathUtils.clamp(currentIndex + 1, 0, Beuys.POIs.length - 1);
  const prevIndex = THREE.MathUtils.clamp(currentIndex - 1, 0, Beuys.POIs.length - 1);

  const dCurrent = position(currentIndex).distanceTo(p);
  const dPrev = position(prevIndex).distanceTo(p);
  const dNext = position(nextIndex).distanceTo(p);

  const dPC = position(prevIndex).distanceTo(position(currentIndex));
  const dCN = position(currentIndex).distanceTo(position(nextIndex));

  // Find percentage of progress by straight line distances

  if (prevIndex == currentIndex) { // first POI
    Beuys.currentFloatIndex = currentIndex + (1 - dNext / dCN) || 0;
  }

  if (dPrev < dPC) { // between prev and current
    Beuys.currentFloatIndex = prevIndex + dPrev / dPC;
  }

  if (dNext < dCN) { // between current and next
    Beuys.currentFloatIndex = currentIndex + (1 - dNext / dCN);
  }

  if (currentIndex == nextIndex) { // last POI
    Beuys.currentFloatIndex = prevIndex + dPrev / dPC;
  }

  Beuys.currentFloatIndex = THREE.MathUtils.clamp(Beuys.currentFloatIndex, 0, Beuys.POIs.length - 1);

  // Page

  const newPageFloatIndex = y / window.innerHeight;
  
  if (newPageFloatIndex != Beuys.currentPageFloatIndex) {
    const event = new CustomEvent('zaubarScroll', {
      detail: {
        currentPageFloatIndex: newPageFloatIndex,
        deltaPageFloatIndex: newPageFloatIndex - Beuys.currentPageFloatIndex,
        isNewPage: Math.floor(newPageFloatIndex) != Math.floor(Beuys.currentPageFloatIndex)
      }
    });
    document.dispatchEvent(event);
  }

  Beuys.currentPageFloatIndex = newPageFloatIndex;

  // Update GUI

  // for (const i in Beuys.POIs) params[name(i)] = false;
  // params[name(currentIndex)] = true;
  // params.Position = position(currentIndex).toArray().map(n => n.toFixed(2)).join(' ');
  // params.FloatIndex = Beuys.currentFloatIndex;

  const eScrollIndex = document.getElementById('scroll-index');
  if (eScrollIndex) {
    const eCurrentPoint = eScrollIndex.children[currentIndex];
    if (eCurrentPoint)
      eCurrentPoint.querySelector('input').checked = true;
    
    const eScrollIndicator = eScrollIndex.previousElementSibling;
    eScrollIndicator.style.top = y / getTotalPages() + 'px';
    eScrollIndicator.textContent = Beuys.currentPageFloatIndex.toFixed(1);
  }

  // VFX

  if (currentIndex !== Beuys.oldCurrentIndex) {
    updateVfx();
  }

  return Beuys.currentFloatIndex;
}