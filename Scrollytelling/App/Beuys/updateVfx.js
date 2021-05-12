/**
 * Manage the VFX.
 *
 * Enable/disable and set parameters to the different VFXs based on the scene index (and page index)
 */

import Beuys from './variables.js';
import params from './params.js';
import { ProjectorVfx, projectorVfx } from './VFX/projectorVfx.js';
import { BloomPass, bloomPass } from './VFX/bloomPass.js';
import { SimpleBokehPass, bokehPass } from './VFX/bokehPass.js';
import { ToneMappingPass, toneMappingPass } from './VFX/toneMappingPass.js';
import { DustVfx, dustVfx } from './VFX/dustVfx.js';
import { AudioEffect, audioEffect } from './VFX/audioEffect.js';
import { LutPass, lutPass } from './VFX/lutPass.js';
// import { VortexVfx, vortexVfx } from './VFX/vortexVfx.js';


let vfxInitialized = false;

let lastIndex = -1;

export default function updateVfx() {

    if (!vfxInitialized) {
        vfxInitialized = true;
    }

    // if (lastIndex != Beuys.currentPageFloatIndex) {
    //     console.log("Beuys.currentPageFloatIndex= ", Beuys.currentPageFloatIndex);
    //     lastIndex = Beuys.currentPageFloatIndex
    // }

    if (params.vfx.projectorVfxParams && params.vfx.projectorVfxParams.enabled) {
        if (!projectorVfx.instance) {
            projectorVfx.instance = new ProjectorVfx(params.vfx.projectorVfxParams, Beuys.videoTexture);
            projectorVfx.instance.init();
        }

        if (projectorVfx.instance) {
            projectorVfx.instance.update(Beuys.currentPageFloatIndex);
        }
    }

    if (params.vfx.bloomPassParams && params.vfx.bloomPassParams.enabled) {
        if (!bloomPass.instance) {
            bloomPass.instance = new BloomPass(params.vfx.bloomPassParams);
            bloomPass.instance.init();
            bloomPass.instance.enable();
            bloomPass.instance.show();
        }

        if (bloomPass.instance) {
            bloomPass.instance.update(Beuys.currentPageFloatIndex);
        }
    }

    if (params.vfx.bokehPassParams && params.vfx.bokehPassParams.enabled) {
        if (!bokehPass.instance) {
            bokehPass.instance = new SimpleBokehPass(params.vfx.bokehPassParams);
            bokehPass.instance.init();
            bokehPass.instance.enable();
            bokehPass.instance.show();
        }

        if (bokehPass.instance) {
            bokehPass.instance.update(Beuys.currentPageFloatIndex);
        }
    }

    if (params.vfx.toneMappingParams && params.vfx.toneMappingParams.enabled) {
        if (!toneMappingPass.instance) {
            toneMappingPass.instance = new ToneMappingPass(params.vfx.toneMappingParams);
            toneMappingPass.instance.init();
            toneMappingPass.instance.enable();
            toneMappingPass.instance.show();
        }

        if (toneMappingPass.instance) {
            toneMappingPass.instance.update(Beuys.currentPageFloatIndex);
        }
    }

    if (params.vfx.dustParams && params.vfx.dustParams.enabled) {
        if (!dustVfx.instance) {
            dustVfx.instance = new DustVfx(params.vfx.dustParams);
            dustVfx.instance.init();
            dustVfx.instance.enable();
            dustVfx.instance.show();
        }

        if (dustVfx.instance) {
            dustVfx.instance.update(Beuys.currentPageFloatIndex);
        }
    }

    if (params.vfx.audioParams && params.vfx.audioParams.enabled) {
        if (!audioEffect.instance) {
            audioEffect.instance = new AudioEffect(params.vfx.audioParams);
            audioEffect.instance.init();
            audioEffect.instance.enable();
            audioEffect.instance.show();
        }

        if (audioEffect.instance) {
            audioEffect.instance.update(Beuys.currentPageFloatIndex);
        }
    }

    if (params.vfx.lutPassParams && params.vfx.lutPassParams.enabled) {
        if (!lutPass.instance) {
            lutPass.instance = new LutPass(params.vfx.lutPassParams);
            lutPass.instance.init();
        }

        if (lutPass.instance) {
            lutPass.instance.update(Beuys.currentPageFloatIndex);
        }
    }

    // if (params.vfx.vortexParams && params.vfx.vortexParams.enabled) {
    //     if (!vortexVfx.instance) {
    //         vortexVfx.instance = new VortexVfx(params.vfx.vortexParams);
    //         vortexVfx.instance.init();
    //     }

    //     if (vortexVfx.instance) {
    //         vortexVfx.instance.update(Beuys.currentPageFloatIndex);
    //     }
    // }

}
