/**
 * Set up a simple vortex shader to animate the trees
 */

import * as THREE from "../../../components/three/build/three.module.js";

import Beuys from '../variables.js';
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


export class VortexVfx extends Effect {

    constructor(params, movieTexture) {
        super("VortexVfx");
        this.params = params;

        this.treeModels = [];
    }

    get enabled() {
        return this._enabled;
    }

    init() {

        const treeObjects = [
            'oakTreeMedium_mediumtree01_geo',
            'Oaktree01_c_Big01_geo',
            'Oaktree01_c_Medium01_geo'
        ];

        const that = this;
        treeObjects.forEach(name => {
            const obj = Beuys.scene.getObjectByName(name);
            if (obj) {
                that.treeModels.push(obj);
            } else {
                console.error("failed to find object in scene:", name);
            }
        })

        this.treeModels.forEach(tree => {

            let posArray = tree.geometry.attributes["position"].array;
            let pos = [];

            // for (let i = 0; i < posArray.length; i += 3) {
            //     let localPos = new THREE.Vector3(
            //         posArray[i],
            //         posArray[i + 1],
            //         posArray[i + 2]
            //     );
            //     let worldPos = tree.localToWorld(localPos);
            //     pos.push(worldPos);
            // }

            console.log("num verts= ", pos.length);

            tree.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {

                // console.log(tree);
                if (tree.userData.shader) {
                    tree.userData.shader.uniforms.time.value = performance.now() / 1000;
                }
            };

            var box = new THREE.Box3().setFromObject(tree);
            var size = new THREE.Vector3();
            box.getSize(size);

            // colorful effect taken from https://codepen.io/prisoner849/pen/BvxBPW
            //
            // tree.material.onBeforeCompile = function (shader) {
            //     shader.uniforms.time = { value: 0 };
            //     shader.uniforms.size = { value: size };
            //     shader.uniforms.color1 = { value: new THREE.Color(0xff0080) };
            //     shader.uniforms.color2 = { value: new THREE.Color(0xfff000) };
            //     shader.vertexShader = 'varying vec4 vWorldPosition;\n' + shader.vertexShader;
            //     shader.vertexShader = shader.vertexShader.replace(
            //         '#include <worldpos_vertex>',
            //         [
            //             '#include <worldpos_vertex>',
            //             'vWorldPosition = modelMatrix * vec4( transformed, 1.0 );'
            //         ].join('\n')
            //     );
            //     shader.fragmentShader = 'uniform float time;\nuniform vec3 size;\nuniform vec3 color1;\nuniform vec3 color2;\nvarying vec4 vWorldPosition;\n' + shader.fragmentShader;
            //     shader.fragmentShader = shader.fragmentShader.replace(
            //         '#include <dithering_fragment>',
            //         [
            //             '#include <dithering_fragment>',
            //             'float gridRatio = sin( time ) * 0.1875 + 0.3125;', // 0.125 .. 0.5
            //             'vec3 m = abs( sin( vWorldPosition.xyz * gridRatio ) );',
            //             'vec3 gridColor = mix(color1, color2, vWorldPosition.y / size.y);',
            //             'gl_FragColor = vec4( mix( gridColor, gl_FragColor.rgb, m.x * m.y * m.z ), diffuseColor.a );'
            //         ].join('\n')
            //     );
            //     tree.userData.shader = shader;
            // };

            tree.material.onBeforeCompile = function (shader) {
                shader.uniforms.time = { value: 0 };
                shader.uniforms.size = { value: size };
                shader.uniforms.color1 = { value: new THREE.Color(0xff0080) };
                shader.uniforms.color2 = { value: new THREE.Color(0xfff000) };
                shader.vertexShader = '#ifdef USE_UV\n' + shader.vertexShader;

                shader.vertexShader = shader.vertexShader.replace(
                    '#ifdef USE_UV\n',
                    [
                        '#include <worldpos_vertex>',
                        'float random(vec2 st) {',
                        '    return fract(sin(dot(st.xy',
                        '                         vec2(12.9898,78.233)))* 43758.5453123);',
                        '}',
                        'vWorldPosition = modelMatrix * vec4( transformed, 1.0 );',
                        'vWorldPosition.x += 0.001 * random(vec2(1,1);',
                        'vWorldPosition.y += 0.001 * random(vec2(1,1);',
                        'vWorldPosition.y += 0.001 * random(vec2(1,1);',
                        ''
                    ].join('\n')
                );


                shader.vertexShader = 'varying vec4 vWorldPosition;\n' + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <worldpos_vertex>',
                    [
                        '#include <worldpos_vertex>',
                        'float random(vec2 st) {',
                        '    return fract(sin(dot(st.xy',
                        '                         vec2(12.9898,78.233)))* 43758.5453123);',
                        '}',
                        'vWorldPosition = modelMatrix * vec4( transformed, 1.0 );',
                        'vWorldPosition.x += 0.001 * random(vec2(1,1);',
                        'vWorldPosition.y += 0.001 * random(vec2(1,1);',
                        'vWorldPosition.y += 0.001 * random(vec2(1,1);',
                        ''
                    ].join('\n')
                );
                // shader.fragmentShader = 'uniform float time;\nuniform vec3 size;\nuniform vec3 color1;\nuniform vec3 color2;\nvarying vec4 vWorldPosition;\n' + shader.fragmentShader;
                // shader.fragmentShader = shader.fragmentShader.replace(
                //     '#include <dithering_fragment>',
                //     [
                //         '#include <dithering_fragment>',
                //         'float gridRatio = sin( time ) * 0.1875 + 0.3125;', // 0.125 .. 0.5
                //         'vec3 m = abs( sin( vWorldPosition.xyz * gridRatio ) );',
                //         'vec3 gridColor = mix(color1, color2, vWorldPosition.y / size.y);',
                //         'gl_FragColor = vec4( mix( gridColor, gl_FragColor.rgb, m.x * m.y * m.z ), diffuseColor.a );'
                //     ].join('\n')
                // );
                tree.userData.shader = shader;
            };


        })


    }

    update(pathIndex) {

        const { segment, intensity } = this.getIntensity(pathIndex, this.params);

        if (intensity > 0) {

            this.show();

        } else {
            this.hide();
        }
    }

    createGeometry() {
    }
};

export let vortexVfx = {
    instance: undefined
}


