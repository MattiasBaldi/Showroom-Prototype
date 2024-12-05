import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import Experience from './Experience.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default class Renderer
{
    constructor()
    {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.debug = this.experience.debug

        this.setInstance()
        this.instance.autoClear = false;

        //Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Post Processing')
        }

        // Post processing
        this.setComposer()

    }

    setInstance()
    {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })
        this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMappingExposure = 1.75
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.antialias = true;
        this.instance.setClearColor('#211d20')
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    setComposer() {
        this.composer = new EffectComposer(this.instance);
        this.renderPass = new RenderPass(this.scene, this.camera.instance);
        this.composer.addPass(this.renderPass);
        this.outputPass = new OutputPass();
        this.composer.addPass(this.outputPass);
    }

    setBloom()
    {
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.sizes.width, this.sizes.height),
            1, // strength
            0.4, // radius
            0 // threshold
        );

        console.log(this.bloomPass);

        // Add bloomPass parameters to GUI
        if (this.debug.active) {
            const debugObject = {
                strength: this.bloomPass.strength,
                radius: this.bloomPass.radius,
                threshold: this.bloomPass.threshold
            };

            const bloomFolder = this.debugFolder.addFolder('BloomPass');
            bloomFolder.add(debugObject, 'strength').name('Strength').step(0.001).min(0).max(1).onChange((value) => {
                this.bloomPass.strength = value;
            });
            bloomFolder.add(debugObject, 'radius').name('Radius').step(0.01).min(0).max(1).onChange((value) => {
                this.bloomPass.radius = value;
            });
            bloomFolder.add(debugObject, 'threshold').name('Threshold').step(0.01).min(0).max(1).onChange((value) => {
                this.bloomPass.threshold = value;
            });
        }

        this.composer.addPass(this.bloomPass);
    }

    update()
    {
        this.composer.render()
        // this.instance.render(this.scene, this.camera.instance)
    }
}

