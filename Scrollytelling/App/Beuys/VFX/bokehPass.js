/**
 * The bokeh (simple DOF) postprocessing pass.
 */

import * as THREE from "../../../components/three/build/three.module.js";

import Beuys from '../variables.js';
import { Effect } from "./effect.js";

import { BokehPass } from '../../../components/three/examples/jsm/postprocessing/BokehPass.js';

export class SimpleBokehPass extends Effect {

    constructor(params) {
        super("bokehPass");
        this.passPriority = 3;

        this.bokehPass = undefined;
        this.params = params;
        this.raycaster = new THREE.Raycaster();
    }


    init() {

        let pixelRatio = Beuys.renderer.getPixelRatio();

        this.bokehPass = new BokehPass(Beuys.scene, Beuys.pathCamera, {
            focus: 1.0,
            // aperture: 0.025,
            // maxblur: 0.01,
            aperture: 0.0025, // 0.0005 - 0.05
            maxblur: 0.003, // 0.001 - 0.03

            width: window.innerWidth * this.params.hDPI ? pixelRatio : 1,
            height: window.innerHeight * this.params.hDPI ? pixelRatio : 1
        });

        this.bokehPass.enabled = false;
        Beuys.effectComposer.addPass(this.bokehPass);
    }

    enable() {
        const hasBeenEnabled = super.enable();
        this.bokehPass.enabled = this.enabled;
        return hasBeenEnabled;
    }

    disable() {
        super.disable();
        this.bokehPass.enabled = this.enabled;
    }

    update(pathIndex) {

        if (!this.params.enabled) {
            return;
        }

        const { segment, intensity } = this.getIntensity(pathIndex, this.params);

        if (intensity <= 0.001) {
            this.disable();
        } else {
            this.enable();

            const center = new THREE.Vector2(0., 0.);

            this.raycaster.setFromCamera(center, Beuys.pathCamera);

            const intersects = this.raycaster.intersectObjects(Beuys.scene.children, true);

            let distance = Number.MAX_VALUE;

            if (intersects.length > 0) {

                for (let i = 0; i < intersects.length; i++) {
                    const intersect = intersects[i];
                    if (!intersect.object.userData.doNotIntersect) {
                        // console.log(intersect.distance);
                        distance = Math.min(distance, intersect.distance);
                    }
                }

            }

            // console.log("distance=", distance);

            // this.bokehPass.focus = distance;

            const aperture = THREE.MathUtils.mapLinear(segment.aperture, 0, 100, 0.0005, 0.05);
            const maxBlur = THREE.MathUtils.mapLinear(segment.maxBlur, 0, 100, 0.001, 0.03);

            this.bokehPass.uniforms["focus"].value = distance;
            this.bokehPass.uniforms["aperture"].value = aperture;
            this.bokehPass.uniforms["maxblur"].value = maxBlur;

            // this.bokehPass.aperture = segment.aperture * intensity;
            // this.bokehPass.maxblur = segment.maxblur;
        }

        // console.log("BloomPass intensity= ", intensity);
    }

};

export let bokehPass = {
    instance: undefined
}


