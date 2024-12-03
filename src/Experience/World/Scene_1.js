import * as THREE from 'three'
import Experience from '../Experience.js'
import Switch from '../Controls/Switch.js'

export default class Scene_1
{
    constructor() 
    {
        this.experience  = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.controls = this.camera.controls
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Debug
        if (this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Scene 1 (Catwalk)')
            this.debugFolder.close()
            this.animationFolder = this.debugFolder.addFolder('Animation')
            this.animationFolder.close()
        }

        // Setup
        this.resource = this.resources.items.Scene_1
        this.sceneModels = this.resource.scene
        this.animatedModel = this.sceneModels.children[0]
        this.posedModel = this.sceneModels.children[1]
        this.radius = 5; 

        // Call actions
        this.setScene()
        this.setAnimations()
        this.updateMaterials()
        this.setWalk()
        this.setFade()

        this.switch = new Switch(this.posedBody, 2, 10)


    }

    setScene()
    {
        this.sceneGroup = new THREE.Group(); 
        this.scale = 0.25
        this.sceneGroup.scale.set(this.scale, this.scale, this.scale)
        this.sceneGroup.add(this.sceneModels)
        this.scene.add(this.sceneGroup)

        // Debug
        if(this.debug.active) {
        this.debugFolder.add(this.sceneGroup.scale, 'x', 'y', 'z').name('Scale').step(0.01).min(0).max(2).onChange((value) => {
            this.sceneGroup.scale.set(value, value, value)})
        this.debugFolder
        .add(this.animatedModel.position, 'z')
        .name('PositionZ animatedModel')
        .step(0.01)
        .min(-20)
        .max(20)
        }
    }

    setAnimations()
    {
        this.animation = { mixer: {} };
        this.action = {};

        this.animation.walking = this.resource.animations[0];
        this.animation.pose = this.resource.animations[1];

        this.animation.mixer.walking = new THREE.AnimationMixer(this.sceneModels);
        this.animation.mixer.pose = new THREE.AnimationMixer(this.sceneModels);

        this.action.walking = this.animation.mixer.walking.clipAction(this.animation.walking);
        this.action.pose = this.animation.mixer.pose.clipAction(this.animation.pose);

        this.action.walking.play();
        this.action.pose.play();
    }

    updateMaterials()
    {
        this.chromeMaterial =  new THREE.MeshStandardMaterial({roughness: '0.01', metalness: '1',  emissive: 0x000000, // Emissive color
            emissiveIntensity: 0 });
        this.bodyMaterial = new THREE.MeshBasicMaterial({color: 'white'}); 
        this.animatedBody = this.animatedModel.children[0]
        this.posedBody = this.posedModel.children[1]


        //  Set all chrome except the bodies
         this.sceneModels.traverse((child) =>
            {
            if (child instanceof THREE.Mesh)
            {
            if(child === this.animatedBody || child === this.posedBody)
            {
                child.material = this.bodyMaterial
            }
            else
            {
                child.material = this.chromeMaterial
            }
            }
            })

    }

