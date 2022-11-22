var snowActive = false;
var audioPlaying = false;
function getName() {
    $.get({
        url: '/api/home?code=' + document.getElementById('codeInput').value
    }).then((res) => {
        console.log(res);
        document.getElementById('welcome').innerHTML = "Tere " + res.name + "!<br />Sina tõmbasid mütsist sildi nimega...";
        document.getElementById('recipient').innerHTML = "<h2>" + res.designatedPerson + "</h2>";

        document.getElementById('logs').innerHTML =
            "Kokku oled sa vaadanud oma nime " +
            res.logEntriesCount +
        " kord" + (res.logEntriesCount !== 1 ? "a" : "") +
        (res.uniqueUserAgentCount > 1 ? (", " +
            res.uniqueUserAgentCount +
            "-st erinevast kohast!") : "!")
            ;
        if (!snowActive) {
            snowActive = true;
            createSnowFlakes();
        }
        document.getElementById('player').play();
        setTimeout(() => {
            document.getElementById('buttonContainer').style.opacity = 1;
        }, 1000);
        audioPlaying = true;
    }).catch((err) => {
        document.getElementById('welcome').innerHTML = "Vigane kood";
    });
}

function playPause() {
    console.log('ASD');
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
