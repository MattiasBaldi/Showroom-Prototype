import Experience from "../Experience"

export default class JoyStickControls { 
    constructor(wasd) {

        this.experience  = new Experience()
        this.debug = this.experience.debug

        this.joystick = document.getElementById("joystick")
        this.nipple = document.getElementById("nipple")

        this.wasd = wasd; 

        // 
        this.isDragging = false; 
        this.active = false; 

    }

    onPointerDown() {
        this.isDragging = true; 
    }

    onPointerUp() {
        this.isDragging = false; 
    }

    onPointerMove(e) {
        if (!this.isDragging) return

        // get mouse coordination in relation to the origin of the nipple
        console.log(e)

        // while ()
        // this.controls.wasd.moveBackward = true; 
        // this.controls.wasd.moveForward = true; 
        // this.controls.wasd.moveLeft = true; 
        // this.controls.wasd.moveRight = true; 

    }

    setListeners() 
    {
        this.nipple.addEventListener("pointerdown", this.onPointerDown())
        this.nipple.addEventListener("pointerup", this.onPointerUp())
        this.nipple.addEventListener("pointermove", this.onPointerMove())
    }

    removeListeners() {
        this.nipple.removeEventListener("pointerdown", this.onPointerDown())
        this.nipple.removeEventListener("pointerup", this.onPointerUp())
        this.nipple.removeEventListener("pointermove", this.onPointerMove())
    }

    update() 
    {

        if(window.innerWidth < 1024) 
        {
            if (!this.active)
            {
                // this.wasd.PointerLockControls.lock()
                this.setListeners()
                this.active = true; 
            }
        }
        else 
        {   
            if (this.active) 
            {
                this.removeListeners()
                this.active = true; 
            }
        }

    }
}