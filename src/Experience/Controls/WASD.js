import * as THREE from 'three'
import Experience from '../Experience.js'
import { PointerLockControls } from 'three/examples/jsm/Addons.js'

export default class WASD {
    constructor(arbitraryCameraParameter, arbitraryCanvasParameter)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        this.time = this.experience.time

        // Setup
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // Movement flags
        this.moveSpeed =  1; 
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;

        this.setKeyMap()
        this.setPointerLockControls(arbitraryCameraParameter, arbitraryCanvasParameter)
        this.setLock(arbitraryCanvasParameter)
    }

    setLock(arbitraryCanvasParameter)
    {
            this.fullscreen = document.querySelector('button.full-screen');
            this.blocker = document.getElementById('blocker'); 

            // Active on fullscreen click
            this.fullscreen.addEventListener('click', async () => {
                await new Promise((resolve) => {
                this.PointerLockControls.addEventListener('lock', resolve, { once: true });
                this.PointerLockControls.lock();
                });

                if (!document.fullscreenElement) {
                if (this.experience.canvas.requestFullscreen) {
                    this.experience.canvas.requestFullscreen();
                } else if (this.experience.canvas.mozRequestFullScreen) { // Firefox
                    this.experience.canvas.mozRequestFullScreen();
                } else if (this.experience.canvas.webkitRequestFullscreen) { // Chrome, Safari and Opera
                    this.experience.canvas.webkitRequestFullscreen();
                } else if (this.experience.canvas.msRequestFullscreen) { // IE/Edge
                    this.experience.canvas.msRequestFullscreen();
                }
                }
            })

            // Activate on blocker click
            this.blocker.addEventListener('click', () => {
                this.PointerLockControls.lock();
            });

            // 
            this.PointerLockControls.addEventListener('unlock', () => {
                this.blocker.style.display = 'block'
            });

            this.PointerLockControls.addEventListener('lock', () => {
                this.blocker.style.display = 'none'
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
            }
        }

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    }

    setPointerLockControls(arbitraryCameraParameter, arbitraryCanvasParameter) {
        arbitraryCameraParameter.position.y = 1; 
        this.PointerLockControls = new PointerLockControls(arbitraryCameraParameter, arbitraryCanvasParameter)
        this.setLock(arbitraryCanvasParameter)
        this.setKeyMap()
    }

    update()
    {
        if (this.PointerLockControls.isLocked) {
            // Velocity & direction
            this.velocity.x -= this.velocity.x * 10 * (0.001 * this.time.delta) * this.moveSpeed;
            this.velocity.z -= this.velocity.z * 10 * (0.001 * this.time.delta) * this.moveSpeed;

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize(); // this ensures consistent movements in all directions

            // Movement
            if (this.moveForward || this.moveBackward) this.velocity.z -= (this.direction.z * 400 * (this.time.delta * 0.001) * this.moveSpeed);
            if (this.moveLeft || this.moveRight) this.velocity.x -= (this.direction.x * 400 * (this.time.delta * 0.001) * this.moveSpeed);
            this.PointerLockControls.moveRight(-this.velocity.x * (this.time.delta * 0.001) * this.moveSpeed);
            this.PointerLockControls.moveForward(-this.velocity.z * (this.time.delta * 0.001) * this.moveSpeed);
        }     
    }
}