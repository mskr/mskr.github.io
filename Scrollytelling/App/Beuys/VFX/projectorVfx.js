/**
 * Set up and manage the projector effect in the first scene.
 * 
 * audio: mixkit-vintage-film-projector-working-1441.wav
 * sound downloaded from https://mixkit.co/free-sound-effects/movie-projector/
 */

import * as THREE from "../../../components/three/build/three.module.js";

import Beuys from '../variables.js';
import params from "../params.js";
import { Effect } from "./effect.js";

/**
 * Simple vertex shader with the additional pass through of the second set of uvs (uv2)
 * to specify the borders of the actual geometry.
 * @returns
 */
function vertexShader() {
    return `
        varying vec4 modelViewPosition;
        varying vec2 texCoord;
        varying vec2 planeCoord;
        attribute vec2 uv2;

        void main() {
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            texCoord = uv;
            planeCoord = uv2;
            gl_Position = projectionMatrix * modelViewPosition;
        }
    `;
}

/**
 * The fragment shader does some smoothing of the texture and manipulates alpha to
 * be high for only the brighter pixels, making the dark ones transparent.
 *
 * Transparency is low towards the corners to hide the plane geometry.
 *
 * The normal texCoord will contain the uvs of the movie texture, which is just a
 * vertical strip, and the second set uv2 are the coordinates of the plane geometry
 * to identify the borders of the plane to fade out.
 *
 * @returns the fragment shader string
 */
function fragmentShader() {
    return `
        uniform float opacity;
        uniform float filterDx;
        varying vec2 texCoord;
        varying vec2 planeCoord;
        uniform sampler2D u_texture;

        // 4 extra samples
        float offsetWeight = 1./4.;

        void main() {

            #ifdef MULTI_SAMPLE
                gl_FragColor = (
                    texture2D(u_texture, texCoord) +
                    texture2D(u_texture, texCoord + vec2(filterDx, filterDx)) * offsetWeight +
                    texture2D(u_texture, texCoord + vec2(-filterDx, filterDx)) * offsetWeight +
                    texture2D(u_texture, texCoord + vec2(filterDx, -filterDx)) * offsetWeight +
                    texture2D(u_texture, texCoord + vec2(-filterDx, -filterDx)) * offsetWeight
                    ) / 2.0; // one full sample and 4 quarter samples
            #else
                gl_FragColor = texture2D(u_texture, texCoord);
            #endif

            float distX = clamp(1.0 - planeCoord.x, 0., 1.);
            float distY = clamp(min(planeCoord.y, 1.0 - planeCoord.y), 0., 1.) * 2.;

            float sum = gl_FragColor.r + gl_FragColor.g + gl_FragColor.b;
            gl_FragColor.a = sum / 3. * opacity * distX * distY;
            gl_FragColor.rgb *= 2.;
        }
    `;
}

export class ProjectorVfx extends Effect {

    constructor(params, movieTexture) {
        super("ProjectorVfx");
        this.params = params;
        this.movieTexture = movieTexture;
        this.sound = undefined;
        this.soundIsLoaded = false;
        this.soundIsPlaying = false;
        this.objects = [];
    }

    get enabled() {
        return this._enabled;
    }

