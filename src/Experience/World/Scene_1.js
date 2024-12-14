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
        this.renderer = this.experience.renderer
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
        this.animatedBody = this.animatedModel.children[0]
        this.posedBody = this.posedModel.children[1]

        // Call actions
        this.setScene()
        this.setAnimations()
        this.updateMaterials()
        this.setWalk()
        this.setFade()
        this.setBloom()

        // Switch
        this.switch = new Switch(this.posedBody, 2, 10)

    }

    setScene()
    {
        this.sceneGroup = new THREE.Group(); 
        this.scale = 0.2
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
        this.animation.mixer.walking = new THREE.AnimationMixer(this.sceneModels);
        this.action.walking = this.animation.mixer.walking.clipAction(this.animation.walking);
        this.action.walking.play();
    }

    updateMaterials()
    {
        this.chromeMaterial =  new THREE.MeshStandardMaterial({roughness: '0.01', metalness: '1'});
        this.bodyMaterial = new THREE.MeshStandardMaterial({color: 'white', roughness: '0.01'}); 

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
        this.walkSpeed = 0.7;
        this.action.walking.timeScale = 0.8; 
        this.walkStart = 70;
        this.walkEnd = 250;
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

            // Rotation
            this.catwalk.rotation.x = Math.PI * 0.5;
            this.catwalk.rotation.z = Math.PI * 0.5;

            // Debug
            if (this.debug.active) {
                this.debugFolder
                    .add(this.catwalk.rotation, 'z')
                    .name('Catwalk Rotation Z')
                    .step(0.01)
                    .min(-Math.PI)
                    .max(Math.PI);

                this.debugFolder
                    .add(this.catwalk.rotation, 'y')
                    .name('Catwalk Rotation Y')
                    .step(0.01)
                    .min(-Math.PI)
                    .max(Math.PI);

                this.debugFolder
                    .add(this.catwalk.rotation, 'x')
                    .name('Catwalk Rotation X')
                    .step(0.01)
                    .min(-Math.PI)
                    .max(Math.PI);

                this.debugFolder
                    .add(this.catwalk.position, 'z')
                    .name('Catwalk Position Z')
                    .step(0.01)
                    .min(-100)
                    .max(100);

                this.debugFolder
                    .add(this.catwalk.position, 'y')
                    .name('Catwalk Position Y')
                    .step(0.01)
                    .min(-100)
                    .max(100);

                this.debugFolder
                    .add(this.catwalk.position, 'x')
                    .name('Catwalk Position X')
                    .step(0.01)
                    .min(-100)
                    .max(100);

            }


            // Position
            this.catwalk.position.z = (this.walkStart * this.scale) - (this.walkLength * 2 * this.scale);
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

    setBloom()
    {
        const bloom = this.renderer.selectiveBloom
        bloom.selection.add(this.posedBody)
        bloom.selection.add(this.animatedBody)
     
    }

    setSwitch()
    {
        
    }

    update()
    {
            this.animation.mixer.walking.update(this.time.delta * 0.001); 
            this.updateWalk()
            this.setFade()
            this.switch.update()
    }
}