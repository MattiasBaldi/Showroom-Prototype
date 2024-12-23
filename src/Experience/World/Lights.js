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
        // this.debugFolder.close()
        }

        // Setup
        this.setObjectLight(this.scene_1.posedModel, 3, 10, 10, 50)
        this.setObjectLight(this.scene_2.mesh, 3, 10, -1, 10)
        // this.setObjectLight(this.scene_3.sceneModels, 3, 10, 2, 50)
        this.setSpotlight(4, 40, 10)
        this.setCatwalk(4, 20)
        this.setRoomLight()
 
    }

    setSpotlight(count, gap, height = 10) 
    {
        this.spotLights = [];

        for (let i = 0; i < count; i++)
        {

            // constructor(color = Color = 'grey', ConeRadius = 2, ConeHeight = 5, LightIntensity = 100)
            this.spotLight = new VolumetricSpotLight('white', 2.8, height, 100)
            
            // Calculate positionX based on the desired pattern
            const positionX = (i % 2 === 0) ? ((i / 2) * gap) + gap: -(Math.ceil(i / 2)) * gap;
            this.spotLight.position.x = positionX;
            this.spotLight.position.y = height;

            // Adjust light
            this.light = this.spotLight.children[1]
            this.light.intensity = 1000;
            this.light.penumbra = 1;
            this.light.decay = 1.5;

            //Adjust cone
            this.cone = this.spotLight.children[0]
            this.coneUniforms = this.cone.material.uniforms
            this.coneUniforms.spotPosition.value = this.spotLight.position
            this.coneUniforms.attenuation.value = 10.5;
            this.coneUniforms.anglePower.value = 5;
            this.coneUniforms.edgeScale.value = 0.5; // Adjust this value as needed
            this.coneUniforms.edgeConstractPower.value = 0.7; // Adjust this value as needed
            this.coneUniforms.emissiveIntensity = 100
        
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
            height: 10, // Assign a default value to height
            rotationX: this.spotLights[0].rotation.x,
            rotationY: this.spotLights[0].rotation.y,
            rotationZ: this.spotLights[0].rotation.z
        };

        this.Volumetric = this.debugFolder.addFolder('Navigational Lights');
        this.Volumetric.close()

        this.Volumetric
            .add(debugObject, 'rotationX')
            .name('Rotation X')
            .step(0.01)
            .min(-Math.PI)
            .max(Math.PI)
            .onChange((value) => {
            this.spotLights.forEach((spotLight) => {
                spotLight.rotation.x = value;
            });
            });

        this.Volumetric
            .add(debugObject, 'rotationY')
            .name('Rotation Y')
            .step(0.01)
            .min(-Math.PI)
            .max(Math.PI)
            .onChange((value) => {
            this.spotLights.forEach((spotLight) => {
                spotLight.rotation.y = value;
            });
            });

        this.Volumetric
            .add(debugObject, 'rotationZ')
            .name('Rotation Z')
            .step(0.01)
            .min(-Math.PI)
            .max(Math.PI)
            .onChange((value) => {
            this.spotLights.forEach((spotLight) => {
                spotLight.rotation.z = value;
            });
            });

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

    setCatwalk(count, gap, height = 10)
    {

    const lights = []

    for (let i = 0; i < count; i++) {

        const spotLight = new VolumetricSpotLight('white', 2.8, height, 100)

        // Position
        spotLight.position.z += i * gap + (gap * 2); 
        spotLight.position.y = height
        spotLight.position.x = 0

        // Cone settings
        const cone = spotLight.children[0]
        const spotLightConeUniforms = cone.material.uniforms
        spotLightConeUniforms.spotPosition.value = spotLight.position


        // spotLightConeUniforms.attenuation.value = 10.5;
        // spotLightConeUniforms.anglePower.value = 5;
        // spotLightConeUniforms.edgeScale.value = 0.5; // Adjust this value as needed
        // spotLightConeUniforms.edgeConstractPower.value = 0.7; // Adjust this value as needed
        // spotLightConeUniforms.emissiveIntensity = 100

        // Light settings
        lights.push(spotLight)
        this.scene.add(spotLight);
    }

    if (this.debug.active) {
        const debugObject = {
            radiusBottom: lights[0].children[0].geometry.parameters.radiusBottom,
            attenuation: lights[0].children[0].material.uniforms.attenuation.value,
            anglePower: lights[0].children[0].material.uniforms.anglePower.value,
            lightIntensity: lights[0].children[1].intensity,
            lightAngle: lights[0].children[1].angle,
            lightPenumbra: lights[0].children[1].penumbra,
            lightDecay: lights[0].children[1].decay,
            edgeScale: lights[0].children[0].material.uniforms.edgeScale.value,
            edgeConstractPower: lights[0].children[0].material.uniforms.edgeConstractPower.value,
            height: height,
            rotationX: lights[0].rotation.x,
            rotationY: lights[0].rotation.y,
            rotationZ: lights[0].rotation.z
        };

        const catWalkFolder = this.debugFolder.addFolder(' catWalk ')
        catWalkFolder.close()


        catWalkFolder
            .add(debugObject, 'rotationX')
            .name('Rotation X')
            .step(0.01)
            .min(-Math.PI)
            .max(Math.PI)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.rotation.x = value;
                });
            });

        catWalkFolder
            .add(debugObject, 'rotationY')
            .name('Rotation Y')
            .step(0.01)
            .min(-Math.PI)
            .max(Math.PI)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.rotation.y = value;
                });
            });

        catWalkFolder
            .add(debugObject, 'rotationZ')
            .name('Rotation Z')
            .step(0.01)
            .min(-Math.PI)
            .max(Math.PI)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.rotation.z = value;
                });
            });

        catWalkFolder
            .add(debugObject, 'height')
            .name('Height')
            .step(0.1)
            .min(0)
            .max(20)
            .onChange((value) => {
                lights.forEach((light) => {
                    const oldGeometry = light.children[0].geometry;
                    const newGeometry = oldGeometry.clone();
                    newGeometry.parameters.height = value;
                    newGeometry.dispose();

                    light.children[0].geometry = new THREE.CylinderGeometry(
                        newGeometry.parameters.radiusTop,
                        newGeometry.parameters.radiusBottom,
                        value,
                        newGeometry.parameters.radialSegments
                    );

                    light.children[0].rotation.x = -Math.PI / 0.5;
                    light.children[0].position.y = value / 2;
                    light.position.y = 0;
                });
            });

        catWalkFolder
            .add(debugObject, 'radiusBottom')
            .name('radiusBottom')
            .step(0.001)
            .min(0)
            .max(20)
            .onChange((value) => {
                lights.forEach((light) => {
                    const oldGeometry = light.children[0].geometry;
                    const newGeometry = oldGeometry.clone();
                    newGeometry.parameters.radiusBottom = value;
                    newGeometry.dispose();

                    light.children[0].geometry = new THREE.CylinderGeometry(
                        newGeometry.parameters.radiusTop,
                        value,
                        newGeometry.parameters.height,
                        newGeometry.parameters.radialSegments
                    );

                    light.children[0].rotation.x = -Math.PI / 0.5;
                    light.children[0].position.y = newGeometry.parameters.height / 2;
                    light.position.y = 0;
                });
            });

        catWalkFolder
            .add(debugObject, 'attenuation')
            .name('Attenuation')
            .step(0.001)
            .min(0)
            .max(20)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[0].material.uniforms.attenuation.value = value;
                });
            });

        catWalkFolder
            .add(debugObject, 'anglePower')
            .name('AnglePower')
            .step(0.001)
            .min(0)
            .max(20)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[0].material.uniforms.anglePower.value = value;
                });
            });

        catWalkFolder
            .add(debugObject, 'lightIntensity')
            .name('Light Intensity')
            .step(0.001)
            .min(0)
            .max(1000)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[1].intensity = value;
                });
            });

        catWalkFolder
            .add(debugObject, 'lightAngle')
            .name('Light Angle')
            .step(0.001)
            .min(0)
            .max(Math.PI / 2)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[1].angle = value;
                });
            });

        catWalkFolder
            .add(debugObject, 'lightPenumbra')
            .name('Light Penumbra')
            .step(0.001)
            .min(0)
            .max(1)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[1].penumbra = value;
                });
            });

        catWalkFolder
            .add(debugObject, 'lightDecay')
            .name('Light Decay')
            .step(0.001)
            .min(0)
            .max(2)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[1].decay = value;
                });
            });

        catWalkFolder
            .add(debugObject, 'edgeScale')
            .name('Edge Scale')
            .step(0.001)
            .min(0)
            .max(1)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[0].material.uniforms.edgeScale.value = value;
                });
            });

        catWalkFolder
            .add(debugObject, 'edgeConstractPower')
            .name('Edge Constract Power')
            .step(0.001)
            .min(0)
            .max(1)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[0].material.uniforms.edgeConstractPower.value = value;
                });
            });
    }

    }

    setObjectLight(object, count, radius = 5, height = 10, coneLength = 10)
    {
    const gap = 360 / count
    const lights = []

    for (let i = 0; i < count; i++)
    {
    const light = new VolumetricSpotLight('white', 2.8, coneLength, 10)
    const lightMesh = light.children[3]
    const cone = light.children[0]
    lightMesh.children.slice(1, 5).forEach((child) => { 
        lightMesh.remove(child);
    });

    // circle point positioning
    light.position.x = Math.cos(THREE.MathUtils.degToRad(gap * i)) * radius;
    light.position.z = Math.sin(THREE.MathUtils.degToRad(gap * i)) * radius;
    light.position.y = height

    // calculate the objects world position
    const localPosition = new THREE.Vector3()
    object.localToWorld(localPosition)

    // add the localPosition to the original position
    light.position.x += localPosition.x
    light.position.y += localPosition.y
    light.position.z += localPosition.z

    // look at
    // light.traverse((child) => {
    //     if (child.isLight) {
    //         child.target = new THREE.Object3D();
    //         child.target.position.copy(localPosition);
    //         this.scene.add(child.target);
    //         child.target.updateMatrixWorld();
    //         child.lookAt(localPosition);
    //     } else if (lightMesh || cone) {
    //         child.lookAt(localPosition);
    //     }
    // });

    light.lookAt(localPosition)


    // cone
    const spotLightConeUniforms = cone.material.uniforms
    spotLightConeUniforms.spotPosition.value = light.position

    // adjust light
    const spotLight = light.children[1]

    lights.push(light)
    this.scene.add(light)
    }

    if (this.debug.active) {
        const debugFolder = this.debugFolder.addFolder(`Object ${object.name}`);
        debugFolder.close();

        const debugObject = {
            handle: lights[0].children[3].children[0],
            reflector: lights[0].children[3].children[1],
            intensity: lights[0].children[1].intensity,
            positionY: lights[0].position.y,
            rotationX: lights[0].children[3].rotation.x,
            rotationY: lights[0].children[3].rotation.y,
            rotationZ: lights[0].children[3].rotation.z,
            attenuation: lights[0].children[0].material.uniforms.attenuation.value,
            anglePower: lights[0].children[0].material.uniforms.anglePower.value,
            edgeScale: lights[0].children[0].material.uniforms.edgeScale.value,
            edgeConstractPower: lights[0].children[0].material.uniforms.edgeConstractPower.value
        };

        debugFolder
            .add(debugObject.handle.rotation, 'x')
            .name('Handle Rotation X')
            .min(-Math.PI)
            .max(Math.PI)
            .step(0.01)
            .onChange((value) => {
            lights.forEach((light) => {
                light.children[3].children[0].rotation.x = value;
            });
            });

        debugFolder
            .add(debugObject.handle.rotation, 'y')
            .name('Handle Rotation Y')
            .min(-Math.PI)
            .max(Math.PI)
            .step(0.01)
            .onChange((value) => {
            lights.forEach((light) => {
                light.children[3].children[0].rotation.y = value;
            });
            });

        debugFolder
            .add(debugObject.handle.rotation, 'z')
            .name('Handle Rotation Z')
            .min(-Math.PI)
            .max(Math.PI)
            .step(0.01)
            .onChange((value) => {
            lights.forEach((light) => {
                light.children[3].children[0].rotation.z = value;
            });
            });

        debugFolder
            .add(debugObject.reflector.rotation, 'x')
            .name('Reflector Rotation X')
            .min(-Math.PI)
            .max(Math.PI)
            .step(0.01)
            .onChange((value) => {
            lights.forEach((light) => {
                light.children[3].children[1].rotation.x = value;
            });
            });

        debugFolder
            .add(debugObject.reflector.rotation, 'y')
            .name('Reflector Rotation Y')
            .min(-Math.PI)
            .max(Math.PI)
            .step(0.01)
            .onChange((value) => {
            lights.forEach((light) => {
                light.children[3].children[1].rotation.y = value;
            });
            });

        debugFolder
            .add(debugObject.reflector.rotation, 'z')
            .name('Reflector Rotation Z')
            .min(-Math.PI)
            .max(Math.PI)
            .step(0.01)
            .onChange((value) => {
            lights.forEach((light) => {
                light.children[3].children[1].rotation.z = value;
            });
            });

        debugFolder
            .add(debugObject, 'positionY')
            .name('Position Y')
            .min(-200)
            .max(200)
            .step(0.1)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.position.y = value;
                    light.children[0].material.uniforms.spotPosition.value.y = value;
                });
            });

        debugFolder
            .add(debugObject, 'intensity')
            .name('Intensity')
            .min(0)
            .max(1000)
            .step(0.1)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[1].intensity = value;
                });
            });

        debugFolder
            .add(debugObject, 'attenuation')
            .name('Attenuation')
            .min(0)
            .max(20)
            .step(0.1)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[0].material.uniforms.attenuation.value = value;
                });
            });

        debugFolder
            .add(debugObject, 'anglePower')
            .name('Angle Power')
            .min(0)
            .max(20)
            .step(0.1)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[0].material.uniforms.anglePower.value = value;
                });
            });

        debugFolder
            .add(debugObject, 'edgeScale')
            .name('Edge Scale')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[0].material.uniforms.edgeScale.value = value;
                });
            });

        debugFolder
            .add(debugObject, 'edgeConstractPower')
            .name('Edge Constract Power')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[0].material.uniforms.edgeConstractPower.value = value;
                });
            });
    }
    
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

    update(){
    }
    
}