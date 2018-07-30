class SkyCanvasTexture {
    constructor() {
        this.now = new Date()

        this.canvas = document.createElement('canvas')
        this.canvas.width = innerWidth
        this.canvas.height = innerHeight
        this.ctx = this.canvas.getContext('2d')

        this.fcanvas = document.createElement('canvas')
        this.fcanvas.width = innerWidth
        this.fcanvas.height = innerHeight
        this.fctx = this.fcanvas.getContext('2d')

        this.previous = null // TODO use fcanvas to fade draw when time changes

        this.texture = new THREE.CanvasTexture( this.canvas )
        this.texture.minFilter = THREE.LinearFilter
        this.texture.magFilter = THREE.LinearFilter

        this.draw()
    }

    draw(){
        if( this.now.getHours() >= 20 ){
            this._nightTime( innerWidth/4 )
            this.previous = 'night'
        } else if( this.now.getHours() >= 6 && this.now.getHours() < 11 ){
            this._sunRise()
            this.previous = 'dawn'
        } else if( this.now.getHours() >= 11 && this.now.getHours() < 15 ){
            this._afternoon()
            this.previous = 'afternoon'
        } else if( this.now.getHours() >= 15 && this.now.getHours() < 18 ){
            this._evening()
            this.previous = 'evening'
        } else if( this.now.getHours() >= 18 && this.now.getHours() < 20 ){
            this._sunSet()
            this.previous = 'dusk'
        }
    }

    update(textureOnly){
        if(!textureOnly) this.now = new Date()
        if(!textureOnly) this.draw()
        this.texture.needsUpdate = true
    }

    _nightTime( n ) {
        this.ctx.rect(0,0,this.canvas.width,this.canvas.height)
        let grd = this.ctx.createLinearGradient(this.canvas.width/2, this.canvas.height, this.canvas.width/2, 0 )
        grd.addColorStop(0, '#13344b')
        grd.addColorStop(1, '#001320')
        this.ctx.fillStyle = grd
        this.ctx.fill()
        // stars
        this.ctx.fillStyle = "#fff"
        for (var i = 0; i < n; i++) {
            var s = Math.ceil(Math.random()*4)
            var x = Math.random()*innerWidth
            var y = Math.random()*innerHeight/2
            this.ctx.fillRect(x,y,s,s)
        }
    }

    _sunRise(){
        // inner radial gradient sun
        this.ctx.rect(0,0,this.canvas.width,this.canvas.height)
        let grd = this.ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, this.canvas.width/20,
            this.canvas.width/2, this.canvas.height/2, this.canvas.width/2
        )
        grd.addColorStop(0, '#f9eec1')
        grd.addColorStop(0.5, '#ffc8d2')
        grd.addColorStop(1, '#5f93b7')
        this.ctx.fillStyle = grd
        this.ctx.fill()
        // outer linear gradient
        this.ctx.rect(0,0,this.canvas.width,this.canvas.height)
        let lgrd = this.ctx.createLinearGradient(this.canvas.width/2, this.canvas.height, this.canvas.width/2, 0 )
        lgrd.addColorStop(0.5, 'rgba(255,185,187,0.5)')
        lgrd.addColorStop(1, 'rgba(95,147,183,0.5)')
        this.ctx.fillStyle = lgrd
        this.ctx.fill()
    }

    _sunSet(){
        this.ctx.rect(0,0,this.canvas.width,this.canvas.height)
        // let grd = this.ctx.createLinearGradient(this.canvas.width/2, this.canvas.height, this.canvas.width/2, 0 )
        let grd = this.ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, this.canvas.width/8,
            this.canvas.width/2, this.canvas.height/2, this.canvas.width/4
        )
        grd.addColorStop(0, '#ffd956')
        grd.addColorStop(1, '#ff8656')
        this.ctx.fillStyle = grd
        this.ctx.fill()
        // outer linear gradient
        this.ctx.rect(0,0,this.canvas.width,this.canvas.height)
        let lgrd = this.ctx.createLinearGradient(this.canvas.width/2, this.canvas.height, this.canvas.width/2, 0 )
        lgrd.addColorStop(0.5, 'rgba(208,56,9,0.5)')
        lgrd.addColorStop(1, 'rgba(145,85,186,0.5)')
        this.ctx.fillStyle = lgrd
        this.ctx.fill()
    }

    _evening(){
        // outer linear gradient
        this.ctx.rect(0,0,this.canvas.width,this.canvas.height)
        let lgrd = this.ctx.createLinearGradient(this.canvas.width/2, this.canvas.height, this.canvas.width/2, 0 )
        lgrd.addColorStop(0.5, '#fff2be')
        lgrd.addColorStop(0.75, '#4cb1f8')
        lgrd.addColorStop(1, '#4cb1f8')
        this.ctx.fillStyle = lgrd
        this.ctx.fill()
        // inner sun radial gradient
        this.ctx.rect(0,0,this.canvas.width,this.canvas.height)
        let grd = this.ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/3, this.canvas.width/20,
            this.canvas.width/2, this.canvas.height/3, this.canvas.width/4
        )
        grd.addColorStop(0, '#fffbee')
        grd.addColorStop(1, 'rgba(248,195,165,0.5)')
        this.ctx.fillStyle = grd
        this.ctx.fill()

    }

    _afternoon(){
        this.ctx.rect(0,0,this.canvas.width,this.canvas.height)
        let grd = this.ctx.createLinearGradient(this.canvas.width/2, this.canvas.height, this.canvas.width/2, 0 )
        grd.addColorStop(0.5, '#d1edfd')
        grd.addColorStop(1, '#79ceff')
        this.ctx.fillStyle = grd
        this.ctx.fill()
    }

}
