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
            this.debugFolder = this.debug.ui.addFolder('Scene 1 (Posed Model)')
            this.debugFolder.close()
            this.clothesFolder = this.debugFolder.addFolder('Clothes')
            this.clothesFolder.close()
            this.bodyFolder = this.debugFolder.addFolder('Body');
            this.bodyFolder.close()
        }

        // Setup
        this.resource = this.resources.items.Scene_1
        this.sceneModels = this.resource.scene
        this.model = this.sceneModels.children[0]
        this.body = this.model.children[0]

        // Call actions
        this.setScene()
        this.setMaterial()
        this.setBloom()
        // this.setEnvMapIntensity()

        // Switch
        this.switch = new Switch(this.body, 10)

    }

    setScene()
    {
        this.scale = 0.2
        this.sceneModels.scale.set(this.scale, this.scale, this.scale)
        this.scene.add(this.sceneModels)

        // Debug
        if(this.debug.active) {
        this.debugFolder.add(this.model.scale, 'x', 'y', 'z').name('Scale').step(0.01).min(0).max(2).onChange((value) => {
            this.model.scale.set(value, value, value)})

        }
    }

    setMaterial()
    {
                // Debug
                if(this.debug.active) {
          
                   const chromeModels = this.model.children.slice(1, 6)
                    this.clothesFolder.addColor({ color: chromeModels[0].material.color.getHex() }, 'color').name('Material Color').onChange((value) => {
                        chromematerials.forEach(child => child.material.color.set(value))
                    })
                    this.clothesFolder.add({ metalness: chromeModels[0].material.metalness }, 'metalness').min(0).max(1).step(0.01).name('Metalness').onChange((value) => {
                        chromeModels.forEach(child => child.material.metalness = value)
                    })
                    this.clothesFolder.add({ roughness: chromeModels[0].material.roughness }, 'roughness').min(0).max(1).step(0.01).name('Roughness').onChange((value) => {
                        chromeModels.forEach(child => child.material.roughness = value)
                    })
                    this.clothesFolder.add({ envMapIntensity: chromeModels[0].material.envMapIntensity }, 'envMapIntensity').min(0).max(1).step(0.1).name('Env Map Intensity').onChange((value) => {
                        chromeModels.forEach(child => {
                            child.material.envMap = this.environment.environmentMap;
                            child.material.envMapIntensity = value;
                        })
                    })

                    const body = this.model.children[0]
                    const bodyMaterial = body.material;
                    this.bodyFolder.addColor({ color: bodyMaterial.color.getHex() }, 'color').name('Material Color').onChange((value) => {
                        bodyMaterial.color.set(value);
                    });
                    this.bodyFolder.add({ metalness: bodyMaterial.metalness }, 'metalness').min(0).max(1).step(0.01).name('Metalness').onChange((value) => {
                        bodyMaterial.metalness = value;
                    });
                    this.bodyFolder.add({ roughness: bodyMaterial.roughness }, 'roughness').min(0).max(1).step(0.01).name('Roughness').onChange((value) => {
                        bodyMaterial.roughness = value;
                    });
                    this.bodyFolder.add({ envMapIntensity: bodyMaterial.envMapIntensity }, 'envMapIntensity').min(0).max(1).step(0.1).name('Env Map Intensity').onChange((value) => {
                        bodyMaterial.envMap = this.environment.environmentMap;
                        bodyMaterial.envMapIntensity = value;
                    });



                    }
    }

    setBloom()
    {
        this.renderer.selectiveBloom.selection.add(this.body)

        if (this.debug.active)
        {
            this.bodyFolder.add({ bloom: true }, 'bloom').name('Toggle Bloom').onChange((value) => {
                if (value) {
                    this.renderer.selectiveBloom.selection.add(this.body);
                } else {
                    this.renderer.selectiveBloom.selection.delete(this.body);
                }
            });

            this.bodyFolder.addColor({ emissive: this.body.material.emissive.getHex() }, 'emissive').name('Emissive Color').onChange((value) => {
                this.body.material.emissive.set(value);
            });
            this.bodyFolder.add({ emissiveIntensity: this.body.material.emissiveIntensity }, 'emissiveIntensity').min(0).max(1).step(0.1).name('Emissive Intensity').onChange((value) => {
                this.body.material.emissiveIntensity = value;
            });
        }
    }

    update()
    {
            this.switch.update()
    }
}