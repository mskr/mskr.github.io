import * as THREE from "../../components/three/build/three.module.js";
import MyCurve3 from '../Scrollytelling/MyCurve3.js';
import CurveHelper from '../Scrollytelling/CurveHelper.js';
import sortByName from '../Scrollytelling/sortBy.js';
import PUT from '../utils/PUT.js';
import Beuys from './variables.js';

// This file provides safe access to the data model

// Non-mutations

export function name(i) {
  return Beuys.POIs[i][0];
}

export function thing(i) {
  const thingName = Beuys.POIs[THREE.MathUtils.clamp(i, 0, Beuys.POIs.length - 1)][1].thing;

  if (thingName) {
    const obj = Beuys.scene.getObjectByName(thingName);
    if (obj) return obj;
  } else {
    return thing((i + 1) % Beuys.POIs.length);
  }
}

export function thingName(i) {
  return Beuys.POIs[i][1].thing;
}

export function position(i) {
  return new THREE.Vector3().fromArray(Beuys.POIs[i][1].position);
}

export function pages(i) {
  if (Beuys.POIs[i][1].pages <= 0) alert('No pages!');
  return Beuys.POIs[i][1].pages;
}

export function motionType(i) {
  return Beuys.POIs[i][1].motionType;
}

//

export function turningDistanceAt(u, obj) {

  const i = Beuys.path.getPrevIndexByU(u);
  const thisPoint = Beuys.path.getPointAt(u);

  const thisThing = thing(i);

  for (let j = i; j < Beuys.POIs.length; j++) {

    const otherThing = thing(j);

    if (thisThing != otherThing) {

      const turningPoint = position(j);

      obj.thisThing = thisThing;
      obj.otherThing = otherThing;

      return thisPoint.distanceTo(turningPoint);

    }
  }

  obj.thisThing = thisThing;
  obj.otherThing = null;
  return Infinity;
}

//

export function getIndexByPoint(position) {
  let minDist = Infinity;
  let nearestU = 0;

  Beuys.path.getLengths(100).forEach((length) => {
    const u = length / Beuys.path.getLength();
    let d = position.distanceTo(Beuys.path.getPointAt(u));
    if (d < minDist) {
      minDist = d;
      nearestU = u
    }
  });
  return Beuys.path.getNextIndexByU(nearestU);
}

//

export function getIndexByName(name) {
  for (let i = 0; i < Beuys.POIs.length; i++) {
    if (Beuys.POIs[i][0] == name) return i;
  }
  return 0;
}

export function getIndexByPage(page) {
  let pageCount = 0;
  for (let i = 0; i < Beuys.POIs.length; i++) {
    const pages = Beuys.POIs[i][1].pages || 0;
    pageCount += pages;
    if (page < pageCount) return i;
  }
  return Beuys.POIs.length - 1;
}

export function getPageOffset(i) {
  let pageCount = 0;
  for (let j = 0; j < i; j++) {
    const pages = Beuys.POIs[j][1].pages || 0;
    pageCount += pages;
  }
  return pageCount;
}

export function getScrollOffset(i) {
  return getPageOffset(i) * window.innerHeight;
}

export function getTotalPages() {
  let pageCount = 0;
  for (let i = 0; i < Beuys.POIs.length; i++) {
    const pages = Beuys.POIs[i][1].pages || 0;
    pageCount += pages;
  }
  return pageCount;
}

// Mutations

let numInserted = 0;

function updatePath() {
  Beuys.scene.remove(Beuys.scene.getObjectByName('path'));
  Beuys.path = new MyCurve3(Beuys.POIs.map(p => new THREE.Vector3().fromArray(p[1].position)));
  Beuys.pathMesh = CurveHelper.mesh(CurveHelper.tubeGeometry(Beuys.path))
  Beuys.pathMesh.name = 'path';
  Beuys.pathMesh.visible = true;
  Beuys.scene.add(Beuys.pathMesh);
}

export function setPosition(i, vector3) {
  Beuys.POIs[i][1].position = vector3.toArray();
  updatePath();

  // data model
  Beuys.JSON = jsonFromArray(Beuys.POIs);
  sync();
}

export function insertPoint(i, vector3, optionalRotation, optionalThing) {
  // H- means helper point
  Beuys.POIs.splice(i, 0, [
    'H-' + (numInserted++).toString().padStart(2, 0),
    {
      position: vector3.toArray(),
      rotation: optionalRotation ? optionalRotation.toArray() : [0, 0, 0],
      pages: 2,
      thing: optionalThing ? optionalThing : (Beuys.POIs[(i + 1) % Beuys.POIs.length].thing)
    }
  ]);

  updatePath();

  // data model
  Beuys.JSON = jsonFromArray(Beuys.POIs);
  sync();
}

export function deletePoint(i) {
  // if (i == 0) Beuys.POIs.shift(1);
  
  Beuys.POIs.splice(i, 1);
  
  updatePath();

  // data model
  Beuys.JSON = jsonFromArray(Beuys.POIs);
  sync();
}

// Sync data with backend

function sync() {

  let eSync = Beuys.statusBar.children[8];

  eSync.textContent = 'Syncing...';

  PUT(JSON.stringify(Beuys.JSON, null, '  '), Beuys.backend + 'PUT.php').then((response) => {
    if (response.status == 200) {
      eSync.textContent = 'In sync';
    } else {
      eSync.textContent = 'Cloud Sync failed :( ' + response.status;
    }
  });

}

// Helper

function arrayFromJSON(json) {
  return Object.entries(json).sort(sortByName);
}

function jsonFromArray(array) {
  return Object.fromEntries(generateNames(array));
}

function generateNames(array) {
  let result = [];
  let lastNonHelper = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i][0][0] === 'H') {
      result.push([
        array[lastNonHelper][0] + ' - ' + array[i][0],
        array[i][1]
      ]);
    } else {
      lastNonHelper = i;
      result.push([
        array[i][0],
        array[i][1]
      ]);
    }
  }
  return result;
}