class BottleOcean {
    constructor( scene ){
        this.test = 'test'
        this.scene = scene
        this.bottles = [] // all current bottles in ocean
        this.bcount = 0 // total number of bottle sinse beginning
        this.mesh = this._createOcean()
        this.scene.add( this.mesh )
    }

    norm(value, min, max){ return (value - min) / (max - min) }
    lerp(norm, min, max){ return (max - min) * norm + min }
    map(val, smin, smax, dmin, dmax){
        return this.lerp(this.norm(val, smin, smax), dmin, dmax)
    }

    _createOcean(){
        let width = innerWidth*10
        let length = innerHeight*10
        let geometry = new THREE.PlaneGeometry( width, length, 10, 10 )
        let material = new THREE.MeshBasicMaterial({
            color: 0x3c617b,
            flatShading:true,
            transparent: true, opacity: 0.9
        })
        let ocean = new THREE.Mesh( geometry, material )
            ocean.rotation.x = -Math.PI/2
            ocean.name = "ocean"
            ocean.userData = { width, length }
        return ocean
    }

    // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~
    // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~ create / animate bottle
    // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~

    _initBottle(vid){
        // let mesh = new THREE.Object3D() // raycaster won't see this...
        let geometry = new THREE.CubeGeometry(200, 650, 200) //...HACK...
        let mesh = new THREE.Mesh(geometry, {}) // ...gotta do this instead
        // alternatively i can pass "true" in recursive param for raycaster...
        // ...but then would see individual bottle pieces? 

        let bottle_material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            flatShading:true,
            side: THREE.DoubleSide,
            transparent: true, opacity: 0.4
        })

        let top_geo = new THREE.CylinderGeometry(45, 45, 200, 11, 50, false)
        let mid_geo = new THREE.CylinderGeometry(45, 100, 200, 11, 50, false)
        let bot_geo = new THREE.CylinderGeometry(100, 100, 250, 11, 50, false)

        let top = new THREE.Mesh(top_geo, bottle_material)
        let mid = new THREE.Mesh(mid_geo, bottle_material)
        let bot = new THREE.Mesh(bot_geo, bottle_material)

        top.position.y = 200
        bot.position.y = -225

        mesh.add( top )
        mesh.add( mid )
        mesh.add( bot )

        mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.75

        mesh.userData.idx = this.bcount
        mesh.userData.id = vid.id.videoId
        mesh.userData.title = vid.snippet.title
        mesh.userData.channel = vid.snippet.channelTitle
        mesh.userData.chid = vid.snippet.channelId
        mesh.userData.date = vid.snippet.publishedAt
        mesh.userData.thumb = vid.snippet.thumbnails.high

        mesh.name = "vid"+this.bcount

        mesh.position.y = innerHeight*2
        mesh.position.z = -600
        mesh.position.x = Math.random()*innerWidth*2 - innerWidth

        this._animBottle( mesh )

        mesh.userData.ripple = this._initRipple()
        return mesh
    }

    _floatHack(mesh){
        if( mesh.position.y > 200 ){
            let bot = this.scene.getObjectByName(mesh.name)
            this.scene.remove( bot )
            this.bottles.shift()
        }
    }

    _animBottle( mesh ){
        let dropTime = 10000

        new TWEEN.Tween( mesh.position ).to({y:50}, dropTime )
        .easing( TWEEN.Easing.Elastic.Out).start();

        setTimeout(()=>{

            let rot = {
                x:Math.random()*0.50 - 0.25,
                y:Math.random(),
                z:Math.random()*0.50 - 0.25
            }
            new TWEEN.Tween( mesh.rotation ).to( rot, Math.random()*500+3500 )
            .easing( TWEEN.Easing.Elastic.Out).start()

            // drift back . . . . . . . . .

            let driftTime = 20000
            let oceanL = -this.mesh.userData.length/2

            let pos = { x: 0, y: 50, z: oceanL }
            new TWEEN.Tween( mesh.position ).to( pos, driftTime )
            .easing( TWEEN.Easing.Quadratic.In ).start()

            setTimeout(()=>{
                // remove bottle callback
                let bot = this.scene.getObjectByName(mesh.name)
                this.scene.remove( bot )
                this.bottles.shift()
            }, driftTime )

            this._floatHack(mesh)

        }, dropTime/3 )
    }

    // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~
    // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~ create ripple
    // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~

    _initRipple(){
        let self = this

        function remove(){ self.scene.remove( this.parent ) }

        function getOffset(){
            let seg = 4 // frames per row|col
            let val = this.cnt/seg
            let x = val-Math.floor(val)
            let y = 0.75-Math.floor(val)/seg
            return {x:x,y:y}
        }

        function animateTexture(){
            setTimeout(()=>{
                this.texture.offset.x = this.getOffset().x
                this.texture.offset.y = this.getOffset().y
                this.parent.material.opacity -= 0.04
                this.cnt++
                // 4*4 = spritesheet dimentions
                if(this.cnt<4*4) this.animateTexture()
                else this.remove()
            },1000/10)
        }

        function update( pos ){
            this.parent.position.x = pos.x
            this.parent.position.z = pos.z
            if( pos.y<0 && !this.added ){
                this.animateTexture()
                this.added = true
                self.scene.add( this.parent )
            }
        }

        let alpha = new THREE.TextureLoader()
            .load('../src/images/ripple_sheet_blackV4.png')
        let texture = new THREE.TextureLoader()
            .load('../src/images/ripple_sheet_blackV4_1.png')
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set( 1/4, 1/4 ) // b/c image is 4x4 spritesheet
        texture.offset = {x:0.25, y:0.75}

        let mat = new THREE.MeshBasicMaterial({
            map: texture,
            alphaMap:alpha, alphaTest: 0.5,
            transparent: true, opacity: 1
        })
        let geo = new THREE.PlaneGeometry(400,400,1,1)
        let mesh = new THREE.Mesh(geo, mat)
        //
        mesh.rotation.x = -Math.PI/2
        mesh.position.y = 2
        mesh.name = "rip"+this.bcount
        mesh.userData.idx = this.bcount
        mesh.userData.added = false
        mesh.userData.cnt = 0
        mesh.userData.texture = texture
        mesh.userData.update = update
        mesh.userData.animateTexture = animateTexture
        mesh.userData.getOffset = getOffset
        mesh.userData.remove = remove
        mesh.userData.parent = mesh
        return mesh
    }

    // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~
    // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~. public methods
    // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~

    createVideoBottles( res ){
        res.items.forEach((v,i)=>{
            let sec
            if(i==0) sec = 0
            else sec = parseInt(v.snippet.publishedAt.substr(17,2))
            setTimeout((vid)=>{ // make bottle
                let bottle = this._initBottle(vid)
                this.bottles.push( bottle )
                this.scene.add( bottle )
                this.bcount++
            },sec*1000,v)
        })
    }

    update(){
        this.bottles.forEach((b)=>{
            b.children.forEach((c)=>{
                let oceanL = -this.mesh.userData.length/2
                let opac = this.map( b.position.z, -600, oceanL, 0.4, 0.0 )
                c.material.opacity = opac
            })
            b.userData.ripple.userData.update( b.position )
        })
        TWEEN.update()
    }
}
