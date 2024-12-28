import Experience from '../Experience.js'
import * as THREE from 'three'


export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.renderer = this.experience.renderer
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Environment')
            this.debugFolder.close()
        }

        //Setup
        this.environmentMap = this.resources.items.blueStudio
        // this.addGrid()
        this.setEnvironmentMap()
        this.addFloor()
        this.setFog()
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
            this.scene.fog = null; // Ensure fog is deactivated initially
            
            if(this.debug.active)
            {
                const debugObject =
                 {
                    fogActive: false, // Set initial state to false
                    color: new THREE.Color('grey'), 
                    density: 0.01
                }

                this.debugFolder
                .add(debugObject, 'fogActive')
                .name('Fog')
                .onChange((value) => {
                    if (value) {
                        this.scene.fog = new THREE.FogExp2(debugObject.color, debugObject.density);
                    } else {
                        this.scene.fog = null;
                    }
                })

                this.debugFolder
                .addColor(debugObject, 'color')
                .name('Color')
                .onChange((value) => { 
                    if (this.scene.fog) {
                        this.scene.fog.color.set(value);
                    }
                })

                this.debugFolder
                .add(debugObject, 'density')
                .name('Density')
                .onChange((value) => { 
                    if (this.scene.fog) {
                        this.scene.fog.density = value;
                    }
                })
                .step(0.001)
                .max(0.1)
                .min(0.001);
            }
        }

        addFloor()
        {

        // this.resource = this.resources.items.floor
        // const floor = this.resource.scene


        const floor = new THREE.Mesh
        (
            new THREE.PlaneGeometry(1000, 1000),
            new THREE.MeshStandardMaterial({
                color: 'black',
                emissive: new THREE.Color(0x000000), // Set emissive color
                emissiveIntensity: 2 // Set emissive intensity
            })
        )

        floor.rotation.x = Math.PI * - 0.5
        floor.receiveShadow = true; 
        this.scene.add(floor)

        if (this.debug.active) {
            const debugObject = {
            color: floor.material.color.getHex(),
            emissive: floor.material.emissive.getHex(),
            emissiveIntensity: floor.material.emissiveIntensity || 1
            };

            this.debugFolder
            .addColor(debugObject, 'color')
            .name('Floor Color')
            .onChange((value) => {
            floor.material.color.set(value);
            });

            this.debugFolder
            .addColor(debugObject, 'emissive')
            .name('Floor Emissive')
            .onChange((value) => {
            floor.material.emissive.set(value);
            });

            this.debugFolder
            .add(debugObject, 'emissiveIntensity')
            .name('Emissive Intensity')
            .onChange((value) => {
            floor.material.emissiveIntensity = value;
            })
            .step(0.1)
            .max(10)
            .min(0);

            this.debugFolder
            .add({ showFloor: true }, 'showFloor')
            .name('Show Floor')
            .onChange((value) => {
                floor.visible = value;
            });

            this.debugFolder
            .add({ bloom: true }, 'bloom')
            .name('Bloom Effect')
            .onChange((value) => {
                if (value) {
                    bloom.selection.add(floor);
                } else {
                    bloom.selection.delete(floor);
                }
            });
        }

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