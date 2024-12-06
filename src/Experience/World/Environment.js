import Experience from '../Experience.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import * as THREE from 'three'


export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.renderer = this.experience.renderer.instance

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Environment')
            // this.debugFolder.close()
        }

        //Setup
        this.environmentMap = this.resources.items.blueStudio
        this.addGrid()
        this.setEnvironmentMap()
        this.addFloor()
        // this.setFog()
    }

        setEnvironmentMap()
        {
            this.environmentMap.mapping =  THREE.EquirectangularReflectionMapping
            this.scene.environment = this.environmentMap
            this.scene.environmentIntensity = 0.25
            this.scene.background = new THREE.Color('black')
            
            // Debug
            if(this.debug.active)
            {
                const debugObject = {
                    showBackground: false,
                    gridHelper: true,
                    intensity: this.scene.environmentIntensity
                };
        
                this.debugFolder
                .add(debugObject, 'showBackground')
                .name('Show Background')
                .onChange((value) => {
                    if (value) {
                        this.scene.background = this.environmentMap; // Set to your desired background
                    } else {
                        this.scene.background = new THREE.Color('black'); // Hide background
                    }
                });


                this.debugFolder
                .add(debugObject, 'intensity')
                .name('Intensity')
                .onChange((value) => {this.scene.environmentIntensity = value})
                .step(0.001)
                .max(10)
                .min(0);
            }
        }

        setFog()
        {
            this.scene.fog = new THREE.FogExp2('grey', 0.01)
        }

        addFloor()
        {
        const floor = new THREE.Mesh
        (
            new THREE.PlaneGeometry(1000, 1000),
            new THREE.MeshStandardMaterial({ color: 'black' })
        )
    
        floor.rotation.x = Math.PI * - 0.5
        floor.receiveShadow = true; // Ensure the floor receives shadows
        this.scene.add(floor)
        }
    

        addGrid()
        {
            // Grid Helper 
            this.gridHelper = new THREE.GridHelper(50, 50);
        
            // Debug
            if (this.debug.active)
            {
            const debugObject = {showGridHelper: false}

            if (debugObject.showGridHelper)
            {
            this.scene.add(this.gridHelper)
            }

            this.debugFolder
            .add(debugObject, 'showGridHelper')
            .name('Grid')
            .onChange((value) => { 
            if (value) {this.scene.add(this.gridHelper)} 
            else {this.scene.remove(this.gridHelper) } 
            })
            }
        }

    }


//     // Tone mapping
// // Tone mapping is a bit like color grading
// // Reinhard is a bit like a 'raw' filed photo, with no color grading applied yet
// renderer.toneMapping = THREE.ReinhardToneMapping
// renderer.toneMappingExposure = 2; //Exposure like in a photography

// gui.add(renderer, 'toneMapping', {
//     No: THREE.NoToneMapping, 
//     Linear: THREE.LinearToneMapping, 
//     Reinhard: THREE.ReinhardToneMapping, 
//     Cineon: THREE.CineonToneMapping, 
//     ACESFilmic: THREE.ACESFilmicToneMapping
// })

// gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001); 


// // AntiAliasing
// // Aliasing determines the sharpness of the geometry, otherwise it creates a stair-like effect, where edges are creased
// // It depends on the pixel ratio, but antialiasing solves it
// // Set it to true in the renderer

// // Physically accurates lighting 
// renderer.useLegacyLights = false
// gui.add(renderer, 'useLegacyLights')

// //Shadows
// // Environment maps cannot cast shadows
// // So we add light that's similiar to the environment maps intensity and add shadows afterwards
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
// renderer.shadowMap.enabled = true;
