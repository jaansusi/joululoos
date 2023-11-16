function showResult() {
    document.getElementById("recipientHidden").style.display = "none";
    document.getElementById("recipient").style.display = "block";

    if (!audioPlaying)
        playPause();
}