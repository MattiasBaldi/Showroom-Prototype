import * as THREE from 'three'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'
import sources from  './Sources.js'
import Debug from './Utils/Debug.js'
import Stats from 'stats.js'

let instance = null; 

export default class Experience 
{
    constructor(canvas)
    {

        //singleton
        if (instance)
        {
            return instance 
        }

        instance = this

        // Global access
        window.experience = this

        // Options
        this.canvas = canvas

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.camera = new Camera(this)
        this.renderer = new Renderer(this)
        this.resources = new Resources(sources)

        this.world = new World()
        this.stats = new Stats()

        // Sizes resize event
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        // Time tick event 
        this.time.on('tick', () =>
        {
            this.update()
        })

        // Stats
        if(this.debug.active)
        {
            document.body.appendChild(this.stats.dom)
            this.stats.dom.style.position = 'fixed';
            this.stats.dom.style.left = '95%';
            this.stats.dom.style.top = '95%';
        }
    }

    resize()
    {
        this.camera.resize()
        this.renderer.resize()
    }

    update()
    {
        if(this.debug.active)
        {
            this.stats.begin()
        }

        this.camera.update()
        this.world.update()
        this.renderer.update()
        
        if(this.debug.active)
            {
                this.stats.end()
            }
    }

    destroy()
    {
        this.sizes.off('resize')
        this.time.off('tick')

        // Traverse the whole scene
        this.scene.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.geometry.dispose()

                for(const key in child.material)
                {
                    const value = child.material[key]
                    
                    if(value && typeof value.dispose === 'function')
                    {
                        value.dispose()
                    }
                }
            }
        })

        // this.camera.controls.dispose()
        this.renderer.instance.dispose()

        if(this.debug.active)
            this.debug.ui.destroy()
        }
}