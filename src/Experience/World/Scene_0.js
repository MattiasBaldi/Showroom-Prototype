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

        // Call actions
        this.setScene()
        this.setAnimations()
        // this.setWalk()
        // this.setFade()

    }

    setScene()
    {
        // this.sceneGroup = new THREE.Group();
        // this.sceneGroup.add(this.sceneModels) 
        this.scale = 0.2
        this.sceneModels.scale.set(this.scale, this.scale, this.scale)
        this.sceneModels.position.y += 0.01
        this.sceneModels.position.z = 100
        this.scene.add(this.sceneModels)

        // console.log(this.sceneModels)

        // Visibility
        this.sceneModels.children[1].visible = false
        this.sceneModels.children[3].visible = false

        if (this.debug.active) {

            this.debugFolder.add(this.sceneModels.scale, 'x', 'y', 'z').name('Scale').step(0.01).min(0).max(2).onChange((value) => {
                this.sceneModels.scale.set(value, value, value)})

            this.debugFolder.add(this.sceneModels.position, 'z').name('Position Z').step(0.01).min(-100).max(100);
            this.debugFolder.add(this.sceneModels.position, 'y').name('Position Y').step(0.01).min(-100).max(100);

            this.sceneModels.children.forEach((child, index) => {
                if (index !== 0) {
                    const folder = this.debugFolder.addFolder(`Child ${index}`);
                    folder.add(child, 'visible').name('Visible');
                }
            });

            const scaleObject = { scaleZ: 1 };
            this.debugFolder.add(scaleObject, 'scaleZ').name('Scale Z').min(0.1).max(10).step(0.1).onChange((value) => {
                this.sceneModels.children.forEach((child, index) => {
                    if (index !== 0) {
                        child.scale.z = value;
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

    update()
    {
            this.animation.mixer.walking.update(this.time.delta * 0.001); 
            // this.updateWalk()
            // this.setFade()
    }
}