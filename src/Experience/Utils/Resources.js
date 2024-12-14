import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/Addons.js'
import EventEmitter from './EventEmitter.js'
import { gsap } from 'gsap'

export default class Resources extends EventEmitter
{
    constructor(sources)
    {
        super()

        this.sources = sources
        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.setLoadingScreen()
        this.setLoaders()
        this.startLoading()

    }

    setLoadingScreen()
    {
       
        console.log('test123')
        const overLay = document.querySelector('.loading.overlay')
        console.log('before LoadingManager')
        
        this.loadingManager = new THREE.LoadingManager(
            // Loaded 
        () =>
    {
        console.log('before gsap')
        gsap.delayedCall(0.5, () =>
        {
            console.log('gsap delay')
            gsap.to(overLay, { duration: 3, opacity: 0, onComplete: () => overLay.style.display = 'none' })
            console.log('has Loaded')
        })
    },

    // Progress 
    (itemUrl, itemsLoaded, itemsTotal) =>
        {
        const progressRatio = itemsLoaded / itemsTotal
        console.log(`load ${progressRatio}`)
        overLay.innerHTML = `${progressRatio * 100 + '%'}`
    });

    }

    setLoaders()
    {
        this.loaders = {}
        this.loaders.gltfLoader = new GLTFLoader(this.loadingManager);
        this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);
        this.loaders.rgbeLoader = new RGBELoader(this.loadingManager);
        this.loaders.audioLoader = new THREE.AudioLoader(this.loadingManager);
    }

    startLoading()
    {
        // Load each source
        for(const source of this.sources)
        {
            if(source.type === 'gltfModel')
            {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'texture')
            {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'cubeTexture')
            {
                this.loaders.cubeTextureLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'HDR')
                {
                    this.loaders.rgbeLoader.load(
                        source.path,
                        (file) =>
                        {
                            this.sourceLoaded(source, file)
                        }
                    )
                }
            else if(source.type === 'audio')
                {
                    this.loaders.audioLoader.load(
                        source.path,
                        (file) =>
                        {
                            this.sourceLoaded(source, file)
                        }
                    )
                }
        }
    }


    sourceLoaded(source, file)
    {
        this.items[source.name] = file

        this.loaded++

        if(this.loaded === this.toLoad)
        {
            this.trigger('ready')
        }
    }

}