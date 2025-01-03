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
        this.environment = this.experience.world.environment
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
        this.model = this.sceneModels.children[0]
        this.body = this.sceneModels.children[0]

        // Call actions
        this.setScene()
        // this.setBloom()
        // this.setEnvMapIntensity()

        // Switch
        this.switch = new Switch(this.body, 2, 10)

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
        this.debugFolder.add(this.model.scale, 'x', 'y', 'z').name('Scale').step(0.01).min(0).max(2).onChange((value) => {
            this.model.scale.set(value, value, value)})
    

        }
    }


    setBloom()
    {
        this.renderer.selectiveBloom.selection.add(this.body)
    }

    update()
    {
            this.switch.update()
    }
}