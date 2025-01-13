import * as THREE from 'three'
import Experience from '../Experience.js'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { VerticalTiltShiftShader } from 'three/examples/jsm/Addons.js';

export default class Scene_0
{
    constructor() 
    {

        this.experience  = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer
        this.controls = this.camera.controls
        this.resources = this.experience.resources
        this.environment = this.experience.world.environment
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Debug
        if (this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Scene 0 (Catwalk)')
            this.debugFolder.close()
            this.animationFolder = this.debugFolder.addFolder('Animation')
            this.animationFolder.close()
            this.catWalkFolder = this.debugFolder.addFolder('Catwalk')
            this.catWalkFolder.close()
            this.audienceFolder = this.debugFolder.addFolder('Audience')
            this.audienceFolder.close()
            this.benchFolder = this.debugFolder.addFolder('Bench')
            this.benchFolder.close()
            this.tentFolder = this.debugFolder.addFolder('Tent')
            this.tentFolder.close()

        }

        // Setup
        this.resource = this.resources.items.Scene_0
        this.sceneModels = this.resource.scene
        this.animatedModel = this.sceneModels.children[0]
        this.bench = this.sceneModels.children[1]
        this.audience = this.sceneModels.children[2]
        this.catWalk = this.sceneModels.children[3]
        this.tent = this.sceneModels.children[4]

        // Call actions
        this.setScene()
        this.setWalkAnimation()
        this.setMaterials()
        this.setBloom()

    }

    setScene()
    {
        // Creating the sccene and init positioning
        this.scale = 0.05
        this.sceneModels.position.y += 0.01 // avoiding z-fighting
        this.sceneModels.scale.set(this.scale, this.scale, this.scale)
        this.sceneModels.position.z = 50
        this.sceneModels.updateMatrixWorld(true)
        this.scene.add(this.sceneModels)

        // Visibility
        if (this.debug.active) {

            const debugObject = 
            { 
                scaleZ: 1,
                groups: 
                [
                    { runway: this.catWalk, audience: this.audience }
                ]
            };

            this.debugFolder.add(this.sceneModels.scale, 'x', 'y', 'z').name('Scale').step(0.01).min(0).max(2).onChange((value) => {
                this.sceneModels.scale.set(value, value, value)})

            this.debugFolder.add(this.sceneModels.position, 'z').name('Position Z').step(0.01).min(-100).max(100);

            this.catWalkFolder.add(this.catWalk, 'visible').name('Catwalk Visibility');

            this.catWalkFolder.add(debugObject, 'scaleZ').name('Scale Z').min(0.1).max(10).step(0.1).onChange((value) => {
                this.catWalk.scale.z = value;
            });


            this.audienceFolder.add(this.audience, 'visible').name('Audience Visibility');
            this.benchFolder.add(this.bench, 'visible').name('Bench Visibility');
            this.tentFolder.add(this.tent, 'visible').name('tent Visibility');

            this.tentFolder.add(this.tent.scale, 'x').name('tent Scale Z').min(0.1).max(10).step(0.1).onChange(() => {
                this.tent.scale.x = this.tent.scale.z;
                this.tent.updateMatrixWorld(true);
            });

            this.tentFolder.add(this.tent.scale, 'y').name('tent Scale Y').min(0.1).max(10).step(0.1).onChange(() => {
                this.tent.scale.y = this.tent.scale.y;
                this.tent.updateMatrixWorld(true);
            });


            this.tentFolder.add(this.tent.position, 'y').name('tent Position Y').min(-10).max(10).step(0.1).onChange(() => {
                this.tent.position.y = this.tent.position.y;
                this.tent.updateMatrixWorld(true);
            });

        }
    }

