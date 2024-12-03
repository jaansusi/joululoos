let audioPlaying = false;

function playPause() {
    var audio = document.getElementById("player");
    audio.volume = 0.3;
    
    if (audioPlaying) {
        audioPlaying = false;
        audio.pause();
    }
    else {
        audioPlaying = true;
        audio.play();
    }
}