    setWalk()
    {
        this.walkAxis = 'z'; 
        this.walkSpeed = 1;
        this.walkStart = 0;
        this.walkEnd = 60;
        this.length = null

        // Debug
        if(this.debug.active)
        {
            const debugObject =
            {
                walkSpeed: this.walkSpeed,
                walkStart: this.walkStart,
                walkEnd: this.walkEnd,
                timeScale: this.action.walking.timeScale,
                catwalkActive: false
            }
            
        this.animationFolder
        .add(debugObject, 'catwalkActive')
        .name('catwalkVisualizer')
        .onChange((value) => {
           if (value) {
               this.setCatwalkVisualizer();
           } else {
              if (this.catwalk) 
                  {
                  this.scene.remove(this.catwalk);
                  this.catwalk.geometry.dispose();
                  this.catwalk.material.dispose();
                  }
          }
        })
            

        this.animationFolder
        .add(debugObject, 'walkStart')
        .name('Walk Start')
        .onChange((value) => {
            this.walkStart = value;
            if(this.catwalk)
            {
                this.setCatwalkVisualizer();
            }
        })
        .step(0.01)
        .min(0)
        .max(10)

        this.animationFolder
        .add(debugObject, 'walkEnd')
        .name('Walk End')
        .onChange((value) => {
            this.walkEnd = value;
            if(this.catwalk)
                {
                    this.setCatwalkVisualizer();
                }
        })
        .step(0.01)
        .min(10)
        .max(50)

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

        // Reset walking
        if (this.animatedModel.position[this.walkAxis] > this.walkEnd)
        {
            this.animatedModel.position[this.walkAxis] = this.walkStart; 
        }   
    }

    setCatwalkVisualizer()
    {
            // walkLength calculated
            this.walkLength = (this.walkStart - this.walkEnd) * this.scale; 

            // Dispose
            if (this.catwalk) 
            {
            this.scene.remove(this.catwalk);
            this.catwalk.geometry.dispose();
            this.catwalk.material.dispose();
            }

            // Catwalk
            this.catwalk = new THREE.Mesh
            (
                new THREE.PlaneGeometry(this.walkLength, 1),
                new THREE.MeshBasicMaterial({color: 'white'})
            )
            this.catwalk.rotation.x = Math.PI * 0.5; 
            this.catwalk.rotation.z = Math.PI * 0.5;
            this.catwalk.position.z = this.walkStart/2
            this.catwalk.position.y = 0.01
            this.scene.add(this.catwalk)
    }

    setFade()
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

    update()
    {
            this.animation.mixer.walking.update(this.time.delta * 0.001); 
            this.animation.mixer.pose.update(this.time.delta * 0.001); 
            this.updateWalk()
            this.setFade()
            this.switch.update()
    }
}

// // Scene1, Character
// let characterAnimation = null; 
// let characterPose = null; 
// let scene1 = null
// let action = null; 
// let animation = null;
// gltfLoader.load('/scenes/scene_1.glb', 
//     (gltf) =>
//     { 
//         // variables
//         scene1 = gltf.scene; 
//         characterAnimation = scene1.children[0];
//         characterPose = scene1.children[1];

//         //Material
//         const chromeMaterialPose =  new THREE.MeshStandardMaterial({roughness: '0.01', metalness: '1'});
//         const chromeMaterialAnimation =  new THREE.MeshStandardMaterial({roughness: '0.01', metalness: '1'});
//         const bodyMaterialPose = new THREE.MeshBasicMaterial({color: 'white'}); 
//         const bodyMaterialAnimation = new THREE.MeshBasicMaterial({color: 'white'}); 

//         // Apply material to the specified range of children in characterAnimation
//         characterAnimation.children.slice(1, 5).forEach(child => {
//         child.material = chromeMaterialAnimation;
//         });
//         characterPose.children[0].material = bodyMaterialAnimation;         

//         // Apply material to the specified range of children in characterPose
//         characterPose.children.slice(2, 6).forEach(child => {
//         child.material = chromeMaterialPose;
//         });
//         characterPose.children[1].material = bodyMaterialPose; 
//         characterPose.children[0].material = chromeMaterialPose; 

//         // add character
//         scene1.rotation.y += Math.PI * 0.5;
//         scene1.scale.setScalar(0.16); 

//         // Console.log()
//         console.log( 
//             'Scene 1 ', '\n' +
//             'scene: ', scene1, '\n' + 
//             'Animations: ', gltf.animations, '\n' +
//             'Walk: ', characterAnimation, '\n' +
//             'WalkChildren: ', characterAnimation.children, '\n' +
//             'Pose: ', characterPose, '\n' +
//             'Action', action, '\n'
//         ); 
        
//         // Skeleton
//         const skeleton = new THREE.SkeletonHelper(characterAnimation);
//         skeleton.visible = false; 
//         scene.add(skeleton);

//         // Animation speed
//         debugUI.speed = action.timeScale; 
//         characterDebug.add(debugUI, 'speed').min(0).max(2).step(0.01).name('Animation Speed').onChange((value) => {
//                 action.timeScale = value; // Update the timeScale of the action if it exists
//         });

//         // Skeleton visibility
//         debugUI.skeleton = skeleton.visible
//         characterDebug.add(debugUI, 'skeleton').name('Show Skeleton').onChange((value) => {
//             skeleton.visible = value;   
//             });
//     }
// );


//     // Character Walking
//     if (characterAnimation != null)
//         {

//             //Initiate
//             characterAnimation.position[walkAxis] += delta * walkSpeed;      

//             // Reset walking
//             if (characterAnimation.position[walkAxis] > walkEnd)
//             {
//                 characterAnimation.position[walkAxis] = walkStart; 
//             }

//             //Fade model in and out
//             const walkPercentage = characterAnimation.position[walkAxis] / (walkStart + walkEnd);
//             const fade = Math.sin(walkPercentage * Math.PI);


//             characterAnimation.children.forEach(child => {
//                 if (child.material) {
//                     child.material.transparent = true;
//                     child.material.opacity = fade;
//                 }
//             });
            
            
//             // material1.opacity = fade;
//             // material2.opacity = fade;

//             // Points light at character
//             catWalkLight.target = characterAnimation;
//             catWalkLight.position[walkAxis] = characterAnimation.position[walkAxis];
//             catWalkLight2.target = characterAnimation;
//             catWalkLight2.position[walkAxis] = characterAnimation.position[walkAxis];

//             //Light Helper
//             // catWalkLightHelper2.position[walkAxis] = character.position[walkAxis];
//             // catWalkLightHelper2.update();
//             // catWalkLightHelper.position[walkAxis] = character.position[walkAxis];
//             // catWalkLightHelper.update();

//         }

