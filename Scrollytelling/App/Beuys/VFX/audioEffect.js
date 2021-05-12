
/**
 * Set up and manage a n audio effect
 *
 */

import * as THREE from "../../../components/three/build/three.module.js";

import Beuys from '../variables.js';
import { Effect } from "./effect.js";


export class AudioEffect extends Effect {

    constructor(params) {
        super("AudioEffect");
        this.params = params;
        this.isSettingUp = false;
    }

    get enabled() {
        return this._enabled;
    }

    init() {

        if (this.isSettingUp) {
            return;
        }

        this.isSettingUp = true;

        const params = this.params;
        const segments = params.segments;

        segments.forEach(segment => {

            segment.sound = undefined;
            segment.soundIsLoaded = false;
            segment.soundIsPlaying = false;

            if (segment.audioOn) {
                // create an AudioListener and add it to the camera
                const listener = new THREE.AudioListener();
                Beuys.pathCamera.add(listener);

                const isSpatial = segment.spatialAudio;

                // create the PositionalAudio object (passing in the listener)
                const sound = segment.sound = isSpatial ?
                    new THREE.PositionalAudio(listener) : new THREE.Audio(listener);
                const audioVolume = segment.audioVolume;

                // load a sound and set it as the PositionalAudio object's buffer
                const audioLoader = new THREE.AudioLoader();

                console.log("setup audio:", segment.audioFile);

                audioLoader.load(segment.audioFile,
                    (buffer) => {
                        console.log("audio buffered:", segment.audioFile);

                        sound.setBuffer(buffer);
                        if (isSpatial) {
                            // from sample code:
                            sound.setRefDistance(20);
                        }
                        sound.setVolume(audioVolume);
                        sound.setLoop(segment.loopAudio);
                        segment.soundIsLoaded = true;

                        // in case we started playing already before buffer was loaded
                        if (segment.soundIsPlaying) {
                            sound.play();
                        }
                    },
                    () => { },
                    (error) => {
                        console.error("audio load failed:", segment.audioFile);
                    });

                if (isSpatial) {
                    this.projector.add(sound);
                }
            }

        });
    }

    show() {
        super.show();
        this.update(Beuys.currentPageFloatIndex);
    }

    hide() {
        super.hide();
        this.update(Beuys.currentPageFloatIndex);
    }

    checkPlaySegment(segment, pathIndex) {
        const intensity = this.getSegmentIntensity(segment, pathIndex);
        const sound = segment.sound;

        if (intensity > 0) {
            if (sound) {
                const volume = segment.audioVolume || this.params.audioVolume;
                sound.setVolume(volume * intensity);

                if (!sound.isPlaying) {
                    segment.soundIsPlaying = true;
                    if (segment.soundIsLoaded) {
                        // console.log("start play:", segment.audioFile);
                        sound.play();
                    }
                }
            }

        } else {
            if (sound && sound.isPlaying) {
                segment.soundIsPlaying = false;
                if (segment.soundIsLoaded) {
                    // console.log("stop play:", segment.audioFile);
                    sound.stop();
                }
            }
        }
    }

    update(pathIndex) {
        this.params.segments.forEach(segment => {
            this.checkPlaySegment(segment, pathIndex);
        });
    }
};

export let audioEffect = {
    instance: undefined
}


