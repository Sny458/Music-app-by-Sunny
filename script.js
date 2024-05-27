// console.log("Lets write js")
const cors = require(cors)
app.use(cors())

let currentsong = new Audio();
let songs, currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

//menu icon functionality
document.querySelector(".menu").addEventListener("click", () => {
    document.querySelector(".left").style.left = "1%"
})
document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-150%"
})


async function getsongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/PROJECTS/spotify-clone/${currFolder}/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }
    }

    //songs ko songlist me daalo (html me)
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const i of songs) {
        songUL.innerHTML += `<li>
            <div>
                <img src="images/music.svg" alt="music" width="30px">
                <div class="info">
                    <div>${i.replaceAll("%20", " ")}</div>
                    <div>Sunny</div>
                </div>
            </div>
            <img src="images/playsong.svg" alt="play" width="30px">
        </li>`
    }

    //Attach a event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", (element) => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs;

}


const playmusic = (track, pause = false) => {
    currentsong.src = `/PROJECTS/spotify-clone/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        document.getElementById("play").src = "images/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ")
    document.querySelector(".duration").innerHTML = currentsong.duration
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/PROJECTS/spotify-clone/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    // console.log(div)
    let as = div.getElementsByTagName("a")
    let array = Array.from(as)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            //get metadata of folder
            let a = await fetch(`http://127.0.0.1:3000/PROJECTS/spotify-clone/songs/${folder}/info.json`)
            let response = await a.json()
            // console.log(response)
            document.querySelector(".working").querySelector(".container").innerHTML += ` <div class="cards"         
                    data-folder="${folder}">
                    <img src="http://127.0.0.1:3000/PROJECTS/spotify-clone/songs/${folder}/cover.jpeg" alt="">
                    <h3>${response.title}</h3>
                    <p>${response.description}</p>
                    <img class="play" src="images/play.webp" alt="play" width="35px">
                    </div>`
        }
    }

    //load the required folder whenever some card is clicked
    Array.from(document.querySelector(".working").getElementsByClassName("cards")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            // console.log(e.dataset.folder)
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0], true)
        })
    })
}
    



async function main() {

    await getsongs("songs/hindi")
    playmusic(songs[0], true)

    //display all the albums present in folder
    await displayAlbums()




    //Attach event listener to play, pause command
    document.getElementById("play").addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            document.getElementById("play").src = "images/pause.svg"
        }
        else {
            currentsong.pause()
            document.getElementById("play").src = "images/playsong.svg"
        }
    })

    //listen for time update event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".currenttime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}`
        document.querySelector(".duration").innerHTML = `${secondsToMinutesSeconds(currentsong.duration)}`

        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    //add event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX) / (e.target.getBoundingClientRect().width)
        document.querySelector(".circle").style.left = percent * 100 + "%"
        currentsong.currentTime = (currentsong.duration) * percent
    })

    //add event for prev/next
    next.addEventListener("click", () => {
        let playingsong = currentsong.src.split("/songs/")[1]
        let index = songs.indexOf(playingsong)
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1])
        }
        else {
            playmusic(songs[0])
        }
    })

    prev.addEventListener("click", () => {
        let playingsong = currentsong.src.split("/songs/")[1]
        let index = songs.indexOf(playingsong)
        if (index > 0) {
            playmusic(songs[index - 1])
        }
        else {
            playmusic(songs[songs.length - 1])
        }
    })

    //event for volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = (e.target.value) / 100
        if (currentsong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("images/mute.svg", "images/volume.svg")
        }
    })

    //event to autoplay next song whem previous ends
    currentsong.addEventListener("ended", () => {
        let playingsong = currentsong.src.split("/songs/")[1]
        let index = songs.indexOf(playingsong)
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1])
        }
        else {
            playmusic(songs[0])
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("images/volume.svg", "images/mute.svg")
            currentsong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("images/mute.svg", "images/volume.svg")
            currentsong.volume = .10;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main()

