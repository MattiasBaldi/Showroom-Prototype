import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import EventEmitter from './EventEmitter.js'
import { gsap } from 'gsap'
import Experience from '../Experience.js'

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

        this.experience = new Experience(); 
        this.renderer = this.experience.renderer
        this.scene = this.experience.scene;
        this.camera = this.experience.camera


        // ui
        this.ui = document.querySelector('#ui-overlay')
        this.overlay = document.querySelector('.loading.overlay')
    }

    setLoadingScreen()
    {

        
        this.loadingManager = new THREE.LoadingManager(
        
        () =>
    {
        // Loaded 
        // gsap.delayedCall(0.5, () =>
        // {
        //     gsap.to(this.overLay, { duration: 3, opacity: 0, onComplete: () => this.overlay.style.display = 'none' })
        //     this.ui.style.display = "block"
        // })
    },

    // Progress 
    (itemUrl, itemsLoaded, itemsTotal) =>
        {
        const progressRatio = itemsLoaded / itemsTotal
        this.overlay.innerHTML = `${progressRatio * 100 + '%'}`
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
            else if (source.type === 'texture') {
                const folderPath = source.folder;
                const textureNamesJPG = ['aoMap', 'map'];
                const textureNamesPNG = ['normalMap'];
                const textures = {};
                const totalTextures = textureNamesJPG.length + textureNamesPNG.length;
                let loadedTextures = 0;
            
                const loadTexture = (textureName, extension) => {
                    const texturePath = `${folderPath}/${textureName}.${extension}`;
                    this.loaders.textureLoader.load(
                        texturePath,
                        (loadedFile) => {
                            textures[textureName] = loadedFile;
                            loadedTextures++;
                            if (loadedTextures === totalTextures) {
                                this.sourceLoaded(source, textures);
                            }
                        },
                        undefined,
                        (error) => {
                            console.warn(`Texture not found at path: ${texturePath}`, error);
                            loadedTextures++;
                            if (loadedTextures === totalTextures) {
                                this.sourceLoaded(source, textures);
                            }
                        }
                    );
                };
            
                textureNamesJPG.forEach((textureName) => loadTexture(textureName, 'jpg'));
                textureNamesPNG.forEach((textureName) => loadTexture(textureName, 'png'));
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
                        console.log(`Audio loaded: ${source.path}`);
                        this.sourceLoaded(source, file)
                    }
                )
            }
        }
    }

    async sourceLoaded(source, file)
    {
        this.items[source.name] = file
        this.loaded++

        if(this.loaded === this.toLoad)
        {
            this.overlay.innerHTML = "preparing"; 

            // trigger preload instead            
            const invisible = []
            const items = this.scene.traverse((object) => 
            {
                if (object.isMesh)
                    {

                        if (object.material && typeof object.material.initTexture === 'function') {
                                        object.material.initTexture();
                                    }

                        // flip
                        if (!object.isVisible) 
                            {   
                                object.visible = true;
                                invisible.push(object)
                            }

                        return object;      
                    }
            })

                await this.renderer.instance.compileAsync(this.scene, this.camera, this.scene);
            
                const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128)
                const cubeCamera = new THREE.CubeCamera(0.01, 100000, cubeRenderTarget)
                cubeCamera.update(  this.renderer.instance, (this.scene))
                cubeRenderTarget.dispose()

                invisible.forEach((o) => o.visible = false)

                gsap.delayedCall(0.5, 

                    gsap.to(this.overLay, { duration: 3, opacity: 0, onComplete: () => {
                        
                        this.overlay.style.display = 'none' 
                        this.ui.style.display = "block"
                    }})

                )
            
                this.trigger('ready')

        }
    }

}