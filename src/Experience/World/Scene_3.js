import * as THREE from 'three'
import Experience from '../Experience'
import Switch from '../Controls/Switch.js'

export default class Scene_3 {

    constructor()
    {
        this.experience = new Experience()
        this.renderer = this.experience.renderer
        this.camera = this.experience.camera
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.environment = this.experience.world.environment
        this.resources = this.experience.resources

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Scene 3 (Furniture Space)')
            this.debugFolder.close()
            this.modelFolder = this.debugFolder.addFolder('Models')
            this.modelFolder.close()
            this.floorFolder = this.debugFolder.addFolder('Floor')
            this.floorFolder.close()
            this.lampFolder = this.debugFolder.addFolder('Lamp')
            this.lampFolder.close()
            this.tableFolder = this.debugFolder.addFolder('Table')
            this.tableFolder.close()
        }

        // Setup 
        this.resource = this.resources.items.Scene_3
        this.sceneModels = this.resource.scene
        this.sceneGroup = new THREE.Group()
        this.empty = this.sceneModels.children[0]
        this.floor = this.empty.children[0] 
        this.lamp = this.empty.children[1] 
        this.models = this.empty.children[2] 
        this.table = this.empty.children[3] 
        this.bulb = this.empty.children[1].children[0]
        this.frame = this.empty.children[1].children[1]
        this.rotationSpeed = 0.005

        // Init
        this.setScene()
        this.setMaterials()
        this.setBloom()
        
