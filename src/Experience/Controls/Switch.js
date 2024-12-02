
// What this does is, it creates an event listener, that works as a switch to toggle between orbitcontrols that pivots around specific object as the pivot point, this eventlistener is removed when camera steps out of the area, and the pivot is only avaiable in that radius as well, the eventlistener is a switch that switches between pointerlock and orbitcontrols

import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Switch {
    constructor(pivotPoint, height, radius)
    {

        this.experience  = new Experience()
        this.camera = this.experience.camera
        this.controls = this.camera.controls
        this.debug = this.experience.debug

        //Setup
        this.pivotPoint = pivotPoint
        this.radius = radius
        this.height = height

        console.log('Pivot Point:', this.pivotPoint);
        console.log('Radius:', this.radius);
        console.log('Height:', this.height);

        this.distance = null;
        this.keydownHandler = this.listener.bind(this);
        this.listenerAdded = false; // Initialize the flag
        this.localPosition = new THREE.Vector3();

    }

    setOrbit()
    {
        console.log('Setting Orbit Controls');
        // Create a vector to store the local position
        this.pivotPoint.localToWorld(this.localPosition)

        // Set pivot point
        this.controls.setControls('OrbitControls')
        this.controls.OrbitControls.target.copy(this.localPosition)
        this.controls.OrbitControls.target.y = this.height
        this.controls.OrbitControls.maxDistance = this.radius; 
    }

    setPointerLock()
    {
        console.log('Setting Pointer Lock Controls');
        this.controls.setControls('PointerLock')
        console.log(this.controls)
    }

    listener(event) {
            console.log('Key pressed:', event.key);
            // if the key pressed was I
            if (event.key === 'I' || event.key === 'i') {
         
            // if orbitcontrols are not active, then activate
            if (!this.controls.OrbitControls) 
            {
                console.log('Orbitcontrols trying to activate');
                this.setOrbit();
            }

            // else if they are active, then removethem 
            else if (this.controls.OrbitControls)
            {
                console.log('PointerLock trying to activate');
                this.setPointerLock();
            }
        }
    }

    setListener()
    {
        console.log('Adding event listener');
        document.addEventListener('keydown', this.keydownHandler);
        this.listenerAdded = true;

        // Create a highlight that shows the hotkey that activates the orbit
        this.instructionOverlay = document.createElement('div')
        this.instructionOverlay.style.border = '1px solid white'
        this.instructionOverlay.style.color = 'white'
        this.instructionOverlay.style.padding = '10px'
        this.instructionOverlay.style.position = 'absolute'
        this.instructionOverlay.style.top = '10px'
        this.instructionOverlay.style.right = '10px'
        this.instructionOverlay.textContent = 'I'
        this.instructionOverlay.style.zIndex = '10'
        document.body.append(this.instructionOverlay);

    }

    removeListener()
    {
        console.log('Removing event listener');
        document.removeEventListener('keydown', this.keydownHandler);
        this.listenerAdded = false;
        if (this.instructionOverlay) {
            this.instructionOverlay.remove();
            this.instructionOverlay = null;
        }
    }

    update()
    {
        // This is the distance that is getting updated
        this.distance = this.camera.instance.position.distanceTo(this.pivotPoint.localToWorld(this.localPosition));
        // console.log(this.distance)

        // if the camera is within radius of the pivotpoint
        if (this.distance <= this.radius)
        {   
            // console.log('Camera is within distance ')
            // if the listener is not already there, then add it 
            if (!this.listenerAdded)
            {
                this.setListener()
            }
        }
        // else if the camera is not within that direction
            else 
            {   
            // console.log('Camera is not within distance')
            //and if there event listener is still there - then remove it 
            if (this.listenerAdded)
            {
                this.removeListener()
            }
        }
    }

}

