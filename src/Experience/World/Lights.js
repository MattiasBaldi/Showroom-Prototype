import * as THREE from 'three'
import Experience from '../Experience.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js'


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
        this.setSpotlight()
        this.setHelpers()

        // Debug
        if (this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Lights')
        }
    }

    setSpotlight() 
    {
        this.spotLight1 = new THREE.SpotLight('white', 1, 5, Math.PI / 4, 0.2, 1)
        this.spotLight1.castShadow = true; // Ensure the light casts shadows
        this.spotLight1.position.y = 0
        this.spotLight1.position.z = 0
        this.spotLight1.position.x = 0

        this.clone1 = this.spotLight1.clone()
        this.clone1.position.z += 10; 
        this.clone2 = this.spotLight1.clone()
        this.clone2.position.x += 20; 
        this.scene.add(this.spotLight1.target)
        this.scene.add(this.spotLight1, this.clone1, this.clone2)
    }

    setHelpers() {
    this.spotLight1Helper = new THREE.SpotLightHelper(this.spotLight1)
    this.scene.add(this.spotLight1Helper)
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