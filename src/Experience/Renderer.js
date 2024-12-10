import * as THREE from 'three'
import { WebGLRenderer } from "three";
import Experience from './Experience.js'
import { KernelSize, ShaderPass, CopyMaterial, EdgeDetectionMode, TextureEffect, SMAAEffect, SMAAImageLoader, SMAAPreset, SepiaEffect, PredicationMode,  LookupTexture3D, LUT3DEffect, BrightnessContrastEffect, ColorAverageEffect, HueSaturationEffect, ColorDepthEffect, BlendFunction, BloomEffect, SelectiveBloomEffect, EffectComposer, EffectPass, RenderPass, GodRaysEffect, ToneMappingMode, ToneMappingEffect, DepthOfFieldEffect, VignetteEffect } from "postprocessing";
import { HalfFloatType } from "three";

export default class Renderer
{
    constructor()
    {

        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.world = this.experience.world
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = this.experience.camera
        this.debug = this.experience.debug
        this.resources = this.experience.resources

        //Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Post Processing')
        }

        // Setup
        this.setInstance()
        this.resize()

        // Post Processing
        // Effects should be applied in the below order

        
        this.setComposer()
        // this.setAntiAliasing()
        // this.setBloom()
        this.setToneMapping()
        // this.setSelectiveBloom()
        // this.setDepthOfField()
        // this.setColor()
        // this.setGodRays()

    }

    setInstance()
    {
        this.instance = new WebGLRenderer({
            canvas: this.canvas,
            powerPreference: "high-performance",
            antialias: false,
            stencil: false,
            depth: false,
            precision: "highp"
        });


        // Reset everything
        this.instance.toneMapping = THREE.NoToneMapping;
        this.instance.outputEncoding = THREE.sRGBEncoding;
    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    setComposer() {

        // Adding Composer
        this.composer = new EffectComposer(this.instance, {frameBufferType: HalfFloatType});

        // RenderPass
        this.renderPass = new RenderPass(this.scene, this.camera.instance);
        this.composer.addPass(this.renderPass);

        // Antialiasing
        const smaaEffect = new SMAAEffect();
        const effectPass = new EffectPass(this.camera.instance, smaaEffect);
        this.composer.multisampling = 8 // Adjust this for better AntiAliasing // Higher = Worse performance & Better AntiAliasing
        this.composer.addPass(effectPass);

        // Debug
        if (this.debug.active)
        {
            this.debugFolder
            .add(this.composer, 'multisampling')
            .name ('Aliasing')
            .step(0.001)
            .max(50)
            .min(0)
        }

    }

    setAntiAliasing()
    {
        
        /*
            https://pmndrs.github.io/postprocessing/public/demo/#antialiasing
        */
        
    }
 
    setToneMapping()
    {
		this.toneMappingEffect = new ToneMappingEffect({
			mode: ToneMappingMode.REINHARD2_ADAPTIVE,
			resolution: 256,
			whitePoint: 16.0,
			middleGrey: 0.6,
			minLuminance: 0.01,
			averageLuminance: 0.01,
			adaptationRate: 1.0
		});

        // Settings


        // Init
        this.composer.addPass(new EffectPass(this.camera.instance, this.toneMappingEffect));
    
        // Debug
        if (this.debug.active) {
            const params = {
            "mode": this.toneMappingEffect.mode,
            "exposure": this.instance.toneMappingExposure,
            "resolution": this.toneMappingEffect.resolution,
            "white point": this.toneMappingEffect.whitePoint,
            "middle grey": this.toneMappingEffect.middleGrey,
            "average lum": this.toneMappingEffect.averageLuminance,
            "min lum": this.toneMappingEffect.adaptiveLuminanceMaterial.minLuminance,
            "adaptation rate": this.toneMappingEffect.adaptiveLuminanceMaterial.adaptationRate,
            "opacity": this.toneMappingEffect.blendMode.opacity.value,
            "blend mode": this.toneMappingEffect.blendMode.blendFunction
            };

            const toneMappingFolder = this.debugFolder.addFolder('Tone Mapping');
            toneMappingFolder.close();

            let f = toneMappingFolder.addFolder("Reinhard (Modified)");

            f.add(params, "white point", 2.0, 32.0, 0.01).onChange((value) => {
                this.toneMappingEffect.whitePoint = value;
            });

            f.add(params, "middle grey", 0.0, 1.0, 0.0001).onChange((value) => {
                this.toneMappingEffect.middleGrey = value;
            });

            f.add(params, "average lum", 0.0001, 1.0, 0.0001).onChange((value) => {
                this.toneMappingEffect.averageLuminance = value;
            });

            f.open();

            f = toneMappingFolder.addFolder("Reinhard (Adaptive)");

            f.add(params, "resolution", [64, 128, 256, 512]).onChange((value) => {
                this.toneMappingEffect.resolution = Number(value);
            });

            f.add(params, "adaptation rate", 0.001, 3.0, 0.001).onChange((value) => {
                this.toneMappingEffect.adaptiveLuminanceMaterial.adaptationRate = value;
            });

            f.add(params, "min lum", 0.001, 1.0, 0.001).onChange((value) => {
                this.toneMappingEffect.adaptiveLuminanceMaterial.minLuminance = value;
            });

            f.open();

            toneMappingFolder.add(params, "opacity", 0.0, 1.0, 0.01).onChange((value) => {
                this.toneMappingEffect.blendMode.opacity.value = value;
            });

            toneMappingFolder.add(params, "blend mode", BlendFunction).onChange((value) => {
                this.toneMappingEffect.blendMode.setBlendFunction(Number(value));
            });

        }

    }

    setBloom() {
        // Bloom
        const bloom = new BloomEffect({
            intensity: 1.5, // Adjust the intensity as needed
            luminanceThreshold: 0.9,
            luminanceSmoothing: 0.025,
            mipmapBlur: true
        });
        this.composer.addPass(new EffectPass(this.camera.instance, bloom));

        // Debug
        if (this.debug.active) {
            const params = {
                "intensity": bloom.intensity,
                "luminanceThreshold": bloom.luminanceMaterial.threshold,
                "luminanceSmoothing": bloom.luminanceMaterial.smoothing,
                "mipmapBlur": bloom.mipmapBlurPass.enabled
            };

            const bloomFolder = this.debugFolder.addFolder('Bloom');
            bloomFolder.close();

            bloomFolder.add(params, "intensity", 0.0, 10.0, 0.01).onChange((value) => {
                bloom.intensity = Number(value);
            });

            bloomFolder.add(params, "luminanceThreshold", 0.0, 1.0, 0.001).onChange((value) => {
                bloom.luminanceMaterial.threshold = Number(value);
            });

            bloomFolder.add(params, "luminanceSmoothing", 0.0, 1.0, 0.001).onChange((value) => {
                bloom.luminanceMaterial.smoothing = Number(value);
            });

            bloomFolder.add(params, "mipmapBlur").onChange((value) => {
                bloom.mipmapBlurPass.enabled = value;
            });
        }
    }

    setSelectiveBloom(object = null)
    {

        // Bloom
        const blendMode = {
            blendFunction: THREE.AdditiveBlending,
            opacity: { value: 1.0 }
        };

        const bloom = new SelectiveBloomEffect(this.scene, this.camera.instance, {
                blendFunction: BlendFunction.ADD,
                mipmapBlur: true,
                luminanceThreshold: 0.4,
                luminanceSmoothing: 0.2,
                intensity: 3.0
            });

        // Settings
        bloom.ignoreBackground = true; 

        // Set selected objects
        bloom.selection.add(object)    

        // Init
        this.composer.addPass(new EffectPass(this.camera.instance, bloom));


        console.log('bloom', bloom.getSelection())

        // Debug
        if(this.debug.active)
        {

            const bloomFolder = this.debugFolder.addFolder(`Bloom ${object.name}`)
            bloomFolder.close()

            const params = {
            "intensity": bloom.intensity,
            "radius": bloom.mipmapBlurPass.radius,
            "luminance": {
                "filter": bloom.luminancePass.enabled,
                "threshold": bloom.luminanceMaterial.threshold,
                "smoothing": bloom.luminanceMaterial.smoothing
            },
            "selection": {
                "inverted": bloom.inverted,
                "ignore bg": bloom.ignoreBackground
            },
            "opacity": blendMode.opacity.value,
            "blend mode": blendMode.blendFunction
            };
            bloomFolder.add(params, "intensity", 0.0, 10.0, 0.01).onChange((value) => {
            bloom.intensity = Number(value);
            });

            bloomFolder.add(params, "radius", 0.0, 1.0, 0.001).onChange((value) => {
            bloom.mipmapBlurPass.radius = Number(value);
            });

            let luminanceFolder = bloomFolder.addFolder("Luminance");

            luminanceFolder.add(params.luminance, "filter").onChange((value) => {
            bloom.luminancePass.enabled = value;
            });

            luminanceFolder.add(params.luminance, "threshold", 0.0, 1.0, 0.001).onChange((value) => {
            bloom.luminanceMaterial.threshold = Number(value);
            });

            luminanceFolder.add(params.luminance, "smoothing", 0.0, 1.0, 0.001).onChange((value) => {
            bloom.luminanceMaterial.smoothing = Number(value);
            });

            luminanceFolder.open();

            let selectionFolder = bloomFolder.addFolder("Selection");

            selectionFolder.add(params.selection, "inverted").onChange((value) => {
            bloom.inverted = value;
            });

            selectionFolder.add(params.selection, "ignore bg").onChange((value) => {
            bloom.ignoreBackground = value;
            });

            selectionFolder.open();

            bloomFolder.add(params, "opacity", 0.0, 1.0, 0.01).onChange((value) => {
            bloom.blendMode.opacity.value = value;
            });

            bloomFolder.add(params, "blend mode", BlendFunction).onChange((value) => {
            bloom.blendMode.setBlendFunction(Number(value));
            });

            bloomFolder.add(bloom, "dithering").onChange((value) => {
            bloom.dithering = value;
            });

        }
    }

    setDepthOfField()
    {

        // Depth of field
        this.depthOfFieldEffect = new DepthOfFieldEffect(this.camera.instance, {
			focusDistance: 10.0,
			focalLength: 0.048,
			bokehScale: 2.0,
			height: 480
		});

        // Vignette
        this.vignetteEffect = new VignetteEffect({
			eskil: false,
			offset: 0.35,
			darkness: 0.5
		});

        // Settings
        
        // Init
        this.composer.addPass(new EffectPass(this.camera.instance, this.depthOfFieldEffect, this.vignetteEffect));

        // Debug
        if (this.debug.active) {
            const params = {
                "coc": {
                    "edge blur kernel": this.depthOfFieldEffect.blurPass.kernelSize,
                    "focus": this.depthOfFieldEffect.cocMaterial.uniforms.focusDistance.value,
                    "focal length": this.depthOfFieldEffect.cocMaterial.uniforms.focalLength.value
                },
                "vignette": {
                    "enabled": true,
                    "offset": this.vignetteEffect.uniforms.get("offset").value,
                    "darkness": this.vignetteEffect.uniforms.get("darkness").value
                },
                "resolution": this.depthOfFieldEffect.resolution.height,
                "bokeh scale": this.depthOfFieldEffect.bokehScale,
                "opacity": this.depthOfFieldEffect.blendMode.opacity.value,
                "blend mode": this.depthOfFieldEffect.blendMode.blendFunction
            };

            const depthOfFieldFolder = this.debugFolder.addFolder('Depth Of Field');
            depthOfFieldFolder.close()

            depthOfFieldFolder.add(params, "resolution", [240, 360, 480, 720, 1080]).name('Resolution').onChange(value => {
                this.depthOfFieldEffect.resolution.height = Number(value);
            });

            depthOfFieldFolder.add(params, "bokeh scale", 1.0, 5.0, 0.001).name('Bokeh Scale').onChange(value => {
                this.depthOfFieldEffect.bokehScale = value;
            });

            let cocFolder = depthOfFieldFolder.addFolder("Circle of Confusion");

            cocFolder.add(params.coc, "edge blur kernel", {
                'Very Small': 0,
                'Small': 1,
                'Medium': 2,
                'Large': 3,
                'Very Large': 4,
                'Huge': 5
            }).name('Edge Blur Kernel').onChange(value => {
                this.depthOfFieldEffect.blurPass.kernelSize = Number(value);
            });

            cocFolder.add(params.coc, "focus", 0.0, 1.0, 0.001).name('Focus Distance').onChange(value => {
                this.depthOfFieldEffect.cocMaterial.uniforms.focusDistance.value = value;
            });

            cocFolder.add(params.coc, "focal length", 0.0, 1.0, 0.0001).name('Focal Length').onChange(value => {
                this.depthOfFieldEffect.cocMaterial.uniforms.focalLength.value = value;
            });

            cocFolder.open();

            let vignetteFolder = depthOfFieldFolder.addFolder("Vignette");

            vignetteFolder.add(params.vignette, "enabled").name('Enabled').onChange(value => {
                this.vignetteEffect.blendMode.setBlendFunction(value ? BlendFunction.NORMAL : BlendFunction.SKIP);
            });

            vignetteFolder.add(this.vignetteEffect, "eskil");

            vignetteFolder.add(params.vignette, "offset", 0.0, 1.0, 0.001).name('Offset').onChange(value => {
                this.vignetteEffect.uniforms.get("offset").value = value;
            });

            vignetteFolder.add(params.vignette, "darkness", 0.0, 1.0, 0.001).name('Darkness').onChange(value => {
                this.vignetteEffect.uniforms.get("darkness").value = value;
            });

            depthOfFieldFolder.add(params, "opacity", 0.0, 1.0, 0.01).name('Opacity').onChange(value => {
                this.depthOfFieldEffect.blendMode.opacity.value = value;
            });

            depthOfFieldFolder.add(params, "blend mode", BlendFunction).name('Blend Mode').onChange(value => {
                this.depthOfFieldEffect.blendMode.setBlendFunction(Number(value));
            });

        }
    }

    setColor()
    {

        /*
        Needs update
        */

        // Color Depth
        this.colorDepthEffect = new ColorDepthEffect({ bits: 16 });

        // Color Management
        this.colorAverageEffect = new ColorAverageEffect(BlendFunction.SKIP);

        // Sepia Effect
        this.sepiaEffect = new SepiaEffect({ blendFunction: BlendFunction.SKIP });

        // Contrast + Brightness
        this.brightnessContrastEffect = new BrightnessContrastEffect({
            blendFunction: BlendFunction.SKIP
        });

        // Hue
        this.hueSaturationEffect = new HueSaturationEffect({
            blendFunction: BlendFunction.SKIP,
            saturation: 0.4,
            hue: 0.0
        });

        // LUT - Lookup 3D Texture 

        /*
        A LUT is like a filter that changes colors in an image or 3D world. 
        A 3D LUT works with colors in 3D space—red, green, and blue—to create more detailed effects. 
        If you use an image as a LUT in a 3D world, it changes the world’s colors to match the style or mood of that image, 
        like making everything look warm, cool, or dramatic. It doesn’t change shapes, just the way colors appear.
        */

        // this.lutNeutral2 = LookupTexture3D.createNeutral(2);
        // this.lutNeutral2.name = "neutral-2";
        // assets.set(this.lutNeutral2.name, this.lutNeutral2);

        // this.lutNeutral4 = LookupTexture3D.createNeutral(4);
        // this.lutNeutral4.name = "neutral-4";
        // assets.set(this.lutNeutral4.name, this.lutNeutral4);

        // this.lutNeutral8 = LookupTexture3D.createNeutral(8);
        // this.lutNeutral8.name = "neutral-8";
        // assets.set(this.lutNeutral8.name, this.lutNeutral8);

        // this.lut = LookupTexture3D.from(assets.get("png/filmic1"));
        // this.lutEffect = capabilities.isWebGL2 ? new LUT3DEffect(this.lut) :
        // new LUT3DEffect(this.lut.convertToUint8().toDataTexture());

		// lutEffect.inputColorSpace = LinearSRGBColorSpace; // Debug

        const pass = new EffectPass(this.camera.instance,
            this.colorDepthEffect, 
            this.colorAverageEffect,
            this.sepiaEffect,
            this.brightnessContrastEffect,
            this.hueSaturationEffect,
            // this.lutEffect
        );


        // Settings


        // Init
        this.composer.addPass(pass);


        // Debug
        if (this.debug.active)
        {

        const ColorFolder = this.debugFolder.addFolder('Color')
        const params = {
            "bits": this.colorDepthEffect.getBitDepth(),
            "opacity": this.colorDepthEffect.blendMode.opacity.value,
            "blend mode": this.colorDepthEffect.blendMode.blendFunction,
            colorAverage: {
            "opacity": this.colorAverageEffect.blendMode.opacity.value,
            "blend mode": this.colorAverageEffect.blendMode.blendFunction
            },
            sepia: {
            "opacity": this.sepiaEffect.blendMode.opacity.value,
            "blend mode": this.sepiaEffect.blendMode.blendFunction
            },
            brightnessContrast: {
            "brightness": this.brightnessContrastEffect.uniforms.get("brightness").value,
            "contrast": this.brightnessContrastEffect.uniforms.get("contrast").value,
            "opacity": this.brightnessContrastEffect.blendMode.opacity.value,
            "blend mode": this.brightnessContrastEffect.blendMode.blendFunction
            },
            hueSaturation: {
            "hue": this.hueSaturationEffect.uniforms.get("hue").value,
            "saturation": this.hueSaturationEffect.uniforms.get("saturation").value,
            "opacity": this.hueSaturationEffect.blendMode.opacity.value,
            "blend mode": this.hueSaturationEffect.blendMode.blendFunction
            },
            // Uncomment and adjust the following if LUT effect is used
            // lut: {
            //     "LUT": this.lutEffect.getLUT().name,
            //     "base size": this.lutEffect.getLUT().image.width,
            //     "3D texture": true,
            //     "tetrahedral filter": false,
            //     "scale up": false,
            //     "target size": 48,
            //     "show LUT": false,
            //     "opacity": this.lutEffect.blendMode.opacity.value,
            //     "blend mode": this.lutEffect.blendMode.blendFunction
            // }
        };

        // Depth
        const depthFolder = ColorFolder.addFolder('Depth')
        depthFolder.add(params, "bits", 1, 32, 1).onChange((value) => {this.colorDepthEffect.setBitDepth(value);});
        depthFolder.add(params, "opacity", 0.0, 1.0, 0.01).onChange((value) => {this.colorDepthEffect.blendMode.opacity.value = value;});
        depthFolder.add(params, "blend mode", BlendFunction).onChange((value) => {this.colorDepthEffect.blendMode.setBlendFunction(Number(value));});

        // Color Average
        let f = ColorFolder.addFolder("Color Average");
        f.add(params.colorAverage, "opacity", 0.0, 1.0, 0.01).onChange((value) => {
            this.colorAverageEffect.blendMode.opacity.value = value;
        });
        f.add(params.colorAverage, "blend mode", BlendFunction).onChange((value) => {
            this.colorAverageEffect.blendMode.setBlendFunction(Number(value));
        });

        // Sepia
        f = ColorFolder.addFolder("Sepia");
        f.add(params.sepia, "opacity", 0.0, 1.0, 0.01).onChange((value) => {
            this.sepiaEffect.blendMode.opacity.value = value;
        });
        f.add(params.sepia, "blend mode", BlendFunction).onChange((value) => {
            this.sepiaEffect.blendMode.setBlendFunction(Number(value));
        });

        // Brightness & Contrast
        f = ColorFolder.addFolder("Brightness & Contrast");
        f.add(params.brightnessContrast, "brightness", -1.0, 1.0, 0.001).onChange((value) => {
            this.brightnessContrastEffect.uniforms.get("brightness").value = value;
        });
        f.add(params.brightnessContrast, "contrast", -1.0, 1.0, 0.001).onChange((value) => {
            this.brightnessContrastEffect.uniforms.get("contrast").value = value;
        });
        f.add(params.brightnessContrast, "opacity", 0.0, 1.0, 0.01).onChange((value) => {
            this.brightnessContrastEffect.blendMode.opacity.value = value;
        });
        f.add(params.brightnessContrast, "blend mode", BlendFunction).onChange((value) => {
            this.brightnessContrastEffect.blendMode.setBlendFunction(Number(value));
        });

        // Hue & Saturation
        f = ColorFolder.addFolder("Hue & Saturation");
        // f.add(params.hueSaturation, "hue", 0.0, Math.PI * 2.0, 0.001).onChange((value) => {
        //     this.hueSaturationEffect.setHue(value);
        // });
        f.add(params.hueSaturation, "saturation", -1.0, 1.0, 0.001).onChange((value) => {
            this.hueSaturationEffect.uniforms.get("saturation").value = value;
        });
        f.add(params.hueSaturation, "opacity", 0.0, 1.0, 0.01).onChange((value) => {
            this.hueSaturationEffect.blendMode.opacity.value = value;
        });
        f.add(params.hueSaturation, "blend mode", BlendFunction).onChange((value) => {
            this.hueSaturationEffect.blendMode.setBlendFunction(Number(value));
        });

        // Uncomment and adjust the following if LUT effect is used
        // f = ColorFolder.addFolder("Lookup Texture 3D");
        // f.add(params.lut, "LUT", [...luts.keys()]).onChange(changeLUT);
        // infoOptions.push(f.add(params.lut, "base size").listen());
        // if (capabilities.isWebGL2) {
        //     f.add(params.lut, "3D texture").onChange(changeLUT);
        //     f.add(params.lut, "tetrahedral filter").onChange((value) => {
        //         this.lutEffect.setTetrahedralInterpolationEnabled(value);
        //     });
        // }
        // f.add(params.lut, "scale up").onChange(changeLUT);
        // f.add(params.lut, "target size", [32, 48, 64, 96, 128]).onChange(changeLUT);
        // f.add(params.lut, "show LUT").onChange(updateLUTPreview);
        // f.add(params.lut, "opacity", 0.0, 1.0, 0.01).onChange((value) => {
        //     this.lutEffect.blendMode.opacity.value = value;
        // });
        // f.add(params.lut, "blend mode", BlendFunction).onChange((value) => {
        //     this.lutEffect.blendMode.setBlendFunction(Number(value));
        // });


    }
    }

    setGodRays()
    {
   		// Fake Sun
           const sunMaterial = new THREE.MeshBasicMaterial({
			color: 'white',
			transparent: true,
			fog: false
		});

		const sunGeometry = new THREE.SphereGeometry(0.75, 32, 32);
		const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.y = 3;
        sun.position.z = -5
        sun.scale.set(2, 2, 2)
        this.scene.add(sun)


        this.GodRaysEffect = new GodRaysEffect(this.camera.instance, sun, 
            {
                height: 480,
                kernelSize: KernelSize.SMALL,
                density: 0.96,
                decay: 0.92,
                weight: 0.3,
                exposure: 0.54,
                samples: 60,
                clampMax: 1.0
            });

        this.composer.addPass(new EffectPass(this.camera.instance, this.GodRaysEffect));


        // Debug
        if(this.debug.active)
        {

            const params = {
                "resolution": this.GodRaysEffect.height,
                "blurriness": this.GodRaysEffect.blurPass.kernelSize,
                "density": this.GodRaysEffect.godRaysMaterial.uniforms.density.value,
                "decay": this.GodRaysEffect.godRaysMaterial.uniforms.decay.value,
                "weight": this.GodRaysEffect.godRaysMaterial.uniforms.weight.value,
                "exposure": this.GodRaysEffect.godRaysMaterial.uniforms.exposure.value,
                "clampMax": this.GodRaysEffect.godRaysMaterial.uniforms.clampMax.value,
                "color": sun.material.color.getHex(),
                "opacity": this.GodRaysEffect.blendMode.opacity.value,
                "blend mode": this.GodRaysEffect.blendMode.blendFunction
            };

            const godRaysFolder = this.debugFolder.addFolder('GodRays');
            godRaysFolder.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange((value) => {
                this.GodRaysEffect.height = Number(value);
            });

            godRaysFolder.add(params, "blurriness", KernelSize.VERY_SMALL, KernelSize.HUGE + 1, 1).onChange((value) => {
                this.GodRaysEffect.blurPass.kernelSize = value - 1;
            });

            godRaysFolder.add(params, "density", 0.0, 1.0, 0.01).onChange((value) => {
                this.GodRaysEffect.godRaysMaterial.uniforms.density.value = value;
            });

            godRaysFolder.add(params, "decay", 0.0, 1.0, 0.01).onChange((value) => {
                this.GodRaysEffect.godRaysMaterial.uniforms.decay.value = value;
            });

            godRaysFolder.add(params, "weight", 0.0, 1.0, 0.01).onChange((value) => {
                this.GodRaysEffect.godRaysMaterial.uniforms.weight.value = value;
            });

            godRaysFolder.add(params, "exposure", 0.0, 1.0, 0.01).onChange((value) => {
                this.GodRaysEffect.godRaysMaterial.uniforms.exposure.value = value;
            });

            godRaysFolder.add(params, "clampMax", 0.0, 1.0, 0.01).onChange((value) => {
                this.GodRaysEffect.godRaysMaterial.uniforms.clampMax.value = value;
            });

            godRaysFolder.add(this.GodRaysEffect, "samples", 15, 200, 1);

            godRaysFolder.add(params, "opacity", 0.0, 1.0, 0.01).onChange((value) => {
                this.GodRaysEffect.blendMode.opacity.value = value;
            });

            godRaysFolder.add(params, "blend mode", BlendFunction).onChange((value) => {
                this.GodRaysEffect.blendMode.setBlendFunction(Number(value));
            });

            // Sun
            const sunFolder = godRaysFolder.addFolder('Sun');
            sunFolder.addColor(params, "color").name('Color').onChange((value) => {
                sun.material.color.setHex(value);
            });
            sunFolder.add({ scale: 2 }, 'scale').name('Scale').min(0).max(10).step(0.01).onChange(value => {
                sun.scale.set(value, value, value);
            });
            sunFolder.add(sun.position, 'x').name('Position X').min(-50).max(50).step(0.01).onChange(value => {
                sun.position.x = value;
            });
            sunFolder.add(sun.position, 'y').name('Position Y').min(0).max(10).step(0.01).onChange(value => {
                sun.position.y = value;
            });
            sunFolder.add(sun.position, 'z').name('Position Z').min(-10).max(10).step(0.01).onChange(value => {
                sun.position.z = value;
            });

        }
    }

    update()
    {
    
        // Composer Renderer
        this.composer.render();
    }
}

