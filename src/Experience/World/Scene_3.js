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
        this.modelOne = this.sceneModels.children[0]
        this.modelTwo = this.sceneModels.children[1]
        this.modelThree = this.sceneModels.children[2]
        this.floor = this.sceneModels.children[4]
        this.chairs = this.sceneModels.children[5]
        

        // Setup
        this.setScene()
        this.updateMaterials()
        this.setBloom()

        // Switch
        this.switch = new Switch(this.sceneGroup, 1, 10)


    }

    setScene()
    {

        // Position
        this.sceneGroup.position.x = 80

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

    updateMaterials()
    {
        this.chromeMaterial =  new THREE.MeshStandardMaterial({roughness: '0.2', metalness: '1'});
        this.bodyMaterial =  new THREE.MeshStandardMaterial({color: 'white', roughness: '0.2'});

        this.transmissionMaterial = new THREE.MeshPhysicalMaterial(
            {
                color: '#ffffff', 
                transparent: true, 
                transmission: 1.0, 
                thickness: 1,
                metalness: 0, 
                roughness: 0
            })



        //  Set interior
         this.sceneModels.traverse((child) =>
            {
            if (child instanceof THREE.Mesh)
            {
                if (child)
                {
                child.material = this.chromeMaterial 
                }
            }
            })

            if (this.modelOne) {
                this.modelOne.children[0].material = this.bodyMaterial
            }
            if (this.modelTwo) {
                this.modelTwo.children[0].material = this.bodyMaterial
            }
            if (this.modelThree) {
                this.modelThree.children[0].material = this.bodyMaterial
            }

            if (this.floor) {
                this.floor.material = new THREE.MeshStandardMaterial('white')
            }
    

        }

    setBloom()
    {

        const bodyOne = this.modelOne.children[0]
        const bodyTwo = this.modelTwo.children[0]
        const bodyThree = this.modelThree.children[0]

        const bloom = this.renderer.selectiveBloom

        bloom.selection.add(bodyOne)
        bloom.selection.add(bodyTwo)
        bloom.selection.add(bodyThree)
        
    }

    update()
    {
        this.switch.update()
    }
}