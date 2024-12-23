// These are shadows
import Experience from  '../Experience.js'

export default class Shadows {

    constructor()
    {
        // Setup
        this.experience = new Experience()
        this.camera =  this.experience.camera.instance
        this.controls = this.camera.controls
        this.world = this.experience.world
        this.envionment = this.world.environment
        this.scene_1 = this.world.scene_1
        this.scene_2 = this.world.scene_2
        this.scene_3 = this.world.scene_3


        this.setCatWalkShadow()
    }

    setCatWalkShadow()
    {
        this.scene_1.animatedModel.castShadow = true; 
        this.scene_1.animatedModel.traverse((child) => {
            if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            }
        });
    }
}