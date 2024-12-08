import * as THREE from 'three'
import Experience from '../Experience'
import Switch from '../Controls/Switch.js'

export default class Scene_3 {

    constructor()
    {
        this.experience = new Experience()
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

        // Setup
        this.resource = this.resources.items.Scene_3
        this.sceneModels = this.resource.scene
        this.setScene()
        this.updateMaterials()

        this.switch = new Switch(this.room, 1, 10)
    }

    setScene()
    {
        this.sceneGroup = new THREE.Group()
        this.sceneGroup.add(this.sceneModels)
        this.scene.add(this.sceneGroup)
        this.sceneGroup.position.x = 50
        this.sceneGroup.scale.setScalar(1)

        // Debug
        if(this.debug.active)
            {
                this.debugFolder.add(this.sceneGroup.position, 'x').name('PositionX').step(1).min(-100).max(100)
                this.debugFolder.add(this.sceneGroup.rotation, 'y').name('Rotation').step(Math.PI * 0.25).min(- 10).max(10)
                this.debugFolder.add(this.sceneGroup.scale, 'x', 'y', 'z').name('Scale').step(0.01).min(0).max(2).onChange((value) => {
                this.sceneGroup.scale.set(value, value, value)
            })
            }
    }

    updateMaterials()
    {
        this.chromeMaterial =  new THREE.MeshStandardMaterial({roughness: '0.01', metalness: '1'});
        this.room = this.sceneModels.children[0]
        this.chairs = this.sceneModels.children[1]
        this.table = this.sceneModels.children[2]

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

        // Flip normals of room 
        this.room.material.side = THREE.BackSide

        // Exterior
        this.room.clone = this.room.clone()
        this.room.clone.scale.copy(this.room.scale.clone().addScalar(0.01))
        this.room.clone.position.y += this.room.position.y
        this.room.clone.material = new THREE.MeshStandardMaterial({color: 'black', roughness: '1', metalness: '1'});
        this.sceneGroup.add(this.room.clone);
    
        // Create edges geometry and material for the clone
        const edges = new THREE.EdgesGeometry(this.room.clone.geometry);
        const lineMaterial = new THREE.LineBasicMaterial({color: 'white'});
        const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    
        // Add the edges to the scene
        this.room.clone.add(lineSegments);

        }

    update()
    {
        this.switch.update()
    }
}