import * as THREE from 'three'
import Experience from '../Experience.js'

export default class PositionalAudio {

    constructor(sound_name, object, distance = 20) {
        // Setup
        this.experience = new Experience()
        this.camera = this.experience.camera.instance

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        this.camera.add(listener);

        // create the PositionalAudio object (passing in the listener)
        const sound = new THREE.PositionalAudio(listener);

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(
            `/sounds/${sound_name}.mp3`,
            function(buffer) {
                sound.setBuffer(buffer);
                // sound.setRefDistance(distance);
                sound.setMaxDistance(distance);
                sound.setRolloffFactor(distance)
                sound.play();
                object.add(sound);
            },
            undefined,
            function(err) {
                console.error('An error occurred while loading the audio file:', err);
            }
        );

        object.add(sound);
    }
}