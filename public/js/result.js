function showResult() {
    document.getElementById("recipientHidden").style.display = "none";
    document.getElementById("recipient").style.display = "block";
    if (!snowActive) {
        snowActive = true;
        createSnowFlakes();
        if (!audioPlaying)
            playPause();
    }
}