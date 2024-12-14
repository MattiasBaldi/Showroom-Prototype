import './style.css'
import Experience from './Experience/Experience.js'

const experience = new Experience(document.querySelector('canvas.webgl')); 


// import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// // First person controls parameters
// let moveForward = false;
// let moveBackward = false;
// let moveLeft = false;
// let moveRight = false;
// let canJump = false;


// /*
// ** Sound 
// */
// const sound = new Audio('./sounds/Break_Well.mp3')
// sound.loop = true;
// sound.volume = 0.5;

// window.addEventListener('resize', () => 
// {
//     // Update sizes
//     sizes.width = window.innerWidth;
//     sizes.height = window.innerHeight; 

//     // Update camera
//     camera.aspect = sizes.width / sizes.height; 
//     camera.updateProjectionMatrix()

//     // Update renderer
//     renderer.setSize(sizes.width, sizes.height); 
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 

// /*
// ** Controls 
// */
// // const Orbitcontrols = new OrbitControls(camera, canvas); 
// const controls = new PointerLockControls(camera, canvas); 
// const fullscreen = document.querySelector('button.full-screen'); 
// const blocker = document.getElementById('blocker'); 
// const instructions = document.getElementById('instructions'); 

// // Fullscreen mode
// fullscreen.addEventListener('click', async () => {
//     await new Promise((resolve) => {
//         controls.addEventListener('lock', resolve, { once: true });
//         controls.lock();
//     });

//     if (canvas.requestFullscreen) {
//         canvas.requestFullscreen();
//     } else if (canvas.mozRequestFullScreen) { // Firefox
//         canvas.mozRequestFullScreen();
//     } else if (canvas.webkitRequestFullscreen) { // Chrome, Safari, and Opera
//         canvas.webkitRequestFullscreen();
//     } else if (canvas.msRequestFullscreen) { // IE/Edge
//         canvas.msRequestFullscreen();
//     }
// });

// // Activate controls vs. active instructions/menu
// blocker.addEventListener('click', async () => {
//     controls.lock();
//     sound.play(); 
// }); 

// controls.addEventListener('lock', () => 
// {
//     instructions.style.display = 'none'; 
//     blocker.style.display = 'none'; 
// })

// controls.addEventListener( 'unlock', () =>
// {
//     blocker.style.display = 'block';
//     instructions.style.display = ''; 
// }); 

// scene.add( controls.object )


// // First person key listeners W-A-S-D
// const onKeyDown = function ( event ) {

//     switch ( event.code ) {

//         case 'ArrowUp':
//         case 'KeyW':
//             moveForward = true;
//             break;

//         case 'ArrowLeft':
//         case 'KeyA':
//             moveLeft = true;
//             break;

//         case 'ArrowDown':
//         case 'KeyS':
//             moveBackward = true;
//             break;

//         case 'ArrowRight':
//         case 'KeyD':
//             moveRight = true;
//             break;

//         case 'Space':
//             if ( canJump === true ) velocity.y += 350;
//             canJump = false;
//             break;

//     }

// };

// const onKeyUp = function ( event ) {

//     switch ( event.code ) {

//         case 'ArrowUp':
//         case 'KeyW':
//             moveForward = false;
//             break;

//         case 'ArrowLeft':
//         case 'KeyA':
//             moveLeft = false;
//             break;

//         case 'ArrowDown':
//         case 'KeyS':
//             moveBackward = false;
//             break;

//         case 'ArrowRight':
//         case 'KeyD':
//             moveRight = false;
//             break;

//     }

// };
// document.addEventListener( 'keydown', onKeyDown );
// document.addEventListener( 'keyup', onKeyUp );

// // catWalk Group
// const catWalkGroup = new THREE.Group(); 

// // Floor
// const floor = new THREE.Mesh(
//     new THREE.PlaneGeometry(50, 50),
//     new THREE.MeshStandardMaterial(
//     {  
//         color: 'white', 
//         // roughness: 0.1,
//         // metalness: 0.7
//     })
// )

// floor.receiveShadow = true; 
// floor.rotation.x = Math.PI * - 0.5; 
// floor.position.x = 3; 
// // scene.add(floor)

// // Video
// // var video = document.getElementById('video');
// // video.muted = true; // Mute the video
// // video.loop = true; // Loop the video

// // var texture = new THREE.VideoTexture(video);
// // texture.needsUpdate;
// // texture.minFilter = THREE.LinearFilter;
// // texture.magFilter = THREE.LinearFilter;
// // texture.format = THREE.RGBFormat;
// // texture.crossOrigin = 'anonymous';

