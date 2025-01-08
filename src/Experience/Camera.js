import * as THREE from 'three'
import Experience from './Experience.js'
import Controls from './Controls/Controls.js'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.debug = this.experience.debug
  
       // Debug
       if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Camera')
            this.debugFolder.close()
        }

        // Set Controls
        this.setInstance()
        this.controls = new Controls(this.instance, this.canvas)
        this.controls.setControls('PointerLock')
        
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 75)
        this.instance.position.set(6, 4, 8)
        // this.instance.near = this.instance.near
        this.instance.far = 50
        this.scene.add(this.instance)

        // Debug
        if(this.debug.active)
        {
            this.debugFolder.add(this.instance, 'far').min(0).max(100).step(1).onChange((value) => {
                this.instance.far = value
                this.instance.updateProjectionMatrix()
            })
        }
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
    this.controls.update()
    }
}