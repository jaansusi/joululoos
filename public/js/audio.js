let audioPlaying = false;

function playPause() {
    var audio = document.getElementById("player");
    audio.volume = 0.2;

    if (audioPlaying) {
        document.getElementById("pauseIcon").classList.add('hidden');
        document.getElementById("playIcon").classList.remove('hidden');
        audioPlaying = false;
        audio.pause();
    }
    else {
        document.getElementById("pauseIcon").classList.remove('hidden');
        document.getElementById("playIcon").classList.add('hidden');
        audio.play();
        document.getElementById('audioContainer').classList.remove('hidden');
        audioPlaying = true;
    }
}