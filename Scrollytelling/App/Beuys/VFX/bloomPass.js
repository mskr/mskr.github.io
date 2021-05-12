/**
 * The bloom postprocessing pass.
 */

import * as THREE from "../../../components/three/build/three.module.js";

import Beuys from '../variables.js';
import { Effect } from "./effect.js";

import { UnrealBloomPass } from '../../../components/three/examples/jsm/postprocessing/UnrealBloomPass.js';

//FIXME:
// * bloom pass enable/disable is very noticeable

export class BloomPass extends Effect {

    constructor(params) {
        super("bloomPass");
        this.passPriority = 2;

        this.bloomPass = undefined;
        this.params = params;
    }


    init() {
        let pixelRatio = Beuys.renderer.getPixelRatio();

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(
                window.innerWidth * this.params.hDPI ? pixelRatio : 1,
                window.innerHeight * this.params.hDPI ? pixelRatio : 1),
            1.5, 0.4, 0.85);

        this.bloomPass.enabled = false;
        Beuys.effectComposer.addPass(this.bloomPass);
    }

    enable() {
        const hasBeenEnabled = super.enable();
        this.bloomPass.enabled = this.enabled;
        return hasBeenEnabled;
    }

    disable() {
        super.disable();
        this.bloomPass.enabled = this.enabled;
    }

    update(pathIndex) {

        if (!this.params.enabled) {
            return;
        }

        const { segment, intensity } = this.getIntensity(pathIndex, this.params);

        if (intensity <= 0.0001) {
            this.disable();
        } else {
            this.enable();
            this.bloomPass.threshold = segment.bloomThreshold;
            this.bloomPass.strength = segment.bloomStrength * intensity;
            this.bloomPass.radius = segment.bloomRadius;
        }
    }

};

export let bloomPass = {
    instance: undefined
}


