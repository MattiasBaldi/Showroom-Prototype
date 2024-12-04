import * as THREE from 'three'
import Experience from '../Experience.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js'
import VolumetricSpotLight from '../Utils/VolumetricLight.js'

export default class Lights 
{
    constructor()
    {
        this.experience = new Experience()
        this.renderer = this.experience.renderer
        this.resources = this.experience.resources
        this.world = this.experience.world
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.scene_1 = this.world.scene_1
        this.scene_2 = this.world.scene_2
        this.scene_3 = this.world.scene_3

        // Debug
        if (this.debug.active) {

            // Ensure this.debugFolder is initialized
            this.debugFolder = this.debug.ui.addFolder('Lights');            
            this.Volumetric = this.debugFolder.addFolder('Volumetric Lights');
        }

        // Setup
        this.setSpotlight(6)
 
    }

    setSpotlight(count) 
    {
        this.spotLights = [];

        for (let i = 0; i < count; i++)
        {

            //     constructor(color = 'grey', attenuation = 6, anglePower = 0.1, intensity = 100, distance = 6, angle = 0.1 * Math.PI, penumbra = 1, decay = 0)
            this.spotLight = new VolumetricSpotLight('grey', 6, 0.1 * Math.PI, 100, 6, 0.1, 1, 0)
            this.spotLight.castShadow = true; // Ensure the light casts shadows

            // Position X
            const gap = 10; 
            const positionX = (i % 2 === 0) ? (i + 1) * gap : -(i + 1) * gap;
            this.spotLight.position.x = positionX;
            this.spotLight.children[0].material.uniforms.spotPosition.value.x = positionX;

            console.log(this.spotLight.children[1].intensity)
            console.log('Light Intensity:', this.spotLight.children[1].intensity);
            console.log('Light Angle:', this.spotLight.children[1].angle);
            console.log('Light Penumbra:', this.spotLight.children[1].penumbra);
            console.log('Light Decay:', this.spotLight.children[1].decay);


            this.spotLights.push(this.spotLight)
            this.scene.add(this.spotLight)
        }

    if (this.debug.active) {
        const debugObject = {
            attenuation: this.spotLights[0].children[0].material.uniforms.attenuation.value,
            anglePower: this.spotLights[0].children[0].material.uniforms.anglePower.value,
            lightDistance:  this.spotLights[0].children[1].distance,
            lightIntensity: this.spotLights[0].children[1].intensity, 
            lightAngle: this.spotLights[0].children[1].angle,
            lightPenumbra: this.spotLights[0].children[1].penumbra, 
            lightDecay:  this.spotLights[0].children[1].decay,
        };

        this.Volumetric
            .add(debugObject, 'attenuation')
            .name('Attenuation')
            .step(0.001)
            .min(0)
            .max(20)
            .onChange((value) => {
                // Update the attenuation value for all spotlights
                this.spotLights.forEach((spotLight) => {
                    spotLight.children[0].material.uniforms.attenuation.value = value;
                });
            });

            this.Volumetric
            .add(debugObject, 'anglePower')
            .name('AnglePower')
            .step(0.001)
            .min(0)
            .max(20)
            .onChange((value) => {
                // Update the attenuation value for all spotlights
                this.spotLights.forEach((spotLight) => {
                    spotLight.children[0].material.uniforms.anglePower.value = value;
                });
            });

            this.Volumetric
            .add(debugObject, 'lightDistance')
            .name('Light Distance')
            .step(0.001)
            .min(0)
            .max(10)
            .onChange((value) => {
                // Update the light intensity for all spotlights
                this.spotLights.forEach((spotLight) => {
                    spotLight.children[1].distance = value;
                });
            });

    this.Volumetric
        .add(debugObject, 'lightIntensity')
        .name('Light Intensity')
        .step(0.001)
        .min(0)
        .max(10)
        .onChange((value) => {
            // Update the light intensity for all spotlights
            this.spotLights.forEach((spotLight) => {
                spotLight.children[1].intensity = value;
            });
        });

    this.Volumetric
        .add(debugObject, 'lightAngle')
        .name('Light Angle')
        .step(0.001)
        .min(0)
        .max(Math.PI / 2)
        .onChange((value) => {
            // Update the light angle for all spotlights
            this.spotLights.forEach((spotLight) => {
                spotLight.children[1].angle = value;
            });
        });

    this.Volumetric
        .add(debugObject, 'lightPenumbra')
        .name('Light Penumbra')
        .step(0.001)
        .min(0)
        .max(1)
        .onChange((value) => {
            // Update the light penumbra for all spotlights
            this.spotLights.forEach((spotLight) => {
                spotLight.children[1].penumbra = value;
            });
        });

    this.Volumetric
        .add(debugObject, 'lightDecay')
        .name('Light Decay')
        .step(0.001)
        .min(0)
        .max(2)
        .onChange((value) => {
            // Update the light decay for all spotlights
            this.spotLights.forEach((spotLight) => {
                spotLight.children[1].decay = value;
            });
        });
    }
    
}


    setBloom() {
        this.bloomParams = {
            threshold: 0,
            strength: 1,
            radius: 0
        };
    
        this.bloom = new UnrealBloomPass();
        this.bloom.renderToScreen = true;
        this.bloom.threshold = this.bloomParams.threshold
        this.composer.addPass(this.bloom);
    
        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Bloom');
            this.debugFolder
                .add(this.bloomParams, 'threshold')
                .name('Threshold')
                .step(0.001)
                .min(0)
                .max(1)
                .onChange(value => {
                    this.bloom.threshold = Number(value);
                });
            this.debugFolder
                .add(this.bloomParams, 'strength')
                .name('Strength')
                .step(0.001)
                .min(0)
                .max(3)
                .onChange(value => {
                    this.bloom.strength = Number(value);
                });
            this.debugFolder
                .add(this.bloomParams, 'radius')
                .name('Radius')
                .step(0.001)
                .min(0)
                .max(1)
                .onChange(value => {
                    this.bloom.radius = Number(value);
                });
        }
    }


    update(){
    }
    
}