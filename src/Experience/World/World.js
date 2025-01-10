import Experience from '../Experience.js'
import Teleportation from './Teleportation.js'
import Environment from './Environment.js'
import Scene_0 from './Scene_0.js'
import Scene_1 from './Scene_1.js'
import Scene_2 from './Scene_2.js'
import Scene_3 from './Scene_3.js'
import Lights from './Lights.js'
import Audio from '../Audio.js'
import Shadows from './Shadows.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience(); 
        this.renderer = this.experience.renderer
        this.scene = this.experience.scene;
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.camera = this.experience.camera.instance

        // Wait for resources
        this.resources.on('ready', () =>
        {   
            // Setup
            this.camera.position.set(0, 1, 75)
            this.environment = new Environment()
            this.scene_0 = new Scene_0()
            this.scene_1 = new Scene_1()
            this.scene_2 = new Scene_2()
            this.scene_3 = new Scene_3()
            this.teleportation = new Teleportation()
            this.lights = new Lights()
            this.audio = new Audio()
            this.shadows = new Shadows()
        })

    }

    update()
    {

    if(this.scene_0)
        {
        this.scene_0.update()
        } 

    if(this.scene_1)
        {
        this.scene_1.update()
        } 

    if(this.scene_2)
        {
            this.scene_2.update()
        }
        
    if(this.scene_3)
    {
        this.scene_3.update()
    } 

    if(this.environment)
        {
            this.environment.update()
        } 

    if(this.lights)
    {
        this.lights.update()
    } 

    }
}