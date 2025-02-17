import Experience from '../Experience.js'

export default class Teleportation {

    constructor()
    {
        // Setup
        this.experience = new Experience()
        this.camera =  this.experience.camera.instance
        this.controls = this.camera.controls
        this.world = this.experience.world
        this.scene_1 = this.world.scene_1
        this.scene_2 = this.world.scene_2
        this.scene_3 = this.world.scene_3

        this.setTeleporter()

    }

    setTeleporter()
    {
          const keyDown = (event) => {
            
                
            switch (event.key) 
            {
                case '1':
                    this.camera.position.x = this.scene_1.sceneGroup.position.x;
                    this.camera.position.z = 7
                    this.camera.lookAt(this.scene_1.sceneGroup.position)
                    break;
                case '2':
                    this.camera.position.x = this.scene_2.sphere.position.x;
                    this.camera.position.z = 5
                    this.camera.position.y = 1
                    this.camera.lookAt(this.scene_2.sphere.position)
                    break;
                case '3':
                    this.camera.position.copy(this.scene_3.empty.getWorldPosition(new THREE.Vector3()));  
                    this.camera.lookAt(this.scene_3.empty.getWorldPosition(new THREE.Vector3()))
                    break;
                    }
            
        }
            
            document.addEventListener('keydown', keyDown);

    }

}