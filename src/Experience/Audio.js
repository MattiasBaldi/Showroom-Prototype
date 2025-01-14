import * as THREE from 'three'
import Experience from './Experience.js'
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';

export default class Audio {

    constructor() {
        
        // Setup
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.camera = this.experience.camera.instance
        this.scene = this.experience.scene
        this.scene_0 = this.experience.world.scene_0
        this.scene_1 = this.experience.world.scene_1
        this.scene_2 = this.experience.world.scene_2
        this.scene_3 = this.experience.world.scene_3
        this.resources = this.experience.resources
        this.loader = this.resources.loaders.audioLoader
        this.sounds = []

        // Debug
        if (this.debug.active)
            {
                this.debugFolder = this.debug.ui.addFolder('Sound')
                this.debugFolder.close()
            }

        // Positional Audio
        this.setPositionalAudio('Audio_Scene_3', this.scene_1.model, 5, 2)
        this.setPositionalAudio('Audio_Scene_2', this.scene_2.sphere)
        this.setPositionalAudio('Audio_Scene_3', this.scene_3.empty)

        // Directional Audio
        this.setDirectionalAudio('Audio_Scene_0',  this.scene_0.catWalk, 2, 8, 0.1)
     
        // Mute Button
        this.toggleMute()

        // Handle visibility change
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    }

    handleVisibilityChange() {

        const toggleOn = document.querySelector('.sound .on')
        const toggleOff = document.querySelector('.sound .off')

        if (document.hidden) {
            this.sounds.forEach((sound) => sound.pause())
        } else if (!document.hidden && toggleOn){
            this.sounds.forEach((sound) => sound.play());
        }
    }

    setPositionalAudio(audioName, object, refDistance = 40, rollOffFactor = 5, distanceModel = 'exponential'  )
    {
        const audio = this.resources.items[audioName]

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        this.camera.add(listener);

        // create the PositionalAudio object (passing in the listener)
        const sound = new THREE.PositionalAudio(listener);

        // settings
        sound.setBuffer(audio); // Use the correct audio buffer
        sound.setRefDistance(refDistance); // The radius from the object where the audio will play at 100%
        sound.setRolloffFactor(rollOffFactor); // The amount that the audio will decrease after getting out of that radius
        sound.setDistanceModel(distanceModel) // The way in which the audio will decrease (exponential, linear etc.)
        // sound.setMaxDistance('x') // The distance which the rollOff stops happening at (default is indefinite)
        sound.play();
        sound.setLoop(true);

        // add to scene
        object.add(sound);
        this.sounds.push(sound)

        // Debug
        if (this.debug.active)
        {

            // helper
            const helper = new PositionalAudioHelper(sound, refDistance)
            sound.add(helper)
            sound.visible = true;

            const soundFolder = this.debugFolder.addFolder(`Audio: ${object.name}`)
            soundFolder.close()

            const debugObject = 
            {
                refDistance: sound.panner.refDistance,
                maxDistance: sound.panner.maxDistance,
                rollOff: sound.panner.rolloffFactor,
                distanceModel: sound.panner.distanceModel
            }
            soundFolder.add(debugObject, 'refDistance').min(0).max(100).step(0.01).name('Ref Distance').onChange((value) => sound.setRefDistance(value))
            soundFolder.add(debugObject, 'maxDistance').min(0).max(10).step(0.01).name('Max Distance').onChange((value) => sound.setMaxDistance(value))
            soundFolder.add(debugObject, 'rollOff').min(0).max(100).step(0.01).name('Roll Off').onChange((value) => sound.setRolloffFactor(value))
            soundFolder.add(debugObject, 'distanceModel', ['linear', 'inverse', 'exponential']).name('Distance Model').onChange((value) => sound.setDistanceModel(value))
            soundFolder.add({ visible: true }, 'visible').name('Toggle Visibility').onChange((value) => {
                sound.visible = value;
                helper.visible = value;
                helper.update();
            });
            

        }
    }

