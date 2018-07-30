class YTSearch {
    constructor(key){
        this.key = key
        this.ready = false
        this.results = []

        var tag = document.createElement('script')
        tag.src = 'https://apis.google.com/js/client.js' // local backup in libs
        tag.addEventListener('load',()=>this.setup(this))
        document.body.appendChild(tag)
    }

    search(query){
        if(this.ready){
            let req = gapi.client.youtube.search.list({
                part:'snippet',
                maxResults:50,
                relevanceLanguage:'en', // NOTE
                type:'video',
                videoDuration:'long', // NOTE ???
                // order: 'date',
                q: query
            })

            req.execute((res)=>{
                // console.log(res)
                // console.log(res.items)
                res.items.forEach((v)=>{
                    // console.log(sec,v.id.videoId, v.snippet.title)
                    // console.log(v.snippet.publishedAt, v.id.videoId, v.snippet.title)
                    let str = "https://www.youtube.com/watch?v="
                    console.log(str+v.id.videoId)
                })
            })
        } else {
            console.warn('gapi isn\'t ready yet')
        }
    }

    searchLatest(callback){
        if(this.ready){
            // create date string ( as per youtube api req ) for 1min ago
            let d1MinAgo = new Date(Date.now()-60000)
            let date1MinAgo = d1MinAgo.toJSON()
            date1MinAgo = date1MinAgo.substr(0,17) +"00Z"

            let req = gapi.client.youtube.search.list({
                part: 'snippet',
                maxResults: 50,
                order: 'date',
                publishedAfter: date1MinAgo
            })

            req.execute( res=>callback(res) )
        } else {
            console.warn('not ready yet, trying again in 100 miliseconds')
            setTimeout(()=>this.searchLatest(callback),100)
        }
    }

    testingToken(userCallback, prevRes){
        let p
        if(!prevRes){
            this.results = []

            // create date string ( as per youtube api req ) for 1min ago
            let d1MinAgo = new Date(Date.now()-60000)
            let date1MinAgo = d1MinAgo.toJSON()
            date1MinAgo = date1MinAgo.substr(0,17) +"00Z"

            let req = gapi.client.youtube.search.list({
                part: 'snippet',
                maxResults: 50,
                order: 'date',
                publishedAfter: date1MinAgo
            })

            req.execute((res)=>{
                console.log(res)
                this.results = [...res.items]
                this.searchLatest(userCallback,res)
            })

        } else {

            let req = gapi.client.youtube.search.list({
                part: 'snippet',
                pageToken: prevRes.nextPageToken
            })

            req.execute((res)=>{
                console.log(res)
                if(res.nextPageToken && this.results.length < 100){
                    this.results = [...this.results, ...res.items]
                    this.searchLatest(userCallback,res)
                } else {
                    userCallback(this.results,res)
                }
            })
        }

    }

    setup(self){
        if(!(gapi && gapi.client)){
            setTimeout(()=>self.setup(self),100)
            return
        }
        // set up yt api
        gapi.client.setApiKey(self.key)
        gapi.client.load('youtube','v3',()=>{
            console.log('gapi ready')
            self.ready = true
        })
    }
}
