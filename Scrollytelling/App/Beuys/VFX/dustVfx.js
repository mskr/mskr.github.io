/**
 * The "dust" particle effect.
 */

import * as THREE from "../../../components/three/build/three.module.js";

import Beuys from '../variables.js';
import params from "../params.js";
import { Effect } from "./effect.js";

/**
 * TODO:
 * * check scene volume
 * * create around camera points
 * * add vertex shader to move them around
 *
 */

const DustVfxTime = {};

// Include a performance.now polyfill.
// In node.js, use process.hrtime.
if (typeof (window) === 'undefined' && typeof (process) !== 'undefined') {
    DustVfxTime.now = function () {
        var time = process.hrtime();

        // Convert [seconds, nanoseconds] to milliseconds.
        return time[0] * 1000 + time[1] / 1000000;
    };
}
// In a browser, use window.performance.now if it is available.
else if (typeof (window) !== 'undefined' &&
    window.performance !== undefined &&
    window.performance.now !== undefined) {
    // This must be bound, because directly assigning this function
    // leads to an invocation exception in Chrome.
    DustVfxTime.now = window.performance.now.bind(window.performance);
}
// Use Date.now if it is available.
else if (Date.now !== undefined) {
    DustVfxTime.now = Date.now;
}
// Otherwise, use 'new Date().getTime()'.
else {
    DustVfxTime.now = function () {
        return new Date().getTime();
    };
}


export class DustVfx extends Effect {

    constructor(params) {
        super("ProjectorVfx");
        this.params = params;
        this.disc = undefined;
        this.objects = [];
        this.particleSets = [];
    }

    get enabled() {
        return this._enabled;
    }

