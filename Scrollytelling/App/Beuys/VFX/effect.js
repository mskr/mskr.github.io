/**
 * Set up nad manage the projector effect in the first scene.
 */

import * as THREE from "../../../components/three/build/three.module.js";

// FIXME:
// Create subclass of effect that has actual geometry, or add new super class for passes
//

export class Effect {
    constructor(name = "?") {
        this._name = name;
        this._enabled = false;
        this.visible = false;
        this.passPriority = 0;
    }

    get name() {
        return this._name;
    }

    get enabled() {
        return this._enabled;
    }

    enable() {
        if (this.enabled) {
            return false;
        }
        // console.log("Effect.enable: ", this.name);
        this._enabled = true;
        this.show();
        return true;
    }

    disable() {
        this._enabled = false;
        this.hide();
    }

    init() { }

    update() { }

    show() {
        const wasVisible = this.visible;
        this.visible = true;
        return !wasVisible;
    }

    hide() {
        const wasVisible = this.visible;
        this.visible = false;
        return wasVisible;
    }

    getIntensity(pathIndex, params) {

        if (!params.enabled) {
            return { segment: undefined, intensity: 0.0 }
        }

        // console.log("------");
        // console.log("Effect.update pathIndex=", pathIndex);
        // console.log("Effect.enabled= ", this.enabled);

        let segment = undefined;
        let i;
        // find index
        for (i = 0; i < params.segments.length; i++) {
            segment = params.segments[i];
            if (pathIndex >= segment.start && (!segment.end || pathIndex < segment.end)) {
                break;
            }
        }
        if (i == params.segments.length) {
            // no segment found
            return { segment: undefined, intensity: 0.0 }
        }

        return { segment, intensity: this.getSegmentIntensity(segment, pathIndex) };
    }

    // return intensity for specified segment
    getSegmentIntensity(segment, pathIndex) {

        if (pathIndex < segment.start || (segment.end !== undefined && pathIndex >= segment.end)) {
            return 0.0;
        }

        const fadeIn = segment.fadeIn ?? 0;
        const fadeOut = segment.fadeOut ?? 0;
        const isFadeIn = fadeIn > 0 && pathIndex <= (segment.start + fadeIn ?? 0);
        const isFadeOut = fadeOut > 0 && segment.end && !isFadeIn && pathIndex >= (segment.end - fadeOut ?? 0);

        let intensity = 0.0;

        // TODO: do not intensity out to 0, but to the value in the next segment
        if (isFadeIn) {
            intensity = THREE.MathUtils.mapLinear(pathIndex, segment.start, segment.start + fadeIn, 0, 1);
            intensity = THREE.MathUtils.smootherstep(intensity, 0, 1);
        } else if (isFadeOut) {
            intensity = THREE.MathUtils.mapLinear(pathIndex, segment.end - fadeOut, segment.end, 1, 0);
            intensity = THREE.MathUtils.smootherstep(intensity, 0, 1);
        } else {
            intensity = 1.0;
        }
        return intensity;
    }

}
