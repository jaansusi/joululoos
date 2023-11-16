function playPause() {
    if (audioPlaying) {
        document.getElementById('player').pause();
        document.getElementById('playButton').style.display = "initial";
        document.getElementById('pauseButton').style.display = "none";
        audioPlaying = false;
    }
    else {
        document.getElementById('player').play();
        document.getElementById('playButton').style.display = "none";
        document.getElementById('pauseButton').style.display = "initial";
        audioPlaying = true;
    }
}