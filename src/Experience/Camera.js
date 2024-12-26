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
        this.instance.far = 30
        this.scene.add(this.instance)
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