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
        this.scene_0 = this.world.scene_0
        this.scene_1 = this.world.scene_1
        this.scene_2 = this.world.scene_2
        this.scene_3 = this.world.scene_3


       // Debug
       if (this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Shadows');
            this.debugFolder.close();
        }

        this.setPosedModelShadow();
        this.setAnimatedModelShadow();
        this.setScene3Shadow();
    }

    setPosedModelShadow()
    {
        this.scene_1.model.castShadow = true; 
        this.scene_1.model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Debug
        if (this.debug.active) {
            const debugObject = { receiveShadow: true }; // Define debugObject
            this.debugFolder.add(debugObject, 'receiveShadow').name('Posed Model').onChange((value) => {
                this.scene_1.model.traverse((child) => {
                    if (child.isMesh) {
                        child.receiveShadow = value;
                    }
                });
            });
        }
    }

    setAnimatedModelShadow()
    {
        this.scene_0.animatedModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.scene_0.catWalk.receiveShadow = true;

        // Debug
        if (this.debug.active) {
            const debugObject = { receiveShadow: true }; // Define debugObject
            this.debugFolder.add(debugObject, 'receiveShadow').name('Animated Model').onChange((value) => {
                this.scene_0.animatedModel.traverse((child) => {
                    if (child.isMesh) {
                        child.receiveShadow = value;
                    }
                });
            });
        }
    }

    setScene3Shadow()
    {
        this.scene_3.empty.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Debug
        if (this.debug.active) {
            const debugObject = { receiveShadow: true }; // Define debugObject
            this.debugFolder.add(debugObject, 'receiveShadow').name('Furniture space').onChange((value) => {
                this.scene_3.empty.traverse((child) => {
                    if (child.isMesh) {
                        child.receiveShadow = value;
                    }
                });
            });
        }
    }

}