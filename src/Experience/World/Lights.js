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
        this.setObjectLight(this.scene_1.posedModel, 3, 5, 5, 50, 30)
        this.setObjectLight(this.scene_2.mesh, 3, 10, 0.16, 10, undefined, false)
        this.setNavigationallight(4, 40, 10)
        this.setCatwalk(4, 20)
 
    }

    setNavigationallight(count, gap, height = 10, coneRadius = 3) 
    {
        const lights = []

        for (let i = 0; i < count; i++)
        {
            const volumetricLight = new VolumetricSpotLight('white', coneRadius, height, 100);
            
            // Calculate positionX based on the desired pattern
            const positionX = (i % 2 === 0) ? ((i / 2) * gap) + gap : -(Math.ceil(i / 2)) * gap;
            volumetricLight.position.x = positionX;
            volumetricLight.position.y = height;

            // Adjust light
            const spotLight = volumetricLight.children[1];
            spotLight.intensity = 1000;
            spotLight.penumbra = 1;
            spotLight.decay = 1.5;
            spotLight.distance = spotLight.distance;

            // Adjust cone
            const cone = volumetricLight.children[0];
            const coneUniforms = cone.material.uniforms;
            coneUniforms.attenuation.value = 10.5;
            coneUniforms.anglePower.value = 5;
            coneUniforms.edgeScale.value = 0.5; // Adjust this value as needed
            coneUniforms.edgeConstractPower.value = 0.7; // Adjust this value as needed

            // LookAt
            const target = new THREE.Object3D();
            target.position.set(volumetricLight.position.x, volumetricLight.position.y - height, volumetricLight.position.z);
            this.scene.add(target); // Add the target to the scene
            spotLight.target = target;
            
            // Make the light look at the target
            volumetricLight.lookAt(spotLight.target.position);

            // helpers
            // const spotLightHelper = new THREE.SpotLightHelper(spotLight);
            // this.scene.add(spotLightHelper);
        
            // Add this to the scene
            lights.push(volumetricLight);
            this.scene.add(volumetricLight);
        }

        // Debug
        if (this.debug.active) {
            const debugObject = {
            radiusBottom: lights[0].children[0].geometry.parameters.radiusBottom,
            attenuation: lights[0].children[0].material.uniforms.attenuation.value,
            anglePower: lights[0].children[0].material.uniforms.anglePower.value,
            lightIntensity: lights[0].children[1].intensity,
            lightAngle: lights[0].children[1].angle,
            lightPenumbra: lights[0].children[1].penumbra,
            lightDecay: lights[0].children[1].decay,
            edgeScale: lights[0].children[0].material.uniforms.edgeScale.value, // Adjust this value as needed
            edgeConstractPower: lights[0].children[0].material.uniforms.edgeConstractPower.value, // Adjust this value as needed,
            height: 10, // Assign a default value to height
            };

            this.Volumetric = this.debugFolder.addFolder('Navigational Lights');
            this.Volumetric.close();

            this.Volumetric
            .add(debugObject, 'height')
            .name('Height')
            .step(0.1)
            .min(0)
            .max(20)
            .onChange((value) => {
                // Update the height for all spotlights
                lights.forEach((spotLight) => {
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
                lights.forEach((spotLight) => {
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
                lights.forEach((spotLight) => {
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
                lights.forEach((spotLight) => {
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
                lights.forEach((spotLight) => {
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
                lights.forEach((spotLight) => {
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
                lights.forEach((spotLight) => {
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
                lights.forEach((spotLight) => {
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
                lights.forEach((spotLight) => {
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
                lights.forEach((spotLight) => {
                spotLight.children[0].material.uniforms.edgeConstractPower.value = value;
                });
            });
        }
    }

    setCatwalk(count, gap, height = 10, coneRadius = 3)
    {

    const lights = []

    for (let i = 0; i < count; i++) {

        const volumetricLight = new VolumetricSpotLight('white', coneRadius, height, 100)

        // Adjust light
        const spotLight = volumetricLight.children[1];
        spotLight.intensity = 1000;
        spotLight.penumbra = 1;
        spotLight.decay = 1.5;
        spotLight.distance = spotLight.distance;

        // Adjust cone
        const cone = volumetricLight.children[0];
        const coneUniforms = cone.material.uniforms;
        coneUniforms.attenuation.value = 10.5;
        coneUniforms.anglePower.value = 5;
        coneUniforms.edgeScale.value = 0.5; // Adjust this value as needed
        coneUniforms.edgeConstractPower.value = 0.7; // Adjust this value as needed

        // Position
        volumetricLight.position.z += i * gap + (gap * 2); 
        volumetricLight.position.y = height
        volumetricLight.position.x = 0

        // Shadows
        spotLight.castShadow = true; 
        spotLight.shadow.mapSize.set(1024, 1024) // the resolution of the shadow map for the spotlight to 512x512 pixels. Higher values result in better shadow quality but can impact performance.
        spotLight.shadow.camera.near = 0.5; // Objects closer than this distance to the camera will not cast shadows.
        spotLight.shadow.camera.far = 15; // Objects farther than this distance from the camera will not cast shadows.
        spotLight.shadow.camera.fov = 30 // Match the spotlight's cone angle
        spotLight.shadow.focus = 1; // This line sets the focus of the shadow map. A value of 1 means the shadow map is focused on the center of the light's cone. Adjusting this value can help improve shadow quality in certain situations.

        // LookAt
        spotLight.target = new THREE.Object3D();
        spotLight.target.position.set(volumetricLight.position.x, volumetricLight.position.y - height, volumetricLight.position.z);
        this.scene.add(spotLight.target); // Add the target to the scene
        
        // Make the light look at the target
        volumetricLight.lookAt(spotLight.target.position);

        // helpers
        const spotLightHelper = new THREE.SpotLightHelper(spotLight);
        this.scene.add(spotLightHelper);
        const shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
        this.scene.add(shadowCameraHelper);

        // Light settings
        lights.push(volumetricLight)
        this.scene.add(volumetricLight);
    }

    // Debug
    if (this.debug.active) {
        const debugObject = {
            attenuation: lights[0].children[0].material.uniforms.attenuation.value,
            anglePower: lights[0].children[0].material.uniforms.anglePower.value,
            lightIntensity: lights[0].children[1].intensity,
            lightAngle: lights[0].children[1].angle,
            lightPenumbra: lights[0].children[1].penumbra,
            lightDecay: lights[0].children[1].decay,
            edgeScale: lights[0].children[0].material.uniforms.edgeScale.value,
            edgeConstractPower: lights[0].children[0].material.uniforms.edgeConstractPower.value,
            shadowCameraNear: lights[0].children[1].shadow.camera.near,
            shadowCameraFar: lights[0].children[1].shadow.camera.far,
            shadowMapSizeWidth: lights[0].children[1].shadow.mapSize.width,
            shadowMapSizeHeight: lights[0].children[1].shadow.mapSize.height
        };

        const catWalkFolder = this.debugFolder.addFolder(' catWalk ')
        catWalkFolder.close()

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

        catWalkFolder
            .add(debugObject, 'shadowMapSizeWidth')
            .name('Shadow Map Size Width')
            .step(1)
            .min(0)
            .max(4096)
            .onChange((value) => {
                lights.forEach((light) => {
                    light.children[1].shadow.mapSize.width = value;
                    if (light.children[1].shadow.map) {
                        light.children[1].shadow.mapSize.width = value;
                        light.children[1].shadow.map.dispose();
                        light.children[1].shadow.map = null;
                    }
                });
            });

        catWalkFolder
            .add(debugObject, 'shadowMapSizeHeight')
            .name('Shadow Map Size Height')
            .step(1)
            .min(0)
            .max(4096)
            .onChange((value) => {
                lights.forEach((light) => {
                    if (light.children[1].shadow.map) {
                    light.children[1].shadow.mapSize.height = value;
                    light.children[1].shadow.map.dispose();
                    light.children[1].shadow.map = null;
                    }
                })
            });
    }

    }

    setObjectLight(object, count, radius = 5, height = 10, coneLength = 10, coneRadius = 3, shadowEnabled = true)
    {
    const gap = 360 / count
    const lights = []

    for (let i = 0; i < count; i++)
    {
    const volumetricLight = new VolumetricSpotLight('white', coneRadius, coneLength, 10)

    // each light group positioned on a circle
    volumetricLight.position.x = Math.cos(THREE.MathUtils.degToRad(gap * i)) * radius;
    volumetricLight.position.z = Math.sin(THREE.MathUtils.degToRad(gap * i)) * radius;
    volumetricLight.position.y = height

    // Adjust light
    const spotLight = volumetricLight.children[1];
    spotLight.intensity = 1000;
    spotLight.penumbra = 1;
    spotLight.decay = 1.5;
    spotLight.distance = 15

    // Adjust cone
    const cone = volumetricLight.children[0];
    const coneUniforms = cone.material.uniforms;
    coneUniforms.attenuation.value = 10.5;
    coneUniforms.anglePower.value = 5;
    coneUniforms.edgeScale.value = 0.5; // Adjust this value as needed
    coneUniforms.edgeConstractPower.value = 0.7; // Adjust this value as needed

    // Shadows
    spotLight.castShadow = shadowEnabled; 
    spotLight.shadow.mapSize.set(1024, 1024)
    spotLight.shadow.camera.fov = coneRadius // Match the spotlight's cone angle     
    spotLight.shadow.camera.near = 0.5; // default
    spotLight.shadow.camera.far = 50; // default
    spotLight.shadow.focus = 1; // default

    // calculate the lookAt object's world position
    const localPosition = new THREE.Vector3()
    object.localToWorld(localPosition)

    // add the object's position to the lights position
    volumetricLight.position.x += localPosition.x
    volumetricLight.position.z += localPosition.z

    // lookAt the object
    volumetricLight.lookAt(localPosition)
    spotLight.target = object

    // helpers
    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    this.scene.add(spotLightHelper);
    const shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
    this.scene.add(shadowCameraHelper);

    lights.push(volumetricLight)
    this.scene.add(volumetricLight)
    }

    // Debug
    if (this.debug.active) {
        const debugFolder = this.debugFolder.addFolder(`${object.name}`);
        debugFolder.close();

        const debugObject = {
            intensity: lights[0].children[1].intensity,
            positionY: lights[0].position.y,
            attenuation: lights[0].children[0].material.uniforms.attenuation.value,
            anglePower: lights[0].children[0].material.uniforms.anglePower.value,
            edgeScale: lights[0].children[0].material.uniforms.edgeScale.value,
            edgeConstractPower: lights[0].children[0].material.uniforms.edgeConstractPower.value
        };

        // debugFolder
        // .add(debugObject, 'CircleRadius')
        // .name('Position Y')
        // .min(-10)
        // .max(10)
        // .step(0.1)
        // .onChange((value) => {
        //     lights.forEach((volumetricLight) => {
        //         volumetricLight.position.y = value;
        //     });
        // });

        // debugFolder
        // .add(debugObject, 'ConeRadius')
        // .name('Position Y')
        // .min(-10)
        // .max(10)
        // .step(0.1)
        // .onChange((value) => {
        //     lights.forEach((volumetricLight) => {
        //         volumetricLight.position.y = value;
        //     });
        // });

        debugFolder
            .add(debugObject, 'positionY')
            .name('Position Y')
            .min(-10)
            .max(10)
            .step(0.1)
            .onChange((value) => {
                lights.forEach((volumetricLight) => {
                    volumetricLight.position.y = value;
                });
            });

        debugFolder
            .add(debugObject, 'intensity')
            .name('Intensity')
            .min(0)
            .max(1000)
            .step(0.1)
            .onChange((value) => {
                lights.forEach((volumetricLight) => {
                    volumetricLight.children[1].intensity = value;
                });
            });

        debugFolder
            .add(debugObject, 'attenuation')
            .name('Attenuation')
            .min(0)
            .max(20)
            .step(0.1)
            .onChange((value) => {
                lights.forEach((volumetricLight) => {
                    volumetricLight.children[0].material.uniforms.attenuation.value = value;
                });
            });

        debugFolder
            .add(debugObject, 'anglePower')
            .name('Angle Power')
            .min(0)
            .max(20)
            .step(0.1)
            .onChange((value) => {
                lights.forEach((volumetricLight) => {
                    volumetricLight.children[0].material.uniforms.anglePower.value = value;
                });
            });

        debugFolder
            .add(debugObject, 'edgeScale')
            .name('Edge Scale')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange((value) => {
                lights.forEach((volumetricLight) => {
                    volumetricLight.children[0].material.uniforms.edgeScale.value = value;
                });
            });

        debugFolder
            .add(debugObject, 'edgeConstractPower')
            .name('Edge Constract Power')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange((value) => {
                lights.forEach((volumetricLight) => {
                    volumetricLight.children[0].material.uniforms.edgeConstractPower.value = value;
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

        // spotLight.castShadow = true; 
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

    setBloom()
    {

    }

    update(){
    }
    
}