import * as THREE from 'three';
import Experience from '../Experience.js'

export default class VolumetricSpotLight {

       constructor(color = 'white', coneRadius = 2, coneHeight = 5, lightIntensity = 500) {
        
        // Setup
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.renderer = this.experience.renderer
        this.scene = this.experience.scene
        this.resources = this.experience.resources
  
        // Parameters
        this.color = color
        this.coneRadius = coneRadius
        this.coneHeight = coneHeight
        this.lightIntensity = lightIntensity

        // Group
        this.group = new THREE.Group();

        // Init
        this.setShader()
        this.setConeMaterial()
        this.setConeGeometry()
        this.setCone()
        this.setLight()
        this.setSpotMesh()
        // this.setHelper()
        this.setBloom()

        return this.group;
    }

    setShader() {
        this.vertexShader = `
        precision highp float;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vFixedSpotPosition;
        void main(){
            // compute intensity
            vNormal = normalize(normalMatrix * normal);
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            // fixed position at the top in local space
            vFixedSpotPosition = (modelMatrix * vec4(0.0, 1.0, 0.0, 1.0)).xyz;
            // set gl_Position
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `;
        
        this.fragmentShader = `
        precision highp float;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vFixedSpotPosition;
        uniform vec3 lightColor;
        uniform float attenuation;
        uniform float anglePower;
        uniform float edgeScale;
        uniform sampler2D tDepth;
    
        #define EDGE_CONSTRAST_SMOOTH
    
        #ifdef EDGE_CONSTRAST_SMOOTH
            uniform float edgeConstractPower;
        #endif
    
        float unpackDepth(const in vec4 rgba_depth) {
            const vec4 bit_shift = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
            float depth = dot(rgba_depth, bit_shift);
            return depth;
        }
    
        void main(){
            float intensity;
    
            // distance attenuation
            intensity = distance(vWorldPosition, vFixedSpotPosition) / attenuation;
            intensity = 1.0 - clamp(intensity, 0.0, 1.0);
    
            // intensity on angle
            vec3 normal = vec3(vNormal.x, vNormal.y, abs(vNormal.z));
            float angleIntensity = pow(dot(normal, vec3(0.0, 0.0, 1.0)), anglePower);
            intensity = intensity * angleIntensity;
    
            // SOFT EDGES
            float deltaDepth = abs(unpackDepth(texture2D(tDepth, gl_FragCoord.xy / vec2(1.0))) - gl_FragCoord.z / gl_FragCoord.w) * edgeScale;
    
            #ifdef EDGE_CONSTRAST_SMOOTH
                float edgeIntensity = 0.5 * pow(clamp(2.0 * ((deltaDepth > 0.5) ? 1.0 - deltaDepth : deltaDepth), 0.0, 1.0), edgeConstractPower);
                edgeIntensity = (deltaDepth > 0.5) ? 1.0 - edgeIntensity : edgeIntensity;
            #endif
    
            intensity = intensity * edgeIntensity;
    
            // final color
            gl_FragColor = vec4(lightColor, intensity);
    
            // Apply smooth blending to the edges
            gl_FragColor.a = smoothstep(0.0, 1.0, intensity);
        }
        `;
    }
    
    setConeMaterial() {
        this.material = new THREE.ShaderMaterial({
            precision: 'lowp', 
            uniforms: {
                attenuation: { type: "f", value: 1 },
                anglePower: { type: "f", value: Math.cos(1) },
                edgeScale: { type: "f", value: 20.0 }, // Adjust this value as needed
                edgeConstractPower: { type: "f", value: 1.5 }, // Adjust this value as needed
                tDepth: { type: "t", value: null }, // This should be set to the depth texture
                lightColor: { type: "c", value: new THREE.Color(this.color) }
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
    }

    setConeGeometry() {
        const radiusTop = 0.1;
        this.geometry = new THREE.CylinderGeometry(radiusTop, this.coneRadius, this.coneHeight, 128, 20, true);
        this.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -this.geometry.parameters.height / 2, 0));
        this.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.geometry.computeVertexNormals();
    }

    setCone() {
        this.cone = new THREE.Mesh(this.geometry, this.material);
        this.cone.name = 'Cone'
        this.cone.position.set(0, 0, 0)
        this.group.add(this.cone);
    }

    setSpotMesh()
    {
        this.lightMesh = this.resources.items.light.scene
        this.lightMesh.scale.setScalar(0.35)
        this.lightMesh.position.set(0, 0, 0)
        this.group.add(this.lightMesh.clone())
    }

    setLight() {
        const angle = Math.atan(this.coneRadius / this.coneHeight); // Calculate the angle
        this.spotLight = new THREE.SpotLight(this.color, this.lightIntensity, 0, angle, 0.5, 0);
        this.spotLight.position.set(0, 0, 0)
        this.group.add(this.spotLight);
    }

    setBloom() {
        const bloom = this.renderer.selectiveBloom;
    
    this.lightMesh.traverse(child => {
        bloom.selection.add(child);
    });
    }

    setHelper() {
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
    this.group.add(this.spotLightHelper);
    }

}