        // Switch
        this.switch = new Switch(this.empty, 10)
    }

    setScene()
    {
        // Position
        this.sceneModels.position.x = 120
        this.sceneModels.scale.setScalar(1)
        this.empty.name = 'furniture'
        this.scene.add(this.sceneModels)

        // Debug
        if(this.debug.active)
            {
                this.debugFolder.add(this.sceneModels.rotation, 'y').name('Rotation').step(Math.PI * 0.25).min(-10).max(10)
                this.debugFolder.add(this.sceneModels.scale, 'x').name('Scale').step(0.01).min(0).max(2).onChange((value) => {
                    this.sceneModels.scale.set(value, value, value)
                })

                this.debugFolder.add(this, 'rotationSpeed').name('Rotation Speed').step(0.01).min(0).max(0.1)
                this.floorFolder.add(this.floor, 'visible').name('Floor Visibility').listen()

                this.lampFolder.add(this.lamp, 'visible').name('Lamp Visibility').listen()
                this.lampFolder.add(this.lamp.position, 'y').name('Position Y').step(0.01).min(0).max(1000)
                this.lampFolder.add(this.lamp.scale, 'x').name('Scale').step(0.01).min(0).max(2).onChange((value) => {
                    this.lamp.scale.set(value, value, value)
                })

                this.modelFolder.add(this.models, 'visible').name('Models Visibility').listen()
                this.tableFolder.add(this.table, 'visible').name('Table Visibility').listen()

            }
    }

    setFloor()
    {
        const getTextures = () => 
            Object.fromEntries(
            Object.entries(this.resources.items).filter(([_, value]) =>
                Object.values(value).some(subValue => subValue instanceof THREE.Texture)
            )
            );
        
        const textures = getTextures();
        const selectedTexture = textures.concrete_worn;
        const applyTexture = (texture) => {
            // Compute the bounding box if not already computed
            if (!this.floor.geometry.boundingBox) {
                this.floor.geometry.computeBoundingBox();
            }

            const boundingBox = this.floor.geometry.boundingBox;
            const radius = (boundingBox.max.x - boundingBox.min.x) / 2;
            const circumference = 2 * Math.PI * radius;

            for (const [name, map] of Object.entries(texture)) {
                // Clone the texture to avoid modifying the original
                const clonedMap = map.clone();
                this.floor.material[name] = clonedMap;
                Object.assign(clonedMap, {
                    wrapS: THREE.MirroredRepeatWrapping,
                    wrapT: THREE.MirroredRepeatWrapping,
                    generateMipmaps: false
                });

                clonedMap.repeat.set(circumference, circumference);
            }
        };


        applyTexture(selectedTexture);    
        this.floor.rotation.x = Math.PI * - 0.5
        this.floor.receiveShadow = true; 
        this.scene.add(this.floor)

        if (this.debug.active) {
            const debugObject = {
            color: this.floor.material.color.getHex(),
            emissive: this.floor.material.emissive.getHex(),
            envMapIntensity: this.floor.material.envMapIntensity,
            selectedTexture: selectedTexture,
            texturename: Object.keys(textures).find(key => textures[key] === selectedTexture)
            };

            const floorFolder = this.debugFolder.addFolder('Floor');

            floorFolder
            .add(debugObject, 'texturename', Object.keys(textures))
            .name('Select Texture')
            .onChange((value) => {
                const texture = textures[value];
                applyTexture(texture);
                this.floor.material.needsUpdate = true;
            });
        }
    }

    setMaterials()
    {
        // Env Map Intensity
        // this.empty.traverse((child) => {
        //     if (child.isMesh && child.material) {
        //         child.material.envMap = this.environment.environmentMap
        //         child.material.envMapIntensity = 1
        //     }
        // })
   
        if(this.debug.active)
        {

            this.debugFolder.add({ envMapIntensity: 1 }, 'envMapIntensity')
                .min(0)
                .max(1)
                .step(0.01)
                .onChange((value) => {
                    this.empty.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.envMap = this.environment.environmentMap
                            child.material.envMapIntensity = value
                        }
                    })
                })

            this.floorFolder
            .add(this.floor.material, 'metalness')
            .min(0)
            .max(1)
            .step(0.01)

            this.floorFolder
            .add(this.floor.material, 'roughness')
            .min(0)
            .max(1)
            .step(0.01)

            this.floorFolder
            .add(this.floor.material, 'envMapIntensity')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange((value) => {
                this.floor.material.envMap = this.environment.environmentMap
                this.floor.material.envMapIntensity = value
            })
            
            this.tableFolder
            .add(this.table.children[1].material, 'metalness')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange((value) => {
                this.table.children[1].material.metalness = value
                this.models.children[0].children[0].children[3].material.metalness = value
            })

            this.tableFolder
            .add(this.table.children[1].material, 'roughness')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange((value) => {
                this.table.children[1].material.roughness = value
                this.models.children[0].children[0].children[3].material.roughness = value
            })

            this.tableFolder
            .add(this.table.children[1].material, 'envMapIntensity')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange((value) => {
                this.table.children[1].material.envMap = this.environment.environmentMap
                this.table.children[1].material.envMapIntensity = value
            })

 

        }
    }

    setBloom()
    {
    
    this.bulb.material = new THREE.MeshStandardMaterial({
        emissive: new THREE.Color(0x808080),
        emissiveIntensity: 10,
        color: new THREE.Color(0x0000000),
        roughness: 0,
        metalness: 1 
    });

    this.frame.material = new THREE.MeshStandardMaterial({
        emissive: new THREE.Color(0x808080),
        emissiveIntensity: 3,
        color: new THREE.Color(0x0000000),
        roughness: 0,
        metalness: 1 
    });

    this.renderer.selectiveBloom.selection.add(this.bulb, this.frame)

    if(this.debug.active)
    {
        const bulbFolder = this.lampFolder.addFolder('Bulb')
        bulbFolder.add(this.bulb.material, 'emissiveIntensity')
            .min(0)
            .max(10)
            .step(0.1)
            .name('Emissive Intensity')

        bulbFolder.add({ bloom: true }, 'bloom').name('Toggle Bloom').onChange((value) => {
            if (value) {
                this.renderer.selectiveBloom.selection.add(this.bulb);
                this.renderer.selectiveBloom.selection.add(this.frame);
            } else {
                this.renderer.selectiveBloom.selection.delete(this.bulb);
                this.renderer.selectiveBloom.selection.delete(this.frame);
            }
        });

        const frameFolder = this.lampFolder.addFolder('Frame')
        frameFolder.add(this.frame.material, 'emissiveIntensity')
            .min(0)
            .max(10)
            .step(0.1)
            .name('Emissive Intensity')

            const floorEmissiveFolder = this.floorFolder.addFolder('Floor Emissive')
            floorEmissiveFolder.add(this.floor.material, 'emissiveIntensity')
                .min(0)
                .max(10)
                .step(0.1)
                .name('Emissive Intensity')

            floorEmissiveFolder.add({ bloom: true }, 'bloom').name('Toggle Bloom').onChange((value) => {
                if (value) {
                this.renderer.selectiveBloom.selection.add(this.floor);
                } else {
                this.renderer.selectiveBloom.selection.delete(this.floor);
                }
            });
    }

    }

    update()
    {
        this.switch.update()
        this.empty.rotation.y += this.rotationSpeed
    }
}