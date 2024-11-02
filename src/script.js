import * as THREE from 'three';
import GUI from 'lil-gui';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';


// Character Walking Parameters
let walkAxis = 'x'; 
let walkSpeed = 0.8;
let walkStart = 0;
let walkEnd = 15; 

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
characterDebug.add(debugUI, 'walkSpeed').min(0).max(100).step(0.01); 
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
** Sound 
*/
const sound = new Audio('./sounds/Break_Well.mp3')
sound.loop = true;
sound.volume = 0.5;

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
// const gridHelper = new THREE.GridHelper(50, 50); 
// scene.add(gridHelper);

// Ambient light for positioning
const ambientLight = new THREE.AmbientLight('white', 0.1); 
scene.add(ambientLight); 

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
blocker.addEventListener('click', async () => {
    controls.lock();
    sound.play(); 
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

// catWalk Group
const catWalkGroup = new THREE.Group(); 

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial(
    {  
        color: 'white', 
        // roughness: 0.1,
        // metalness: 0.7
    })
)

floor.receiveShadow = true; 
floor.rotation.x = Math.PI * - 0.5; 
floor.position.x = 3; 
// scene.add(floor)

// Video
var video = document.getElementById('video');
video.muted = true; // Mute the video
video.loop = true; // Loop the video

var texture = new THREE.VideoTexture(video);
texture.needsUpdate;
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.format = THREE.RGBFormat;
texture.crossOrigin = 'anonymous';

const videoPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(10,10),
    new THREE.MeshBasicMaterial({ map: texture }),);
videoPlane.rotation.y = Math.PI * 0.5; 
videoPlane.position.x = 0.5; 
videoPlane.position.y = 5; 
catWalkGroup.add( videoPlane );

video.src = "./videos/PLN.mp4";
video.load();
video.play();

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
const sculptureGroup = new THREE.Group();
const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
const material = new THREE.MeshStandardMaterial({ color: 'white', metalness: 0.5, roughness: 0.01 });
const sculpture = new THREE.Mesh(geometry, material);
sculpture.position.set(0, 3, 0);
// sculptureGroup.add(sculpture);

// Sculpture light
const sculptureLight = new THREE.SpotLight('white', 10, 20, Math.PI * 0.5, 0.05);
sculptureLight.position.set(0, 0, 0);
sculptureLight.target = sculpture;
sculptureGroup.add(sculptureLight);

// Light Helper
const spotLightHelper = new THREE.SpotLightHelper(sculptureLight); 
// sculptureGroup.add(spotLightHelper);

sculptureGroup.position.set(25, 0, 25); 
scene.add(sculptureGroup)

// Character
let mixer = null; 
let model = null; 
let characterScene = null
let action = null; 
let animation = null;
let material1 = null
let material2 = null
const gltfLoader = new GLTFLoader()
gltfLoader.load('/models/walking_test.glb', 
    (gltf) =>
    { 
        // variables
        characterScene = gltf; 
        model = gltf.scene; 

        // add model
        model.rotation.y += Math.PI * 0.5;
        catWalkGroup.add(model);

        // allow transparency
        material1 = model.children[0].children[0].material
        material2 = model.children[0].children[1].material
        material1.transparent = true; 
        material2.transparent = true; 
        material1.roughness = 0; 
        material2.roughness = 0; 
        material1.metalness = 0.7; 
        material2.metalness = 0.7; 

        // Shadow
        model.children[0].children[0].castShadow = true;
        model.children[0].children[1].castShadow = true;
        // model.children[0].children[0].receiveShadow = true;
        // model.children[0].children[1].receiveShadow = true;  

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
            'Action', action, '\n'
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

// Scene
gltfLoader.load('/scenes/scene_3.glb', (gltf) => {
    // Traverse the scene to update materials and add spotlights
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            // Update material
            child.material = new THREE.MeshStandardMaterial({
                color: child.material.color,
                roughness: 0.5,
                metalness: 0.5
            });

            // Create and position a spotlight above the mesh
            const spotlight = new THREE.SpotLight(0xffffff, 100); // White light with intensity 1
            spotlight.position.set(child.position.x, child.position.y + 7, child.position.z); // Position above the mesh
            spotlight.target = child; // Point the spotlight at the mesh

            // Adjust the spotlight properties
spotlight.angle = Math.PI / 6; // Narrower beam
spotlight.distance = 10; // Limit the distance the light travels
spotlight.penumbra = 0.5; // Soft edges

            scene.add(spotlight);
        }
    });

    // Scale the scene
    gltf.scene.scale.setScalar(5);
    scene.add(gltf.scene);
    
    // Create an AnimationMixer and play all animations
    const mixer = new THREE.AnimationMixer(gltf.scene);
    gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
    });

    // Store the mixer for updating in the animation loop
    mixers.push(mixer);
    console.log('GLTF scene:', gltf.scene);
});

