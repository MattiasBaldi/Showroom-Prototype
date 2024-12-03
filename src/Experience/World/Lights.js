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

        // Setup
        this.setSpotlight(10)
        this.setVolumetricLight()

        // Debug
        if (this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Lights')
        }
    }

    setSpotlight(count) 
    {

        for (let i = 0; i < count; i++)
        {
            this.spotLight = new VolumetricSpotLight()
            this.spotLight.castShadow = true; // Ensure the light casts shadows

            // Position X
            const gap = 10; 
            const positionX = (i % 2 === 0) ? (i + 1) * gap : -(i + 1) * gap;
            this.spotLight.positionX = positionX;

            // Position Y
            this.spotLightpositionY = 5; 

            // Create a target object and set its position directly below the spotlight
            // const target = new THREE.Object3D();
            // target.position.set(this.spotLight.positionX, this.spotLight.positionY - 1, this.spotLight.positionZ);
            // this.scene.add(target);

            // Set the spotlight to look at the target
            // this.spotLight.target = target;

            // this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight)
            this.scene.add(this.spotLight)
            // this.scene.add(this.spotLightHelper)
            
        }


        // this.spotLight1.position.y = 0
        // this.spotLight1.position.z = 0
        // this.spotLight1.position.x = 0

    }

    // setHelpers() {
    // this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight)
    // this.scene.add(this.spotLightHelper)
    // }

    setVolumetricLight()
    {
        this.SpotLightCone = new VolumetricSpotLight()
        this.scene.add(this.SpotLightCone)

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