    init() {
        this.createGeometry();
        if (this.enabled) {
            this.show();
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
        if (!this.visible) {
            for (let i = 0; i < this.objects.length; i++) {
                this.objects[i].visible = true;
            }
            this.visible = true;
        }
    }

    hide() {
        if (this.visible) {
            for (let i = 0; i < this.objects.length; i++) {
                this.objects[i].visible = false;
            }
            this.visible = false;
        }
    }


    update(pathIndex) {

        const { segment, intensity } = this.getIntensity(pathIndex, this.params);

        if (intensity > 0) {
            this.show();

            const cameraPos = Beuys.pathCamera.position;
            const activationDistance = this.params.activationDistance;

            this.particleSets.forEach(set => {
                const inRange = set.center.distanceTo(cameraPos) < activationDistance;
                set.particleMeshes.forEach(mesh => {
                    mesh.visible = inRange;

                    // TODO: optional Individual motion
                    // if (inRange && !mesh.userData.isDebug) {

                    // const geometry = mesh.geometry;
                    // const vertices = geometry.getAttribute("position").array;
                    // const numVertices = vertices.length;

                    // for (let i = 0; i < numVertices; i += 3) {
                    //     vertices[i] += 0.05;
                    //     vertices[i + 1] += 0.05;
                    //     vertices[i + 2] += 0.05;
                    // }
                    // vertices.needsUpdate = true;

                    // const rotY = mesh.rotation.y;
                    // mesh.rotation.copy(new THREE.Euler(0, rotY + .01, 0, 'XYZ'));
                    // }
                }
                );

            })

        } else {
            this.hide();
        }
    }

    // Gauss ransom
    random() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) return this.random() // resample between 0 and 1
        return num
    }

    createGeometryAtPoint(center) {

        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const materials = [];


        const dustRadiusH = this.params.radius;
        const dustMinZ = this.params.floor
        const dustMaxZ = this.params.roof

        // for dust particles and most debug markers
        const particleMeshes = [];

        if (this.params.debug) {

            const largeSphere = new THREE.SphereGeometry(.1);

            const material2 = new THREE.MeshLambertMaterial({
                color: 0x0000ff,
                depthTest: true
            });
            let centerMarker = new THREE.Mesh(largeSphere, material2);

            centerMarker.position.copy(center);
            Beuys.scene.add(centerMarker);

            const sphere = new THREE.SphereGeometry(.03);

            const markerMaterial = new THREE.MeshLambertMaterial({
                color: 0xff0000,
                // depthTest: false
            });

            for (let y = dustMinZ; y < dustMaxZ; y++) {
                for (let z = -dustRadiusH; z < dustRadiusH; z++) {
                    for (let x = -dustRadiusH; x < dustRadiusH; x++) {
                        if (x == -dustRadiusH || x == dustRadiusH - 1 ||
                            z == -dustRadiusH || z == dustRadiusH - 1 ||
                            y == dustMinZ || y == dustMaxZ - 1) {
                            let marker = new THREE.Mesh(sphere, markerMaterial);

                            marker.position.copy(new THREE.Vector3(x, y, z).add(center));
                            Beuys.scene.add(marker);

                            marker.userData.isDebug = true;
                            particleMeshes.push(marker);

                        }
                    }
                }
            }
        }

        for (let i = 0; i < this.params.numParticles; i++) {

            const x = Math.random() * 2 * dustRadiusH - dustRadiusH;
            const y = Math.random() * (dustMaxZ - dustMinZ) + dustMinZ;
            const z = Math.random() * 2 * dustRadiusH - dustRadiusH;

            vertices.push(x, y, z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const parameters = [
            [[1.0, 0.2, 0.5], this.disc, 20, 0.3],
            [[0.95, 0.1, 0.75], this.disc, 15, 0.2],
            [[0.90, 0.5, 0.9], this.disc, 10, 0.4],
            // [[0.85, 0.3, 0.75], this.disc, 17, 0.1],
            // [[0.70, .5, .9], this.disc, 12, .2]
        ];

        const sizeFactor = this.params.sizeFactor;
        const luminanceFactor = this.params.luminanceFactor;
        const saturationFactor = this.params.saturationFactor;
        const opacityFactor = this.params.opacityFactor;

        const now = DustVfxTime.now();

        const particleSet = [];

        for (let i = 0; i < parameters.length; i++) {

            const color = parameters[i][0];
            const sprite = parameters[i][1];
            const size = parameters[i][2];
            const opacity = parameters[i][3] * opacityFactor;

            materials[i] = new THREE.PointsMaterial({
                size: sizeFactor * size,
                sizeAttenuation: true,
                map: sprite,
                alphaTest: 0.005,
                transparent: true,
                blending: THREE.AdditiveBlending,
                opacity: opacity,
                depthTest: true,
                depthWrite: false
            });
            materials[i].color.setHSL(color[0], color[1] * saturationFactor, color[2] * luminanceFactor);

            const particles = new THREE.Points(geometry, materials[i]);
            particles.name = "Dust particles";

            this.objects.push(particles);

            particles.visible = false;

            particles.userData.doNotIntersect = true;
            particles.userData.lastTime = now;

            particles.position.copy(center);

            Beuys.scene.add(particles);

            particleMeshes.push(particles);
            particleSet.push(particles);
        }

        const speed = this.params.speed;

        // Set a render callback on the first mesh of the set to update all rotations in the set equally
        particleSet[0].onBeforeRender = (renderer, scene, camera, geometry, material, group) => {

            const now = DustVfxTime.now();

            const amount = speed * (now - particleSet[0].userData.lastTime) * 0.00001 * this.random();
            particleSet[0].userData.lastTime = now;

            particleSet.forEach(particles => {

                particles.rotation.copy(new THREE.Euler(
                    particles.rotation.x - amount,
                    particles.rotation.y + amount,
                    particles.rotation.z + amount, 'XYZ'));
            });
        };

        this.particleSets.push({
            center,
            particleMeshes
        });
    }

    createGeometry() {

        this.disc = new THREE.TextureLoader().load("Assets/disc.png");

        Beuys.POIs.forEach(poi => {
            const center = new THREE.Vector3().fromArray(poi[1].position);
            this.createGeometryAtPoint(center);
        });

    }
};

export let dustVfx = {
    instance: undefined
}


