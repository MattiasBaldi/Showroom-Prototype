import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
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

        const overLay = document.querySelector('.loading.overlay')
        const uiOverlay = document.querySelector('#ui-overlay')
  
        
        this.loadingManager = new THREE.LoadingManager(
        
        () =>
    {
        // Loaded 
        gsap.delayedCall(0.5, () =>
        {
            gsap.to(overLay, { duration: 3, opacity: 0, onComplete: () => overLay.style.display = 'none' })
            uiOverlay.style.display = 'block'

        })
    },

    // Progress 
    (itemUrl, itemsLoaded, itemsTotal) =>
        {
        const progressRatio = itemsLoaded / itemsTotal
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