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
        this.floor = this.empty.children[0]

        this.lampGroup = this.empty.children[1]
        this.bulb = this.lampGroup.children[0]
        this.frame = this.lampGroup.children[1]
        this.string = this.lampGroup.children[2]

        this.magazines = this.empty.children[2]

        this.groupOne = this.empty.children[3]
        this.modelOne = this.groupOne.children[0]
        this.chairOne = this.groupOne.children[1]

        this.groupTwo = this.empty.children[4]
        this.modelTwo = this.groupTwo.children[0]
        this.chairTwo = this.groupTwo.children[1]

        this.groupThree = this.empty.children[5]
        this.modelThree = this.groupThree.children[0]
        this.chairThree = this.groupThree.children[1]

        this.table = this.empty.children[6]

        this.vaseGroup = this.empty.children[7]
        this.cotton = this.vaseGroup.children[0]
        this.cottonFlowers = this.vaseGroup.children[1]
        this.vase = this.vaseGroup.children[2]
        this.volume = this.vaseGroup.children[3]

        // Setup
        this.setScene()
        // this.updateMaterials()
        this.setBloom()

        // Switch
        this.switch = new Switch(this.sceneGroup, 1, 10)
    }

    setScene()
    {

        // Position
        this.sceneGroup.position.x = 120

        // Scale
        this.sceneGroup.scale.setScalar(1)

        // Init
        this.sceneGroup.add(this.sceneModels)
        this.scene.add(this.sceneGroup)

        // Debug
        if(this.debug.active)
            {
                this.debugFolder.add(this.sceneGroup.position, 'x').name('PositionX').step(1).min(-100).max(100)
                this.debugFolder.add(this.sceneGroup.rotation, 'y').name('Rotation').step(Math.PI * 0.25).min(- 10).max(10)
                this.debugFolder.add(this.sceneGroup.scale, 'x', 'y', 'z').name('Scale').step(0.01).min(0).max(2).onChange((value) => {
                this.sceneGroup.scale.set(value, value, value)         })

                // Debug floor
                this.debugFolder.add(this.floor.position, 'x').name('Floor Position X').step(0.1).min(-10).max(10)
                this.debugFolder.add(this.floor.position, 'y').name('Floor Position Y').step(0.1).min(-10).max(10)
                this.debugFolder.add(this.floor.position, 'z').name('Floor Position Z').step(0.1).min(-10).max(10)
                this.debugFolder.add(this.floor.rotation, 'x').name('Floor Rotation X').step(0.01).min(-Math.PI).max(Math.PI)
                this.debugFolder.add(this.floor.rotation, 'y').name('Floor Rotation Y').step(0.01).min(-Math.PI).max(Math.PI)
                this.debugFolder.add(this.floor.rotation, 'z').name('Floor Rotation Z').step(0.01).min(-Math.PI).max(Math.PI)
     

   
            }
    }

    castShadow()
    {
        this.sceneModels.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    setBloom()
    {

        const bloom = this.renderer.selectiveBloom
        bloom.selection.add(this.bulb)
        
    }

    update()
    {
        this.switch.update()
    }
}