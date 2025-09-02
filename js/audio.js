let music = new Audio("assets/music.mp3");
music.loop = true;
music.volume = 0.4;

let musicPlaying = false;

export function toggleMusic() {
    if (musicPlaying) {
        music.pause();
    } else {
        music.play();
    }
    musicPlaying = !musicPlaying;
}

