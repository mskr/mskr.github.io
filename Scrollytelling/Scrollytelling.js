import * as THREE from "https://ghcdn.rawgit.org/mrdoob/three.js/dev/build/three.module.js";
import Stats from "https://ghcdn.rawgit.org/mrdoob/three.js/dev/examples/jsm/libs/stats.module.js";
import { GUI } from "https://ghcdn.rawgit.org/mrdoob/three.js/dev/examples/jsm/libs/dat.gui.module.js";
import { Curves } from "https://ghcdn.rawgit.org/mrdoob/three.js/dev/examples/jsm/curves/CurveExtras.js";
import { FirstPersonControls } from "https://ghcdn.rawgit.org/mrdoob/three.js/dev/examples/jsm/controls/FirstPersonControls.js";
import { OrbitControls } from "https://ghcdn.rawgit.org/mrdoob/three.js/dev/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from 'https://ghcdn.rawgit.org/mrdoob/three.js/dev/examples/jsm/controls/TransformControls.js';
import { OBJLoader } from 'https://ghcdn.rawgit.org/mrdoob/three.js/dev/examples/jsm/loaders/OBJLoader.js';

direction = new THREE.Vector3();
binormal = new THREE.Vector3();
normal = new THREE.Vector3();
position = new THREE.Vector3();
lookAt = new THREE.Vector3();

const sampleClosedSpline = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, -40, -40),
  new THREE.Vector3(0, 40, -40),
  new THREE.Vector3(0, 140, -40),
  new THREE.Vector3(0, 40, 40),
  new THREE.Vector3(0, -40, 40)
]);

sampleClosedSpline.curveType = 'catmullrom';
sampleClosedSpline.closed = true;

// Keep a dictionary of Curve instances
let splines = {
  GrannyKnot: new Curves.GrannyKnot(),
  HeartCurve: new Curves.HeartCurve(3.5),
  VivianiCurve: new Curves.VivianiCurve(70),
  KnotCurve: new Curves.KnotCurve(),
  HelixCurve: new Curves.HelixCurve(),
  TrefoilKnot: new Curves.TrefoilKnot(),
  TorusKnot: new Curves.TorusKnot(20),
  CinquefoilKnot: new Curves.CinquefoilKnot(20),
  TrefoilPolynomialKnot: new Curves.TrefoilPolynomialKnot(14),
  FigureEightPolynomialKnot: new Curves.FigureEightPolynomialKnot(),
  DecoratedTorusKnot4a: new Curves.DecoratedTorusKnot4a(),
  DecoratedTorusKnot4b: new Curves.DecoratedTorusKnot4b(),
  DecoratedTorusKnot5a: new Curves.DecoratedTorusKnot5a(),
  DecoratedTorusKnot5c: new Curves.DecoratedTorusKnot5c(),
  SampleClosedSpline: sampleClosedSpline
};

// gui
let params = {
  spline: "SampleClosedSpline",
  extrusionSegments: 100,
  radiusSegments: 3,
  closed: false,
  animationView: true,
  lookAhead: false,
  cameraHelper: true
};

function asyncData( object, points, rotations, objTransform ) {

	// 3D space
  
  let row1 = objTransform[0].split(' ');
  let row2 = objTransform[1].split(' ');
  let row3 = objTransform[2].split(' ');
  let row4 = objTransform[3].split(' ');
  
  object.matrixAutoUpdate = false;
  object.matrix.set(
  	row1[0], row1[1], row1[2], row1[3],
  	row2[0], row2[1], row2[2], row2[3],
    row3[0], row3[1], row3[2], row3[3],
    row4[0], row4[1], row4[2], row4[3])

  scene.add( object );

  let control = new TransformControls( camera, renderer.domElement );

  control.addEventListener( 'change', render );

  control.addEventListener( 'dragging-changed', function ( event ) {
    console.log('dragging-changed', event.value);
  } );

  control.attach( object );
  scene.add( control );
  
  camera.lookAt( object.position );
  
  //scene.rotateX(-Math.PI / 2);
  
  // camera path

  const camPoints = points;

  const camSpline = new THREE.CatmullRomCurve3(
    camPoints.filter((p, i) => i%10==0).map(
      p => new THREE.Vector3(
        Number(p.split(' ')[0]), Number(p.split(' ')[1]), Number(p.split(' ')[2])
      )
    )
  );
  
  camSpline.curveType = 'catmullrom';
  camSpline.closed = false;

  splines.CamSpline = camSpline;
  params.spline = 'CamSpline';
  addTube();

  // dat.GUI

  const gui = new GUI({ width: 300 });

  const folderGeometry = gui.addFolder("Geometry");
  folderGeometry
    .add(params, "spline", Object.keys(splines))
    .onChange(function () {
    addTube();
  });
  folderGeometry
    .add(params, "extrusionSegments", 50, 500)
    .step(50)
    .onChange(function () {
    addTube();
  });
  folderGeometry
    .add(params, "radiusSegments", 2, 12)
    .step(1)
    .onChange(function () {
    addTube();
  });
  folderGeometry.open();

  const folderCamera = gui.addFolder("Camera");
  folderCamera.add(params, "animationView").onChange(function () {
    animateCamera();
  });
  folderCamera.add(params, "lookAhead").onChange(function () {
    animateCamera();
  });
  folderCamera.add(params, "cameraHelper").onChange(function () {
    animateCamera();
  });
  folderCamera.open();
}

const material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.5 });

const wireframeMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  opacity: 0.3,
  wireframe: true,
  transparent: true
});

function addTube() {
  if (mesh !== undefined) {
    parent.remove(mesh);
    mesh.geometry.dispose();
  }

  const extrudePath = splines[params.spline];
  
  console.log(extrudePath.points.length)

  tubeGeometry = new THREE.TubeGeometry(
    extrudePath,
    params.extrusionSegments,
    2,
    params.radiusSegments,
    params.closed
  );

  addGeometry(tubeGeometry);
}

function addGeometry(geometry) {
  // 3D shape

  mesh = new THREE.Mesh(geometry, material);
  const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
  mesh.add(wireframe);

  parent.add(mesh);
}

function animateCamera() {
  cameraHelper.visible = params.cameraHelper;
  cameraEye.visible = params.cameraHelper;
}

init();
animate();

function init() {
  container = document.getElementById("container");

  // free camera

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.01,
    10000
  );
  camera.position.set(40, 0, 0);

  // scene

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // light

  const ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
  scene.add( ambient );
  const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
  scene.add( light );

  // tube

  parent = new THREE.Object3D();
  scene.add(parent);
  
  // spline camera

  splineCamera = new THREE.PerspectiveCamera(
    84,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  parent.add(splineCamera);

  cameraHelper = new THREE.CameraHelper(splineCamera);
  scene.add(cameraHelper);

  addTube();

  // debug camera

  cameraEye = new THREE.Mesh(
    new THREE.SphereGeometry(5),
    new THREE.MeshBasicMaterial({ color: 0xdddddd })
  );
  parent.add(cameraEye);

  cameraHelper.visible = params.cameraHelper;
  cameraEye.visible = params.cameraHelper;

  // renderer

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // fps stats

  stats = new Stats();
  container.appendChild(stats.dom);

  // load data
  
  const objLoader = new OBJLoader();
  
  let p0 = new Promise((resolve, reject) =>
  	objLoader.load('https://raw.githubusercontent.com/mskr/Scrollytelling/main/test.obj', resolve, null, reject));

  const fileLoader = new THREE.FileLoader();

  let p1 = new Promise((resolve, reject) =>
    fileLoader.load('https://raw.githubusercontent.com/mskr/Scrollytelling/main/points.json', resolve, null, reject));

  let p2 = new Promise(function(resolve, reject) {
    fileLoader.load('https://raw.githubusercontent.com/mskr/Scrollytelling/main/rotations.json', resolve, null, reject);
  });

  let p3 = new Promise(function(resolve, reject) {
    fileLoader.load('https://raw.githubusercontent.com/mskr/Scrollytelling/main/ObjTransform.json', resolve, null, reject);
  });
  
  Promise.all([p0, p1, p2, p3]).then(d => asyncData(d[0], JSON.parse(d[1]), JSON.parse(d[2]), JSON.parse(d[3])));
  
  // controls

  const controls = new OrbitControls(camera, renderer.domElement);

  window.addEventListener("resize", onWindowResize);
  
  // scrolling

  renderer.domElement.style.position = "fixed";
  document.body.style.overflowY = "scroll";
  myscroller = document.createElement("div");
  container.insertBefore(myscroller, null);
  mapScrollToSpline(myscroller);
  
} // end init

function mapScrollToSpline(myscroller) {
  //TODO pixel position to spline position
  let l = splines[params.spline].getLength();
  console.log("spline length = " + l);
  myscroller.style.pointerEvents = 'none';
  myscroller.style.background = "rgba(255,0,0,.0)";
  myscroller.style.position = "absolute";
  myscroller.style.top = "0";
  myscroller.style.width = "100%";
  myscroller.style.height = "" + l * 50 + "px";
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}

function render() {
  
  // animate camera along spline

  const time = window.scrollY;
  const looptime = 20 * 1000;
  let t = (time % looptime) / looptime;
  if (t > tubeGeometry.parameters.path.getLength()) {
  	t = tubeGeometry.parameters.path.getLength();
  }

  tubeGeometry.parameters.path.getPointAt(t, position);

  // interpolation

  const segments = tubeGeometry.tangents.length;
  const pickt = t * segments;
  const pick = Math.floor(pickt);
  const pickNext = (pick + 1) % segments;

  binormal.subVectors(
    tubeGeometry.binormals[pickNext],
    tubeGeometry.binormals[pick]
  );
  binormal.multiplyScalar(pickt - pick).add(tubeGeometry.binormals[pick]);

  tubeGeometry.parameters.path.getTangentAt(t, direction);

  normal.copy(binormal).cross(direction).applyEuler(new THREE.Euler(0,0,-Math.PI/2));

  // we move on a offset on its binormal
  
  const offset = 0;

  position.add(normal.clone().multiplyScalar(offset));

  splineCamera.position.copy(position);
  cameraEye.position.copy(position);

  // using arclength for stablization in look ahead

  tubeGeometry.parameters.path.getPointAt(
    (t + 30 / tubeGeometry.parameters.path.getLength()) % 1,
    lookAt
  );

  // camera orientation 2 - up orientation via normal

  if (!params.lookAhead) lookAt.copy(position).add(direction);
  splineCamera.matrix.lookAt(splineCamera.position, lookAt, normal);
  splineCamera.quaternion.setFromRotationMatrix(splineCamera.matrix);

  cameraHelper.update();

  renderer.render(scene, params.animationView === true ? splineCamera : camera);
}
