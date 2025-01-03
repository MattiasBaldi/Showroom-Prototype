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
            this.scene.environmentIntensity = 0.3
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

        const textures = [
            {
            map: this.resources.items.floor1_color,
            normalMap: this.resources.items.floor1_normal,
            aoMap: this.resources.items.floor1_ao
            },
            {
            map: this.resources.items.floor2_color,
            normalMap: this.resources.items.floor2_normal,
            aoMap: this.resources.items.floor2_ao,
            roughnessMap: this.resources.items.floor2_roughness
            },
            {
            map: this.resources.items.floor3_color,
            normalMap: this.resources.items.floor3_normal,
            aoMap: this.resources.items.floor3_ao,
            roughnessMap: this.resources.items.floor3_roughness
            }
        ];
        
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000, 10, 10),
            new THREE.MeshStandardMaterial({
                roughness: 0,
                metalness: 0.6,
                envMap: this.environmentMap,
                envMapIntensity: 0,  // Optional, still sets reflection strength
            })
        );
        
        const selectedTexture = 1;
        const texture = textures[selectedTexture - 1];

        // Apply textures and settings only for the selected property
        Object.keys(texture).forEach(property => {
            floor.material[property] = texture[property];
            texture[property].wrapS = THREE.MirroredRepeatWrapping;
            texture[property].wrapT = THREE.MirroredRepeatWrapping;
            texture[property].generateMipmaps = false;
            texture[property].repeat.set(floor.geometry.parameters.width, floor.geometry.parameters.height);
        });
    
        floor.rotation.x = Math.PI * - 0.5
        floor.receiveShadow = true; 
        this.scene.add(floor)

        // bloom
        this.renderer.selectiveBloom.selection.add(floor)

        if (this.debug.active) {
            const debugObject = {
            color: floor.material.color.getHex(),
            emissive: floor.material.emissive.getHex(),
            emissiveIntensity: floor.material.emissiveIntensity || 1,
            selectedTexture: selectedTexture
            };

            const floorFolder = this.debugFolder.addFolder('Floor');

            floorFolder
            .add(debugObject, 'selectedTexture', { Purple: 1, Concrete: 2, Stones: 3 })
            .name('Select Texture')
            .onChange((value) => {

                // Dispose of the old material
                if (floor.material) {
                    floor.material.dispose();
                }

                const texture = textures[value - 1];
                Object.keys(texture).forEach(property => {
                    floor.material[property] = texture[property];
                    texture[property].wrapS = THREE.MirroredRepeatWrapping;
                    texture[property].wrapT = THREE.MirroredRepeatWrapping;
                    texture[property].generateMipmaps = false;
                    texture[property].repeat.set(floor.geometry.parameters.width, floor.geometry.parameters.height);
                });
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
            });


            floorFolder
            .add(floor.material, 'roughness')
            .name('Roughness')
            .onChange((value) => {
                floor.material.roughness = value;
            })
            .step(0.01)
            .max(1)
            .min(0);

            floorFolder
            .add(floor.material, 'metalness')
            .name('Metalness')
            .onChange((value) => {
                floor.material.metalness = value;
            })
            .step(0.01)
            .max(1)
            .min(0);
        }
        }

        addWalls()
        {
            const wallGeometry = new THREE.PlaneGeometry(10, 10)
            const wallMaterial = new THREE.MeshStandardMaterial
                ({
                color: 'black', 
                wireframe: false,
                roughness: 0, 
                envMap: this.environmentMap,
                envMapIntensity: 0.01
                })
                
            const wall = new THREE.Mesh(wallGeometry, wallMaterial)
            wall.geometry.translate(0, wall.geometry.parameters.height / 2, 0) // Translate the geometry so the pivot point is at the center
  
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
            const wallTwoOne = addWall({ width: 30, positionZ: 10, rotationY: Math.PI })
            const wallTwoTwo = addWall({ width: 30, positionZ: 10, rotationY: Math.PI })
            wallTwo.add(wallTwoOne, wallTwoTwo)

            const wallThree = addWall({ width: 2, positionX: -145, rotationY: Math.PI * 0.5 })
            const wallFour = addWall({ width: 2, positionX: 145, rotationY: Math.PI * -0.5 })
            const wallFive = addWall({ width: 15, positionX: -15, positionZ: 80, rotationY: Math.PI * 0.5 })
            const wallSix = addWall({ width: 15, positionX: 15, positionZ: 80, rotationY: Math.PI * -0.5 })
            const wallSeven = addWall({ width: 3, positionZ: 135, rotationY: -Math.PI })


            // const walls = new THREE.InstancedMesh()
            // this.scene.add(walls)
            
            this.scene.add(wallOne, wallTwo, wallThree, wallFour, wallFive, wallSix, wallSeven)


            if (this.debug.active) {

                const debugObject =
                {
                    wallOne,
                    wallTwo,
                    wallThree,
                    wallFour,
                    wallFive,
                    wallSix,
                    wallSeven
                }

                const wallsFolder = this.debugFolder.addFolder('Walls');

                const addWallWithDebug = (wall, name) => {
                    const newWallFolder = wallsFolder.addFolder(name);
                    newWallFolder.close()

                    newWallFolder
                        .add(wall.scale, 'x')
                        .name('Scale X')
                        .min(-50)
                        .max(50)
                        .step(0.1);

                    newWallFolder
                        .add(wall.scale, 'y')
                        .name('Scale Y')
                        .min(-50)
                        .max(50)
                        .step(0.1);

                    newWallFolder
                        .add(wall.scale, 'z')
                        .name('Scale Z')
                        .min(-50)
                        .max(50)
                        .step(0.1);

                    newWallFolder
                        .add(wall.position, 'x')
                        .name('Position X')
                        .min(-200)
                        .max(200)
                        .step(0.1);

                    newWallFolder
                        .add(wall.position, 'y')
                        .name('Position Y')
                        .min(-200)
                        .max(200)
                        .step(0.1);

                    newWallFolder
                        .add(wall.position, 'z')
                        .name('Position Z')
                        .min(-200)
                        .max(200)
                        .step(0.1);

                    newWallFolder
                        .add(wall.rotation, 'y')
                        .name('Rotation')
                        .min(-Math.PI)
                        .max(Math.PI)
                        .step(Math.PI / 4);
                };

                Object.keys(debugObject).forEach((key, index) => {
                    addWallWithDebug(debugObject[key], `Wall ${index + 1}`);
                });

                wallsFolder
                    .add({ showWalls: true }, 'showWalls')
                    .name('Show Walls')
                    .onChange((value) => {
                        Object.values(debugObject).forEach(wall => {
                            wall.visible = value;
                        });
                    });

                    wallsFolder
                        .add({ addWall: () => {
                            const newWall = addWall({ width: 1, height: 1, positionX: 0, positionY: 0, positionZ: 0 });
                            this.scene.add(newWall);
                            addWallWithDebug(newWall, `Wall ${Object.keys(debugObject).length + 1}`);
                            debugObject[`wall${Object.keys(debugObject).length + 1}`] = newWall;
                        }}, 'addWall')
                        .name('Add Wall');
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
        
    }
