import * as THREE from 'three';
import Experience from '../Experience.js'

export default class VolumetricSpotLight {

    constructor(color = 'grey', attenuation = 6, radiusBottom = 1, anglePower = 0.1 * Math.PI, intensity = 100, distance = 6, angle = 0.1 * Math.PI, penumbra = 1, decay = 0) {
        
        // Setup
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.camera = this.experience.camera.instance
        this.sizes = this.experience.sizes
        this.height = this.sizes.height
        this.width = this.sizes.width

        // Parameters
        this.color = color;
        this.attenuation = attenuation; 
        this.anglePower = anglePower; 
        this.radiusBottom = radiusBottom
        this.distance = distance;
        this.intensity = intensity;
        this.angle = angle;
        this.penumbra = penumbra;
        this.decay = decay;
    
        
        // Position
        this.positionX = 0;
        this.positionY = 5;
        this.positionZ = 0;

        // Group
        this.group = new THREE.Group();

        // Init
        this.setShader();
        this.setMaterial();
        this.setGeometry();
        this.setCone();
        this.setLight();
        // this.setHelper()

        return this.group;
    }

    setShader() {
        this.vertexShader = `
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            void main(){
                // compute intensity
                vNormal = normalize(normalMatrix * normal);
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                // set gl_Position
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        this.fragmentShader = `
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            uniform vec3 lightColor;
            uniform vec3 spotPosition;
            uniform float attenuation;
            uniform float anglePower;
            uniform float edgeScale;
            uniform float cameraNear;
            uniform float cameraFar;
            uniform float screenWidth;
            uniform float screenHeight;
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
                intensity = distance(vWorldPosition, spotPosition) / attenuation;
                intensity = 1.0 - clamp(intensity, 0.0, 1.0);

                // intensity on angle
                vec3 normal = vec3(vNormal.x, vNormal.y, abs(vNormal.z));
                float angleIntensity = pow(dot(normal, vec3(0.0, 0.0, 1.0)), anglePower);
                intensity = intensity * angleIntensity;

                // SOFT EDGES
                vec2 depthUV = vec2(gl_FragCoord.x / screenWidth, gl_FragCoord.y / screenHeight);
                float sceneDepth = unpackDepth(texture2D(tDepth, depthUV));
                float fragDepth = gl_FragCoord.z / gl_FragCoord.w;
                fragDepth = 1.0 - smoothstep(cameraNear, cameraFar, fragDepth);
                float deltaDepth = abs(sceneDepth - fragDepth) * edgeScale;

                #ifdef EDGE_CONSTRAST_SMOOTH
                    float edgeIntensity = 0.5 * pow(clamp(2.0 * ((deltaDepth > 0.5) ? 1.0 - deltaDepth : deltaDepth), 0.0, 1.0), edgeConstractPower);
                    edgeIntensity = (deltaDepth > 0.5) ? 1.0 - edgeIntensity : edgeIntensity;
                #endif

                intensity = intensity * edgeIntensity;

                // final color
                gl_FragColor = vec4(lightColor, intensity);
            }
        `;
    }

    setMaterial() {
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                attenuation: { type: "f", value: this.attenuation },
                anglePower: { type: "f", value: Math.cos(this.anglePower) },
                edgeScale: { type: "f", value: 20.0 }, // Adjust this value as needed
                edgeConstractPower: { type: "f", value: 1.5 }, // Adjust this value as needed
                cameraNear: { type: "f", value: this.camera.near },
                cameraFar: { type: "f", value: this.camera.far },
                screenWidth: { type: "f", value: this.sizes.width },
                screenHeight: { type: "f", value: this.sizes.height },
                spotPosition: { type: "v3", value: new THREE.Vector3(this.positionX, this.positionY, this.positionZ) },
                tDepth: { type: "t", value: null }, // This should be set to the depth texture
                lightColor: { type: "c", value: new THREE.Color(this.color) },
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            // side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });

    }

    setGeometry() {
        const radiusTop = 0.1;
        const height = this.distance;
        this.geometry = new THREE.CylinderGeometry(radiusTop, this.radiusBottom, height, 128, 20, true);
        this.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -this.geometry.parameters.height / 2, 0));
        this.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.geometry.computeVertexNormals();
    }

    setCone() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.positionX, this.positionY, this.positionZ);
        this.mesh.rotation.x = Math.PI / 2; // Point downwards
        this.group.add(this.mesh);
    }

    setLight() {
        this.spotLight = new THREE.SpotLight(this.color, this.intensity, 0, this.angle, this.penumbra, this.decay);
        this.spotLight.position.set(this.positionX, this.positionY, this.positionZ);
        this.target = new THREE.Object3D();
        this.spotLight.target = this.target;

        this.group.add(this.spotLight);
        this.group.add(this.target);
    }

    setHelper() {
                this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
                this.group.add(this.spotLightHelper);
    }
}