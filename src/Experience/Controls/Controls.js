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

        // Debug
        if (this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Controls')
            this.debugFolder.close()
        }
        }

    reset()
    {
        // Remove eventListeners
        const fullscreen = document.querySelector('button.full-screen');
        const blocker = document.getElementById('blocker');
        const fullscreenClone = fullscreen.cloneNode(true)
        fullscreen.parentNode.replaceChild(fullscreenClone, fullscreen)
        const blockerClone = blocker.cloneNode(true)
        blocker.parentNode.replaceChild(blockerClone, blocker)

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

    setOrbitFullscreenMode()
    {
    const fullscreen = document.querySelector('button.full-screen');
    const blocker = document.getElementById('blocker');
    
    fullscreen.addEventListener('click', () =>
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
    })

    // Escape toggles menu
    document.addEventListener('keydown', (event) =>
      {
        if  (!this.wasd)
        {
        if(event.key === 'Escape')
        {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
             blocker.style.display = 'block'
        }
    }
    else {

    }
      })

    // Click on display toggles gameplay
    blocker.addEventListener('click', () =>
        {
            blocker.style.display = 'none'
        })
    }

    setOrbitControls() {
        console.log('OrbitControls')
        this.reset()
        this.OrbitControls = new OrbitControls(this.camera, this.canvas); 
        this.OrbitControls.enableDamping = true;
        this.setOrbitFullscreenMode()
    }

    setWASDControls()
    {
        console.log('WASD')
        this.reset()
        this.wasd = new WASD(this.camera, this.canvas);
    }
  
    setControls(switchState) {
    
        console.log('switch controls')
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
            console.log('OrbitControls updated')
        }

        if (this.wasd) {
            this.wasd.update()
            console.log('Pointerlock updated')
        }

    }
}