    setMaterials()
    {

        // Catwalk
        const getTextures = () => 
            Object.fromEntries(
                Object.entries(this.resources.items).filter(([_, value]) =>
                    Object.values(value).some(subValue => subValue instanceof THREE.Texture)
                )
            );
        const textures = getTextures();
        const catWalk = this.catWalk.children[0];
        const selectedTexture = textures.gravel;
        const applyTexture = (texture) => {
            // Compute the bounding box if not already computed
            if (!catWalk.geometry.boundingBox) {
                catWalk.geometry.computeBoundingBox();
            }

            const boundingBox = catWalk.geometry.boundingBox;
            const width = boundingBox.max.x - boundingBox.min.x;
            const height = boundingBox.max.y - boundingBox.min.y;

            for (const [name, map] of Object.entries(texture)) {
                // Clone the texture to avoid modifying the original
                const clonedMap = map.clone();
                catWalk.material[name] = clonedMap;
                Object.assign(clonedMap, {
                    wrapS: THREE.MirroredRepeatWrapping,
                    wrapT: THREE.MirroredRepeatWrapping,
                    generateMipmaps: false
                });

                clonedMap.repeat.set(width, height);
            }
        };
        applyTexture(selectedTexture);
        catWalk.material.envMap = this.environment.environmentMap
        catWalk.material.envMapIntensity = 0; 
 

        // Audience
        const audienceClothesMaterial = this.audience.children[0].material
        const audienceBodyMaterial = this.audience.children[1].material
        this.audience.traverse((child) =>
        {
            if (child instanceof THREE.Mesh && child.material) {
                child.material.envMap = this.environment.environmentMap;
                child.material.envMapIntensity = 0;
                }
        })

        audienceClothesMaterial.envMap = this.environment.environmentMap;
        audienceClothesMaterial.envMapIntensity = 0.01;


        // Tent
        this.tent.material.roughness = 0.3
        this.tent.material.metalness = 1
        this.tent.material.envMap = this.environment.environmentMap;
        this.tent.material.envMapIntensity = 0.01


        // Debug
        if (this.debug.active) {
            const debugObject = {
            envMapIntensity: 0,
            selectedTexture: selectedTexture,
            texturename: Object.keys(textures).find(key => textures[key] === selectedTexture)
            };

            this.catWalkFolder.add(debugObject, 'envMapIntensity').name('Env Map Intensity').min(0).max(1).step(0.01).onChange((value) => {
            catWalk.material.envMap = this.environment.environmentMap
            catWalk.material.envMapIntensity = value
            catWalk.material.needsUpdate = true;
            });
        
            this.catWalkFolder
            .add(debugObject, 'texturename', Object.keys(textures))
            .name('Select Texture')
            .onChange((value) => {
            const texture = textures[value];
            applyTexture(texture);
            catWalk.material.needsUpdate = true;
            });

            this.tentFolder
            .add(this.tent.material, 'roughness')
            .name('Roughness')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange(() => {
            this.tent.material.needsUpdate = true;
            });

            this.tentFolder
            .add(this.tent.material, 'metalness')
            .name('Metalness')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange(() => {
            this.tent.material.needsUpdate = true;
            });

            this.tentFolder
            .add(debugObject, 'envMapIntensity')
            .name('Tent Env Map Intensity')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange((value) => {
            this.tent.material.envMap = this.environment.environmentMap;
            this.tent.material.envMapIntensity = value;
            this.tent.material.needsUpdate = true;
            });

            // Audience
            const audienceDebugObject = {
            clothesEnvMapIntensity: audienceClothesMaterial.envMapIntensity,
            bodyEnvMapIntensity: audienceBodyMaterial.envMapIntensity
            };

            this.audienceFolder
            .add(audienceDebugObject, 'clothesEnvMapIntensity')
            .name('Clothes Env Map Intensity')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange((value) => {
            audienceClothesMaterial.envMapIntensity = value;
            audienceClothesMaterial.needsUpdate = true;
            });

            this.audienceFolder
            .add(audienceDebugObject, 'bodyEnvMapIntensity')
            .name('Body Env Map Intensity')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange((value) => {
            audienceBodyMaterial.envMapIntensity = value;
            audienceBodyMaterial.needsUpdate = true;
            });
            
        }
    }

