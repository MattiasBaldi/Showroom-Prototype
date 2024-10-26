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
camera.position.set(10, 1, 0); 
scene.add(camera);

/*
** Controls 
*/
//const Orbitcontrols = new OrbitControls(camera, canvas); 
const controls = new PointerLockControls(camera, canvas); 
const blocker = document.getElementById('blocker'); 
const instructions = document.getElementById('instructions'); 

blocker.addEventListener('click', () => 
{
    controls.lock();
}); 

controls.addEventListener('lock', () => 
{
    instructions.style.display = 'none'; 
    blocker.style.display = 'none'; 
}); 

controls.addEventListener( 'unlock', () =>
{
    blocker.style.display = 'block';
    instructions.style.display = ''; 
    console.log(blocker, instructions);
}); 

scene.add( controls.object )

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
}))

// scene.add(cube); 

// Sculpture
const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
const material = new THREE.MeshStandardMaterial({ color: 'white', metalness: 0.5, roughness: 0.1 });
const sculpture = new THREE.Mesh(geometry, material);
sculpture.position.set(10, 3, 10)
scene.add(sculpture);

/*
** Grid Helper 
*/
// const gridHelper = new THREE.GridHelper(50, 50); 
// scene.add(gridHelper);

// Character
let mixer = null; 
let speed = null; 
let model = null; 



const gltfLoader = new GLTFLoader()
gltfLoader.load('walking_test.glb', 
    (gltf) =>
    { 
        model = gltf.scene; 
        model.rotation.y += Math.PI * 0.5; 
        scene.add(model);

        //const skeleton = new THREE.SkeletonHelper(model);
        // scene.add(skeleton);

        // Animation
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(gltf.animations[0]);
        action.setLoop(THREE.LoopRepeat)
        speed = action.timeScale; // Adjust this value to control the speed of the specific animation
        action.play();  


    }
);


/*
** Light
*/
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
** Renderer 
*/
const renderer = new THREE.WebGLRenderer({canvas: canvas})
renderer.setSize(sizes.width, sizes.height); 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 

// Movement

let movementSpeed = 0.5; 
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

// // Key Listeners
const onKeyDown = function ( event ) {

    switch ( event.code ) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;

        case 'Space':
            if ( canJump === true ) velocity.y += 350;
            canJump = false;
            break;

    }

};
const onKeyUp = function ( event ) {

    switch ( event.code ) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;

    }

};
document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );


/*
** Animation Loop 
*/
const clock = new THREE.Clock(); 
let previousTime = 0; 

const animationLoop = () => 
{
    const elapsedTime = clock.getElapsedTime(); 
    const delta = elapsedTime - previousTime; 
    previousTime = elapsedTime; 

    // Character Animation
    if (mixer !== null)
    {
        mixer.update(delta); 
    }

    // Movement
    if (controls.isLocked) 
    {

    // Velocity & direction
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.normalize(); // this ensures consistent movements in all directions

    // Movement
    if ( moveForward || moveBackward ) velocity.z -= (direction.z * 400.0 * (delta)) * movementSpeed;
    if ( moveLeft || moveRight ) velocity.x -= (direction.x * 400.0 * delta) * movementSpeed;
    controls.moveRight( - velocity.x * delta );
    controls.moveForward( - velocity.z * delta );
    console.log(camera.position)

    }

    sculpture.rotation.set(elapsedTime, elapsedTime, elapsedTime); 

    // Update renderer
    renderer.render(scene, camera); 

    // Call contionously
    window.requestAnimationFrame(animationLoop); 

}

animationLoop(); 