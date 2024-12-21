import * as THREE from 'three'
import Experience from '../Experience.js'
import VolumetricSpotLight from '../Utils/VolumetricLight.js'

export default class Lights 
{
    constructor()
    {
        this.experience = new Experience()
        this.renderer = this.experience.renderer
        this.resources = this.experience.resources
        this.world = this.experience.world
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.scene_1 = this.world.scene_1
        this.scene_2 = this.world.scene_2
        this.scene_3 = this.world.scene_3
        

        // Debug
        if (this.debug.active) {
        this.debugFolder = this.debug.ui.addFolder('Lights');            
        this.Volumetric = this.debugFolder.addFolder('Volumetric Lights');
        this.Volumetric.close()
        // this.debugFolder.close()
        }

        // Setup
        this.setSpotlight(4, 40)
        this.setCatwalk(4, 20)
        this.setRoomLight()


        this.setObjectLight(this.scene_1.posedModel, 3)
 
    }

    setSpotlight(count, gap) 
    {
        this.spotLights = [];

        for (let i = 0; i < count; i++)
        {

            // constructor(color = Color = 'grey', ConeRadius = 2, ConeHeight = 5, LightIntensity = 100)
            this.spotLight = new VolumetricSpotLight('white', 2.8, 10, 100)
            
            //Adjust cone
            this.cone = this.spotLight.children[0]
            this.coneUniforms = this.cone.material.uniforms
            this.coneUniforms.attenuation.value = 10.5;
            this.coneUniforms.anglePower.value = 5;
            this.coneUniforms.edgeScale.value = 0.5; // Adjust this value as needed
            this.coneUniforms.edgeConstractPower.value = 0.7; // Adjust this value as needed
            this.coneUniforms.emissiveIntensity = 100

            // Adjust light
            this.light = this.spotLight.children[1]
            this.light.intensity = 1000;
            // this.light.angle = Math.PI * 0.1;
            this.light.penumbra = 1;
            this.light.decay = 1.5;

            // Calculate positionX based on the desired pattern
            const positionX = (i % 2 === 0) ? ((i / 2) * gap) + gap: -(Math.ceil(i / 2)) * gap;
            this.spotLight.position.x = positionX;
            this.spotLight.children[0].material.uniforms.spotPosition.value.x = positionX;

            // Add this to the scene
            this.spotLights.push(this.spotLight)
            this.scene.add(this.spotLight)
        }

    if (this.debug.active) {
        const debugObject = {
            radiusBottom: this.spotLights[0].children[0].geometry.parameters.radiusBottom,
            attenuation: this.spotLights[0].children[0].material.uniforms.attenuation.value,
            anglePower: this.spotLights[0].children[0].material.uniforms.anglePower.value,
            lightIntensity: this.spotLights[0].children[1].intensity,
            lightAngle: this.spotLights[0].children[1].angle,
            lightPenumbra: this.spotLights[0].children[1].penumbra,
            lightDecay: this.spotLights[0].children[1].decay,
            edgeScale: this.spotLights[0].children[0].material.uniforms.edgeScale.value, // Adjust this value as needed
            edgeConstractPower: this.spotLights[0].children[0].material.uniforms.edgeConstractPower.value, // Adjust this value as needed
            height: 10 // Assign a default value to height
        };

            this.Volumetric
                .add(debugObject, 'height')
                .name('Height')
                .step(0.1)
                .min(0)
                .max(20)
                .onChange((value) => {
                // Update the height for all spotlights
                this.spotLights.forEach((spotLight) => {
                    const oldGeometry = spotLight.children[0].geometry;
                    const newGeometry = oldGeometry.clone();
                    newGeometry.parameters.height = value;
                    newGeometry.dispose(); // Dispose the old geometry

                    spotLight.children[0].geometry = new THREE.CylinderGeometry(
                    newGeometry.parameters.radiusTop,
                    newGeometry.parameters.radiusBottom,
                    value,
                    newGeometry.parameters.radialSegments
                    );

                    // Rotate the spotlight so it is pointing down
                    spotLight.children[0].rotation.x = -Math.PI / 0.5;
                    spotLight.children[0].position.y = value / 2;
                    spotLight.position.y = 0;
                });
                });

        this.Volumetric
            .add(debugObject, 'radiusBottom')
            .name('radiusBottom')
            .step(0.001)
            .min(0)
            .max(20)
            .onChange((value) => {
            // Update the radiusBottom value for all spotlights
            this.spotLights.forEach((spotLight) => {
                const oldGeometry = spotLight.children[0].geometry;
                const newGeometry = oldGeometry.clone();
                newGeometry.parameters.radiusBottom = value;
                newGeometry.dispose(); // Dispose the old geometry

                spotLight.children[0].geometry = new THREE.CylinderGeometry(
                newGeometry.parameters.radiusTop,
                value,
                newGeometry.parameters.height,
                newGeometry.parameters.radialSegments
                );

                // Rotate the spotlight so it is pointing down
                spotLight.children[0].rotation.x = -Math.PI / 0.5;
                spotLight.children[0].position.y = newGeometry.parameters.height / 2;   
                spotLight.position.y = 0;              
            });
            });


        this.Volumetric
            .add(debugObject, 'attenuation')
            .name('Attenuation')
            .step(0.001)
            .min(0)
            .max(20)
            .onChange((value) => {
                // Update the attenuation value for all spotlights
                this.spotLights.forEach((spotLight) => {
                    spotLight.children[0].material.uniforms.attenuation.value = value;
                });
            });

        this.Volumetric
            .add(debugObject, 'anglePower')
            .name('AnglePower')
            .step(0.001)
            .min(0)
            .max(20)
            .onChange((value) => {
                // Update the anglePower value for all spotlights
                this.spotLights.forEach((spotLight) => {
                    spotLight.children[0].material.uniforms.anglePower.value = value;
                });
            });

        this.Volumetric
            .add(debugObject, 'lightIntensity')
            .name('Light Intensity')
            .step(0.001)
            .min(0)
            .max(1000)
            .onChange((value) => {
                // Update the light intensity for all spotlights
                this.spotLights.forEach((spotLight) => {
                    spotLight.children[1].intensity = value;
                });
            });

        this.Volumetric
            .add(debugObject, 'lightAngle')
            .name('Light Angle')
            .step(0.001)
            .min(0)
            .max(Math.PI / 2)
            .onChange((value) => {
                // Update the light angle for all spotlights
                this.spotLights.forEach((spotLight) => {
                    spotLight.children[1].angle = value;
                });
            });

        this.Volumetric
            .add(debugObject, 'lightPenumbra')
            .name('Light Penumbra')
            .step(0.001)
            .min(0)
            .max(1)
            .onChange((value) => {
                // Update the light penumbra for all spotlights
                this.spotLights.forEach((spotLight) => {
                    spotLight.children[1].penumbra = value;
                });
            });

        this.Volumetric
            .add(debugObject, 'lightDecay')
            .name('Light Decay')
            .step(0.001)
            .min(0)
            .max(2)
            .onChange((value) => {
                // Update the light decay for all spotlights
                this.spotLights.forEach((spotLight) => {
                    spotLight.children[1].decay = value;
                });
            });

        this.Volumetric
            .add(debugObject, 'edgeScale')
            .name('Edge Scale')
            .step(0.001)
            .min(0)
            .max(1)
            .onChange((value) => {
                // Update the edgeScale value for all spotlights
                this.spotLights.forEach((spotLight) => {
                    spotLight.children[0].material.uniforms.edgeScale.value = value;
                });
            });

        this.Volumetric
            .add(debugObject, 'edgeConstractPower')
            .name('Edge Constract Power')
            .step(0.001)
            .min(0)
            .max(1)
            .onChange((value) => {
                // Update the edgeConstractPower value for all spotlights
                this.spotLights.forEach((spotLight) => {
                    spotLight.children[0].material.uniforms.edgeConstractPower.value = value;
                });
            });
    }
}

