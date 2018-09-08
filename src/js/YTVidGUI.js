class YTVidGUI {
    constructor(key,ipc){
        this.key = key
        this.ipc = ipc
        this._initThumb()
        this._initFrame()
        this._initYTiframAPI()
        this.player
        this.vnfo = {}
        this.psc = [] // player state changes
    }

    _initThumb(){
        this.thumb = document.createElement('img')
        this.thumb.src="https://i.ytimg.com/vi/8QNx3SJzeOw/hqdefault.jpg"
        this.thumb.style.position = "absolute"
        this.thumb.style.cursor = "pointer"
        this.thumb.style.width = "300px"
        this.thumb.style.zIndex = "10"
        this.thumb.style.opacity = "0.6"
        this.thumb.style.display = "none"
        document.body.appendChild(this.thumb)

        document.addEventListener('mousemove',(e)=>{
            let w = parseInt(this.thumb.offsetWidth)/2
            let h = parseInt(this.thumb.offsetHeight)/2
            this.thumb.style.left = e.clientX-w+"px"
            this.thumb.style.top = e.clientY-h+"px"
        },false)
    }

    _initFrame(){
        let w = 640
        let c = (innerWidth/2)-(w/2+25)
        this.frame = document.querySelector('#yt-frame')
        this.frame.style.width = w+'px'
        this.frame.style.left = c+'px'
    }

    _initYTiframAPI(){
        let tag = document.createElement('script')
            tag.src = 'https://www.youtube.com/iframe_api'
        let firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

        let self = this
        window.onYouTubeIframeAPIReady = function() {
            self.player = new YT.Player('yt-player-div',{
                width: '100%',
                playerVars:{
                    showinfo:false,
                    rel:0,
                    fs:0,
                    // modestbranding:1
                },
                events: {
                    onStateChange:function(){
                        self._playerStateChange(self)
                    }
                }
            })
        }

    }

    _date(date){
        let months = [
            'Jan','Feb','Mar','Apr','May','Jun',
            'Jul','Aug','Sep','Oct','Nov','Dec'
        ]
        let d = new Date(date)
        let month = months[d.getMonth()]
        let day = d.getDate()
        let year = d.getFullYear()
        return `Published on ${month} ${day}, ${year}`
    }

    _count(num,abbr){
        if(abbr){
            if(!num) return 0
            let suffixes = ["", "K", "M", "B","T"]
            let suffixNum, l = (""+num).length
            if( l > 0 && l <= 3 ) suffixNum = 0
            else if( l > 3 && l <= 6 ) suffixNum = 1
            else if( l > 6 && l <= 9 ) suffixNum = 2
            else if( l > 9 && l <= 12 ) suffixNum = 3
            else if( l > 12 && l <= 15 ) suffixNum = 4
            let sn = (suffixNum != 0) ? (num / Math.pow(1000,suffixNum)) : num
            let shortValue = Math.round(parseFloat(sn)*10)/10
            return shortValue+suffixes[suffixNum]
        } else {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
    }

    _playerStateChange(self){
        let stateStr
        let state = self.player.getPlayerState()
        switch (state) {
            case -1: stateStr='unstarted'; break;
            case 0: stateStr='ended'; break;
            case 1: stateStr='playing'; break;
            case 2: stateStr='paused'; break;
            case 3: stateStr='buffering'; break;
            case 5: stateStr='video cued'; break;
        }
        let change = { time:this.player.getCurrentTime(), state:stateStr }
        if(state == 0) this._vidClose('ended')
        else if(this.vnfo.viewCount && this.vnfo.subscriberCount)
            this.ipc.send('vid-change',{video:this.vnfo,change})
        else setTimeout(()=>{
            this.ipc.send('vid-change',{video:this.vnfo,change})
        },200)
    }

    _vidClose(type){
        if(this.frame.style.display == "block"){
            let change = { time:this.player.getCurrentTime(), state:type }
            // this.ipc.send('vid-change',{video:this.vnfo,change})
            if(this.vnfo.viewCount && this.vnfo.subscriberCount)
                this.ipc.send('vid-change',{video:this.vnfo,change})
            else setTimeout(()=>{
                this.ipc.send('vid-change',{video:this.vnfo,change})
            },200)
        }
        this.frame.style.display = "none"
    }

    hoverOn(obj){
        if(obj.thumb){
            this.thumb.style.display = "block"
            this.thumb.src = obj.thumb.url
        }
    }

    hoverOff(){
        this.thumb.style.display = "none"
    }

    clickVid(vid){
        if(vid.title){
            this.vnfo = vid
            let chSnippet = `https://www.googleapis.com/youtube/v3/channels?id=${vid.chid}&key=${this.key}&part=snippet`
            fetch(chSnippet).then(res=>res.json()).then(data=>{
                let img = data.items[0].snippet.thumbnails.default.url
                this.frame.querySelector('#avatar')
                    .style.backgroundImage = `url(${img})`
                this.vnfo.channelThumbnail = img
            }).catch(err=>console.warn(err))

            let chStats = `https://www.googleapis.com/youtube/v3/channels?id=${vid.chid}&key=${this.key}&part=statistics`
            fetch(chStats).then(res=>res.json()).then(data=>{
                let subs = data.items[0].statistics.subscriberCount
                this.frame.querySelector('#subs')
                    .textContent = `SUBSCRIBE ${this._count(subs,true)}`
                this.vnfo.subscriberCount = subs
            }).catch(err=>console.warn(err))

            let vidStats = `https://www.googleapis.com/youtube/v3/videos?id=${vid.id}&key=${this.key}&part=statistics`
            fetch(vidStats).then(res=>res.json()).then(data=>{
                // console.log('vid data',data)
                let views = data.items[0].statistics.viewCount
                let likes = data.items[0].statistics.likeCount
                let dislikes = data.items[0].statistics.dislikeCount
                this.vnfo.viewCount = views
                this.vnfo.likeCount = likes
                this.vnfo.dislikeCount = dislikes
                this.frame.querySelector('#views').textContent = (views>0) ?
                    this._count(views)+' views' : 'No views'
                this.frame.querySelector('#likes')
                    .textContent = this._count(likes,true)
                this.frame.querySelector('#dislikes')
                    .textContent = this._count(dislikes,true)
            }).catch(err=>console.warn(err))

            this.player.loadVideoById(vid.id)
            this.frame.querySelector('h1').textContent = vid.title
            this.frame.querySelector('#username').textContent = vid.channel
            this.frame.querySelector('#date').textContent = this._date(vid.date)
            this.frame.style.display = "block"
        }
    }

    clickNothing(){
        this.player.stopVideo()
        this._vidClose('closed')
    }

}
