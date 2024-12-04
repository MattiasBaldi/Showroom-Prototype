import * as THREE from 'three'
import Experience from '../Experience.js'
import Teleportation from './Teleportation.js'
import Environment from './Environment.js'
import Scene_1 from './Scene_1.js'
import Scene_2 from './Scene_2.js'
import Scene_3 from './Scene_3.js'
import Lights from './Lights.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience(); 
        this.scene = this.experience.scene;
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // Wait for resources
        this.resources.on('ready', () =>
        {   
            // Setup
            this.scene_3 = new Scene_3()
            this.scene_2 = new Scene_2()
            this.scene_1 = new Scene_1()
            this.teleportation = new Teleportation()
            this.environment = new Environment()
            this.lights = new Lights()
            this.addFloor()
        })

    }

    addFloor()
    {
    const floor = new THREE.Mesh
    (
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.MeshStandardMaterial({ color: 'black' })
    )

    floor.rotation.x = Math.PI * - 0.5
    floor.receiveShadow = true; // Ensure the floor receives shadows
    this.scene.add(floor)
    }

update()
    {
        if(this.scene_3)
        {
            this.scene_3.update()
        } 

        if(this.scene_1)
        {
        this.scene_1.update()
        } 

        if(this.scene_2)
        {
            this.scene_2.update()
        }
        
        if(this.lights)
        {
            this.lights.update()
        } 
}
}