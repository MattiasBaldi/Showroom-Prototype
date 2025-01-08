import * as THREE from 'three'
import Experience from '../Experience.js'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
        }

        // Setup
        this.resource = this.resources.items.Scene_0
        this.sceneModels = this.resource.scene
        this.animatedModel = this.sceneModels.children[0]
        this.catWalk = this.sceneModels.children[1]
        this.bench = this.sceneModels.children[2]
        this.audience = this.sceneModels.children[3]

        // Call actions
        this.setScene()
        this.setAnimations()
        this.setWalk()
        this.setBloom()
        this.setEnvMapIntensity()
        // this.setInstancedMeshArray(50, 1)

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

            this.debugFolder.add(debugObject, 'scaleZ').name('Scale Z').min(0.1).max(10).step(0.1).onChange((value) => {
                this.catWalk.scale.z = value;
            });



            this.sceneModels.children.forEach((child, index) => {
                const visibilityObject = { visible: true };
                this.debugFolder.add(visibilityObject, 'visible').name(`Child ${index} Visibility`).onChange((value) => {
                    child.visible = value;
                });
            });
        }
    }

    setInstancedMeshArray(count, distance)
    {

    // Calculate world position
    const worldPosition = new THREE.Vector3();
    this.audience.getWorldPosition(worldPosition);
    this.audience.updateMatrixWorld(true)

    // Retrieve materials
    const materials = [
        this.audience.children[0].material.clone(), // Clone material to avoid conflicts
        this.audience.children[1].material.clone(),
    ];

    // Retrieve geometries
    const geometries = [
        this.audience.children[0].geometry.clone(),
        this.audience.children[1].geometry.clone()
    ];

    // Merge geometries
    const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false);

    // Set up draw groups for the merged geometry
    let offset = 0;
    geometries.forEach((geometry, index) => {
        mergedGeometry.addGroup(offset, geometry.index.count, index);
        offset += geometry.index.count;
    });

    // Create an instanced mesh with multiple materials
    const mesh = new THREE.InstancedMesh(mergedGeometry, materials, count)
    this.sceneModels.add(mesh);

    // Remove initial audience from the scene
    this.audience.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            child.material.dispose();
        }
    });
    this.audience.parent.remove(this.audience);

    // Create the loop inside a function for debugging purposes
    const addArray = (count, distance) => {
    for (let i = 0; i < count; i++)
    {
        // Calculate z position for the pair
        const zPosition = 0 + Math.floor(i / 2) * (distance / this.scale);

        // Position
        const position = new THREE.Vector3(
            0,
            0,
            zPosition
        )

        // Rotation
        const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(
            0,
            Math.PI, 
            0
        ))

        // Create matrix
        const matrix = new THREE.Matrix4()

        // Mirror in pairs
        if(i % 2 === 0) 
        {
            matrix.scale(new THREE.Vector3(-1, 1, 1));

            // Correct the normals after mirroring
            mesh.material.forEach(material => {
                material.side = THREE.FrontSide;
            });

        }  


        matrix.setPosition(position)
        mesh.setMatrixAt(i, matrix)
    }

    }


    // call function
    addArray(count, distance)


    if(this.debug.active)
    {

    }

    }

    setEnvMapIntensity()
    {
 
        this.audience.traverse((child) =>
        {
            if (child instanceof THREE.Mesh && child.material) {
                child.material.envMap = this.environment.environmentMap;
                child.material.envMapIntensity = 0;
                }
        })

        if (this.debug.active) {
            const debugObject = {
            envMapIntensity: 0
            };

            this.debugFolder.add(debugObject, 'envMapIntensity').name('Env Map Intensity').min(0).max(1).step(0.01).onChange((value) => {
            this.sceneModels.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                child.material.envMapIntensity = value;
                }
            });
            });
        }
    }

    setAnimations()
    {
        this.animation = { mixer: {} };
        this.action = {};
        this.animation.walking = this.resource.animations[0];
        this.animation.mixer.walking = new THREE.AnimationMixer(this.sceneModels);
        this.action.walking = this.animation.mixer.walking.clipAction(this.animation.walking);
        this.action.walking.play();
    }

    setWalk()
    {   
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

    updateWalk()
    {
        // Initiate
        this.animatedModel.position[this.walkAxis] += (this.time.delta * 0.01) * this.walkSpeed;

        // Convert position to world coordinates
        const worldPosition = new THREE.Vector3();
        this.animatedModel.getWorldPosition(worldPosition);

        // Reset walking
        if (worldPosition[this.walkAxis] > this.walkEnd) {
            this.animatedModel.position[this.walkAxis] = this.walkStart - this.animatedModel.parent.position[this.walkAxis];
        }
    }

    setWalkFade()
    {
        // Calculating fade
        this.walkPercentage = this.animatedModel.position[this.walkAxis] / (this.walkStart + this.walkEnd);
        this.fade = Math.sin(this.walkPercentage * Math.PI);

        // Cloning and applying material opacity
        this.animatedModel.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = this.fade; 
            }
        });
    }

    setBloom()
    {
        // this.renderer.selectiveBloom.selection.add(this.animatedModel.children[0]);
        this.renderer.selectiveBloom.selection.add(this.catWalk.children[1]);
    }

    update()
    {
            this.animation.mixer.walking.update(this.time.delta * 0.001); 
            this.updateWalk()
            // this.setFade()  
    }
}