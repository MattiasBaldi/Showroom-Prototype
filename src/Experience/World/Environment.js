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
        // this.setFog()
        this.setEnvironmentMap()
        this.addFloor()

    }

        setEnvironmentMap()
        {
            this.environmentMap.mapping =  THREE.EquirectangularReflectionMapping
            this.scene.environment = this.environmentMap
            this.scene.environmentIntensity = 0.3
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
                .add(this.scene, 'environmentIntensity')
                .name('Env Light Intensity')
                .min(0)
                .max(10)
                .step(0.001);
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

        const textures = [
            {
            map: this.resources.items.floor1_color,
            normalMap: this.resources.items.floor1_normal,
            aoMap: this.resources.items.floor1_ao
            },
            {
            map: this.resources.items.floor2_color,
            normalMap: this.resources.items.floor2_normal,
            aoMap: this.resources.items.floor2_ao,
            roughnessMap: this.resources.items.floor2_roughness
            },
            {
            map: this.resources.items.floor3_color,
            normalMap: this.resources.items.floor3_normal,
            aoMap: this.resources.items.floor3_ao,
            roughnessMap: this.resources.items.floor3_roughness
            }
        ];
        
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000, 10, 10),
            new THREE.MeshStandardMaterial({
                roughness: 0,
                metalness: 0.6,
                envMap: this.environmentMap,
                envMapIntensity: 0,  // Optional, still sets reflection strength
            })
        );
        
        const selectedTexture = 1;
        const texture = textures[selectedTexture - 1];

        // Apply textures and settings only for the selected property
        Object.keys(texture).forEach(property => {
            floor.material[property] = texture[property];
            texture[property].wrapS = THREE.MirroredRepeatWrapping;
            texture[property].wrapT = THREE.MirroredRepeatWrapping;
            texture[property].generateMipmaps = false;
            texture[property].repeat.set(floor.geometry.parameters.width, floor.geometry.parameters.height);
        });
    
        floor.rotation.x = Math.PI * - 0.5
        floor.receiveShadow = true; 
        this.scene.add(floor)

        // bloom
        this.renderer.selectiveBloom.selection.add(floor)

        if (this.debug.active) {
            const debugObject = {
            color: floor.material.color.getHex(),
            emissive: floor.material.emissive.getHex(),
            emissiveIntensity: floor.material.emissiveIntensity || 1,
            selectedTexture: selectedTexture
            };

            const floorFolder = this.debugFolder.addFolder('Floor');

            floorFolder
            .add(debugObject, 'selectedTexture', { Purple: 1, Concrete: 2, Stones: 3 })
            .name('Select Texture')
            .onChange((value) => {

                // Dispose of the old material
                if (floor.material) {
                    floor.material.dispose();
                }

                const texture = textures[value - 1];
                Object.keys(texture).forEach(property => {
                    floor.material[property] = texture[property];
                    texture[property].wrapS = THREE.MirroredRepeatWrapping;
                    texture[property].wrapT = THREE.MirroredRepeatWrapping;
                    texture[property].generateMipmaps = false;
                    texture[property].repeat.set(floor.geometry.parameters.width, floor.geometry.parameters.height);
                });
                floor.material.needsUpdate = true;
            });

            floorFolder
            .add({ showFloor: true }, 'showFloor')
            .name('Show Floor')
            .onChange((value) => {
                floor.visible = value;
            });

            floorFolder
            .addColor(debugObject, 'color')
            .name('Overlay Color')
            .onChange((value) => {
                floor.material.color.set(value);
            });


            floorFolder
            .add(floor.material, 'roughness')
            .name('Roughness')
            .onChange((value) => {
                floor.material.roughness = value;
            })
            .step(0.01)
            .max(1)
            .min(0);

            floorFolder
            .add(floor.material, 'metalness')
            .name('Metalness')
            .onChange((value) => {
                floor.material.metalness = value;
            })
            .step(0.01)
            .max(1)
            .min(0);
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