    init() {
        this.screen = Beuys.scene.getObjectByName("A_Video_Plane");
        this.projector = Beuys.scene.getObjectByName("Projector_grpALL");
        // console.log("screen= ", JSON.stringify(this.screen));

        let posArray = this.screen.geometry.attributes["position"].array;
        let pos = [];

        for (let i = 0; i < posArray.length; i += 3) {
            let localPos = new THREE.Vector3(
                posArray[i],
                posArray[i + 1],
                posArray[i + 2]
            );
            let worldPos = this.screen.localToWorld(localPos);
            pos.push(worldPos);
        }
        // console.log("worldPos= ", pos);
        // console.log("Beuys.pathCamera= ", Beuys.pathCamera);
        // console.log("Beuys.pathCamera worldPos= ", Beuys.pathCamera.localToWorld(Beuys.pathCamera.position));

        this.screenPos = {
            center: this.screen.localToWorld(new THREE.Vector3(0, 0, 0)),
            topLeft: pos[5],
            topRight: pos[4],
            bottomRight: pos[1],
            bottomLeft: pos[0],
        };

        // let marker = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshLambertMaterial({
        //     color: 0xff0000,
        //     depthTest: false
        // }));
        // marker.position.copy(this.screenPos.bottomLeft);
        // Beuys.scene.add(marker);

        this.createGeometry();
        if (this.enabled) {
            this.show();
        }

        if (this.params.audioOn) {
            // create an AudioListener and add it to the camera
            const listener = new THREE.AudioListener();
            Beuys.pathCamera.add(listener);

            const isSpatial = this.params.spatialAudio;

            // create the PositionalAudio object (passing in the listener)
            const sound = this.sound = isSpatial ?
                new THREE.PositionalAudio(listener) : new THREE.Audio(listener);
            const audioVolume = this.params.audioVolume;

            // load a sound and set it as the PositionalAudio object's buffer
            const audioLoader = new THREE.AudioLoader();

            const that = this;
            audioLoader.load(this.params.audioFile,
                function (buffer) {
                    // console.log("projector audio: buffered");

                    sound.setBuffer(buffer);
                    if (isSpatial) {
                        sound.setRefDistance(20);
                    }
                    sound.setVolume(audioVolume);
                    sound.setLoop(that.params.loopAudio);
                    that.soundIsLoaded = true;
                    if (that.soundIsPlaying) {
                        sound.play();
                    }
                },
                () => { },
                (error) => {
                    console.error("audio load failed:", that.params.audioFile);
                }
            );

            if (isSpatial) {
                this.projector.add(this.sound);
            }
        }
    }

    enable() {
        if (super.enable()) {
            if (this.objects.length == 0) {
                this.init();
            }
            return true;
        } else {
            return false;
        }
    }

    show() {
        if (super.show()) {
            for (let i = 0; i < this.objects.length; i++) {
                this.objects[i].visible = true;
            }
        }
        if (this.sound) {
            if (!this.sound.isPlaying) {
                // console.log("projector audio: start");
                this.soundIsPlaying = true;
                if (this.soundIsLoaded) {
                    this.sound.play();
                }
            }
        }
    }

    hide() {
        if (super.hide()) {
            for (let i = 0; i < this.objects.length; i++) {
                this.objects[i].visible = false;
            }
        }
        if (this.sound && this.sound.isPlaying) {
            // console.log("projector audio: stop");
            this.soundIsPlaying = false;
            if (this.soundIsLoaded) {
                this.sound.stop();
            }
        }
    }

    update(pathIndex) {
        // console.log("------");
        // console.log("ProjectorVfx.update");
        // console.log("ProjectorVfx.enabled= ", this.enabled);

        const { segment, intensity } = this.getIntensity(pathIndex, this.params);

        if (intensity > 0) {

            let projectorVfxParams = this.params;

            if (this.uniforms) {
                // update opacity uniform to fade in/out the effect
                this.uniforms.opacity.value = projectorVfxParams.opacity * intensity;
                this.movieMaterial.uniformsNeedUpdate = true;
            }


            const that = this;
            Beuys.videoElement.onended = () => {
                that.hide();
            }

            // Beuys.videoElement.playbackRate = 10.0;

            if (this.sound) {
                const volume = segment.audioVolume || this.params.audioVolume;
                this.sound.setVolume(volume * intensity);
            }

            this.show();

        } else {
            this.hide();
        }
    }

