import * as THREE from '../../../components/three/build/three.module.js';
import { SSAOPass } from '../../../components/three/examples/jsm/postprocessing/SSAOPass.js';

import { RenderPass } from '../../../components/three/examples/jsm/postprocessing/RenderPass.js';
import { SAOPass } from '../../../components/three/examples/jsm/postprocessing/SAOPass.js';

export default function SSAO(composer, scene, camera) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  //TODO increase quality, try SAO 
  //const saoPass = new SAOPass( scene, camera, false, true );
  
  const ssaoPass = new SSAOPass( scene, camera, width, height );
  ssaoPass.kernelRadius = 8;
  composer.addPass( ssaoPass );
}