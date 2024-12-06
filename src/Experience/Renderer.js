import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import Experience from './Experience.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { GodRaysFakeSunShader, GodRaysDepthMaskShader, GodRaysCombineShader, GodRaysGenerateShader } from 'three/addons/shaders/GodRaysShader.js';
import { RGBShiftShader } from 'three/examples/jsm/Addons.js';
import { SMAAPass } from 'three/examples/jsm/Addons.js';

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
        // this.setBloomPass()
        // this.setFilmGrainPass()
        // this.setGodRayPass()
        this.setAntiAliasingPass()
        // this.setRBGShiftPass()
        this.setGammaCorrectionPass()

    }

    setInstance()
    {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true // Only works without a composer
        })

        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)

        // // Tone Mapping
        // this.instance.toneMapping = THREE.CineonToneMapping
        // this.instance.toneMappingExposure = 1

        // // Shadow Map
        // this.instance.shadowMap.enabled = true
        // this.instance.shadowMap.width = 512; // Sets the width of the shadow map
        // this.instance.shadowMap.height = 512; // Sets the height of the shadow map
        // this.instance.shadowMap.type = THREE.PCFSoftShadowMap

        // // Shadow Map Bias
        // this.instance.shadowMap.bias = 0; // Adjusts the bias to reduce shadow artifacts

        // // Shadow Map Normal Offset
        // this.instance.shadowMap.normalBias = 0; // Adjusts the normal bias to reduce shadow acne

        // // Output Encoding
        // this.instance.outputEncoding = THREE.sRGBEncoding; // Sets the output encoding to sRGB for more accurate color representation

        // // Gamma Factor
        // this.instance.gammaOutput = true; // Enables gamma correction for the output
        // this.instance.gammaFactor = 2; // Sets the gamma factor for gamma correction

        // //Debug
        // if(this.debug.active)
        // {
        //     this.debugFolder.add
        //     this.debugFolder.add(this.instance, 'toneMappingExposure').min(0).max(10).step(0.001).name('Tone Mapping Exposure')
        //     this.debugFolder.add(this.instance.shadowMap, 'enabled').name('Shadows Enabled')
        //     this.debugFolder.add(this.instance.shadowMap, 'bias').min(-0.01).max(0.01).step(0.0001).name('Shadow Bias')
        //     this.debugFolder.add(this.instance.shadowMap, 'normalBias').min(0).max(0.1).step(0.001).name('Shadow Normal Bias')
        //     this.debugFolder.add(this.instance, 'outputEncoding', {
        //         LinearEncoding: THREE.LinearEncoding,
        //         sRGBEncoding: THREE.sRGBEncoding
        //     }).name('Output Encoding')
        //     this.debugFolder.add(this.instance, 'gammaOutput').name('Gamma Output')
        //     this.debugFolder.add(this.instance, 'gammaFactor').min(1).max(3).step(0.01).name('Gamma Factor')
        // }

    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    setComposer() {

        // Adding Composer
        this.composer = new EffectComposer(this.instance, this.renderTarget);
        this.composer.setSize(this.sizes.width, this.sizes.height)
        this.composer.setPixelRatio(this.sizes.pixelRatio)

        // Adding RenderPass
        this.renderPass = new RenderPass(this.scene, this.camera.instance);
        this.composer.addPass(this.renderPass);

                // Tone Mapping
                this.composer.toneMapping = THREE.CineonToneMapping
                this.composer.toneMappingExposure = 1

                // Shadow Map
                // this.composer.shadowMap.enabled = true
                // this.composer.shadowMap.width = 512; // Sets the width of the shadow map
                // this.composer.shadowMap.height = 512; // Sets the height of the shadow map
                // this.composer.shadowMap.type = THREE.PCFSoftShadowMap

                // // Shadow Map Bias
                // this.composer.shadowMap.bias = 0; // Adjusts the bias to reduce shadow artifacts

                // // Shadow Map Normal Offset
                // this.composer.shadowMap.normalBias = 0; // Adjusts the normal bias to reduce shadow acne

                // Output Encoding
                this.composer.outputEncoding = THREE.sRGBEncoding; // Sets the output encoding to sRGB for more accurate color representation

                // Gamma Factor
                this.composer.gammaOutput = true; // Enables gamma correction for the output
                this.composer.gammaFactor = 2; // Sets the gamma factor for gamma correction

                // Debug
                if(this.debug.active)
                {
                    this.debugFolder.add
                    this.debugFolder.add(this.composer, 'toneMappingExposure').min(0).max(10).step(0.001).name('Tone Mapping Exposure')
                    // this.debugFolder.add(this.composer.shadowMap, 'enabled').name('Shadows Enabled')
                    // this.debugFolder.add(this.composer.shadowMap, 'bias').min(-0.01).max(0.01).step(0.0001).name('Shadow Bias')
                    // this.debugFolder.add(this.composer.shadowMap, 'normalBias').min(0).max(0.1).step(0.001).name('Shadow Normal Bias')
                    this.debugFolder.add(this.composer, 'outputEncoding', {
                    LinearEncoding: THREE.LinearEncoding,
                    sRGBEncoding: THREE.sRGBEncoding
                    }).name('Output Encoding')
                    this.debugFolder.add(this.composer, 'gammaOutput').name('Gamma Output')
                    this.debugFolder.add(this.composer, 'gammaFactor').min(1).max(3).step(0.01).name('Gamma Factor')
                }
    }

    setBloomPass()
    {
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.sizes.width, this.sizes.height),
            1, // strength
            0.4, // radius
            0 // threshold
        );


        // Log all meshes
        let closestDistanceToModel = 999999999 // infinity
        let meshes = []; 

        // Wait for resources
        this.resources.on('ready', () => {   
            this.scene.traverse((object) => {
                console.log('Object:', object);
                if (object.isMesh) {
                    meshes.push(object);
                    console.log('Mesh found:', object); 
                }
            });
        });


        // Looping through all meshes
        for (let i = 0; i < looksMeshes.length; i++) {
            const modelWorldPosition = looksMeshes[i].getWorldPosition(new THREE.Vector3())
            const modelPositionXZ = new THREE.Vector2(modelWorldPosition.x, modelWorldPosition.z)
            const distanceToModel = new THREE.Vector2(this.camera.instance.position.x, this.camera.instance.position.z).distanceTo(modelPositionXZ)
            
        if (distanceToModel < closestDistanceToModel) closestDistanceToModel = distanceToModel
        }
    
        
        if (closestDistanceToModel <= postprocessingParams.distanceBloomAtenuation && closestDistanceToModel > postprocessingParams.closeDistanceBloom) {        
            unrealBloomPass.threshold = postprocessingParams.threshold + (postprocessingParams.distanceBloomAtenuation - closestDistanceToModel) * Math.abs((postprocessingParams.threshold - postprocessingParams.closeThreshold) / (postprocessingParams.distanceBloomAtenuation - postprocessingParams.closeDistanceBloom))
            unrealBloomPass.radius = postprocessingParams.radius + (postprocessingParams.distanceBloomAtenuation - closestDistanceToModel) * Math.abs((postprocessingParams.radius - postprocessingParams.closeRadius) / (postprocessingParams.distanceBloomAtenuation - postprocessingParams.closeDistanceBloom))
            unrealBloomPass.strength = postprocessingParams.strength - (postprocessingParams.distanceBloomAtenuation - closestDistanceToModel) * Math.abs((postprocessingParams.strength - postprocessingParams.closeStrength) / (postprocessingParams.distanceBloomAtenuation - postprocessingParams.closeDistanceBloom))
    
        } 
        else if (closestDistanceToModel <= postprocessingParams.closeDistanceBloom) {
            unrealBloomPass.threshold = postprocessingParams.closeThreshold
            unrealBloomPass.radius = postprocessingParams.closeRadius
            unrealBloomPass.strength = postprocessingParams.closeStrength
        } 
        else {
            unrealBloomPass.threshold = postprocessingParams.threshold
            unrealBloomPass.strength = postprocessingParams.strength
            unrealBloomPass.radius = postprocessingParams.radius
        }


        // Debug
        this.bloomPass.strength = postprocessingParams.strength
        this.bloomPass.radius = postprocessingParams.radius
        this.bloomPass.threshold = postprocessingParams.threshold
        
        bloomGUIFolder.add(postprocessingParams, 'enabled')
        bloomGUIFolder.add(postprocessingParams, 'strength', 0, 2).name('bloom strenght far')
        bloomGUIFolder.add(postprocessingParams, 'radius', 0, 2).name('bloom radius far')
        bloomGUIFolder.add(postprocessingParams, 'threshold', 0, 2).name('bloom threshold far')
        bloomGUIFolder.add(postprocessingParams, 'closeStrength', 0, 2).name('bloom strenght close')
        bloomGUIFolder.add(postprocessingParams, 'closeRadius', 0, 2).name('bloom radius close')
        bloomGUIFolder.add(postprocessingParams, 'closeThreshold', 0, 2).name('bloom threshold close')
        bloomGUIFolder.add(postprocessingParams, 'distanceBloomAtenuation', 0, 50).name('bloom far distance')
        bloomGUIFolder.add(postprocessingParams, 'closeDistanceBloom', 0, 10).name('bloom near distance')


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

    setGodRayPass()
    {
        console.log(GodRaysFakeSunShader)
        console.log(GodRaysDepthMaskShader)
        console.log(GodRaysCombineShader)
        console.log(GodRaysGenerateShader)
    }

    setAntiAliasingPass()
    {
        // AntiAlis Setup
        this.renderTarget = new THREE.WebGLRenderTarget
        (
            800,
            600,
            {

                samples: this.instance.getPixelRatio() === 1 ? 2 /* Adjust this value */ : 0
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

    update()
    {
        // Standard Renderer
        // this.instance.render(this.scene, this.camera.instance)  

        // Composer Renderer
        this.composer.render()
    }
}

