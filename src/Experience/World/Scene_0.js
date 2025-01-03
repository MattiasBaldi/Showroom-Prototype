import * as THREE from 'three'
import Experience from '../Experience.js'

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
            // this.animationFolder = this.debugFolder.addFolder('Animation')
            // this.animationFolder.close()
        }

        // Setup
        this.resource = this.resources.items.Scene_0
        this.sceneModels = this.resource.scene
        this.animatedModel = this.sceneModels.children[0]
        this.runwayOne = this.sceneModels.children[1]
        this.audienceOne = this.sceneModels.children[2]
        this.runwayTwo = this.sceneModels.children[3]
        this.audienceTwo = this.sceneModels.children[4]
        this.runwayThree = this.sceneModels.children[6]
        this.audienceThree = this.sceneModels.children[5]


        // Call actions
        this.setScene()
        this.setAnimations()
        // this.setWalk()
        // this.setFade()
        this.setBloom()
        this.setEnvIntensity()

    }

    setScene()
    {

      // this.sceneGroup = new THREE.Group();
      // this.sceneGroup.add(this.sceneModels)

        this.scale = 0.15
        this.sceneModels.scale.set(this.scale, this.scale, this.scale)
        this.sceneModels.position.y += 0.01
        this.sceneModels.position.z = 100
        this.scene.add(this.sceneModels)

        this.runwayOne.visible = false
        this.audienceOne.visible = false
        this.runwayTwo.visible = false
        this.audienceTwo.visible = false
   

        // Visibility
        if (this.debug.active) {

            const debugObject = 
            { 
                scaleZ: 1,
                groups: 
                [
                    { runway: this.runwayOne, audience: this.audienceOne },
                    { runway: this.runwayTwo, audience: this.audienceTwo },
                    { runway: this.runwayThree, audience: this.audienceThree }
                ]
            };

            debugObject.groups.forEach((group, index) => {
                const folder = this.debugFolder.addFolder(`Group ${index + 1}`);
                folder.add(group.runway, 'visible').name('Runway Visible');
                folder.add(group.audience, 'visible').name('Audience Visible');
            });

            this.debugFolder.add(this.sceneModels.scale, 'x', 'y', 'z').name('Scale').step(0.01).min(0).max(2).onChange((value) => {
                this.sceneModels.scale.set(value, value, value)})

            this.debugFolder.add(this.sceneModels.position, 'z').name('Position Z').step(0.01).min(-100).max(100);
            this.debugFolder.add(this.sceneModels.position, 'y').name('Position Y').step(0.01).min(-100).max(100);

            this.debugFolder.add(debugObject, 'scaleZ').name('Scale Z').min(0.1).max(10).step(0.1).onChange((value) => {
                this.runwayOne.scale.z = value;
                this.runwayTwo.scale.z = value;
            });
    }

    }

    setEnvIntensity()
    {
        this.sceneModels.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
            child.material.envMap = this.environment.environmentMap;
            child.material.envMapIntensity = 0;
            }
        });

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
        this.walkAxis = 'z'; 
        this.walkSpeed = 0.7;
        this.action.walking.timeScale = 0.8; 
        this.walkStart = 250;
        this.walkEnd = 550;
        this.length = null


        // Set Initial start position of the model
        this.animatedModel.position.z = this.walkStart

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
        .max(100)

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

        // Reset walking
        if (this.animatedModel.position[this.walkAxis] > this.walkEnd)
        {
            this.animatedModel.position[this.walkAxis] = this.walkStart; 
        }   
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

    setBloom()
    {

        const catwalkOne = this.runwayOne.children[0];
        const catwalkTwo = this.runwayTwo.children[0];
        const catwalkThree = this.runwayThree.children[0];

        if(this.debug.active)
        {
            const bloomFolder = this.debugFolder.addFolder('Bloom')

            const debugObject = {
            bloomCatwalkOne: false,
            bloomCatwalkTwo: false,
            bloomCatwalkThree: false
            };

            bloomFolder.add(debugObject, 'bloomCatwalkOne').name('Bloom Catwalk One').onChange((value) => {
            if (value) {
                this.renderer.selectiveBloom.selection.add(catwalkOne);
            } else {
                this.renderer.selectiveBloom.selection.delete(catwalkOne);
            }
            });

            bloomFolder.add(debugObject, 'bloomCatwalkTwo').name('Bloom Catwalk Two').onChange((value) => {
            if (value) {
                this.renderer.selectiveBloom.selection.add(catwalkTwo);
            } else {
                this.renderer.selectiveBloom.selection.delete(catwalkTwo);
            }
            });

            bloomFolder.add(debugObject, 'bloomCatwalkThree').name('Bloom Catwalk Three').onChange((value) => {
                if (value) {
                    this.renderer.selectiveBloom.selection.add(catwalkThree);
                } else {
                    this.renderer.selectiveBloom.selection.delete(catwalkThree);
                }
                });
        }
        
    }

    update()
    {
            this.animation.mixer.walking.update(this.time.delta * 0.001); 
            // this.updateWalk()
            // this.setFade()
    }
}