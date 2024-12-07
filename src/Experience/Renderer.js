import * as THREE from 'three'
import { WebGLRenderer } from "three";
import Experience from './Experience.js'
import { BloomEffect, EffectComposer, EffectPass, RenderPass, GodRaysEffect, ToneMappingMode, ToneMappingEffect, SMAAEffect, DepthOfFieldEffect } from "postprocessing";
import { HalfFloatType } from "three";
import Scene_2 from './World/Scene_2.js';


export default class Renderer
{
    constructor()
    {

        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = this.experience.camera
        this.debug = this.experience.debug
        this.resources = this.experience.resources

        //Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Post Processing')
        }

        // Setup
        this.setInstance()
        this.resize()

        // Post Processing
        this.setComposer()
        this.setToneMapping()
        this.setGodRay()
        // this.setBloomPass()
        // this.setFilmGrainPass()
        // this.setGodRayPass()
        // this.setDepthOfField()
        // this.testGodray()
        // this.setAntiAliasingPass()
        // this.setRBGShiftPass()
        // this.setGammaCorrectionPass()
        // this.setAdjustMents()
        // this.setDepthOfField()

    }

    setInstance()
    {
        this.instance = new WebGLRenderer({
            canvas: this.canvas,
            powerPreference: "high-performance",
            antialias: false,
            stencil: false,
            depth: true,
            precision: "highp"
        });


        // Reset everything
        this.instance.toneMapping = THREE.NoToneMapping;
        this.instance.outputEncoding = THREE.sRGBEncoding;
    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    setComposer() {

        // Adding Composer
        this.composer = new EffectComposer(this.instance, {frameBufferType: HalfFloatType});

        // RenderPass
        this.renderPass = new RenderPass(this.scene, this.camera.instance);
        this.composer.addPass(this.renderPass);

        // Antialiasing
        const smaaEffect = new SMAAEffect();
        const effectPass = new EffectPass(this.camera.instance, smaaEffect);
        this.composer.multisampling = 8 // Adjust this for better AntiAliasing // Higher = Worse performance & Better AntiAliasing
        this.composer.addPass(effectPass);

        // Debug
        if (this.debug.active)
        {
            this.debugFolder
            .add(this.composer, 'multisampling')
            .name ('Aliasing')
            .step(0.001)
            .max(50)
            .min(0)
        }

    }

    setBloom()
    {
        // Bloom
        this.composer.addPass(new EffectPass(this.camera.instance, new BloomEffect()))
    }

    setToneMapping()
    {
        this.ToneMappingEffect = new ToneMappingEffect({
            mode: ToneMappingMode.REINHARD,
            resolution: 256,
            whitePoint: 16.0,
            middleGrey: 0.6,
            minLuminance: 0.01,
            averageLuminance: 0.01,
            adaptationRate: 1.0
        });

        this.composer.addPass(new EffectPass(this.camera.instance, this.ToneMappingEffect));

        console.log(this.ToneMappingEffect)

        // Debug
        // console.log('Before Debug')
        if (this.debug.active) {
            console.log('After Debug')
            const toneMappingFolder = this.debugFolder.addFolder('Tone Mapping');
            toneMappingFolder.add(this.ToneMappingEffect, 'whitePoint').min(0).max(20).step(0.1).name('White Point');
        //     toneMappingFolder.add(this.ToneMappingEffect, 'middleGrey').min(0).max(1).step(0.01).name('Middle Grey');
        //     toneMappingFolder.add(this.ToneMappingEffect, 'minLuminance').min(0).max(1).step(0.01).name('Min Luminance');
        //     toneMappingFolder.add(this.ToneMappingEffect, 'averageLuminance').min(0).max(1).step(0.01).name('Avg Luminance');
        //     toneMappingFolder.add(this.ToneMappingEffect, 'adaptationRate').min(0).max(5).step(0.1).name('Adaptation Rate');
        }

    }

    setDepthOfField()
    {

        this.depthOfFieldEffect = new DepthOfFieldEffect(this.camera.instance, 
        {
            focusDistance: 0.02,
            focalLength: 1,
            bokehScale: 2.0,
            height: 480
        });
        
        this.effectPass = new EffectPass(this.camera.instance, this.depthOfFieldEffect);
        this.composer.addPass(this.effectPass);

        // if (this.debug.active) {
        //     const debugObject = {
        //     focusDistance: this.depthOfFieldEffect.focusDistance,
        //     focalLength: this.depthOfFieldEffect.focalLength,
        //     bokehScale: this.depthOfFieldEffect.bokehScale
        //     };

        //     const folder = this.debugFolder.addFolder('Depth of Field');
        //     folder.add(debugObject, 'focusDistance').min(0).max(1).step(0.01).onChange((value) => {
        //     this.depthOfFieldEffect.focusDistance = value;
        //     });
        //     folder.add(debugObject, 'focalLength').min(0).max(1).step(0.01).onChange((value) => {
        //     this.depthOfFieldEffect.focalLength = value;
        //     });
        //     folder.add(debugObject, 'bokehScale').min(0).max(10).step(0.1).onChange((value) => {
        //     this.depthOfFieldEffect.bokehScale = value;
        //     });
        // }
    }

    setGodRay()
    {
   		// Sun
           const sunMaterial = new THREE.MeshBasicMaterial({
			color: 'white',
			transparent: true,
			fog: false
		});

		const sunGeometry = new THREE.SphereGeometry(0.75, 32, 32);
		const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.y = 2;

        const sun2 = sun.clone()
        sun2.position.x = 10; 

        const group = new THREE.Group()
        console.log(group)
        this.scene.add(group);

        // // God ray
        let gre = new GodRaysEffect(this.camera.instance, group, {
            height: 480,
            kernelSize: 2,
            density: 1,
            decay: 0.9,
            weight: 0.5,
            exposure: 0.3,
            samples: 20,
            clampMax: 0.95,
          });

          this.composer.addPass(new EffectPass(this.camera.instance, gre));


        // Debug
        console.log(gre)
    }

    update()
    {
    
        // this.instance.setRenderTarget(this.targetDepth); // God ray

        // this.instance.render(this.scene, this.camera.instance);

        // // God ray
        // this.instance.setRenderTarget(this.targetGodRays);
        // this.instance.render(this.scene, this.camera.instance);
        // this.instance.setRenderTarget(null);         // Reset render target to null to render to the screen

        // Composer Renderer
        this.composer.render();
    }
}

