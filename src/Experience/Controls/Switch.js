import * as THREE from 'three'
import Experience from '../Experience.js'

/*
    What this does is, it creates an event listener, 
    that works as a switch to toggle between orbitcontrols with a pivot point around a specific object.
    This eventlistener is removed when the camera steps out of the area, and the pivot is only avaiable in that radius as well, 
    the eventlistener is a switch that switches between pointerlock and orbitcontrols.
 */


export default class Switch {
    constructor(pivotPoint, radius, Orbitactive = false)
    {

        this.experience  = new Experience()
        this.camera = this.experience.camera
        this.controls = this.camera.controls
        this.debug = this.experience.debug

        //Setup
        this.pivotPoint = pivotPoint
        this.radius = radius
        this.active = null

        //Overlay
        this.overlay = document.querySelector(`.${this.pivotPoint.name}`);
        this.orbitToggleButton = document.querySelector('#orbit-objects .toggleButton')

        this.distance = null;
        this.keydownHandler = this.listener.bind(this);
        this.listenerAdded = false;

        return this.active
    }

    setOrbit()
    {
        // Create a vector to store the local position
        const localPosition = new THREE.Vector3();
        this.pivotPoint.localToWorld(localPosition);

        // Set pivot point
        this.controls.setControls('OrbitControls')
        this.controls.OrbitControls.autoRotate = true;
        this.controls.OrbitControls.autoRotateSpeed = 2;
        this.controls.OrbitControls.target.copy(localPosition)
        this.controls.OrbitControls.maxDistance = this.radius - 0.1;

        // Set overlay 
        this.overlay.classList.add('active')

        // set active
        this.active = true
    }

    setWASD()
    {
        this.controls.setControls('PointerLock')
        this.overlay.classList.remove('active')
        this.active = false
    }

    listener(event) {
            // if the key pressed was I
            if (event.key === 'I' || event.key === 'i') {
         
            // if orbitcontrols are not active, then activate
            if (!this.controls.OrbitControls) 
            {
                this.setOrbit();
            }

            // else if they are active, then remove them 
            else if (this.controls.OrbitControls)
            {
                this.setWASD();
            }
        }
    }

    setListener()
    {
        document.addEventListener('keydown', this.keydownHandler);
        this.listenerAdded = true;

        // Create a highlight that shows the hotkey that activates the orbit
     
        this.orbitToggleButton.style.display = 'block'

    }

    removeListener()
    {
        document.removeEventListener('keydown', this.keydownHandler);
        this.listenerAdded = false;
        if (this.orbitToggleButton.style.display = 'block') {
            this.orbitToggleButton.style.display = 'none'
        }
    }

    update()
    {

        this.distance = this.camera.instance.position.distanceTo(this.pivotPoint.localToWorld(new THREE.Vector3()));

        // if the camera is within radius of the pivotpoint
        if (this.distance <= this.radius)
        {   
            // if the listener is not already there, then add it 
            if (!this.listenerAdded)
            {
                this.setListener()
            }
        }
        // else if the camera is not within that direction
            else 
            {   
            //and if there event listener is still there - then remove it 
            if (this.listenerAdded)
            {
                this.removeListener()
            }
        }
    }
}