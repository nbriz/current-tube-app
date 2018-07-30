const { app, ipcMain, BrowserWindow } = require('electron')
const dev = (process.argv[2]=="dev") ? true : false
const fs = require('fs')

let win, pl = {} // playlist history database

function createWindow () {
    win = new BrowserWindow({
        width: 800, height: 600,
        fullscreen: false,
        icon:`${__dirname}/icon.png`
    })
    // load up index.html page
    win.loadURL(`file:///${__dirname}/src/index.html`)
    // Open the DevTools.
    if( dev ) win.webContents.openDevTools()
    // Emitted when the window is closed.
    win.on('closed', ()=>{ win = null })
}

function savePlaylist(){
    let now = new Date()
    fs.writeFileSync(`playlistDB/${now.toISOString()}.json`,JSON.stringify(pl))
    console.log(`updated playlistDB: ${now.toISOString()}`)
}


app.on('ready', createWindow)
// mac specific behaviors
app.on('window-all-closed',()=>{ if(process.platform!=='darwin') app.quit() })
app.on('activate', ()=>{ if (win === null) createWindow() })

ipcMain.on('key-cmd',(event,arg)=>{
    if(arg=='open-dev') win.webContents.openDevTools()
    else if(arg=="toggle-fullscreen"){
        if(win.isFullScreen()) win.setFullScreen(false)
        else win.setFullScreen(true)
    } else if(arg=='quit-app'){
        savePlaylist()
    }
})

ipcMain.on('vid-change',(event,arg)=>{
    let date = new Date()
    let dstr = date.toDateString()
    let v = {
        channel: arg.video.channel,
        channelId: arg.video.chid,
        channelThumbnail: arg.video.channelThumbnail,
        subscriberCount: arg.video.subscriberCount,
        id: arg.video.id,
        title: arg.video.title,
        publishedAt: arg.video.date,
        thumbnail: arg.video.thumb,
        viewCount: arg.video.viewCount,
        likeCount: arg.video.likeCount,
        dislikeCount: arg.video.dislikeCount
    }

    if( !pl.hasOwnProperty(dstr) ) pl[dstr] = {}

    if( !pl[dstr].hasOwnProperty(arg.video.id) ){
        pl[dstr][arg.video.id] = {
            time:date, video:v, events:[arg.change]
        }
    } else {
        pl[dstr][arg.video.id].events.push(arg.change)
    }
})
