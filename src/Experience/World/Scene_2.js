import * as THREE from 'three'
import Experience from '../Experience.js'
import Switch from '../Controls/Switch.js'
import PositionalAudio from '../Utils/PositionalAudio.js'

export default class Scene_2
{
    constructor()
    {
        this.experience = new Experience()
        this.renderer = this.experience.renderer
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Scene 2 (Art)')
            this.debugFolder.close()
        }

        // Setup
        this.setScene()
        this.createBox()

        // Audio
        // this.audio = new PositionalAudio('Test_big', this.sceneGroup, 1)

        // Switch
        this.switch = new Switch(this.sceneGroup, 0, 10)

        //bloom
        // this.renderer.setSelectiveBloom(this.box)

    }

    setScene()
    {
    this.sceneGroup = new THREE.Group(); 
    this.sceneGroup.position.x = -100; 
    this.sceneGroup.scale.setScalar(0.6)
    this.scene.add(this.sceneGroup)

    // Debug
    if(this.debug.active)
    {
        this.debugFolder.add(this.sceneGroup.position, 'x').name('PositionX').step(1).min(-100).max(100)
        this.debugFolder.add(this.sceneGroup.scale, 'x', 'y', 'z').name('Scale').step(0.01).min(0).max(2).onChange((value) => 
        {this.sceneGroup.scale.set(value, value, value)})
    }
    }

    createBox()
    {
        // Create a box geometry
        this.boxgeometry = new THREE.BoxGeometry(2, 2, 2, 40, 40, 40);

        // ShaderMaterial for vertex displacement
        this.boxMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          uniform float time;
      
          void main() {
            vNormal = normal;
            vec3 newPosition = position + normal * sin(position.x * 5.0 + time) * 0.2;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            vec3 color = vec3(0.8, 0.8, 0.8); // Metallic color
            float metallic = 1.0;
            float roughness = 0.0;
            gl_FragColor = vec4(color * metallic, 1.0);
          }
        `,
        uniforms: {
          time: { value: 0 }
        },
        wireframe: true,
        });
      
        // Create the mesh
        this.box = new THREE.Mesh(this.boxgeometry, this.boxMaterial);
        this.sceneGroup.add(this.box);
    }

    update()
    {
            //Box animation
            this.box.rotation.x += 0.1 * (this.time.delta * 0.001);
            this.box.rotation.y += 0.1 * (this.time.delta * 0.001);
            this.boxMaterial.uniforms.time.value += 1 * (this.time.delta * 0.001) ; // Convert to seconds
            this.switch.update()
   
    }

}

