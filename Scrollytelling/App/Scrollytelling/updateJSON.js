import * as THREE from "../../components/three/build/three.module.js";

export default function updateJSON(camera, json) {

  // find nearest point

  //FIXME this method can jump from one point on the curve to another
  // we need to take the previous and next points on the curve into account
  // assuming we are always on the curve

  let nearestPoint = 'not found';
  let smallestDistance = Infinity;

  for (const [name, values] of Object.entries(json)) {
    let d = new THREE.Vector3().fromArray(values.position).distanceTo(camera.position);
    if (d < smallestDistance) {
      nearestPoint = name;
      smallestDistance = d;
    }
  }

  // update point

  json[nearestPoint].position = camera.position.toArray();
  json[nearestPoint].rotation = camera.rotation.toArray();
}