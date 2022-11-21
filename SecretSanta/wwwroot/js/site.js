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
    }).catch((err) => {
        document.getElementById('name').innerHTML = "Vigane kood";
    });

    var confetti = Snow.init();
}