    setCatwalk(count, gap)
    {
    for (let i = 0; i < count; i++) {

        const spotLight = new VolumetricSpotLight('white', 2.8, 10, 100)

        // Position
        spotLight.position.z += i * gap + (gap * 2); 
        spotLight.children[0].material.uniforms.spotPosition.value.z += i * gap + (gap * 2);

        // Cone settings
        const cone = spotLight.children[0]
        const spotLightConeUniforms = cone.material.uniforms

        spotLightConeUniforms.attenuation.value = 10.5;
        spotLightConeUniforms.anglePower.value = 5;
        spotLightConeUniforms.edgeScale.value = 0.5; // Adjust this value as needed
        spotLightConeUniforms.edgeConstractPower.value = 0.7; // Adjust this value as needed
        spotLightConeUniforms.emissiveIntensity = 100

        // Light settings
        const light = spotLight.children[1]

        this.scene.add(spotLight);

    }

    }

    setScene2Lights()
    {
        const VolumetricLight = new VolumetricSpotLight('white', 2.8, 10, 100)
  
        // Position
        const localPosition = new THREE.Vector3();
        this.scene_2.mesh.localToWorld(localPosition);
        VolumetricLight.position.x = localPosition.x;
        VolumetricLight.children[0].material.uniforms.spotPosition.value.x =  VolumetricLight.position.x

        // Light
        const light = VolumetricLight.children[1]
        light.intensity = 1000;
        light.penumbra = 1;
        light.decay = 1.5;

        // Cone 
        const cone = VolumetricLight.children[0];
        const spotLightConeUniforms = cone.material.uniforms;
        spotLightConeUniforms.attenuation.value = 10.5;
        spotLightConeUniforms.anglePower.value = 5;
        spotLightConeUniforms.edgeScale.value = 0.5; // Adjust this value as needed
        spotLightConeUniforms.edgeConstractPower.value = 0.7; // Adjust this value as needed
        spotLightConeUniforms.emissiveIntensity = 100;

        const lightHelper = new THREE.SpotLightHelper(light);
        this.scene.add(lightHelper);

        this.scene.add(VolumetricLight)

        if (this.debug.active)
        {
            const debugObject = {
                attenuation: VolumetricLight.children[0].material.uniforms.attenuation.value,
                anglePower: VolumetricLight.children[0].material.uniforms.anglePower.value,
                lightIntensity: VolumetricLight.children[1].intensity,
                lightPenumbra: VolumetricLight.children[1].penumbra,
                lightDecay: VolumetricLight.children[1].decay,
                edgeScale: VolumetricLight.children[0].material.uniforms.edgeScale.value,
                edgeConstractPower: VolumetricLight.children[0].material.uniforms.edgeConstractPower.value
            };

            const scene2Folder = this.debugFolder.addFolder('Scene 2, Light');
            scene2Folder.close();

            scene2Folder
                .add({ showHelper: true }, 'showHelper')
                .name('Show Helper')
                .onChange((value) => {
                    lightHelper.visible = value;
                });

            scene2Folder
                .add(VolumetricLight.rotation, 'x')
                .name('Rotation X')
                .step(0.1)
                .min(-Math.PI)
                .max(Math.PI)
                .onChange((value) => {
                    VolumetricLight.rotation.x = value;
                    lightHelper.update();
                });

            scene2Folder
                .add(VolumetricLight.rotation, 'y')
                .name('Rotation Y')
                .step(0.1)
                .min(-Math.PI)
                .max(Math.PI)
                .onChange((value) => {
                    VolumetricLight.rotation.y = value;
                    lightHelper.update();
                });

            scene2Folder
                .add(VolumetricLight.rotation, 'z')
                .name('Rotation Z')
                .step(0.1)
                .min(-Math.PI)
                .max(Math.PI)
                .onChange((value) => {
                    VolumetricLight.rotation.z = value;
                    lightHelper.update();
                });

            scene2Folder
                .add(VolumetricLight.position, 'x')
                .name('Position X')
                .step(0.1)
                .min(-200)
                .max(200)
                .onChange((value) => {
                    VolumetricLight.position.x = value;
                    VolumetricLight.children[0].material.uniforms.spotPosition.value.x = value;
                    lightHelper.update();
                });

            scene2Folder
                .add(VolumetricLight.position, 'y')
                .name('Position Y')
                .step(0.1)
                .min(-200)
                .max(200)
                .onChange((value) => {
                    VolumetricLight.position.y = value;
                    VolumetricLight.children[0].material.uniforms.spotPosition.value.y = value;
                    lightHelper.update();
                });

            scene2Folder
                .add(VolumetricLight.position, 'z')
                .name('Position Z')
                .step(0.1)
                .min(-200)
                .max(200)
                .onChange((value) => {
                    VolumetricLight.position.z = value;
                    VolumetricLight.children[0].material.uniforms.spotPosition.value.z = value;
                    lightHelper.update();
                });

            scene2Folder
                .add(debugObject, 'attenuation')
                .name('Attenuation')
                .step(0.001)
                .min(0)
                .max(20)
                .onChange((value) => {
                    VolumetricLight.children[0].material.uniforms.attenuation.value = value;
                });

            scene2Folder
                .add(debugObject, 'anglePower')
                .name('AnglePower')
                .step(0.001)
                .min(0)
                .max(20)
                .onChange((value) => {
                    VolumetricLight.children[0].material.uniforms.anglePower.value = value;
                });

            scene2Folder
                .add(debugObject, 'lightIntensity')
                .name('Light Intensity')
                .step(0.001)
                .min(0)
                .max(1000)
                .onChange((value) => {
                    VolumetricLight.children[1].intensity = value;
                });

            scene2Folder
                .add(debugObject, 'lightPenumbra')
                .name('Light Penumbra')
                .step(0.001)
                .min(0)
                .max(1)
                .onChange((value) => {
                    VolumetricLight.children[1].penumbra = value;
                });

            scene2Folder
                .add(debugObject, 'lightDecay')
                .name('Light Decay')
                .step(0.001)
                .min(0)
                .max(2)
                .onChange((value) => {
                    VolumetricLight.children[1].decay = value;
                });

            scene2Folder
                .add(debugObject, 'edgeScale')
                .name('Edge Scale')
                .step(0.001)
                .min(0)
                .max(1)
                .onChange((value) => {
                    VolumetricLight.children[0].material.uniforms.edgeScale.value = value;
                });

            scene2Folder
                .add(debugObject, 'edgeConstractPower')
                .name('Edge Constract Power')
                .step(0.001)
                .min(0)
                .max(1)
                .onChange((value) => {
                    VolumetricLight.children[0].material.uniforms.edgeConstractPower.value = value;
                });

                scene2Folder
                    .add({ duplicate: () => {
                        const duplicateLight = VolumetricLight.clone();
                        duplicateLight.position.x += 10; // Adjust position to avoid overlap
                        this.scene.add(duplicateLight);

                        const duplicateHelper = new THREE.SpotLightHelper(duplicateLight.children[1]);
                        this.scene.add(duplicateHelper);
                    }}, 'duplicate')
                    .name('Duplicate Light');
        }
        scene2Folder
            .add({ remove: () => {
                this.scene.remove(VolumetricLight);
                this.scene.remove(lightHelper);
            }}, 'remove')
            .name('Remove Light');

    }

