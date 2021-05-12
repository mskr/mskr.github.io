import * as THREE from "../../components/three/build/three.module.js";

// Helps with rendering a ThreeJS Curve for debugging
  
// Curve => TubeGeometry => Mesh => Screen

let CurveHelper = {};

CurveHelper.tubeGeometry = function(curve) {

  let tube = new THREE.TubeGeometry(
    curve,
    100, // longitudinal divisions
    0.1, // radius
    3, // radial divisions
    curve.closed
  );

  return tube;
}

CurveHelper.mesh = function(geometry) {
  const material = new THREE.MeshLambertMaterial({ 
    color: 0xFFFFFF, 
    transparent: true, 
    opacity: 0.9
  });
  return new THREE.Mesh(geometry, material);
}

CurveHelper.arrows = function(tube) {
  const N = tube.tangents.length;
  const points = tube.parameters.path.getSpacedPoints(N);
  const arrws = tube.tangents.map((e, i) => {
    const arrowHelper = new THREE.ArrowHelper( e, points[i], 1, 0x000000 );
    scene.add( arrowHelper );
  });
  return arrws;
}

export default CurveHelper;