    setDirectionalAudio(audioName, object, coneInner = 180, coneOuter = 180, gain = 1, refDistance = 40, rollOffFactor = 5, distanceModel = 'exponential')
    {
        const audio = this.resources.items[audioName]

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        this.camera.add(listener);

        // create the PositionalAudio object (passing in the listener)
        const sound = new THREE.PositionalAudio(listener);

        // settings
        sound.setBuffer(audio); // Use the correct audio buffer
        sound.setDirectionalCone(coneInner, coneOuter, gain)
        sound.setRefDistance(refDistance); // The radius from the object where the audio will play at 100%
        sound.setRolloffFactor(rollOffFactor); // The amount that the audio will decrease after getting out of that radius
        sound.setDistanceModel(distanceModel) // The way in which the audio will decrease (exponential, linear etc.)
        sound.play();
        sound.setLoop(true);

        // sound.rotation.y = Math.PI
        sound.position.z = 12

        // add to scene
        object.updateWorldMatrix(true, true)
        console.log(object.position)
        object.add(sound);
        this.sounds.push(sound)

        // Debug
        if (this.debug.active)
        {

            // helper
            const helper = new PositionalAudioHelper(sound, refDistance)
            sound.add(helper)
            sound.visible = true;

            const soundFolder = this.debugFolder.addFolder(`Audio: ${object.name}`)
            soundFolder.close()
            
            const debugObject = 
            {
                coneInnerAngle: sound.panner.coneInnerAngle,
                coneOuterAngle: sound.panner.coneOuterAngle,
                coneOuterGain: sound.panner.coneOuterGain
            }

            soundFolder.add(sound.rotation, 'x').min(-1 * Math.PI).max(1 * Math.PI).step(0.25 * Math.PI).name('Rotation X').onChange(() => {
                helper.update();
            });

            soundFolder.add(sound.rotation, 'y').min(-1 * Math.PI).max(1 * Math.PI).step(0.25 * Math.PI).name('Rotation Y').onChange(() => {
                helper.update();
            });

            soundFolder.add(sound.rotation, 'z').min(-1 * Math.PI).max(1 * Math.PI).step(0.25 * Math.PI).name('Rotation Z').onChange(() => {
                helper.update();
            });

            soundFolder.add(sound.position, 'x').min(-100).max(100).step(0.01).name('Position X').onChange(() => {
                helper.update();
            });

            soundFolder.add(sound.position, 'z').min(-100).max(100).step(0.01).name('Position Z').onChange(() => {
                helper.update();
            });

            soundFolder.add(sound.panner, 'refDistance').min(0).max(1000).step(0.01).name('Ref Distance').onChange((value) => {
                sound.setRefDistance(value);
                helper.range = value
                helper.update();
            });

            soundFolder.add(sound.panner, 'rolloffFactor').min(0).max(100).step(0.01).name('Roll Off').onChange((value) => {
                sound.setRolloffFactor(value);
                helper.update();
            });

            soundFolder.add(sound.panner, 'distanceModel', ['linear', 'inverse', 'exponential']).name('Distance Model').onChange((value) => {
                sound.setDistanceModel(value);
                helper.update();
            });


            soundFolder.add(debugObject, 'coneInnerAngle').min(-360).max(360).step(1).name('Cone Inner Angle').onChange((value) => {
                sound.panner.coneInnerAngle = value;
                helper.update();
            });
            
            soundFolder.add(debugObject, 'coneOuterAngle').min(-360).max(360).step(1).name('Cone Outer Angle').onChange((value) => {
                sound.panner.coneOuterAngle = value;
                helper.update();
            });
            
            soundFolder.add(debugObject, 'coneOuterGain').min(0).max(1).step(0.01).name('Cone Outer Gain').onChange((value) => {
                sound.panner.coneOuterGain = value;
                helper.update();
            });

            soundFolder.add({ visible: true }, 'visible').name('Toggle Visibility').onChange((value) => {
                sound.visible = value;
                helper.visible = value;
                helper.update();
            });

        } 
    }

    toggleMute()
    {
        const toggle = document.querySelector('.sound')

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