    setBloom()
    {

        this.renderer.selectiveBloom.selection.add(this.catWalk.children[1]);
        this.catWalk.children[1].material.emissiveIntensity = 0.2

        this.renderer.selectiveBloom.selection.add(this.audience);
        this.audience.children[1].material.emissiveIntensity = 0.2
        this.audience.children[0].material.emissiveIntensity = 0.2

        if (this.debug.active) {
            const debugObject = {
            emissiveIntensity: this.catWalk.children[1].material.emissiveIntensity || 1,
            bloom: true
            };

            this.catWalkFolder.add(debugObject, 'emissiveIntensity').name('Emissive Intensity, White Area').min(0).max(1).step(0.1).onChange((value) => {
            this.catWalk.children[1].material.emissiveIntensity = value;
            this.catWalk.children[0].material.emissiveIntensity = value;
            });

            this.catWalkFolder.add(debugObject, 'bloom').name('Toggle Bloom').onChange((value) => {
            if (value) {
                this.renderer.selectiveBloom.selection.add(this.catWalk.children[1]);
            } else {
                this.renderer.selectiveBloom.selection.delete(this.catWalk.children[1]);
            }
            });
        }
    }

    setWalkAnimation()
    {
        this.animation = { mixer: {} };
        this.action = {};
        this.animation.walking = this.resource.animations[0];
        this.animation.mixer.walking = new THREE.AnimationMixer(this.sceneModels);
        this.action.walking = this.animation.mixer.walking.clipAction(this.animation.walking);
        this.action.walking.play();


                // Compute the catWalk boundingBox
                const catWalk = this.catWalk.children[0]
                this.sceneModels.updateMatrixWorld(true)
                catWalk.geometry.computeBoundingBox();
        
                // Helper
                const box = new THREE.BoxHelper(catWalk, 0xffff00);
                box.visible = false
                this.scene.add(box);
        
                this.min = catWalk.localToWorld(catWalk.geometry.boundingBox.min);
                this.max = catWalk.geometry.boundingBox.max.clone();
                catWalk.localToWorld(this.max);
        
                this.walkAxis = 'z'; 
                this.walkSpeed = 1.5;
                this.action.walking.timeScale = 0.8; 
                this.walkStart = this.min.z;
                this.walkEnd = this.max.z;
                this.walkLength = this.walkEnd  - this.walkStart
        
                // Debug
                if(this.debug.active)
                {
                    const debugObject =
                    {
                        walkSpeed: this.walkSpeed,
                        walkStart: this.walkStart,
                        walkEnd: this.walkEnd,
                        timeScale: this.action.walking.timeScale,
                    }
        
                this.animationFolder
                .add(debugObject, 'walkStart')
                .name('Walk Start')
                .onChange((value) => {
                    this.walkStart = value;
                })
                .step(0.01)
                .min(0)
                .max(100)
        
                this.animationFolder
                .add(debugObject, 'walkEnd')
                .name('Walk End')
                .onChange((value) => {
                    this.walkEnd = value;
                })
                .step(0.01)
                .min(10)
                .max(500)
        
                this.animationFolder
                .add(debugObject, 'timeScale')
                .name('Time Scale')
                .onChange((value) => {
                    this.action.walking.timeScale = value;
                })
                .step(0.01)
                .min(0)
                .max(2)
        
        
                this.animationFolder
                .add(debugObject, 'walkSpeed')
                .name('Move Speed')
                .onChange((value) => {
                    this.walkSpeed = value;
                })
                .step(0.01)
                .min(0)
                .max(2)
        
        
        
            }
    }

    updateWalkAnimation()
    {
        // // Convert position to world coordinates
        const worldPosition = new THREE.Vector3();
        this.animatedModel.getWorldPosition(worldPosition);

        // Initiate
        this.animatedModel.position[this.walkAxis] += (this.time.delta * 0.01) * this.walkSpeed;

        // Reset walking
        if (worldPosition[this.walkAxis] > this.walkEnd) {
            this.animatedModel.position[this.walkAxis] = this.walkStart - this.animatedModel.parent.position[this.walkAxis];
        }

        // Calculate the fade
        this.walkPercentage = (this.animatedModel.position[this.walkAxis] * this.scale) /  this.walkLength; 
        this.fade = Math.sin(this.walkPercentage * Math.PI);

        // Applying fade on material opacity
        this.animatedModel.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.material.transparent = true;
                child.material.opacity = this.fade; 
                // console.log(`Walk Percentage: ${Math.floor(this.walkPercentage * 100)} %, Material Opacity: ${Math.floor(child.material.opacity * 100)}%`);
            }
        });

    }

    update()
    {
            this.animation.mixer.walking.update(this.time.delta * 0.001); 
            this.updateWalkAnimation()
    }
}