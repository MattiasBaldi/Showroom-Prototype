import Experience from '../Experience.js'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import  WASD from './WASD.js'
import * as THREE from 'three'

export default class Controls {
    constructor(camera, canvas) {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.canvas = this.experience.canvas
        this.camera = camera
        this.canvas = canvas

        // Controls
        this.OrbitControls = null;
        this.wasd = null;
        this.setFullscreen()

        // Debug
        if (this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Controls')
            this.debugFolder.close()
        }
        }

    reset()
    {
        if (this.OrbitControls) 
        {
        this.OrbitControls.dispose();
        this.OrbitControls = null; 
        }

        if (this.wasd) 
        {
            this.wasd.PointerLockControls.dispose(); 
            this.wasd = null;
        }
    }

    setFullscreen()
    {
    const fullscreen = document.querySelector('button.full-screen');
    const blocker = document.getElementById('blocker');

    // Clicking on the fullscreen icon toggles fullscreen and removes blocker
    fullscreen.addEventListener('click', () =>
    {
        const setFullscreen = () =>
            {
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
        }
    
        if (this.OrbitControls) 
        {
        console.log('Fullscreen')
        setFullscreen();  
        }
        else if (this.wasd)
            {

        const waitforPointerLock = async () => {
            this.wasd.PointerLockControls.lock();
        
            // Polling until isLocked is true
            while (!this.wasd.PointerLockControls.isLocked) {
                await new Promise(resolve => setTimeout(resolve, 50));  // Check every 50ms
            }
        
            setFullscreen()  // Remove blocker once locked
            console.log('Blocker removed');
        };
        
        waitforPointerLock();
        }
    })

    // Escape toggles menu
    document.addEventListener('keydown', (event) =>
      {
        if(event.key === 'Escape')
        {
             blocker.style.display = 'block'
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
        }
    })

    // Click on display toggles gameplay
    blocker.addEventListener('click', () =>
        {
            if(this.OrbitControls)
            {
                console.log('Not locked controls')
                blocker.style.display = 'none'
                console.log('Blocker removed')
            }

            else if (this.wasd) 
            {

                const waitforPointerLock = async () => {
                    this.wasd.PointerLockControls.lock();
                
                    // Polling until isLocked is true
                    while (!this.wasd.PointerLockControls.isLocked) {
                        await new Promise(resolve => setTimeout(resolve, 50));  // Check every 50ms
                    }
                
                    blocker.style.display = 'none';  // Remove blocker once locked
                    console.log('Blocker removed');
                };
                
                waitforPointerLock();
            }
        });



    }

    setOrbitControls() {
        this.reset()
        this.OrbitControls = new OrbitControls(this.camera, this.canvas); 
        this.OrbitControls.enableDamping = true;
        // this.setOrbitFullscreenMode()
    }

    setWASDControls()
    {
        this.reset()
        this.wasd = new WASD(this.camera, this.canvas);
    }
  
    setControls(switchState) {
    
        // Switch
        switch (switchState) {   
            case 'OrbitControls':
                this.setOrbitControls()
                break;

            case 'PointerLock':
                this.setWASDControls()
                break;
            
            default:
                this.setOrbitControls()
        }


        //Debug
        // if (this.debug.active)
        // {
        //     this.debugFolder
        //         .add({ mode: ['PointerLock', 'OrbitControls'] }, 'mode')
        //         .name('Switch')
        //         .onChange((value) => 
        //         {
        //             this.switch = value;
        //             this.setControls(this.camera, this.canvas, value);
        //         });
        // }
}

    update() {

        if (this.OrbitControls) {
            this.OrbitControls.update()
        }

        if (this.wasd) {
            this.wasd.update()
        }

    }
}