    createGeometry() {

        if (this.objects.length > 0) {
            return;
        }

        let projectorVfxParams = this.params;

        this.movieTexture.minFilter = THREE.LinearFilter;
        this.movieTexture.magFilter = THREE.LinearFilter;
        this.movieTexture.wrapS = THREE.ClampToEdgeWrapping;
        this.movieTexture.wrapT = THREE.ClampToEdgeWrapping;

        const filterDx = 0.25 / projectorVfxParams.numPlanes;

        this.uniforms = {
            u_texture: { value: this.movieTexture },
            opacity: { type: "float", value: projectorVfxParams.opacity },
            filterDx: { type: "float", value: filterDx },
        };

        const defines = {};

        if (projectorVfxParams.multiSample) {
            defines.MULTI_SAMPLE = true;
        }

        this.movieMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            defines,
            fragmentShader: fragmentShader(),
            vertexShader: vertexShader(),

            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            name: "projectorVfx"
        }
        );

        const topLeft = this.screenPos.topLeft;
        const topRight = this.screenPos.topRight;
        const bottomRight = this.screenPos.bottomRight;
        const bottomLeft = this.screenPos.bottomLeft;


        const poiPosArray = projectorVfxParams.projectorLensPosition;

        const projectorPosition = new THREE.Vector3(poiPosArray[0], poiPosArray[1], poiPosArray[2]);

        const startOffset = projectorVfxParams.startOffset; // offset from projector focus point to begin of effect
        const endOffset = projectorVfxParams.endOffset;     // fade out early in front of screen

        const numStrips = projectorVfxParams.numStrips;
        const numPlanes = projectorVfxParams.numPlanes;

        for (let planeIndex = 0; planeIndex < numPlanes; planeIndex++) {

            const scale = planeIndex / numPlanes;

            const top = topLeft.clone().lerp(topRight, scale);
            const bottom = bottomLeft.clone().lerp(bottomRight, scale);
            const geometry = new THREE.BufferGeometry();

            const startTop = projectorPosition.clone().lerp(top, startOffset);
            const startBottom = projectorPosition.clone().lerp(bottom, startOffset);
            const endTop = projectorPosition.clone().lerp(top, endOffset);
            const endBottom = projectorPosition.clone().lerp(bottom, endOffset);

            const vertices = [];
            const uvs = [];
            const uvs2 = [];

            const stripSize = 1. / numStrips;

            for (let stripIndex = 0; stripIndex < numStrips; stripIndex++) {
                const stripScale = stripIndex / numStrips;
                const stripStartTop = startBottom.clone().lerp(startTop, stripScale + stripSize);
                const stripStartBottom = startBottom.clone().lerp(startTop, stripScale);

                const stripEndTop = endBottom.clone().lerp(endTop, stripScale + stripSize);
                const stripEndBottom = endBottom.clone().lerp(endTop, stripScale);

                vertices.push(stripEndBottom.x, stripEndBottom.y, stripEndBottom.z);
                vertices.push(stripStartTop.x, stripStartTop.y, stripStartTop.z);
                vertices.push(stripEndTop.x, stripEndTop.y, stripEndTop.z);

                vertices.push(stripEndBottom.x, stripEndBottom.y, stripEndBottom.z);
                vertices.push(stripStartBottom.x, stripStartBottom.y, stripStartBottom.z);
                vertices.push(stripStartTop.x, stripStartTop.y, stripStartTop.z);

                // texCoord of movie texture, which is actually only a vertical line
                uvs.push(scale, stripScale);
                uvs.push(scale, stripScale + stripSize);
                uvs.push(scale, stripScale + stripSize);

                uvs.push(scale, stripScale);
                uvs.push(scale, stripScale);
                uvs.push(scale, stripScale + stripSize);

                // coordinate within plane
                uvs2.push(1, stripScale);
                uvs2.push(0, stripScale + stripSize);
                uvs2.push(1, stripScale + stripSize);

                uvs2.push(1, stripScale);
                uvs2.push(0, stripScale);
                uvs2.push(0, stripScale + stripSize);
            }

            // itemSize = 3 because there are 3 values (components) per vertex
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(vertices), 3));
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(uvs), 2));
            geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(new Float32Array(uvs2), 2));
            const mesh = new THREE.Mesh(geometry, this.movieMaterial);

            mesh.renderOrder = 1000 - planeIndex;
            mesh.name = "projectorVfx-plane-" + planeIndex;

            this.objects.push(mesh);
            mesh.visible = false; // need this.show() to render.

            mesh.userData.doNotIntersect = true;
            Beuys.scene.add(mesh);
        }
    }
};

export let projectorVfx = {
    instance: undefined
}


