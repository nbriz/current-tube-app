const { ipcRenderer } = require('electron')

const sky = new SkyCanvasTexture()

// TODO :: look into search token for more results

const yts = new YTSearch(gapiKey)
const gui = new YTVidGUI(gapiKey,ipcRenderer)


let ocean

const world = new ThreeWorld({
    camera:{z:900,y:900},
    background:sky.texture,
    // controls:true,
    raycaster:{
        exclude:['ocean','rip*'],
        hover:function(intersects){
            if( intersects.length > 0 )
                gui.hoverOn(intersects[0].object.userData)
            else gui.hoverOff()
        },
        click:function(intersects){
            if(intersects.length > 0){
                gui.clickVid(intersects[0].object.userData)
                ipcRenderer.send('vid-click',intersects[0].object.userData)
            }
            else gui.clickNothing()
        }
    },
    setup:function(scene,camera){
        ocean = new BottleOcean(scene)
        camera.lookAt(new THREE.Vector3(0,0,-ocean.mesh.userData.length/2))
        yts.searchLatest((res)=>{
            console.log(`${res.items.length} vids received`)
            console.log(res)
            ocean.createVideoBottles(res)
        })
    },
    draw:function(){
        ocean.update()
    }
})


document.addEventListener('keypress',(e)=>{
    // console.log(e)
    if(e.ctrlKey && e.key=="d")
        ipcRenderer.send('key-cmd','open-dev')
    else if(e.ctrlKey && e.key=="f")
        ipcRenderer.send('key-cmd','toggle-fullscreen')
    else if(e.ctrlKey && e.key=="r")
        location.reload()
    else if(e.ctrlKey && e.key=="s")
        ipcRenderer.send('key-cmd','save-playlist')
    else if(e.ctrlKey && e.key=="q")
        ipcRenderer.send('key-cmd','quit-app')
})