    setRoomLight()
    {

        const spotLight = new THREE.SpotLight(0xffffff, 25, 0,  50 * (Math.PI / 180), 0.5, 2)

        const localPosition = new THREE.Vector3();
        this.scene_3.bulb.localToWorld(localPosition);

        spotLight.position.copy(localPosition)
        spotLight.position.y += 0.5
        spotLight.target.position.set(spotLight.position.x, spotLight.position.y - 1, spotLight.position.z);
        spotLight.target.updateMatrixWorld();

        spotLight.castShadow = true; 
        // const spotLightHelper = new THREE.SpotLightHelper(spotLight)
        this.scene.add(spotLight)
    

        // Debug
        if (this.debug.active)
        {
            const scene3Folder = this.debugFolder.addFolder('Scene 3, Light')
            scene3Folder.close()

            const debugObject = {
                intensity: spotLight.intensity,
                distance: spotLight.distance,
                angle: spotLight.angle,
                penumbra: spotLight.penumbra,
                decay: spotLight.decay
            };

            scene3Folder
                .add(debugObject, 'intensity')
                .name('Intensity')
                .min(0)
                .max(1000)
                .step(0.1)
                .onChange((value) => {
                    spotLight.intensity = value;
                });

            scene3Folder
                .add(debugObject, 'distance')
                .name('Distance')
                .min(0)
                .max(1000)
                .step(0.1)
                .onChange((value) => {
                    spotLight.distance = value;
                });

            scene3Folder
                .add(debugObject, 'angle')
                .name('Angle')
                .min(0)
                .max(Math.PI / 2)
                .step(0.01)
                .onChange((value) => {
                    spotLight.angle = value;
                });

            scene3Folder
                .add(debugObject, 'penumbra')
                .name('Penumbra')
                .min(0)
                .max(1)
                .step(0.01)
                .onChange((value) => {
                    spotLight.penumbra = value;
                });

            scene3Folder
                .add(debugObject, 'decay')
                .name('Decay')
                .min(0)
                .max(2)
                .step(0.01)
                .onChange((value) => {
                    spotLight.decay = value;
                });
        }

    }

