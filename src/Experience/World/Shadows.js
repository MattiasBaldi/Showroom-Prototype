// These are shadows
import Experience from  '../Experience.js'

export default class Shadows {

    constructor()
    {
        // Setup
        this.experience = new Experience()
        this.camera =  this.experience.camera.instance
        this.debug = this.experience.debug
        this.controls = this.camera.controls
        this.world = this.experience.world
        this.envionment = this.world.environment
        this.scene_1 = this.world.scene_1
        this.scene_2 = this.world.scene_2
        this.scene_3 = this.world.scene_3


       // Debug
       if (this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Shadows');
            this.debugFolder.close();
        }

        
        this.setCatWalkShadow()
        this.setScene3Shadow()

 
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

        this.scene_1.posedModel.castShadow = true; 
        this.scene_1.posedModel.traverse((child) => {
            if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            }
        });


        // Debug
        if (this.debug.active) {
            const debugObject = {
            receiveShadow: this.scene_1.animatedModel.receiveShadow
            };

            // Set initial value based on default
            this.scene_1.animatedModel.traverse((child) => {
            if (child.isMesh) {
                child.receiveShadow = debugObject.receiveShadow;
            }
            });
            this.scene_1.posedModel.traverse((child) => {
            if (child.isMesh) {
                child.receiveShadow = debugObject.receiveShadow;
            }
            });

            this.debugFolder.add(debugObject, 'receiveShadow').onChange((value) => {
            this.scene_1.animatedModel.traverse((child) => {
                if (child.isMesh) {
                child.receiveShadow = value;
                }
            });
            this.scene_1.posedModel.traverse((child) => {
                if (child.isMesh) {
                child.receiveShadow = value;
                }
            });
            });
        }

    }

    setPosedShadow()
    {

        this.scene_1.posedModel.castShadow = true; 
        this.scene_1.posedModel.traverse((child) => {
            if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            }
        });

    }

    setScene3Shadow()
    {

        console.log(this.scene_3.empty)

        this.scene_3.empty.traverse((child) => {
            if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            }
        });

    }

}