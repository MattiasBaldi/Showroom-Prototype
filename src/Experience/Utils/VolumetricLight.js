import * as THREE from 'three';

export default class VolumetricSpotLight {

    constructor(color = 'grey', intensity = 10, distance = 20, angle = 0.1 * Math.PI, penumbra = 1, decay = 0) {
        
        // Parameters
        this.color = color;
        this.intensity = intensity;
        this.distance = distance;
        this.angle = angle;
        this.penumbra = penumbra;
        this.decay = decay;

        this.positionX = 0;
        this.positionY = 5;
        this.positionZ = 10;


        // Group
        this.group = new THREE.Group();

        // Init
        this.setShader();
        this.setMaterial();
        this.setGeometry();
        this.setCone();
        this.setLight();

        console.log(this.spotLight.position)
        console.log(this.mesh.position)
        console.log(this.target.position)



        return this.group;
    }

    setShader() {
        this.vertexShader = `
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            void main(){
                vNormal = normalize(normalMatrix * normal);
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
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
            void main(){
                float intensity;
                intensity = distance(vWorldPosition, spotPosition) / attenuation;
                intensity = 1.0 - clamp(intensity, 0.0, 1.0);
                vec3 normal = vec3(vNormal.x, vNormal.y, abs(vNormal.z));
                float angleIntensity = pow(dot(normal, vec3(0.0, 0.0, 1.0)), anglePower);
                intensity = intensity * angleIntensity;
                gl_FragColor = vec4(lightColor, intensity);
            }
        `;
    }

    setMaterial() {
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                attenuation: { type: "f", value: this.distance },
                anglePower: { type: "f", value: Math.cos(this.angle) },
                spotPosition: { type: "v3", value: new THREE.Vector3(this.positionX, this.positionY, this.positionZ) },
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
        const radiusBottom = Math.tan(this.angle) * this.distance;
        const height = this.distance;
        this.geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 64, 20, true);
        this.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -this.geometry.parameters.height / 2, 0));
        this.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    }

    setCone() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.positionX, this.positionY, this.positionZ);
        this.mesh.rotation.x = Math.PI / 2; // Point downwards
        this.group.add(this.mesh);
    }

    setLight() {
        this.spotLight = new THREE.SpotLight(this.color, this.intensity, this.distance, this.angle * 1.3, this.penumbra, this.decay);
        this.spotLight.position.set(this.positionX, this.positionY, this.positionZ);
        this.target = new THREE.Object3D();
        this.target.position.set(0, 4, 10);
        this.spotLight.target = this.target;

        this.group.add(this.spotLight);
        this.group.add(this.target);
    }

    setHelper() {
                this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
                this.group.add(this.spotLightHelper);
    }
}