    setObjectSpotLight(count, object)
    {
        for (let i = 0; i < count; i++) {
            const spotLight = new THREE.SpotLight('white', 100, 0, Math.PI * 0.1, 0.5, 2);
            const localPosition = new THREE.Vector3();
            object.localToWorld(localPosition.set(0, 0, 0));
            
            // Create a target object and set its position
            const targetObject = new THREE.Object3D();
            targetObject.position.copy(localPosition);
            this.scene.add(targetObject);
            spotLight.target = targetObject;
        
            // Position the spotlight
            spotLight.position.copy(localPosition);
            spotLight.position.x += - 0.5 * (5 * (Math.random() * 1.2))
            spotLight.position.y += 5 * (Math.random() * 1.2)
            spotLight.position.z += - 0.5 * (5 * (Math.random() * 1.2))

            // Helper
            const spotLightHelper = new THREE.SpotLightHelper(spotLight)

            this.scene.add(spotLight);
            // this.scene.add(spotLightHelper);
        }
    }

    setObjectLight(object, count, radius = 5, height = 5)
    {

    const gap = 360 / count

    for (let i = 0; i < count; i++)
    {
    
    const light = new VolumetricSpotLight('white', 2.8, height, 100)
    const cone = light.children[0]
    const spotLight = light.children[1]

    // circle point positioning
    light.position.x = Math.cos(THREE.MathUtils.degToRad(gap * i)) * radius;
    light.position.z = Math.sin(THREE.MathUtils.degToRad(gap * i)) * radius;

    // calculate the object position and make the objects lookAt it
    const localPosition = new THREE.Vector3(); 
    object.localToWorld(localPosition)
    light.lookAt(localPosition);
    for (const child of light.children)
        {
            if(child instanceof THREE.Mesh)
            {
            child.lookAt(object)
            }
        }
    
    
    // add the localPosition 
    light.position.z += localPosition.z
    light.position.x += localPosition.x
    cone.material.uniforms.spotPosition.value = light.position

    console.log(light)

    this.scene.add(light)
    
    }

    
    }

    update(){
    }
    
}