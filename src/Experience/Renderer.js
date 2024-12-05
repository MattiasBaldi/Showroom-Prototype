import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import Experience from './Experience.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';

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

        this.setInstance()
        this.instance.autoClear = false;

        //Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Post Processing')
        }

        //Param
        this.postprocessingParams = {
            enabled: true,
            threshold: 0.05,
            closeThreshold: 0.7,
            strength: 0.82,
            closeStrength: 0.28,
            radius: 0.2,
            closeRadius: 1.2,
            distanceBloomAtenuation: 10,
            closeDistanceBloom: 5.5,
            filmGrainIntensity: 0.4,
            grayscale: false
        }


        // Log all meshes
        // Ensure objects are added to the scene before traversal
   
    

        // Post processing
        this.setComposer()
        // this.setFilmGrain()
        // this.setBloom()

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

    setFilmGrain()
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

    update()
    {
        this.composer.render()
        // this.instance.render(this.scene, this.camera.instance)
    }
}

