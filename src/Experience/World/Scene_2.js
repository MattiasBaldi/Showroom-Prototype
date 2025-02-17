import * as THREE from 'three'
import Experience from '../Experience'
import vertexShader from '../shaders/sphere/vertex.glsl'
import fragmentShader from '../shaders/sphere/fragment.glsl'
import Microphone from '../Microphone.js'
import Switch from '../Controls/Switch'


export default class Sphere
{
    constructor()
    {
        this.experience = new Experience()
        this.microphone = new Microphone()
        this.renderer = this.experience.renderer
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.controls = this.camera.controls
        this.timeFrequency = 0.0003
        this.elapsedTime = 0

        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Scene 2 (Sound sphere)');    
            this.debugFolder.close()    

            this.debugFolder
            .add(this,'timeFrequency').min(0).max(0.001).step(0.000001)
        }
        
        this.setGeometry()
        this.setLights()
        this.setOffset()
        this.setMaterial()
        this.setSphere()
        this.setBloom()
        this.setVariations()

        // Switch
        this.switch = new Switch(this.sphere, 10)
    }

    setVariations()
    {
        this.variations = {}

        this.variations.volume = {}
        this.variations.volume.target = 0
        this.variations.volume.current = 0
        this.variations.volume.upEasing = 0.03
        this.variations.volume.downEasing = 0.002
        this.variations.volume.getValue = () =>
        {
            const level0 = this.microphone.levels[0] || 0
            const level1 = this.microphone.levels[1] || 0
            const level2 = this.microphone.levels[2] || 0

            return Math.max(level0, level1, level2) * 0.3
        }
        this.variations.volume.getDefault = () =>
        {
            return 0.152
        }

        this.variations.lowLevel = {}
        this.variations.lowLevel.target = 0
        this.variations.lowLevel.current = 0
        this.variations.lowLevel.upEasing = 0.005
        this.variations.lowLevel.downEasing = 0.002
        this.variations.lowLevel.getValue = () =>
        {
            let value = this.microphone.levels[0] || 0
            value *= 0.003
            value += 0.0001
            value = Math.max(0, value)

            return value
        }
        this.variations.lowLevel.getDefault = () =>
        {
            return 0.0003
        }
        
        this.variations.mediumLevel = {}
        this.variations.mediumLevel.target = 0
        this.variations.mediumLevel.current = 0
        this.variations.mediumLevel.upEasing = 0.008
        this.variations.mediumLevel.downEasing = 0.004
        this.variations.mediumLevel.getValue = () =>
        {
            let value = this.microphone.levels[1] || 0
            value *= 2
            value += 3.587
            value = Math.max(3.587, value)

            return value
        }
        this.variations.mediumLevel.getDefault = () =>
        {
            return 3.587
        }
        
        this.variations.highLevel = {}
        this.variations.highLevel.target = 0
        this.variations.highLevel.current = 0
        this.variations.highLevel.upEasing = 0.02
        this.variations.highLevel.downEasing = 0.001
        this.variations.highLevel.getValue = () =>
        {
            let value = this.microphone.levels[2] || 0
            value *= 5
            value += 0.5
            value = Math.max(0.5, value)

            return value
        }
        this.variations.highLevel.getDefault = () =>
        {
            return 0.65
        }
    }

    removeVariations()
    {
        if (this.variations) {
            delete this.variations;
        }
    }

    setLights()
    {
        this.lights = {}

        // Light A
        this.lights.a = {}

        this.lights.a.intensity = 0.7
        this.lights.a.color = {}
        this.lights.a.color.value = '#ffffff'
        this.lights.a.color.instance = new THREE.Color(this.lights.a.color.value)
        this.lights.a.spherical = new THREE.Spherical(1, 2, -2.915)

        // Light B
        this.lights.b = {}

        this.lights.b.intensity = 0.7
        this.lights.b.color = {}
        this.lights.b.color.value = '#ffffff'
        this.lights.b.color.instance = new THREE.Color(this.lights.b.color.value)
        this.lights.b.spherical = new THREE.Spherical(1, 0.5, - 0.185)

        if(this.debug.active)
        {
            for(const _lightName in this.lights)
            {
            const light = this.lights[_lightName]
            
            const debugFolder = this.debugFolder.addFolder(_lightName)
            debugFolder.close()

            debugFolder
                .addColor(light.color, 'value')
                .name('color')
                .onChange(() =>
                {
                light.color.instance.set(light.color.value)
                })

            debugFolder
                .add(light, 'intensity', 0, 10)
                .onChange(() =>
                {
                this.material.uniforms[`uLight${_lightName.toUpperCase()}Intensity`].value = light.intensity
                })

            debugFolder
                .add(light.spherical, 'phi', 0, Math.PI, 0.001)
                .name('phi')
                .onChange(() =>
                {
                this.material.uniforms[`uLight${_lightName.toUpperCase()}Position`].value.setFromSpherical(light.spherical)
                })

            debugFolder
                .add(light.spherical, 'theta', -Math.PI, Math.PI, 0.001)
                .name('theta')
                .onChange(() =>
                {
                this.material.uniforms[`uLight${_lightName.toUpperCase()}Position`].value.setFromSpherical(light.spherical)
                })
            }
        }
    }

    setOffset()
    {
        this.offset = {}
        this.offset.spherical = new THREE.Spherical(1, Math.random() * Math.PI, Math.random() * Math.PI * 2)
        this.offset.direction = new THREE.Vector3()
        this.offset.direction.setFromSpherical(this.offset.spherical)
    }

    setGeometry()
    {
        this.geometry = new THREE.SphereGeometry(1, 512, 512)
        this.geometry.computeTangents()
    }

    setMaterial()
    {
        this.material = new THREE.ShaderMaterial({
            uniforms:
            {
                uLightAColor: { value: this.lights.a.color.instance },
                uLightAPosition: { value: new THREE.Vector3(1, 100, 0) },
                uLightAIntensity: { value: this.lights.a.intensity },

                uLightBColor: { value: this.lights.b.color.instance },
                uLightBPosition: { value: new THREE.Vector3(- 1, - 100, 0) },
                uLightBIntensity: { value: this.lights.b.intensity },

                uSubdivision: { value: new THREE.Vector2(this.geometry.parameters.widthSegments, this.geometry.parameters.heightSegments) },

                uOffset: { value: new THREE.Vector3() },

                uDistortionFrequency: { value: 1 },
                uDistortionStrength: { value: 0.5 },
                uDisplacementFrequency: { value: 2 },
                uDisplacementStrength: { value: 0.5 },

                uFresnelOffset: { value: 1 },
                uFresnelMultiplier: { value: 2.519 },
                uFresnelPower: { value: 0.2 },

                uTime: { value: 0 },

            },
            defines:
            {
                USE_TANGENT: ''
            },

            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })

        this.material.uniforms.uLightAPosition.value.setFromSpherical(this.lights.a.spherical)
        this.material.uniforms.uLightBPosition.value.setFromSpherical(this.lights.b.spherical)
        
        if(this.debug.active)
        {
            this.debugFolder.add(
                this.material.uniforms.uDistortionFrequency,
                'value').name('uDistortionFrequency').min(0).max(10).step(0.001)
            
            
            this.debugFolder
                .add(this.material.uniforms.uDistortionStrength, 'value')
                .name('uDistortionStrength')
                .min(0)
                .max(10)
                .step(0.001)

            this.debugFolder
                .add(this.material.uniforms.uDisplacementFrequency, 'value')
                .name('uDisplacementFrequency')
                .min(0)
                .max(100)
                .step(0.001)

            this.debugFolder
                .add(this.material.uniforms.uDisplacementStrength, 'value')
                .name('uDisplacementStrength')
                .min(0)
                .max(1)
                .step(0.001)

            this.debugFolder
                .add(this.material.uniforms.uFresnelOffset, 'value')
                .name('uFresnelOffset')
                .min(-2)
                .max(2)
                .step(0.001)

            this.debugFolder
                .add(this.material.uniforms.uFresnelMultiplier, 'value')
                .name('uFresnelMultiplier')
                .min(0)
                .max(5)
                .step(0.001)

            this.debugFolder
                .add(this.material.uniforms.uFresnelPower, 'value')
                .name('uFresnelPower')
                .min(0)
                .max(5)
                .step(0.001)
        }
    }

    setSphere()
    {
        this.sphere = new THREE.Mesh(this.geometry, this.material)
        this.sphere.name = 'sphere'
        this.sphere.position.x = - 120; 
        this.sphere.position.y = 1.5; 
        this.sphere.rotation.z = Math.PI * 0.5;  

        this.scene.add(this.sphere) // Add sphere to the group

        // Debug
        if (this.debug.active)
        {
            const debugFolder = this.debugFolder.addFolder('Position')

            debugFolder.add(this.sphere.position, 'x').min(-100).max(100).step(1)
            debugFolder.add(this.sphere.position, 'y').min(0).max(10).step(1)
        }
    }

    updateMicrophone()
    {

        if(this.switch.active && !this.microphone.ready) {
            this.microphone.setMicrophone()
            this.setVariations()


            this.experience.world.audio.sounds.forEach((sound) => {
                const currentTime = sound.gain.context.currentTime;
                sound.gain.gain.setValueAtTime(sound.gain.gain.value, currentTime);
                sound.gain.gain.linearRampToValueAtTime(0.2, currentTime + 3);
            })
        }

        if(!this.switch.active && this.microphone.ready)
            {
                this.microphone.removeMicrophone()
                this.removeVariations()
    
                this.experience.world.audio.sounds.forEach((sound) => {
                    const currentTime = sound.gain.context.currentTime;
                    sound.gain.gain.setValueAtTime(sound.gain.gain.value, currentTime);
                    sound.gain.gain.linearRampToValueAtTime(1, currentTime + 3);
                })
            }
    }

    setBloom()
    {
        this.renderer.selectiveBloom.selection.add(this.sphere)
    }

    update()
    {
        this.switch.update()
        this.updateMicrophone()

        // update sphere
        if(this.microphone.ready)
        {

        this.microphone.update()

        // Update variations
        for(let _variationName in this.variations)
        {
            const variation = this.variations[_variationName]
            variation.target = this.microphone.ready ? variation.getValue() : variation.getDefault()
            
            const easing = variation.target > variation.current ? variation.upEasing : variation.downEasing
            variation.current += (variation.target - variation.current) * easing * this.time.delta
        }

        // Time
        this.timeFrequency = this.variations.lowLevel.current
        this.elapsedTime = this.time.delta * this.timeFrequency

        // Update material
        this.material.uniforms.uDisplacementStrength.value = this.variations.volume.current
        this.material.uniforms.uDistortionStrength.value = this.variations.highLevel.current
        this.material.uniforms.uFresnelMultiplier.value = this.variations.mediumLevel.current

        // Offset
        const offsetTime = this.elapsedTime * 0.3
        this.offset.spherical.phi = ((Math.sin(offsetTime * 0.001) * Math.sin(offsetTime * 0.00321)) * 0.5 + 0.5) * Math.PI
        this.offset.spherical.theta = ((Math.sin(offsetTime * 0.0001) * Math.sin(offsetTime * 0.000321)) * 0.5 + 0.5) * Math.PI * 2
        this.offset.direction.setFromSpherical(this.offset.spherical)
        this.offset.direction.multiplyScalar(this.timeFrequency * 2)

        this.material.uniforms.uOffset.value.add(this.offset.direction)

        // Time
        this.material.uniforms.uTime.value += this.elapsedTime
        }

        if(this.sphere)
        {
            this.sphere.rotation.y += 0.01; 
            this.sphere.rotation.x += 0.01; 
            this.sphere.rotation.z += 0.01; 
        }
    }
}