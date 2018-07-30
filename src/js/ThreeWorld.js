class ThreeWorld {
    constructor(config){
        if(!config) config = {}

        this.renderer = new THREE.WebGLRenderer()
        this.setRenderer()
        this.scene = new THREE.Scene()
        this.setScene(config)

        if(config.controls) this.setControls()
        if(config.raycaster) this.setRaycaster(config.raycaster)

        // run setup function
        if(config.setup) config.setup(this.scene,this.camera)
        // run animation loop
        if(config.draw) this.draw = config.draw
        this.animate()
    }

    setRenderer(){
        this.renderer.setSize( innerWidth, innerHeight )
        this.renderer.domElement.style.position = 'absolute'
        this.renderer.shadowMap.enabled = true
        this.renderer.setClearColor( 0x000000,0 )
        document.body.appendChild( this.renderer.domElement )
    }

    setScene(config){
        if(config.background) this.scene.background = config.background
        let ar = innerWidth/innerHeight
        this.camera = new THREE.PerspectiveCamera(70, ar, 0.1, 1000000 )
        if(config.camera) {
            if(config.camera.x) this.camera.position.x = config.camera.x
            if(config.camera.y) this.camera.position.y = config.camera.y
            if(config.camera.z) this.camera.position.z = config.camera.z
        }
        window.addEventListener('resize',()=>{this.resize()},false)
    }

    setRaycaster(params){
        this.rayparams = params
        this.mouse = { x:0, y:0 }
        this.raycaster = new THREE.Raycaster()
        this.intersects = []
        document.addEventListener('mousemove',e=>this.onMouseMove(e),false)
        document.addEventListener('click',e=>this.onMouseClick(e),false)
    }

    setControls(){
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
        // init position
        this.camera.position.set(0, 2.59, 4.24)
        this.camera.rotation.set(-6.12, 0, -5.12)
        // init controls
        this.controls.minDistance = 1
        this.controls.maxDistance = 50
        this.controls.maxPolarAngle = Math.PI / 2
    }

    //--------------------------------------------------------------------------

    resize(){
        this.camera.aspect = innerWidth / innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(innerWidth, innerHeight)
        this.renderer.setSize(innerWidth, innerHeight)
    }

    onMouseMove(event) {
        this.mouse.x = ( event.clientX / innerWidth ) * 2 - 1
        this.mouse.y = - ( event.clientY / innerHeight ) * 2 + 1
        if(this.rayparams.hover){
            this.rayparams.hover(this.intersects)
        }
    }

    onMouseClick(event){
        if(this.rayparams.click){
            this.rayparams.click(this.intersects)
        }
    }

    _startsWith(check,arr){
        for (var i = 0; i < arr.length; i++) {
            let str = arr[i]
                str = str.substr(0,str.indexOf('*'))
            if( check.indexOf(str)==0 ) return true
        }
        return false
    }

    updateRaycaster(){
        this.raycaster.setFromCamera( this.mouse, this.camera )
        let check
        if( this.rayparams.exclude ){
            check = this.scene.children.filter(c=>{
                let wilds = this.rayparams.exclude.filter(e=>e.includes('*'))
                let excluded = this.rayparams.exclude.includes(c.name)
                if(!excluded && !this._startsWith(c.name,wilds) ) return c
            })
        } else {
            check = this.scene.children
        }
        this.intersects = this.raycaster.intersectObjects( check )
        // change cursor
        if( this.intersects.length > 0 ) document.body.style.cursor = "pointer"
        else document.body.style.cursor = "auto"
    }


    //--------------------------------------------------------------------------

    animate(){
        requestAnimationFrame(()=>{ this.animate() })
        this.renderer.render( this.scene, this.camera )
        if(this.controls) this.controls.update()
        if(this.mouse) this.updateRaycaster()
        if(this.draw) this.draw()
    }
}
