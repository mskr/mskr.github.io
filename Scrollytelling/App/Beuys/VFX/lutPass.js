/**
 * The tone mapping postprocessing pass.
 */

import * as THREE from "../../../components/three/build/three.module.js";

import { LUTCubeLoader } from '../../../components/three/examples/jsm/loaders/LUTCubeLoader.js';
import { LUTPass } from '../../../components/three/examples/jsm/postprocessing/LUTPass.js';



import Beuys from '../variables.js';
import { Effect } from "./effect.js";


export class LutPass extends Effect {

    constructor(params) {
        super("LutPass");
        this.passPriority = Number.MAX_SAFE_INTEGER;

        this.params = params;
        this.initialized = false;
        this.lutPass = undefined;
        this.lutMap = undefined;
        this.lutMapObject = undefined;
        this.lutMapArray = undefined;

        // select from gui;
        this.guiLutName = undefined;
        this.guiIntensity = undefined;
        this.use2DLut = undefined;
    }

    get luts() {
        return this.lutMapObject;
    }

    selectLut(lutName) {
        this.guiLutName = lutName;
    }

    setIntensity(intensity) {
        this.guiIntensity = intensity;
    }

    setUse2DLut(use2D) {
        this.use2DLut = use2D;
    }

    init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        const lutMap = this.lutMap = new Map();
        lutMap.set("(NONE)", null);
        lutMap.set("Arabica 12.CUBE", null);
        lutMap.set("Ava 614.CUBE", null);
        lutMap.set("Azrael 93.CUBE", null);
        lutMap.set("Byers 11.CUBE", null);
        lutMap.set("Bourbon 64.CUBE", null);
        lutMap.set("Chemical 168.CUBE", null);
        lutMap.set("Clayton 33.CUBE", null);
        lutMap.set("Clouseau 54.CUBE", null);
        lutMap.set("Cobi 3.CUBE", null);
        lutMap.set("Contrail 35.CUBE", null);
        lutMap.set("Cubicle 99.CUBE", null);
        lutMap.set("Django 25.CUBE", null);
        lutMap.set("Domingo 145.CUBE", null);
        lutMap.set("Faded 47.CUBE", null);
        lutMap.set("Folger 50.CUBE", null);
        lutMap.set("Fusion 88.CUBE", null);
        lutMap.set("Hyla 68.CUBE", null);
        lutMap.set("Korben 214.CUBE", null);
        lutMap.set("Lenox 340.CUBE", null);
        lutMap.set("Lucky 64.CUBE", null);
        lutMap.set("McKinnon 75.CUBE", null);
        lutMap.set("Milo 5.CUBE", null);
        lutMap.set("Neon 770.CUBE", null);
        lutMap.set("Pasadena 21.CUBE", null);
        lutMap.set("Pitaya 15.CUBE", null);
        lutMap.set("Paladin 1875.CUBE", null);
        lutMap.set("Reeve 38.CUBE", null);
        lutMap.set("Remy 24.CUBE", null);
        lutMap.set("Sprocket 231.CUBE", null);
        lutMap.set("Teigen 28.CUBE", null);
        lutMap.set("Trent 18.CUBE", null);
        lutMap.set("Tweed 71.CUBE", null);
        lutMap.set("Zed 32.CUBE", null);
        lutMap.set("Zeke 39.CUBE", null);
        lutMap.set("Vireo 37.CUBE", null);

        this.lutMapObject = {};
        this.lutMapArray = [];

        // make it accessible for dat.gui
        for (let key of this.lutMap.keys()) {
            this.lutMapObject[key] = key;
            this.lutMapArray.push(key);
        }

        this.lutPass = new LUTPass();

        this.lutPass.enabled = false;

        Beuys.effectComposer.addPass(this.lutPass);
    }

    enable() {
        const hasBeenEnabled = super.enable();
        this.lutPass.enabled = this.enabled;
        return hasBeenEnabled;
    }

    disable() {
        super.disable();
        this.lutPass.enabled = this.enabled;
    }

    setLutInternal(lutName, intensity, use2DLut) {
        if (!this.params.enabled || !lutName) {
            return;
        }

        if (lutName == "(NONE)") {
            this.disable();
            return;
        }
        this.enable();

        this.lutPass.intensity = intensity;

        const lut = this.lutMap.get(lutName);
        if (lut && lut != "isLoading") {
            const newLut = use2DLut ? lut.texture : lut.texture3D;
            if (newLut != this.lutPass.lut) {
                this.lutPass.lut = newLut;
            }
        } else if (lut == undefined) {
            this.lutMap.set(lutName, "isLoading");
            new LUTCubeLoader()
                .load(Beuys.lutPath + lutName,
                    (lut) => {
                        this.lutPass.enabled = true;
                        this.lutMap.set(lutName, lut);
                        console.log("loaded LUT: " + lutName);
                        const newLut = use2DLut ? lut.texture : lut.texture3D;
                        if (newLut != this.lutPass.lut) {
                            this.lutPass.lut = newLut;
                        }
                        this.enable();
                    },
                    () => { },
                    (error) => {
                        this.lutPass.enabled = false;
                        console.error("failed to load LUT: " + lutName);
                        this.disable();
                    });
        }
    }

    update(pathIndex) {

        if (!this.params.enabled) {
            return;
        }

        let { segment, intensity } = this.getIntensity(pathIndex, this.params);

        intensity = this.guiIntensity != undefined ? this.guiIntensity : (intensity * segment.intensity || 1);

        const lutName = (this.guiLutName && this.guiLutName != "(NONE)") ? this.guiLutName : segment.lut;
        const use2DLut = this.use2DLut != undefined ? this.use2DLut : segment.use2DLut;

        if (intensity <= 0.001 | !lutName) {
            this.disable();
        } else {
            this.setLutInternal(lutName, intensity, use2DLut)
        }
    }

};

export let lutPass = {
    instance: undefined
}


