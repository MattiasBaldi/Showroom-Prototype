import * as THREE from 'three'
import Experience from './Experience.js'

export default class Audio {

    constructor() {
        
        // Setup
        this.experience = new Experience()
        this.camera = this.experience.camera.instance
        this.scene_1 = this.experience.world.scene_1
        this.scene_2 = this.experience.world.scene_2
        this.scene_3 = this.experience.world.scene_3
        this.resources = this.experience.resources
        this.loader = this.resources.loaders.audioLoader
        this.sounds = []


        // setAudio
        console.log(this.resources.items)
        this.setPositionalAudio('Test', this.scene_1.posedBody)

        // Mute Button
        this.toggleMute()

    }

    setPositionalAudio(audioName, object, distance = 1)
    {
        const audio = this.resources.items[audioName]

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        this.camera.add(listener);

        // create the PositionalAudio object (passing in the listener)
        const sound = new THREE.PositionalAudio(listener);

        // settings
        sound.setRefDistance(distance);
        sound.setBuffer(audio); // Use the correct audio buffer
        sound.setMaxDistance(distance);
        sound.setRolloffFactor(distance);
        sound.play();
        sound.setLoop(true);

        // add to scene
        object.add(sound);
        this.sounds.push(sound)

    }

    toggleMute()
    {
        const toggle = document.querySelector('.sound')

        console.log(toggle)
        const toggleOn = document.querySelector('.sound .on')
        const toggleOff = document.querySelector('.sound .off')

        toggle.addEventListener('click', () =>
        {

            // Mute
            if(toggleOn.style.display === 'block')
            {
                this.sounds.forEach((sound) => {sound.pause()})
                toggleOn.style.display = 'none'
                toggleOff.style.display = 'block'
            }

            // Unmute
            else
            {
                this.sounds.forEach((sound) => {sound.play()})
                toggleOff.style.display = 'none'    
                toggleOn.style.display = 'block'
            }
        })
    }


}

