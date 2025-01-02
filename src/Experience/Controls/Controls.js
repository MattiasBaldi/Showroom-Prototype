import Experience from '../Experience.js'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import  WASD from './WASD.js'

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

            // this.debugFolder.add(this.wasd, 'move   Speed').min(0).max(2).step(0.01).name('Movement Speed');
            // this.debugFolder.add(this.wasd.PointerLockControls, 'pointerSpeed').min(0.1).max(5).step(0.1).name('Pointer Speed');
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
            this.wasd.PointerLockControls.unlock();
            this.wasd.PointerLockControls.dispose(); 
            this.wasd = null;
        }

    }

    setFullscreen()
    {
    const fullscreen = document.querySelector('button.full-screen');
    const blocker = document.getElementById('blocker');

    // Clicking on the fullscreen icon toggles fullscreen and removes blocker
     const experienceCanvas = document.body
    
    fullscreen.addEventListener('click', () =>
    {
        const setFullscreen = () =>
            {
                if (!document.fullscreenElement) {
                    if (experienceCanvas.requestFullscreen) {
                        experienceCanvas.requestFullscreen();
                    } else if (experienceCanvas.mozRequestFullScreen) { // Firefox
                        experienceCanvas.mozRequestFullScreen();
                    } else if (experienceCanvas.webkitRequestFullscreen) { // Chrome, Safari and Opera
                        experienceCanvas.webkitRequestFullscreen();
                    } else if (experienceCanvas.msRequestFullscreen) { // IE/Edge
                        experienceCanvas.msRequestFullscreen();
                    }
                } 
        }
    
        if (this.OrbitControls) 
        {
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
                blocker.style.display = 'none'
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
                };
                
                waitforPointerLock();
            }
        });



    }

    setOrbitControls() {
        this.reset()
        this.OrbitControls = new OrbitControls(this.camera, this.canvas); 
        this.OrbitControls.enableDamping = true;
    }

    setWASDControls()
    {
        this.reset()
        this.wasd = new WASD(this.camera, this.canvas);
        this.wasd.PointerLockControls.lock()
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

}

    update() {

        if (this.OrbitControls) {
            this.OrbitControls.update()

            // Remove debug of the old this.wasd instance
            if (this.debug.active && this.debugFolder.children.length !== 0)
            {
                this.debugFolder.controllers.forEach(controller => controller.destroy());
            } 
        
        }
        
        if (this.wasd) {
            this.wasd.update()

            // Add debug of the new this.wasd instance
            if (this.debug.active && this.debugFolder.children.length === 0)
            {
            this.debugFolder.add(this.wasd, 'moveSpeed').min(0).max(2).step(0.01).name('Movement Speed');
            this.debugFolder.add(this.wasd.PointerLockControls, 'pointerSpeed').min(0.1).max(5).step(0.1).name('Pointer Speed');
            }

        }

}
}