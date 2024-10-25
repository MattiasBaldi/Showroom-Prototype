import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

/*
** Scene
*/
const scene = new THREE.Scene(); 

/*
** Grid Helper 
*/
const gridHelper = new THREE.GridHelper(50, 50); 
scene.add(gridHelper); 

/*
** Objects
*/
// Cube
const cube = new THREE.Mesh
(
new THREE.BoxGeometry(30, 5),
new THREE.MeshStandardMaterial(
{
    roughness: 0.1,
    metalness: 0.5
        
}
)
)
// scene.add(cube); 

let mixer = null; 
let speed = null; 

// Walking human
const gltfLoader = new GLTFLoader()
gltfLoader.load('walking_test.glb', 
    (gltf) =>
    {
        gltf.scene.rotation.y += Math.PI * 0.5; 
        scene.add(gltf.scene); 
        //console.log(gltf);

        console.log(gltf.scene.children[0])

        mixer = new THREE.AnimationMixer(gltf.scene);
        const action = mixer.clipAction(gltf.animations[0]);

        // set the loop mode to LoopRepeat
        action.setLoop(THREE.LoopRepeat)
        speed = action.timeScale; // Adjust this value to control the speed of the specific animation
        action.play();  

    }
);

/*
** Light
*/

// Group
const lights = new THREE.Group(); 
const intensity = 30; 
const height = 20; 
const width = 2.5; 

// Light One
const rectAreaLight = new THREE.RectAreaLight('white', intensity, height, width); 
rectAreaLight.position.set(0, 1, 5)
rectAreaLight.rotation.x += Math.PI * 0.15; 

// Light two
const rectAreaLight2 = new THREE.RectAreaLight('white', intensity, height, width); 
rectAreaLight2.position.set(0, 1, -5)
rectAreaLight2.rotation.x += Math.PI; 
rectAreaLight2.rotation.x += - Math.PI * 0.15; 

// Light Helper
const rectLightHelper = new RectAreaLightHelper(rectAreaLight);
const rectLightHelper2 = new RectAreaLightHelper(rectAreaLight2);

// lights.add(rectLightHelper, rectLightHelper2);
lights.add(rectAreaLight, rectAreaLight2);
scene.add(lights); 

/*
** Sizes 
*/
const sizes = 
{
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => 
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight; 

    // Update camera
    camera.aspect = sizes.width / sizes.height; 
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height); 
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 

});

/*
** Camera 
*/
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(10, 10, 10); 
scene.add(camera);

/*
** Renderer 
*/
const renderer = new THREE.WebGLRenderer({canvas: canvas})
renderer.setSize(sizes.width, sizes.height); 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 

/*
** Controls 
*/
const controls = new OrbitControls(camera, canvas); 
// const controls = new FirstPersonControls(camera, canvas); 

// Tweaking
// gui.add(intensity).min(0).max(1).step(0.01); 
// gui.add(speed).min(0).max(1).step(0.01); 

/*
** Animation Loop 
*/
const clock = new THREE.Clock(); 
let previousTime = 0; 

const animationLoop = () => 
{
    const elapsedTime = clock.getElapsedTime(); 
    const deltaTime = elapsedTime - previousTime; 
    previousTime = elapsedTime; 

    // Character Animation
    if (mixer !== null)
    {
        mixer.update(deltaTime); 
    }

    // Update controls
    controls.update(); 

    // Update renderer
    renderer.render(scene, camera); 

    // Call contionously
    window.requestAnimationFrame(animationLoop); 

}

animationLoop(); 
