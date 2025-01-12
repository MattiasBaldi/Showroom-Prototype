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
        this.scene_0 = this.world.scene_0
        this.scene_1 = this.world.scene_1
        this.scene_2 = this.world.scene_2
        this.scene_3 = this.world.scene_3

        this.poseSpeed = null
        this.sphereSpeed = null
        this.furnitureSpeed = 0.01

        // Debug
        if (this.debug.active) {
        this.debugFolder = this.debug.ui.addFolder('Lights');            
        this.debugFolder.close()
        }

        // Setup
        this.bloom = []
        this.lightGroups = {}

        // Methods
        this.setObjectLight(this.scene_1.model, 2, 5, 5, 50, 30, 10)
        this.setObjectLight(this.scene_2.sphere, 3, 10, 0.16, 10, undefined, false)
        this.setNavigationallight(4, 40, 10)
        this.setCatwalk(5, 10, 2, 100)

        // Testing roomLight
        if(this.debug.active)
        {
            this.scene3Folder = this.debugFolder.addFolder('scene 3')
        }
        this.setRoomSpotlight()
        this.setRoomPointLight()

        this.setBloom()
    }

    setNavigationallight(count, gap, height = 10, coneRadius = 3, intensity = 1000) 
    {
        const group = new THREE.Group()

        for (let i = 0; i < count; i++)
        {
            const volumetricLight = new VolumetricSpotLight('white', coneRadius, height, 100);
            
            // Calculate positionX based on the desired pattern
            const positionX = (i % 2 === 0) ? ((i / 2) * gap) + gap : -(Math.ceil(i / 2)) * gap;
            volumetricLight.position.x = positionX;
            volumetricLight.position.y = height;

            volumetricLight.rotation.x += Math.PI * 0.25; 
            volumetricLight.rotation.z += Math.PI * 0.25; 

            // Adjust light
            const spotLight = volumetricLight.children[1];
            spotLight.intensity = intensity;
            spotLight.penumbra = 1;
            spotLight.decay = 1.5;
            spotLight.distance = spotLight.distance;

            // Adjust cone
            const cone = volumetricLight.children[0];
            const coneUniforms = cone.material.uniforms;
            coneUniforms.attenuation.value = 12.5;
            coneUniforms.anglePower.value = 2;
            coneUniforms.edgeScale.value = 0.5; // Adjust this value as needed
            coneUniforms.edgeConstractPower.value = 1; // Adjust this value as needed

            // LookAt
            const target = new THREE.Object3D();
            target.position.set(volumetricLight.position.x, volumetricLight.position.y - height, volumetricLight.position.z);
            this.scene.add(target); // Add the target to the scene
            spotLight.target = target;
            
            // Make the light look at the target
            volumetricLight.lookAt(spotLight.target.position);
        
            // bloom
            const lightMesh = volumetricLight.children[2]
            const reflector = lightMesh.children[0].children[5]
            reflector.traverse((child) => {
                if (child.isMesh) {
                   this.bloom.push(child)
                }
            });


            group.add(volumetricLight)
            }
    
        this.scene.add(group)
        this.lightGroups['navLights'] = group; // Store the group by object name or ID

        // Debug
        if (this.debug.active) {
            const debugObject = {
            radiusBottom: group.children[0].children[0].geometry.parameters.radiusBottom,
            attenuation: group.children[0].children[0].material.uniforms.attenuation.value,
            anglePower: group.children[0].children[0].material.uniforms.anglePower.value,
            lightIntensity: group.children[0].children[1].intensity,
            lightAngle: group.children[0].children[1].angle,
            lightPenumbra: group.children[0].children[1].penumbra,
            lightDecay: group.children[0].children[1].decay,
            edgeScale: group.children[0].children[0].material.uniforms.edgeScale.value,
            edgeConstractPower: group.children[0].children[0].material.uniforms.edgeConstractPower.value,
            height: 10,
            };

            const navFolder = this.debugFolder.addFolder('Navigational Lights');
            navFolder.close();

            //helpers
            const spotLightHelpers = [];
            group.children.forEach((light) => {
                const spotLightHelper = new THREE.SpotLightHelper(light.children[1]);
                this.scene.add(spotLightHelper);
                spotLightHelper.visible = false
                spotLightHelpers.push(spotLightHelper);
            });
            
            navFolder
            .add({ showHelpers: false }, 'showHelpers')
            .name('Show Helpers')
            .onChange((value) => {
                spotLightHelpers.forEach((helper) => {
                helper.visible = value;
                });
            });
  
            navFolder
            .add(debugObject, 'attenuation')
            .name('Attenuation')
            .step(0.001)
            .min(0)
            .max(20)
            .onChange((value) => {
                group.children.forEach((spotLight) => {
                spotLight.children[0].material.uniforms.attenuation.value = value;
                });
            });

            navFolder
            .add(debugObject, 'anglePower')
            .name('AnglePower')
            .step(0.001)
            .min(0)
            .max(20)
            .onChange((value) => {
                group.children.forEach((spotLight) => {
                spotLight.children[0].material.uniforms.anglePower.value = value;
                });
            });

            navFolder
            .add(debugObject, 'lightIntensity')
            .name('Light Intensity')
            .step(0.001)
            .min(0)
            .max(1000)
            .onChange((value) => {
                group.children.forEach((spotLight) => {
                spotLight.children[1].intensity = value;
                });
            });

            navFolder
            .add(debugObject, 'lightAngle')
            .name('Light Angle')
            .step(0.001)
            .min(0)
            .max(Math.PI / 2)
            .onChange((value) => {
                group.children.forEach((spotLight) => {
                spotLight.children[1].angle = value;
                });
            });

            navFolder
            .add(debugObject, 'lightPenumbra')
            .name('Light Penumbra')
            .step(0.001)
            .min(0)
            .max(1)
            .onChange((value) => {
                group.children.forEach((spotLight) => {
                spotLight.children[1].penumbra = value;
                });
            });

            navFolder
            .add(debugObject, 'lightDecay')
            .name('Light Decay')
            .step(0.001)
            .min(0)
            .max(2)
            .onChange((value) => {
                group.children.forEach((spotLight) => {
                spotLight.children[1].decay = value;
                });
            });

            navFolder
            .add(debugObject, 'edgeScale')
            .name('Edge Scale')
            .step(0.001)
            .min(0)
            .max(1)
            .onChange((value) => {
                group.children.forEach((spotLight) => {
                spotLight.children[0].material.uniforms.edgeScale.value = value;
                });
            });

            navFolder
            .add(debugObject, 'edgeConstractPower')
            .name('Edge Constract Power')
            .step(0.001)
            .min(0)
            .max(1)
            .onChange((value) => {
                group.children.forEach((spotLight) => {
                spotLight.children[0].material.uniforms.edgeConstractPower.value = value;
                });
            });
        }
    }

    setCatwalk(count, height = 10, coneRadius = 3, intensity = 100)
    {
    const group = new THREE.Group()
    const gap = this.scene_0.walkLength  / (count - 1)
    this.lightAreas = [];

    for (let i = 0; i < count; i++) {

        const volumetricLight = new VolumetricSpotLight('white', coneRadius, height, 100)

        // Adjust light
        const spotLight = volumetricLight.children[1];
        spotLight.intensity = intensity;
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
        volumetricLight.position.z += i * gap + (this.scene_0.walkStart); 
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
        volumetricLight.lookAt(spotLight.target.position);    // Make the light look at the target

        const lightMesh = volumetricLight.children[2]
        const reflector = lightMesh.children[0].children[5]
        reflector.traverse((child) => {
            if (child.isMesh) {
               this.bloom.push(child)
            }
        });


        // Calculate the area on the floor lit by the light
        const lightArea = {
            position: new THREE.Vector3(volumetricLight.position.x, 0, volumetricLight.position.z),
            radius: coneRadius
        };
        this.lightAreas.push(lightArea);

        group.add(volumetricLight)
    }

    this.scene.add(group)
    this.lightGroups['catWalk'] = group; // Store the group by object name or ID

    // Debug
    if (this.debug.active) {

        const catWalkFolder = this.debugFolder.addFolder(' catWalk ')
        catWalkFolder.close()

        const debugObject = {
            attenuation: group.children[0].children[0].material.uniforms.attenuation.value,
            anglePower: group.children[0].children[0].material.uniforms.anglePower.value,
            lightIntensity: group.children[0].children[1].intensity,
            lightAngle: group.children[0].children[1].angle,
            lightPenumbra: group.children[0].children[1].penumbra,
            lightDecay: group.children[0].children[1].decay,
            edgeScale: group.children[0].children[0].material.uniforms.edgeScale.value,
            edgeConstractPower: group.children[0].children[0].material.uniforms.edgeConstractPower.value,
            shadowCameraNear: group.children[0].children[1].shadow.camera.near,
            shadowCameraFar: group.children[0].children[1].shadow.camera.far,
        };


        //helpers
        const spotLightHelpers = [];
        const shadowHelpers = [];
        group.children.forEach((light) => {
            const spotLightHelper = new THREE.SpotLightHelper(light.children[1]);
            this.scene.add(spotLightHelper);
            spotLightHelper.visible = false; 
            spotLightHelpers.push(spotLightHelper);

            const shadowCameraHelper = new THREE.CameraHelper(light.children[1].shadow.camera);
            this.scene.add(shadowCameraHelper);
            shadowCameraHelper.visible = false; 
            shadowHelpers.push(shadowCameraHelper);
        });
        
        catWalkFolder
        .add({ showHelpers: false }, 'showHelpers')
        .name('Show Helpers')
        .onChange((value) => {
            spotLightHelpers.forEach((helper) => {
            helper.visible = value;
            });
            shadowHelpers.forEach((helper) => {
            helper.visible = value;
            });
        });
  
        catWalkFolder
            .add(debugObject, 'attenuation')
            .name('Attenuation')
            .step(0.001)
            .min(0)
            .max(20)
            .onChange((value) => {
                group.children.forEach((light) => {
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
                group.children.forEach((light) => {
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
                group.children.forEach((light) => {
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
                group.children.forEach((light) => {
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
                group.children.forEach((light) => {
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
                group.children.forEach((light) => {
                    light.children[0].material.uniforms.edgeConstractPower.value = value;
                });
            });
    }

    }

    setObjectLight(object, count, radius = 5, height = 10, coneLength = 10, coneRadius = 3, shadowEnabled = true, intensity = 100)
    {
    const group = new THREE.Group()

    // calculate the lookAt object's world position
    const localPosition = new THREE.Vector3()
    object.localToWorld(localPosition)

    const addLights = (count, radius, height, coneLength, coneRadius, shadowEnabled) => {
    for (let i = 0; i < count; i++)
    {
    const gap = 360 / count
    const volumetricLight = new VolumetricSpotLight('white', coneRadius, coneLength, 10)

    // each light group positioned on a circle
    volumetricLight.position.x = Math.cos(THREE.MathUtils.degToRad(gap * i)) * radius;
    volumetricLight.position.z = Math.sin(THREE.MathUtils.degToRad(gap * i)) * radius;
    volumetricLight.position.y = height

    // Adjust light
    const spotLight = volumetricLight.children[1];
    spotLight.intensity = intensity;
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

    // add the object's position to the lights position
    group.position.x = localPosition.x
    group.position.z = localPosition.z

    // lookAt the object
    volumetricLight.lookAt(0, 0, 0)
    spotLight.target = object

    //bloom
    const lightMesh = volumetricLight.children[2]
    const reflector = lightMesh.children[0].children[5]
    reflector.traverse((child) => {
        if (child.isMesh) {
           this.bloom.push(child)
        }
    });

    group.add(volumetricLight)
    }
    }

    addLights(count, radius, height, coneLength, coneRadius, shadowEnabled)

    // add
    this.scene.add(group)
    this.lightGroups[object.name] = group; // Store the group by object name or ID

    // Debug
    if (this.debug.active) {

    //  Helpers
    const spotLightHelpers = [];
    const shadowHelpers = [];
    group.children.forEach((light) => {
        const spotLightHelper = new THREE.SpotLightHelper(light.children[1]);
        this.scene.add(spotLightHelper);
        spotLightHelper.visible = false;
        spotLightHelpers.push(spotLightHelper); // Store reference

        const shadowCameraHelper = new THREE.CameraHelper(light.children[1].shadow.camera);
        this.scene.add(shadowCameraHelper);
        shadowCameraHelper.visible = false;
        shadowHelpers.push(shadowCameraHelper); // Store reference
    });

    // Function to update SpotLightHelpers
    const updateSpotLightHelpers = () => {
        spotLightHelpers.forEach(helper => helper.update());
    };

    // Folder
    const debugFolder = this.debugFolder.addFolder(`${object.name}`);
    debugFolder.close();

    const debugObject = {
        intensity: group.children[0].children[1].intensity,
        positionY: group.children[0].position.y,
        attenuation: group.children[0].children[0].material.uniforms.attenuation.value,
        anglePower: group.children[0].children[0].material.uniforms.anglePower.value,
        edgeScale: group.children[0].children[0].material.uniforms.edgeScale.value,
        edgeConstractPower: group.children[0].children[0].material.uniforms.edgeConstractPower.value,
        count: count, // Add this line
        coneRadius: coneRadius
    };
 
    this[`${object.name}Speed`] = 0.01;
    
    debugFolder
        .add(this, `${object.name}Speed`)
        .name('Speed')
        .min(0)
        .max(1)
        .step(0.01)
        .onChange((value) => {
            this[`${object.name}Speed`] = value;
        });

    debugFolder
        .add(debugObject, 'count')
        .name('Light Count')
        .min(0)
        .max(20)
        .step(1)
        .onChange((value) => {
            // Clear existing lights
            while (group.children.length > 0) {
                const child = group.children[0];
                child.traverse((object) => {
                    if (object.isMesh) {
                        object.geometry.dispose();
                        object.material.dispose();
                    }
                });
                group.remove(child);
            }
            addLights(value, radius, height, coneLength, coneRadius, shadowEnabled)
        });

        debugFolder
        .add({ showHelpers: false }, 'showHelpers')
        .name('Show Helpers')
        .onChange((value) => {
        spotLightHelpers.forEach(helper => helper.visible = value);
        shadowHelpers.forEach(helper => helper.visible = value);
        });

    debugFolder
        .add({ radius }, 'radius')
        .name('Circle Radius')
        .min(0)
        .max(20)
        .step(0.1)
        .onChange((value) => {
        group.children.forEach((volumetricLight, index) => {
            const count = group.children.length
            const gap = 360 / count;
            volumetricLight.position.x = Math.cos(THREE.MathUtils.degToRad(gap * index)) * value;
            volumetricLight.position.z = Math.sin(THREE.MathUtils.degToRad(gap * index)) * value;
            volumetricLight.lookAt(localPosition)

        });

        updateSpotLightHelpers()
        });

    debugFolder
        .add(group.rotation, 'y')
        .name('Rotation Y')
        .min(0)
        .max(Math.PI * 2)
        .step(0.01)
        .onChange((value) => {
            group.rotation.y = value;
            updateSpotLightHelpers();
        });

    debugFolder
        .add(debugObject, 'positionY')
        .name('Position Y')
        .min(-10)
        .max(10)
        .step(0.1)
        .onChange((value) => {
        group.children.forEach((volumetricLight) => {
            volumetricLight.position.y = value;
            volumetricLight.lookAt(localPosition)
        });
        updateSpotLightHelpers()
        });


    debugFolder
    .add(debugObject, 'coneRadius')
    .name('Cone Radius')
    .min(0)
    .max(20)
    .step(1)
    .onChange((value) => {
        // Clear existing lights
        while (group.children.length > 0) {
            const child = group.children[0];
            child.traverse((object) => {
                if (object.isMesh) {
                    object.geometry.dispose();
                    object.material.dispose();
                }
            });
            group.remove(child);
        }
        addLights(count, radius, height, coneLength, value, shadowEnabled)
    });

    debugFolder
        .add(debugObject, 'intensity')
        .name('Intensity')
        .min(0)
        .max(1000)
        .step(0.1)
        .onChange((value) => {
            group.children.forEach((volumetricLight) => {
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
            group.children.forEach((volumetricLight) => {
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
            group.children.forEach((volumetricLight) => {
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
            group.children.forEach((volumetricLight) => {
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
            group.children.forEach((volumetricLight) => {
                volumetricLight.children[0].material.uniforms.edgeConstractPower.value = value;
            });
        });
}
    
    }

    setRoomSpotlight()
    {
        // Spotlight
        const spotLight = new THREE.SpotLight(0xffffff, 25, 0, 50 * (Math.PI / 180), 0.5, 2)
        const worldPosition = new THREE.Vector3();
        this.scene_3.bulb.getWorldPosition(worldPosition);

        spotLight.position.copy(worldPosition)
        spotLight.position.y += 0.5
        spotLight.target.position.set(spotLight.position.x, spotLight.position.y - 1, spotLight.position.z);
        spotLight.target.updateMatrixWorld();        
        this.scene.add(spotLight)

        // Shadow
        spotLight.castShadow = true

        // Debug
        if (this.debug.active)
        {
            const scene3Folder = this.scene3Folder.addFolder('Spotlight')
            scene3Folder.close()

            const debugObject = {
            intensity: spotLight.intensity,
            distance: spotLight.distance,
            angle: spotLight.angle,
            penumbra: spotLight.penumbra,
            decay: spotLight.decay,
            active: true,
            shadows: true
            };

            // Add checkbox to toggle point light
            scene3Folder
            .add(debugObject, 'active')
            .name('Active')
            .onChange((value) => {
                spotLight.visible = value;
            });

            // Add checkbox to toggle shadows
            scene3Folder
            .add(debugObject, 'shadows')
            .name('Shadows')
            .onChange((value) => {
                spotLight.castShadow = value;
            });

            // Helpers
            const shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
            shadowCameraHelper.visible = false;
            const spotLightHelper = new THREE.SpotLightHelper(spotLight);
            spotLightHelper.visible = false;
            this.scene.add(shadowCameraHelper, spotLightHelper);

            scene3Folder
            .add({ showHelpers: false }, 'showHelpers')
            .name('Show Helpers')
            .onChange((value) => {
                shadowCameraHelper.visible = value;
                spotLightHelper.visible = value;
            });

            scene3Folder
            .add(debugObject, 'intensity')
            .name('Intensity')
            .min(0)
            .max(1000)
            .step(0.1)
            .onChange((value) => {
                spotLight.intensity = value;
                spotLightHelper.update();
            });

            scene3Folder
            .add(debugObject, 'distance')
            .name('Distance')
            .min(0)
            .max(1000)
            .step(0.1)
            .onChange((value) => {
                spotLight.distance = value;
                spotLightHelper.update();
            });

            scene3Folder
            .add(debugObject, 'angle')
            .name('Angle')
            .min(0)
            .max(Math.PI / 2)
            .step(0.01)
            .onChange((value) => {
                spotLight.angle = value;
                spotLightHelper.update();
            });

            scene3Folder
            .add(debugObject, 'penumbra')
            .name('Penumbra')
            .min(0)
            .max(1)
            .step(0.01)
            .onChange((value) => {
                spotLight.penumbra = value;
                spotLightHelper.update();
            });

            scene3Folder
            .add(debugObject, 'decay')
            .name('Decay')
            .min(0)
            .max(2)
            .step(0.01)
            .onChange((value) => {
                spotLight.decay = value;
                spotLightHelper.update();
            });

            // Add controls for shadow camera near and far
            scene3Folder
            .add(spotLight.shadow.camera, 'near')
            .name('Shadow Near')
            .min(0.1)
            .max(100)
            .step(0.1)
            .onChange(() => {
                spotLight.shadow.camera.updateProjectionMatrix();
                shadowCameraHelper.update();
            });

            scene3Folder
            .add(spotLight.shadow.camera, 'far')
            .name('Shadow Far')
            .min(0.1)
            .max(100)
            .step(0.1)
            .onChange(() => {
                spotLight.shadow.camera.updateProjectionMatrix();
                shadowCameraHelper.update();
            });

            scene3Folder
            .add(spotLight.shadow.camera, 'fov')
            .name('Shadow FOV')
            .min(1)
            .max(120)
            .step(1)
            .onChange(() => {
                spotLight.shadow.camera.updateProjectionMatrix();
                shadowCameraHelper.update();
            });

            scene3Folder
            .add(spotLight.shadow, 'bias')
            .name('Shadow Bias')
            .min(-0.01)
            .max(0.01)
            .step(0.0001)
            .onChange(() => {
                shadowCameraHelper.update();
            });

            scene3Folder
            .add(spotLight.shadow, 'radius')
            .name('Shadow Radius')
            .min(0)
            .max(10)
            .step(0.1)
            .onChange(() => {
                shadowCameraHelper.update();
            });
        }
    }

    setRoomPointLight()
    {
        // Point Light
        const pointLight = new THREE.PointLight(0xffffff, 5, 100, 2);
        const worldPosition = new THREE.Vector3();
        this.scene_3.bulb.getWorldPosition(worldPosition);

        pointLight.position.copy(worldPosition)
        pointLight.position.y += 0.5
        this.scene.add(pointLight)

        // Debug
        if (this.debug.active)
        {
            const scene3Folder = this.scene3Folder.addFolder('PointLight')
            scene3Folder.close()

            const debugObject = {
            intensity: pointLight.intensity,
            distance: pointLight.distance,
            decay: pointLight.decay,
            active: true, // Add active property to control the light
            shadows: false
            };

            // Add checkbox to toggle point light
            scene3Folder
            .add(debugObject, 'active')
            .name('Active')
            .onChange((value) => {
                pointLight.visible = value;
            });


            // Add checkbox to toggle shadows
            scene3Folder
            .add(debugObject, 'shadows')
            .name('Shadows')
            .onChange((value) => {
                pointLight.castShadow = value;
            });

            scene3Folder
            .add(debugObject, 'intensity')
            .name('Intensity')
            .min(0)
            .max(1000)
            .step(0.1)
            .onChange((value) => {
                pointLight.intensity = value;
                shadowCameraHelper.update();
            });

            scene3Folder
            .add(debugObject, 'distance')
            .name('Distance')
            .min(0)
            .max(100)
            .step(0.1)
            .onChange((value) => {
                pointLight.distance = value;
                shadowCameraHelper.update();
            });

            scene3Folder
            .add(debugObject, 'decay')
            .name('Decay')
            .min(0)
            .max(2)
            .step(0.01)
            .onChange((value) => {
                pointLight.decay = value;
                shadowCameraHelper.update();
            });
        }
    }

    setBloom()
    {
    this.bloom.forEach((child) => {this.renderer.selectiveBloom.selection.add(child)})

    // const bulb = this.scene_3.empty.children[1].children[0]
    // const frame = this.scene_3.empty.children[1].children[1]
    
    // bulb.material = new THREE.MeshStandardMaterial({
    //     emissive: new THREE.Color(0x808080),
    //     emissiveIntensity: 10,
    //     color: new THREE.Color(0x0000000),
    //     roughness: 0,
    //     metalness: 1 
    // });

    // frame.material = new THREE.MeshStandardMaterial({
    //     emissive: new THREE.Color(0x808080),
    //     emissiveIntensity: 3,
    //     color: new THREE.Color(0x0000000),
    //     roughness: 0,
    //     metalness: 1 
    // });

    // this.renderer.selectiveBloom.selection.add(bulb, frame)
    }

    updateEnvMap()
    {
        const animatedModel = this.scene_0.animatedModel;
        const modelPosition = new THREE.Vector3();
        animatedModel.getWorldPosition(modelPosition);
    
        let isWithinLightArea = false;
    
        for (const lightArea of this.lightAreas) {
            const distance = modelPosition.distanceTo(lightArea.position);
            if (distance <= lightArea.radius) {
                isWithinLightArea = true;
                break;
            }
        }
    
        animatedModel.traverse((child) => {
            if (child.isMesh) {
                const targetIntensity = isWithinLightArea ? 1 : 0;
                const currentIntensity = child.material.envMapIntensity || 0;
                const fadeIn = 0.0025
                const fadeOut = 0.25
                const fadeSpeed = isWithinLightArea ? fadeIn : fadeOut; // Faster fade out
    
                child.material.envMapIntensity = THREE.MathUtils.lerp(currentIntensity, targetIntensity, fadeSpeed);
                child.material.envMap = this.resources.items.blueStudio;
                child.material.needsUpdate = true;
            }
        });
    }

    update()
    {
        this.lightGroups.pose.rotation.y += this.poseSpeed
        this.lightGroups.sphere.rotation.y += this.sphereSpeed
        if(this.lightGroups.furniture)
        {
        this.lightGroups.furniture.rotation.y +=  this.furnitureSpeed
        }
        // this.updateEnvMap()
    }
}