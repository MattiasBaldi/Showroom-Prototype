import * as THREE from 'three'
import { WebGLRenderer } from "three";
import Experience from './Experience.js'
import { BloomEffect, EffectComposer, EffectPass, RenderPass, GodRaysEffect } from "postprocessing";

// Post Processing
// import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
// import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
// import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';
// import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
// import { GodRaysFakeSunShader, GodRaysDepthMaskShader, GodRaysCombineShader, GodRaysGenerateShader } from 'three/addons/shaders/GodRaysShader.js';
// import { RGBShiftShader } from 'three/examples/jsm/Addons.js';
// import { SMAAPass } from 'three/examples/jsm/Addons.js';
// import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
// import { BokehShader, BokehDepthShader } from 'three/addons/shaders/BokehShader2.js';



export default class Renderer
{
    constructor()
    {

        console.log('test', GodRaysEffect)

        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
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

        console.log(BloomEffect);
        console.log(EffectComposer);
        console.log(EffectPass);
        console.log(RenderPass);

        // Post Processing
        this.setComposer()
        // this.setBloomPass()
        // this.setFilmGrainPass()
        // this.setGodRayPass()
        // this.setDepthOfField()
        // this.testGodray()
        // this.setAntiAliasingPass()
        // this.setRBGShiftPass()
        // this.setGammaCorrectionPass()
        // this.setAdjustMents()

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
        })

        // Set toneMapping to NoToneMapping
        this.instance.toneMapping = THREE.NoToneMapping;
    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    setComposer() {

        // Adding Composer
        this.composer = new EffectComposer(this.instance, this.renderTarget);

        // RenderPass
        this.renderPass = new RenderPass(this.scene, this.camera.instance);
        this.composer.addPass(this.renderPass);

        // Bloom
        this.composer.addPass(new EffectPass(this.camera.instance, new BloomEffect()));

   		// Sun
		const sunMaterial = new THREE.MeshBasicMaterial({
			color: 0xffddaa,
			transparent: true,
			fog: false
		});

		const sunGeometry = new THREE.SphereGeometry(0.75, 32, 32);
		const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.y = 5;
        this.scene.add(sun);

        // // God ray
        let gre = new GodRaysEffect(this.camera.instance, sun, {
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


          

    }

    setBloomPass()
    {
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.sizes.width, this.sizes.height),
            0.01, // strength
            1.4, // radius
            0 // threshold
        );


        // // Log all meshes
        // let closestDistanceToModel = 999999999 // infinity
        // let meshes = []; 

        // // Wait for resources
        // this.resources.on('ready', () => {   
        //     this.scene.traverse((object) => {
        //         console.log('Object:', object);
        //         if (object.isMesh) {
        //             meshes.push(object);
        //             console.log('Mesh found:', object); 
        //         }
        //     });
        // });


    // // Looping through all meshes
    // for (let i = 0; i < looksMeshes.length; i++) {
    //     const modelWorldPosition = looksMeshes[i].getWorldPosition(new THREE.Vector3())
    //     const modelPositionXZ = new THREE.Vector2(modelWorldPosition.x, modelWorldPosition.z)
    //     const distanceToModel = new THREE.Vector2(this.camera.instance.position.x, this.camera.instance.position.z).distanceTo(modelPositionXZ)
        
    // if (distanceToModel < closestDistanceToModel) closestDistanceToModel = distanceToModel
    // }

    
    // if (closestDistanceToModel <= postprocessingParams.distanceBloomAtenuation && closestDistanceToModel > postprocessingParams.closeDistanceBloom) {        
    //     unrealBloomPass.threshold = postprocessingParams.threshold + (postprocessingParams.distanceBloomAtenuation - closestDistanceToModel) * Math.abs((postprocessingParams.threshold - postprocessingParams.closeThreshold) / (postprocessingParams.distanceBloomAtenuation - postprocessingParams.closeDistanceBloom))
    //     unrealBloomPass.radius = postprocessingParams.radius + (postprocessingParams.distanceBloomAtenuation - closestDistanceToModel) * Math.abs((postprocessingParams.radius - postprocessingParams.closeRadius) / (postprocessingParams.distanceBloomAtenuation - postprocessingParams.closeDistanceBloom))
    //     unrealBloomPass.strength = postprocessingParams.strength - (postprocessingParams.distanceBloomAtenuation - closestDistanceToModel) * Math.abs((postprocessingParams.strength - postprocessingParams.closeStrength) / (postprocessingParams.distanceBloomAtenuation - postprocessingParams.closeDistanceBloom))

    // } 
    // else if (closestDistanceToModel <= postprocessingParams.closeDistanceBloom) {
    //     unrealBloomPass.threshold = postprocessingParams.closeThreshold
    //     unrealBloomPass.radius = postprocessingParams.closeRadius
    //     unrealBloomPass.strength = postprocessingParams.closeStrength
    // } 
    // else {
    //     unrealBloomPass.threshold = postprocessingParams.threshold
    //     unrealBloomPass.strength = postprocessingParams.strength
    //     unrealBloomPass.radius = postprocessingParams.radius
    // }


    // if (this.debug.active) {
    //     const debugObject = {
    //         strength: this.bloomPass.strength,
    //         radius: this.bloomPass.radius,
    //         threshold: this.bloomPass.threshold
    //     };

    //             // Debug
    //         this.bloomPass.strength = postprocessingParams.strength
    //         this.bloomPass.radius = postprocessingParams.radius
    //         this.bloomPass.threshold = postprocessingParams.threshold
            
    //         bloomGUIFolder.add(postprocessingParams, 'enabled')
    //         bloomGUIFolder.add(postprocessingParams, 'strength', 0, 2).name('bloom strenght far')
    //         bloomGUIFolder.add(postprocessingParams, 'radius', 0, 2).name('bloom radius far')
    //         bloomGUIFolder.add(postprocessingParams, 'threshold', 0, 2).name('bloom threshold far')
    //         bloomGUIFolder.add(postprocessingParams, 'closeStrength', 0, 2).name('bloom strenght close')
    //         bloomGUIFolder.add(postprocessingParams, 'closeRadius', 0, 2).name('bloom radius close')
    //         bloomGUIFolder.add(postprocessingParams, 'closeThreshold', 0, 2).name('bloom threshold close')
    //         bloomGUIFolder.add(postprocessingParams, 'distanceBloomAtenuation', 0, 50).name('bloom far distance')
    //         bloomGUIFolder.add(postprocessingParams, 'closeDistanceBloom', 0, 10).name('bloom near distance')

    //     const bloomFolder = this.debugFolder.addFolder('BloomPass');
    //     bloomFolder.add(debugObject, 'strength').name('Strength').step(0.001).min(0).max(1).onChange((value) => {
    //         this.bloomPass.strength = value;
    //     });
    //     bloomFolder.add(debugObject, 'radius').name('Radius').step(0.01).min(0).max(1).onChange((value) => {
    //         this.bloomPass.radius = value;
    //     });
    //     bloomFolder.add(debugObject, 'threshold').name('Threshold').step(0.01).min(0).max(1).onChange((value) => {
    //         this.bloomPass.threshold = value;
    //     });
    // }

        // Add this to the composer
        this.composer.addPass(this.bloomPass);

    }

    setFilmGrainPass()
    {
        // Film grain
        const effectFilm = new FilmPass( 0.2, false )
        this.composer.addPass(effectFilm)
        const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
        this.composer.addPass(gammaCorrectionPass)

        if(this.debug.active)
        {

        // bloomGUIFolder.add(postprocessingParams, 'filmGrainIntensity', 0, 5).name('film grain intensity').onChange(() => {effectFilm.uniforms.intensity.value = postprocessingParams.filmGrainIntensity})
        // bloomGUIFolder.add(postprocessingParams, 'grayscale').onChange(() => {effectFilm.uniforms.grayscale.value = postprocessingParams.grayscale})

        }

    }

    setDepthOfField()
    {
        const bokeh = new BokehPass()
        const bokehShader = new BokehShader()
        const BokehDepthShader = new BokehDepthShader()

        materialDepth = new THREE.ShaderMaterial( {
            uniforms: depthShader.uniforms,
            vertexShader: depthShader.vertexShader,
            fragmentShader: depthShader.fragmentShader
        } );

        materialDepth.uniforms[ 'mNear' ].value = camera.near;
        materialDepth.uniforms[ 'mFar' ].value = camera.far;


        // Resize
        postprocessing.rtTextureDepth.setSize( window.innerWidth, window.innerHeight );
        postprocessing.rtTextureColor.setSize( window.innerWidth, window.innerHeight );

        postprocessing.bokeh_uniforms[ 'textureWidth' ].value = window.innerWidth;
        postprocessing.bokeh_uniforms[ 'textureHeight' ].value = window.innerHeight;

    }

    setAntiAliasingPass()
    {
        // AntiAlis Setup
        this.renderTarget = new THREE.WebGLRenderTarget
        (
            800,
            600,
            {

                samples: this.instance.getPixelRatio() === 1 ? 5 /* Adjust this value */ : 0
            }
        )


        // AntiAliasing Pass
        if(this.instance.getPixelRatio === 1 && !this.instance.capabilities.isWebGL2)
            {
                this.SMAAPass = new SMAAPass()
                this.composer.addPass(this.SMAAPass)    
            }
    
    }

    setRBGShiftPass()
    {
/* 
    The RGB shift effect makes the image look like the red, green, and blue colors are slightly separated or misaligned. 
    This creates a visual distortion that can make the scene look more dynamic or give it a "glitchy" appearance. 
    It's often used in visual effects to add a sense of motion or to create a retro or sci-fi look.
*/        

        this.RGBShiftShader = new RGBShiftShader()
        this.composer.addPass(this.RGBShiftShader) 
    }

    setGammaCorrectionPass()
    {
        // RGB Correction
        this.gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
        this.composer.addPass(this.gammaCorrectionPass);
    }

    setAdjustMents()
    {
        // Tone Mapping
        this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMappingExposure = 100000000

        // Shadow Map
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.width = 512; // Sets the width of the shadow map
        this.instance.shadowMap.height = 512; // Sets the height of the shadow map
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap

        // Shadow Map Bias
        this.instance.shadowMap.bias = 0; // Adjusts the bias to reduce shadow artifacts

        // Shadow Map Normal Offset
        this.instance.shadowMap.normalBias = 0; // Adjusts the normal bias to reduce shadow acne

        // Output Encoding
        this.instance.outputEncoding = THREE.sRGBEncoding; // Sets the output encoding to sRGB for more accurate color representation

        // Gamma Factor
        this.instance.gammaOutput = true; // Enables gamma correction for the output
        this.instance.gammaFactor = 2; // Sets the gamma factor for gamma correction
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

