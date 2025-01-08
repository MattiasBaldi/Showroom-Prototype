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
        this.resources = this.experience.resources

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Scene 3 (Interior room)')
            this.debugFolder.close()
        }

        // Scene 
        this.resource = this.resources.items.Scene_3
        this.sceneModels = this.resource.scene
        this.sceneGroup = new THREE.Group()
        this.empty = this.sceneModels.children[0]

        // Setup
        this.setScene()

        
        // Switch
        this.switch = new Switch(this.empty, 10)
    }

    setScene()
    {
        // Position
        this.sceneModels.position.x = 120
        this.sceneModels.scale.setScalar(1)
        this.sceneModels.name = 'scene_3'
        this.empty.name = 'scene_3'
        this.lamp = this.empty.children[1]
        this.scene.add(this.sceneModels)

        // Debug
        if(this.debug.active)
            {
                this.debugFolder.add(this.sceneModels.rotation, 'y').name('Rotation').step(Math.PI * 0.25).min(-10).max(10)
                this.debugFolder.add(this.sceneModels.scale, 'x').name('Scale').step(0.01).min(0).max(2).onChange((value) => {
                    this.sceneModels.scale.set(value, value, value)
                })

                const lampFolder = this.debugFolder.addFolder('Lamp')
                lampFolder.add(this.lamp, 'visible').name('Lamp Visibility').listen()
                lampFolder.add(this.lamp.position, 'y').name('Position Y').step(0.01).min(0).max(1000)

            }
    }

    update()
    {
        this.switch.update()
    }
}