import * as THREE from 'three'
import Experience from '../Experience.js'
import { PointerLockControls } from 'three/examples/jsm/Addons.js'

export default class WASD {
    constructor(camera, canvas)
    {

        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.camera = camera
        this.canvas = canvas

        // Setup
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // Movement flags
        this.accelerate =  0.5;
        this.decelerate =  15;
        this.pointerSpeed  = 2;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;

        this.originalSpeed = this.accelerate
        this.sprint = false; 
        this.sprintSpeed = this.accelerate * 1.5

        this.setKeyMap()
        this.setPointerLockControls()
    
    }

    setLock()
    {
            this.fullscreen = document.querySelector('button.full-screen');
            this.blocker = document.getElementById('blocker'); 
            const experienceCanvas = document.getElementById('experience');
            

            // Unlock
            // When I click on fullscreen icon, the screen becomes fullscreen and the locker locks
            this.fullscreen.addEventListener('click', async () => {
                await new Promise((resolve) => {
                this.PointerLockControls.addEventListener('lock', resolve, { once: true });
                this.PointerLockControls.lock();
                });

                if (!document.fullscreenElement) {
                if (experienceCanvas.requestFullscreen) {
                    this.canvas.requestFullscreen();
                } else if (experienceCanvas.mozRequestFullScreen) { // Firefox
                    this.canvas.mozRequestFullScreen();
                } else if (experienceCanvas.webkitRequestFullscreen) { // Chrome, Safari and Opera
                    this.canvas.webkitRequestFullscreen();
                } else if (experienceCanvas.msRequestFullscreen) { // IE/Edge
                    this.canvas.msRequestFullscreen();
                }
                }
            })

            // When I click the blocker, the controls are locked
            this.blocker.addEventListener('click', () => {
                this.PointerLockControls.lock();
            });

    }

    setKeyMap() {

        const onKeyDown = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = true;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = true;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;

                case 'Space':
                    if (this.canJump === true) this.velocity.y += 350;
                    this.canJump = false;
                    break;

                case 'ShiftLeft':
                case 'ShiftRight':
                    this.sprint = true;
                    console.log('shift clicked')
                    break;
            }
        }

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = false;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = false;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;

                case 'Space':
                    if (this.canJump === true) this.velocity.y += 350;
                    this.canJump = false;
                    break;

                case 'ShiftLeft':
                case 'ShiftRight':
                    console.log('shift up')
                    this.sprint = false;
                    break;
            }
        }

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    }

    setPointerLockControls() {
        this.camera.position.y = 1; 
        this.PointerLockControls = new PointerLockControls(this.camera, this.canvas)
        this.PointerLockControls.pointerSpeed  = this.pointerSpeed; 
    }

    update()
    {
        if (this.PointerLockControls.isLocked) 
            {
            // Velocity & direction
            this.velocity.x -= this.velocity.x * this.decelerate * (0.001 * this.time.delta) * this.accelerate;
            this.velocity.z -= this.velocity.z * this.decelerate * (0.001 * this.time.delta) * this.accelerate;

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize(); // this ensures consistent movements in all directions

            // Movement
            if (this.moveForward || this.moveBackward) this.velocity.z -= (this.direction.z * 400 * (this.time.delta * 0.001) * this.accelerate);
            if (this.moveLeft || this.moveRight) this.velocity.x -= (this.direction.x * 400 * (this.time.delta * 0.001) * this.accelerate);
            this.PointerLockControls.moveRight(-this.velocity.x * (this.time.delta * 0.001) * this.accelerate);
            this.PointerLockControls.moveForward(-this.velocity.z * (this.time.delta * 0.001) * this.accelerate);

            // Sprint
            if (this.sprint) {
                this.accelerate = this.sprintSpeed;
            } else {
                this.accelerate = this.originalSpeed;
            }

        }     
    }
}
