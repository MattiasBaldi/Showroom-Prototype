import * as THREE from 'three';
import GUI from 'lil-gui';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';


// Character Walking Parameters
let walkAxis = 'x'; 
let walkSpeed = 1;
let walkStart = 0;
let walkEnd = 1; 

// First person controls parameters
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

// Debug
const gui = new GUI();

const debugUI = {
    get walkSpeed() {
        return walkSpeed;
    },
    set walkSpeed(value) {
        walkSpeed = value;
    },
    get walkAxis() {
        return walkAxis;
    },
    set walkAxis(value) {
        walkAxis = value;
    },
    get walkStart() {
        return walkStart;
    },
    set walkStart(value) {
        walkStart = value;
    },
    get walkEnd() {
        return walkEnd;
    },
    set walkEnd(value) {
        walkEnd = value;
    }
};

const characterDebug = gui.addFolder('Character Control'); 
characterDebug.add(debugUI, 'walkSpeed').min(0).max(5).step(0.01); 
characterDebug.add(debugUI, 'walkAxis', ['x', 'y', 'z']);
characterDebug.add(debugUI, 'walkStart').min(0).max(100).step(1);
characterDebug.add(debugUI, 'walkEnd').min(0).max(100).step(1);

// Canvas
const canvas = document.querySelector('canvas.webgl');

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
** Grid Helper 
*/
const gridHelper = new THREE.GridHelper(50, 50); 
scene.add(gridHelper);

/*
** Controls 
*/
// const Orbitcontrols = new OrbitControls(camera, canvas); 
const controls = new PointerLockControls(camera, canvas); 
const fullscreen = document.querySelector('button.full-screen'); 
const blocker = document.getElementById('blocker'); 
const instructions = document.getElementById('instructions'); 


// Fullscreen mode
fullscreen.addEventListener('click', async () => {
    await new Promise((resolve) => {
        controls.addEventListener('lock', resolve, { once: true });
        controls.lock();
    });

    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) { // Firefox
        canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { // IE/Edge
        canvas.msRequestFullscreen();
    }
});

// Activate controls vs. active instructions/menu
blocker.addEventListener('click', () => 
{
    controls.lock();
}); 

controls.addEventListener('lock', () => 
{
    instructions.style.display = 'none'; 
    blocker.style.display = 'none'; 
})

controls.addEventListener( 'unlock', () =>
{
    blocker.style.display = 'block';
    instructions.style.display = ''; 
}); 

scene.add( controls.object )

// First person key listeners W-A-S-D
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

// Character
let mixer = null; 
let model = null; 
let characterScene = null
let action = null; 
let animation = null;
let material1 = null
let material2 = null
const gltfLoader = new GLTFLoader()
gltfLoader.load('walking_test.glb', 
    (gltf) =>
    { 
        // variables
        characterScene = gltf; 
        model = gltf.scene; 

        // add model
        model.rotation.y += Math.PI * 0.5;
        scene.add(model);

        // allow transparency
        material1 = model.children[0].children[0].material
        material2 = model.children[0].children[1].material
        material1.transparent = true; 
        material2.transparent = true; 

        // Animation
        mixer = new THREE.AnimationMixer(model);
        animation = gltf.animations[0];
        action = mixer.clipAction(animation);
        action.play(); 

        // Console.log()
        console.log( 
            'scene: ', characterScene, '\n' + 
            'model: ', model, '\n' + 
            'Animation: ', animation, '\n' +
            'Action', action, '\n' + 
            'Duration: ', animation.duration, '\n' +
            'Opacity: ', material1.opacity, '\n'
        ); 
        
        // Skeleton
        const skeleton = new THREE.SkeletonHelper(model);
        skeleton.visible = false; 
        scene.add(skeleton);

        /*
        ** GUI
        */

        // Animation speed
        debugUI.speed = action.timeScale; 
        characterDebug.add(debugUI, 'speed').min(0).max(2).step(0.01).name('Animation Speed').onChange((value) => {
                action.timeScale = value; // Update the timeScale of the action if it exists
        });

        // Skeleton visibility
        debugUI.skeleton = skeleton.visible
        characterDebug.add(debugUI, 'skeleton').name('Show Skeleton').onChange((value) => {
            skeleton.visible = value;   
            });
    }
);

// Catwalk

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

// Catwalk visualization
let catWalkLine = null;

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

    // First Person Controls
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
    if ( moveForward || moveBackward ) velocity.z -= (direction.z * 400.0 * (delta));
    if ( moveLeft || moveRight ) velocity.x -= (direction.x * 400.0 * delta);
    controls.moveRight( - velocity.x * delta );
    controls.moveForward( - velocity.z * delta );
    }

    // Sculpture rotation
    sculpture.rotation.set(elapsedTime, elapsedTime, elapsedTime); 

    // Character Walking
    if (model != null)
        {

            //Initiate
            model.position[walkAxis] += delta * walkSpeed;      

            // Reset walking
            if (model.position[walkAxis] > walkEnd)
                {
                    model.position[walkAxis] = walkStart; 
                }

            //Fade model in and out
            const walkPercentage = model.position[walkAxis] / (walkStart + walkEnd);
            const fade = Math.sin(walkPercentage * Math.PI);
            material1.opacity = fade;
            material2.opacity = fade;

             // Visualize catWalk
            if (catWalkLine) 
            {
            scene.remove(catWalkLine);
            catWalkLine.geometry.dispose();
            catWalkLine.material.dispose();
            }

            const catWalkVertices = new Float32Array([
            walkStart, model.position.y - 1, model.position.z,
            walkEnd, model.position.y - 1, model.position.z
            ]);

            const catWalkGeometry = new THREE.BufferGeometry();
            catWalkGeometry.setAttribute('position', new THREE.BufferAttribute(catWalkVertices, 3));
            const catWalkMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
            catWalkLine = new THREE.Line(catWalkGeometry, catWalkMaterial);
            scene.add(catWalkLine);
            
        }

    // Update renderer
    renderer.render(scene, camera); 

    // Orbit controls
    // Orbitcontrols.update(); 

    // Call contionously
    window.requestAnimationFrame(animationLoop); 

}

animationLoop(); 