// Array to store mixers
const mixers = [];

/*
** Light
*/
const catWalkLight = new THREE.SpotLight('grey', 80, 4, 0.6, 0.5, 0)
catWalkLight.position.set(0, -1, 0)

const catWalkLight2 = new THREE.SpotLight('grey', 20, 6, 0.6, 0.5, 0)
catWalkLight2.position.set(0, 5, 0)

catWalkLight.castShadow = true; 
catWalkLight2.castShadow = true; 

catWalkLight.shadow.mapSize.width = 512; 
catWalkLight.shadow.mapSize.height = 512; 
// catWalkLight.shadow.camera.near = 1; 
// catWalkLight.shadow.camera.far = 5; 

catWalkLight2.shadow.mapSize.width = 512; 
catWalkLight2.shadow.mapSize.height = 512; 
// catWalkLight2.shadow.camera.near = 1; 
// catWalkLight2.shadow.camera.far = 5; 

// Helpers
const catWalkLightHelper = new THREE.SpotLightHelper(catWalkLight)
const catWalkLightHelper2 = new THREE.SpotLightHelper(catWalkLight2)
catWalkGroup.add(catWalkLightHelper, catWalkLightHelper2); 

catWalkGroup.add(catWalkLight, catWalkLight2); 

/*
** Renderer 
*/
const renderer = new THREE.WebGLRenderer({canvas: canvas})
renderer.setSize(sizes.width, sizes.height); 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
renderer.shadowMap.enabled = true; 

// Catwalk group
let catWalkLine = null;
// scene.add(catWalkGroup); 

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
    
        mixers.forEach((mixer) => {
            mixer.update(delta);
        });

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
            // if (catWalkLine) 
            // {
            // catWalkGroup.remove(catWalkLine);
            // catWalkLine.geometry.dispose();
            // catWalkLine.material.dispose();
            // }

            // const catWalkVertices = new Float32Array([
            // walkStart, model.position.y - 1, model.position.z,
            // walkEnd, model.position.y - 1, model.position.z
            // ]);

            // const catWalkGeometry = new THREE.BufferGeometry();
            // catWalkGeometry.setAttribute('position', new THREE.BufferAttribute(catWalkVertices, 3));
            // const catWalkMaterial = new THREE.LineBasicMaterial({ });
            // catWalkLine = new THREE.Line(catWalkGeometry, catWalkMaterial);
            // catWalkGroup.add(catWalkLine);

            // Points light at model
            catWalkLight.target = model;
            catWalkLight.position[walkAxis] = model.position[walkAxis];
            catWalkLight2.target = model;
            catWalkLight2.position[walkAxis] = model.position[walkAxis];

            //Light Helper
            // catWalkLightHelper2.position[walkAxis] = model.position[walkAxis];
            // catWalkLightHelper2.update();
            // catWalkLightHelper.position[walkAxis] = model.position[walkAxis];
            // catWalkLightHelper.update();

        }

    // Put Cat Walk light on model
    // catWalkLight.position = model.position

    // Update renderer
    renderer.render(scene, camera); 

    // Orbit controls
    // Orbitcontrols.update(); 

    // Call contionously
    window.requestAnimationFrame(animationLoop); 

}

animationLoop(); 