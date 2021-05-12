/**
 * The tone mapping postprocessing pass.
 */

import * as THREE from "../../../components/three/build/three.module.js";

import Beuys from '../variables.js';
import { Effect } from "./effect.js";

const toneMappingOptions = {
    "None": THREE.NoToneMapping,
    "Linear": THREE.LinearToneMapping,
    "Reinhard": THREE.ReinhardToneMapping,
    "Cineon": THREE.CineonToneMapping,
    "ACESFilmic": THREE.ACESFilmicToneMapping,
    "Custom": THREE.CustomToneMapping
};

/**
 * Is not an actual pass, but part of the render process
 */
export class ToneMappingPass extends Effect {

    constructor(params) {
        super("toneMappingPass");

        this.params = params;
    }


    init() {
        THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
            'vec3 CustomToneMapping( vec3 color ) { return color; }',
            `#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )
            float toneMappingWhitePoint = 1.0;
            vec3 CustomToneMapping( vec3 color ) {
                color *= toneMappingExposure;
                return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );
            }`
        );
    }

    enable() {
        const hasBeenEnabled = super.enable();
        if (hasBeenEnabled) {

            if (this.params.toneMapping) {
                Beuys.renderer.toneMapping = toneMappingOptions[this.params.toneMapping];
            }
            // Beuys.renderer.toneMappingExposure = this.params.exposure;

            Beuys.renderer.toneMappingExposure = 1;
        }
        return hasBeenEnabled;
    }

    disable() {
        super.disable();
        Beuys.renderer.toneMapping = THREE.NoToneMapping;
        Beuys.renderer.toneMappingExposure = 1;
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

            if (segment.toneMapping && toneMappingOptions[segment.toneMapping] &&
                toneMappingOptions[segment.toneMapping] != Beuys.renderer.toneMapping) {
                Beuys.renderer.toneMapping = toneMappingOptions[segment.toneMapping];
            }
            Beuys.renderer.toneMappingExposure = segment.exposure;
        }
    }

};

export let toneMappingPass = {
    instance: undefined
}


