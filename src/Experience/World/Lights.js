import * as THREE from 'three'
import Experience from '../Experience.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js'
import VolumetricSpotLight from '../Utils/VolumetricLight.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export default class Lights 
{
    constructor()
    {
        this.experience = new Experience()
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.world = this.experience.world
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.scene_1 = this.world.scene_1
        this.scene_2 = this.world.scene_2
        this.scene_3 = this.world.scene_3

        // Debug
        if (this.debug.active) {

            // Ensure this.debugFolder is initialized
            this.debugFolder = this.debug.ui.addFolder('Lights');            
            this.Volumetric = this.debugFolder.addFolder('Volumetric Lights');
            // this.debugFolder.close()
        }

        // Setup
        this. setObjectSpotLight(4, this.scene_1.posedModel)
        this.setSpotlight(6)
 
    }

    setSpotlight(count) 
    {
        this.spotLights = [];

        for (let i = 0; i < count; i++)
        {

            //     constructor(color = 'grey', attenuation = 6, radiusBottom = 1, anglePower = 0.1, intensity = 100, distance = 6, angle = 0.1 * Math.PI, penumbra = 1, decay = 0)
            this.spotLight = new VolumetricSpotLight('white', 5.3, 3.7, 0.1, 10, 5, 0.5, 1, 0)
            this.cone = this.spotLight.children[0]
            this.light = this.spotLight.children[1]


            // Position X
            const gap = 10; 
            const positionX = (i % 2 === 0) ? (i + 1) * gap : -(i + 1) * gap;
            this.spotLight.position.x = positionX;
            this.spotLight.children[0].material.uniforms.spotPosition.value.x = positionX;

            // Position Y 

            this.spotLights.push(this.spotLight)
            this.scene.add(this.spotLight)
        }

//geometry.parameters.thetaLength, //geometry.parameters.thetastart, //this.spotLight.children[0].material.uniforms.spotPosition

    if (this.debug.active) {
        const debugObject = {
            radiusBottom: this.spotLights[0].children[0].geometry.parameters.radiusBottom,
            attenuation: this.spotLights[0].children[0].material.uniforms.attenuation.value,
            anglePower: this.spotLights[0].children[0].material.uniforms.anglePower.value,
            lightDistance: this.spotLights[0].children[1].distance,
            lightIntensity: this.spotLights[0].children[1].intensity,
            lightAngle: this.spotLights[0].children[1].angle,
            lightPenumbra: this.spotLights[0].children[1].penumbra,
            lightDecay: this.spotLights[0].children[1].decay,
            edgeScale: this.spotLights[0].children[0].material.uniforms.edgeScale.value, // Adjust this value as needed
            edgeConstractPower: this.spotLights[0].children[0].material.uniforms.edgeConstractPower.value // Adjust this value as needed
        };

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
            .add(debugObject, 'lightDistance')
            .name('Light Distance')
            .step(0.001)
            .min(0)
            .max(10)
            .onChange((value) => {
                // Update the light distance for all spotlights
                this.spotLights.forEach((spotLight) => {
                    spotLight.children[1].distance = value;
                });
            });

        this.Volumetric
            .add(debugObject, 'lightIntensity')
            .name('Light Intensity')
            .step(0.001)
            .min(0)
            .max(10)
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

    setObjectSpotLight(count, object)
    {
        for (let i = 0; i < count; i++) {
            const spotLight = new THREE.SpotLight('white', 100, 0, Math.PI * 0.1, 0.5, 2);
            const localPosition = new THREE.Vector3();
            object.localToWorld(localPosition.set(0, 0, 0)); // Assuming you want the object's position
        
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

    setCatwalk()
    {
        
    }

    update(){
    }
    
}