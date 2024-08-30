const player = document.getElementById('player');
const albumArt = document.getElementById('album-art');
const songName = document.getElementById('song-name');
const songArtist = document.getElementById('song-artist');
const playPauseButton = document.getElementById('play-pause-button');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const seekBar = document.getElementById('seek-bar');

let playlist = [];
let currentSongIndex = 0;
let playlistEnded = false;
check = 0
function setStatus(){
    check = document.querySelector('body').getAttribute('check')
}
// Fetch playlist data
fetch('/playlist_data')
    .then(response => response.json())
    .then(data => {
        playlist = data;
        loadCurrentSong();
    });

function loadCurrentSong() {
    if (playlist.length === 0) return;

    const song = playlist[currentSongIndex];
    albumArt.src = song.image;
    songName.textContent = song.name;
    songArtist.textContent = song.artist;
    player.src = song.url;
}

function playSong() {
    player.play();
    playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseSong() {
    player.pause();
    playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
}

function playPause() {
    if (player.paused) {
        playSong();
    } else {
        pauseSong();
    }
}

function nextSong() {
    if (check == 0){

    if (playlist.length === 0) return;

    currentSongIndex = (currentSongIndex + 1) % playlist.length;

    if (currentSongIndex === 0) {
        // End of playlist reached
        playlistEnded = true;
    } else {
        playlistEnded = false;
    }

    loadCurrentSong();
    playSong();
} else{
    pauseSong();
}
}

function prevSong() {
    if (playlist.length === 0) return;

    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    playlistEnded = false; // Reset flag as we are navigating within the playlist
    loadCurrentSong();
    playSong();
}

// Update seek bar as the song plays
player.addEventListener('timeupdate', () => {
    const percent = (player.currentTime / player.duration) * 100;
    seekBar.value = percent;
});

// Change song position when seek bar is adjusted
seekBar.addEventListener('input', () => {
    const newTime = (seekBar.value / 100) * player.duration;
    player.currentTime = newTime;
});

player.addEventListener('ended', () => {
    if (playlistEnded) {
        // Do nothing if playlist has ended
        pauseSong();
    } else {
        // Schedule the next song after a short delay to ensure the flag update
        setTimeout(nextSong, 100);
    }
});

playPauseButton.addEventListener('click', playPause);
nextButton.addEventListener('click', nextSong);
prevButton.addEventListener('click', prevSong);
