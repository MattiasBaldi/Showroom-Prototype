import Experience from '../Experience.js'
import * as THREE from 'three'

export default class Environment
{
    constructor()
    {

        this.experience = new Experience()
        this.scene = this.experience.scene
        this.renderer = this.experience.renderer
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.camera = this.experience.camera.instance
        this.time = this.experience.time
        this.camera = this.experience.camera.instance
        this.controls = this.experience.camera.controls


        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Environment')
            this.debugFolder.close()
        }

        //Setup
        // this.addGrid()
        // this.setFog()
        this.setEnvironmentMap()
        this.addFloor()
        this.addWalls()


    }

        setEnvironmentMap()
        {
            this.environmentMap = this.resources.items.blueStudio
            this.environmentMap.mapping =  THREE.EquirectangularReflectionMapping
            this.scene.environment = this.environmentMap
            this.scene.environmentIntensity = 1; 
            this.scene.background = new THREE.Color('black')
            
            // Debug
            if(this.debug.active)
            {
                const debugObject = {
                    showBackground: false,
                    gridHelper: true,
                    intensity: this.scene.environmentIntensity,
                    maps: {
                        blueStudio: this.resources.items.blueStudio, 
                        blockyStudio: this.resources.items.blockyStudio,
                        brownStudio: this.resources.items.brownStudio,
                        photoStudio: this.resources.items.photoStudio,
                        studioSmall: this.resources.items.studioSmall
                    }

                };

                this.debugFolder
                .add(debugObject, 'showBackground')
                .name('Show Background')
                .onChange((value) => {
                    if (value) {
                        this.scene.background = this.environmentMap; // Set to your desired background
                    } else {
                        this.scene.background = new THREE.Color('black'); // Hide background
                    }
                });

                this.debugFolder
                .add({ environmentMap: 'blueStudio' }, 'environmentMap', Object.keys(debugObject.maps))
                .name('Environment Map')
                .onChange((value) => {
                    this.environmentMap = debugObject.maps[value];
                    this.environmentMap.mapping =  THREE.EquirectangularReflectionMapping
                    this.scene.environment = this.environmentMap
                    this.scene.environmentIntensity = debugObject.intensity
                    if (debugObject.showBackground) {
                        this.scene.background = this.environmentMap;
                    }
                });
                

                this.debugFolder
                .add(this.scene, 'environmentIntensity')
                .name('Env Light Intensity')
                .min(0)
                .max(10)
                .step(0.001)
                .onChange((value) => { 
                    this.scene.environmentIntensity = value;
                    if (debugObject.showBackground) {
                        this.scene.backgroundIntensity = value;
                        this.scene.background.needsUpdate = true;
                    }
                });
            }

        }

        setFog()
        {
            this.scene.fog = null; // Ensure fog is deactivated initially
            
            if(this.debug.active)
            {
                const debugObject =
                 {
                    fogActive: false, // Set initial state to false
                    color: new THREE.Color('grey'), 
                    density: 0.01
                }

                this.debugFolder
                .add(debugObject, 'fogActive')
                .name('Fog')
                .onChange((value) => {
                    if (value) {
                        this.scene.fog = new THREE.FogExp2(debugObject.color, debugObject.density);
                    } else {
                        this.scene.fog = null;
                    }
                })

                this.debugFolder
                .addColor(debugObject, 'color')
                .name('Color')
                .onChange((value) => { 
                    if (this.scene.fog) {
                        this.scene.fog.color.set(value);
                    }
                })

                this.debugFolder
                .add(debugObject, 'density')
                .name('Density')
                .onChange((value) => { 
                    if (this.scene.fog) {
                        this.scene.fog.density = value;
                    }
                })
                .step(0.001)
                .max(0.1)
                .min(0.001);
            }
        }

        addFloor()
        {

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000, 10, 10),
            new THREE.MeshStandardMaterial({
                roughness: 0,
                metalness: 0.6,
                envMap: this.environmentMap,
                envMapIntensity: 0,  // Optional, still sets reflection strength
            })
        );        


        const getTextures = () => 
            Object.fromEntries(
                Object.entries(this.resources.items).filter(([_, value]) =>
                    Object.values(value).some(subValue => subValue instanceof THREE.Texture)
                )
            );
        
        const textures = getTextures();
        const selectedTexture = textures.concrete_worn;
        
        const applyTexture = (texture) => {
        for (const [name, map] of Object.entries(texture)) {
            // Clone the texture to avoid modifying the original
            const clonedMap = map.clone();
            floor.material[name] = clonedMap;
            Object.assign(clonedMap, {
                wrapS: THREE.MirroredRepeatWrapping,
                wrapT: THREE.MirroredRepeatWrapping,
                generateMipmaps: false
            });
            clonedMap.repeat.set(floor.geometry.parameters.width, floor.geometry.parameters.height);
        }
        };
        
        applyTexture(selectedTexture);    
        floor.rotation.x = Math.PI * - 0.5
        floor.receiveShadow = true; 
        this.scene.add(floor)

        // bloom
        this.renderer.selectiveBloom.selection.add(floor)

        if (this.debug.active) {
            const debugObject = {
            color: floor.material.color.getHex(),
            emissive: floor.material.emissive.getHex(),
            envMapIntensity: floor.material.envMapIntensity,
            selectedTexture: selectedTexture,
            texturename: Object.keys(textures).find(key => textures[key] === selectedTexture)
            };

            const floorFolder = this.debugFolder.addFolder('Floor');

            floorFolder
            .add(debugObject, 'texturename', Object.keys(textures))
            .name('Select Texture')
            .onChange((value) => {
                const texture = textures[value];
                applyTexture(texture);
                floor.material.needsUpdate = true;
            });

            floorFolder
            .add({ showFloor: true }, 'showFloor')
            .name('Show Floor')
            .onChange((value) => {
                floor.visible = value;
            });

            floorFolder
            .addColor(debugObject, 'color')
            .name('Overlay Color')
            .onChange((value) => {
                floor.material.color.set(value);
                floor.material.needsUpdate = true;
            });


            floorFolder
            .add(floor.material, 'roughness')
            .name('Roughness')
            .onChange((value) => {
                floor.material.roughness = value;
                floor.material.needsUpdate = true;
            })
            .step(0.01)
            .max(1)
            .min(0);

            floorFolder
            .add(floor.material, 'metalness')
            .name('Metalness')
            .onChange((value) => {
                floor.material.metalness = value;
                floor.material.needsUpdate = true;
            })
            .step(0.01)
            .max(1)
            .min(0);

            floorFolder
            .add(debugObject, 'envMapIntensity')
            .name('Emissive Intensity')
            .min(0)
            .max(10)
            .step(0.1)
            .onChange((value) => {
                floor.material.envMapIntensity = value;
                floor.material.needsUpdate = true;
            });

            floorFolder
            .add({ toggleBloom: true }, 'toggleBloom')
            .name('Toggle Bloom')
            .onChange((value) => {
                if (value) {
                    this.renderer.selectiveBloom.selection.add(floor);
                } else {
                    this.renderer.selectiveBloom.selection.delete(floor);
                }
            });


        }
        }

        addGrid()
        {
            // Grid Helper 
            this.gridHelper = new THREE.GridHelper(50, 50);
        
            // Debug
            if (this.debug.active)
            {
            const debugObject = {showGridHelper: false}

            if (debugObject.showGridHelper)
            {
            this.scene.add(this.gridHelper)
            }

            this.debugFolder
            .add(debugObject, 'showGridHelper')
            .name('Grid')
            .onChange((value) => { 
            if (value) {this.scene.add(this.gridHelper)} 
            else {this.scene.remove(this.gridHelper) } 
            })
            }
        }

        addWallCollission()
        {
            if(this.controls.wasd)
            {
            this.walls.children.forEach((wall) => {
                const wallBox = new THREE.Box3().setFromObject(wall);
                const cameraPosition = new THREE.Vector3().copy(this.camera.position);
                const collisionDistance = 0.3
                if (wallBox.distanceToPoint(cameraPosition) <= collisionDistance) {
                    console.log('collision')
                    this.controls.wasd.PointerLockControls.moveRight(this.controls.wasd.velocity.x * (this.time.delta * 0.001) * this.controls.wasd.accelerate);
                    this.controls.wasd.PointerLockControls.moveForward(this.controls.wasd.velocity.z * (this.time.delta * 0.001) * this.controls.wasd.accelerate);
                }
            });
        }
        }

        addWalls()
        {

            const wallGeometry = new THREE.PlaneGeometry(10, 10);
            this.wallMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    playerPosition: { value: new THREE.Vector3() },
                    near: { value: 0.0 },
                    far: { value: 10.0 },
                    wallTexture: { value: this.resources.items.concrete_worn.map },
                    normalMap: { value: this.resources.items.concrete_worn.normalMap },
                    aoMap: { value: this.resources.items.concrete_worn.aoMap },
                    metalness: { value: 0.5 },
                    roughness: { value: 0.5 }
                },
                vertexShader: `
                    varying vec3 vWorldPosition;
                    varying vec2 vUv;
                    varying vec3 vNormal;
            
                    void main() {
                        vUv = uv;
                        vNormal = normalize(normalMatrix * normal);
                        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                        vWorldPosition = worldPosition.xyz;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 playerPosition;
                    uniform float far;
                    uniform float near;
                    uniform sampler2D wallTexture;
                    uniform sampler2D normalMap;
                    uniform sampler2D aoMap;
                    uniform float metalness;
                    uniform float roughness;
            
                    varying vec2 vUv;
                    varying vec3 vWorldPosition;
                    varying vec3 vNormal;
            
                    void main() {
                        // Calculate view direction
                        vec3 viewDir = normalize(playerPosition - vWorldPosition);
            
                        // Sample textures
                        vec4 albedo = texture2D(wallTexture, vUv);
                        vec3 normalTex = texture2D(normalMap, vUv).rgb * 2.0 - 1.0; // Normal map in tangent space
                        vec3 ao = texture2D(aoMap, vUv).rgb;
            
                        // Combine normals
                        vec3 normal = normalize(normalTex);
            
                        // Metalness and reflectivity
                        vec3 baseColor = albedo.rgb * ao; // Base color modulated by AO
                        vec3 reflectivity = mix(vec3(0.04), baseColor, metalness); // Dielectric reflectance (0.04 for non-metals)
            
                        // Roughness-based diffusion
                        float NdotV = max(dot(normal, viewDir), 0.0);
                        float roughFactor = pow(1.0 - roughness, 2.0);
                        vec3 diffuse = baseColor * NdotV * (1.0 - roughFactor);
            
                        // Specular highlights
                        vec3 reflectedDir = reflect(-viewDir, normal);
                        float specular = pow(max(dot(reflectedDir, viewDir), 0.0), 1.0 / (roughFactor + 0.001));
            
                        // Combine lighting components
                        vec3 color = diffuse + reflectivity * specular;
            
                        // Distance fade (factor blending based on distance)
                        float distance = length(vWorldPosition - playerPosition);
                        float factor = distance > far ? 0.0 : smoothstep(far, near, distance);
            
                        // Final color output
                        if (gl_FrontFacing) {
                            gl_FragColor = vec4(color, factor);
                        } else {
                            gl_FragColor = vec4(0, 0, 0, 1);
                        }
                    }
                `,
                side: THREE.DoubleSide,
                transparent: true,
            });

   
            
            const wall = new THREE.Mesh(wallGeometry, this.wallMaterial)
            wall.geometry.translate(0, wall.geometry.parameters.height / 2, 0) // Translate the geometry so the pivot point is at the center

            // Unwrap the texture correctly
            const wallTexture = this.wallMaterial.uniforms.wallTexture.value;
            Object.assign(wallTexture, {
                wrapS: THREE.MirroredRepeatWrapping,
                wrapT: THREE.MirroredRepeatWrapping,
                generateMipmaps: false
            });
            wallTexture.repeat.set(1, 1);
            


            const addWall = ({ rotationX = 0, rotationY = 0, rotationZ = 0, positionX = 0, positionY = 0, positionZ = 0, width = 1, height = 1 }) =>
            {
                const clone = wall.clone()
                clone.rotation.set(rotationX, rotationY, rotationZ)
                clone.position.set(positionX, positionY, positionZ)
                clone.scale.set(width, height, 1)

                return clone
            }

            const wallOne = addWall({ width: 30, positionZ: -10 })
            const wallTwo = new THREE.Group()
            const wallTwoOne = addWall({ width: 15, positionX: 90, positionZ: 10, rotationY: Math.PI })
            const wallTwoTwo = addWall({ width: 15, positionX: -90, positionZ: 10, rotationY: Math.PI })
            const wallThree = addWall({ width: 2, positionX: -145, rotationY: Math.PI * 0.5 })
            const wallFour = addWall({ width: 2, positionX: 145, rotationY: Math.PI * -0.5 })
            const wallFive = addWall({ width: 15, positionX: -15, positionZ: 85, rotationY: Math.PI * 0.5 })
            const wallSix = addWall({ width: 15, positionX: 15, positionZ: 85, rotationY: Math.PI * -0.5 })
            const wallSeven = addWall({ width: 3, positionZ: 125, rotationY: -Math.PI })

            this.walls = new THREE.Group()
            this.walls.add(wallOne, wallTwoOne, wallTwoTwo, wallThree, wallFour, wallFive, wallSix, wallSeven)
            this.scene.add(this.walls)


            // if (this.debug.active) {

            //     const debugObject =
            //     {
            //         wallOne,
            //         wallTwo,
            //         wallThree,
            //         wallFour,
            //         wallFive,
            //         wallSix,
            //         wallSeven,
            //     }

            //     const wallsFolder = this.debugFolder.addFolder('Walls');

            //     wallsFolder
            //         .add(this.wallMaterial, 'envMapIntensity')
            //         .name('EnvMap Intensity')
            //         .min(0)
            //         .max(10)
            //         .step(0.1)
            //         .onChange((value) => {
            //             this.walls.children.forEach((wall) => {
            //                 wall.material.envMapIntensity = value;
            //                 wall.material.needsUpdate = true;
            //             });
            //         });

            //     wallsFolder
            //     .addColor({ color: wall.material.color.getHex() }, 'color')
            //     .name('Color')
            //     .onChange((value) => {
            //         this.walls.children.forEach((wall) => {
            //             wall.material.color.set(value);
            //         });
            //     });


            //     wallsFolder
            //         .add(this.walls.scale, 'x')
            //         .name('Scale')
            //         .min(0.1)
            //         .max(10)
            //         .step(0.1)
            //         .onChange((value) => {this.walls.scale.x = value, this.walls.scale.y = value, this.walls.z = value })

   
            //     const addWallWithDebug = (wall, name) => {
            //         const newWallFolder = wallsFolder.addFolder(name);
            //         newWallFolder.close()

            //         newWallFolder
            //             .add(wall.scale, 'x')
            //             .name('Scale X')
            //             .min(-50)
            //             .max(50)
            //             .step(0.1);

            //         newWallFolder
            //             .add(wall.scale, 'y')
            //             .name('Scale Y')
            //             .min(-50)
            //             .max(50)
            //             .step(0.1);

            //         newWallFolder
            //             .add(wall.scale, 'z')
            //             .name('Scale Z')
            //             .min(-50)
            //             .max(50)
            //             .step(0.1);

            //         newWallFolder
            //             .add(wall.position, 'x')
            //             .name('Position X')
            //             .min(-200)
            //             .max(200)
            //             .step(0.1);

            //         newWallFolder
            //             .add(wall.position, 'y')
            //             .name('Position Y')
            //             .min(-200)
            //             .max(200)
            //             .step(0.1);

            //         newWallFolder
            //             .add(wall.position, 'z')
            //             .name('Position Z')
            //             .min(-200)
            //             .max(200)
            //             .step(0.1);

            //         newWallFolder
            //             .add(wall.rotation, 'y')
            //             .name('Rotation')
            //             .min(-Math.PI)
            //             .max(Math.PI)
            //             .step(Math.PI / 4);
            //     };

            //     Object.keys(debugObject).forEach((key, index) => {
            //         addWallWithDebug(debugObject[key], `Wall ${index + 1}`);
            //     });

            //     wallsFolder
            //         .add({ showWalls: true }, 'showWalls')
            //         .name('Show Walls')
            //         .onChange((value) => {
            //             Object.values(debugObject).forEach(wall => {
            //                 wall.visible = value;
            //             });
            //         });

            //         wallsFolder
            //             .add({ addWall: () => {
            //                 const newWall = addWall({ width: 1, height: 1, positionX: 0, positionY: 0, positionZ: 0 });
            //                 this.scene.add(newWall);
            //                 addWallWithDebug(newWall, `Wall ${Object.keys(debugObject).length + 1}`);
            //                 debugObject[`wall${Object.keys(debugObject).length + 1}`] = newWall;
            //             }}, 'addWall')
            //             .name('Add Wall');
            // }
    
        }

        update()
        {
            // Calculate the distance between the camera and each wall, and update the opacity
            // this.walls.children.forEach((wall) => {
            // wall.material.uniforms.playerPosition.value.copy(this.camera.position);
            // wall.material.needsUpdate = true;
            // });

            
             this.addWallCollission()

        }
    }