// // const videoPlane = new THREE.Mesh(
// //     new THREE.PlaneGeometry(10,10),
// //     new THREE.MeshBasicMaterial({ map: texture }),);
// // videoPlane.rotation.y = Math.PI * 0.5; 
// // videoPlane.position.x = 0.5; 
// // videoPlane.position.y = 5; 
// // catWalkGroup.add( videoPlane );

// // video.src = "./videos/PLN.mp4";
// // video.load();
// // video.play();

// // Scene 2, Interactive art, Tornado

// // const scene2 = new THREE.Group(); 
// // scene2.position.z = 10; 


// // ShaderMaterial for vertex displacement
// // Create a box geometry
// const boxgeometry = new THREE.BoxGeometry(2, 2, 2, 40, 40, 40);

// const boxMaterial = new THREE.ShaderMaterial({
//     vertexShader: `
//       varying vec3 vNormal;
//       uniform float time;
  
//       void main() {
//         vNormal = normal;
//         vec3 newPosition = position + normal * sin(position.x * 5.0 + time) * 0.2;
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
//       }
//     `,
//     fragmentShader: `
//       varying vec3 vNormal;
//       void main() {
//         vec3 color = vec3(0.8, 0.8, 0.8); // Metallic color
//         float metallic = 1.0;
//         float roughness = 0.0;
//         gl_FragColor = vec4(color * metallic, 1.0);
//       }
//     `,
//     uniforms: {
//       time: { value: 0 }
//     },
//     wireframe: true,
//   });
  
//   // Create the scene_2
//   const box = new THREE.Mesh(boxgeometry, boxMaterial);
//   box.position.z = 20; 
//   scene.add(box);

// // Scene 3, Interior design room
// gltfLoader.load('/scenes/scene_3.glb', 
//     (gltf) =>
//     {
//         // objects
//         const scene3 = gltf.scene
//         const room = scene3.children[0];
//         const roomClone = room.clone();
//         const chairs = scene3.children[1]
//         const table = scene3.children[2]

//         // Material
//         const chromeMaterial = new THREE.MeshStandardMaterial({metalness: '1', roughness: '0.01'})
//         chairs.material = chromeMaterial
//         table.material = chromeMaterial
//         room.material = new THREE.MeshStandardMaterial({ color: 'white', wireframe: true, side: THREE.BackSide });
//         roomClone.material = new THREE.MeshStandardMaterial({ metalness: '1', roughness: '0.01', side: THREE.FrontSide });
//         roomClone.position.set(0, 0, -25);

//         scene3.position.set(0, 0, -25);
//         scene.add(scene3,roomClone)
//         console.log(
//         'Scene 3 ', '\n' +
//         'scene: ', scene3, '\n' + 
//         'Position', scene3.position, '\n'
    
//         ); 
//     }
// )

// // Lights
// const big_light  = new THREE.PointLight('white', 1, 100, 0);
// big_light.position.y = 15;  

// scene.add(big_light);

// const big_light_helper = new THREE.PointLightHelper(big_light); 
// scene.add(big_light_helper); 

// /*
// ** Renderer 
// */
// const renderer = new THREE.WebGLRenderer({canvas: canvas})
// renderer.setSize(sizes.width, sizes.height); 
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
// renderer.shadowMap.enabled = true; 

// // Catwalk group
// let catWalkLine = null;
// scene.add(catWalkGroup); 

// /*
// ** Animation Loop 
// */
// const clock = new THREE.Clock(); 
// let previousTime = 0; 

// const animationLoop = () => 
// {
//     const elapsedTime = clock.getElapsedTime(); 
//     const delta = elapsedTime - previousTime; 
//     previousTime = elapsedTime; 

//     // First Person Controls
//     if (controls.isLocked) 
//     {

//     // Velocity & direction
//     const velocity = new THREE.Vector3();
//     const direction = new THREE.Vector3();
//     velocity.x -= velocity.x * 10.0 * delta;
//     velocity.z -= velocity.z * 10.0 * delta;
//     direction.z = Number( moveForward ) - Number( moveBackward );
//     direction.x = Number( moveRight ) - Number( moveLeft );
//     direction.normalize(); // this ensures consistent movements in all directions

//     // Movement
//     if ( moveForward || moveBackward ) velocity.z -= (direction.z * 400.0 * (delta));
//     if ( moveLeft || moveRight ) velocity.x -= (direction.x * 400.0 * delta);
//     controls.moveRight( - velocity.x * delta );
//     controls.moveForward( - velocity.z * delta );
//     }
    
//     // Update renderer
//     renderer.render(scene, camera); 

//     //Box animation
//     box.rotation.x += 0.01;
//     box.rotation.y += 0.01;
//     boxMaterial.uniforms.time.value += 0.1 ; // Convert to seconds

//     // Call contionously
//     window.requestAnimationFrame(animationLoop); 

// }

// animationLoop(); 