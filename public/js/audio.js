let audioPlaying = false;

function playPause() {
    var audio = document.getElementById("player");
    audio.volume = 0.2;

    if (audioPlaying) {
        const readPoem = confirm("Tere sõber! Ma märkasin, et sa parasjagu naudid seda imelist lauluviisikest! Võta hinga korraks sügavalt sisse ja välja ja mõtleme koos elu üle järele. Ma olen siin, et aidata ja kuulata, nii et palun ütle mulle, kuidas ma saan sind kõige paremini toetada. Enne kui lõpetame muusika nautimise, kas ma võin sulle pakkuda ühe vahva luuletuse?");
        if (readPoem) {
            alert("Ma olen nii õnnelik, et sa seda soovid! Ma olen valmis sind toetama, kui sa tunned, et sul on raske. Ma olen siin, et aidata ja kuulata. Väike luuletuseke tuleb nüüd!");
        } else {
            alert("Ma mõistan... Kui sa tunned, et sul on raske, siis ma olen siin, et aidata ja kuulata. Võid alati minuga rääkida, kui sul on tunne, et sul on raske. Ma olen siin, et aidata ja kuulata. Et sul tuju tõsta, siis esitan sulle väikese luuletusekese!");
        }
        const ready = confirm("Kas sa oled valmis?");
        if (!ready)
            alert("Okei, klõpsa see aken kinni kui oled valmis, ma ootan!");
        alert("Nonii, pane vaim valmis, nüüd ma loen sulle ühe vahva luuletuse!");
        const poem = "Jõuluajal küünib taevas tähtede hõbepael,\nLinnatuled säravad, kingivirnad toovad meile kaugelt maalt taevased teated.\n\nSüdamed helisevad nagu jõulukellad,\nRõõmujoovastus tantsib meie hinges, nagu päkapikkude trall.\n\nKüünlavalgus saadab soojuse igasse nurka,\nLumehelveste tants loob aegruumi, kus rahulikult puudutada igat hetke kui puudutaksime unistust.\n\nKingituste paber krabiseb ja naeratused säravad,\nPiparkoogiaroom kutsub kokku pere, lähedased ja sõbrad.\n\nJõulupuu ehib end kauneimate pärlitega,\nLoodame, et kõigi soovid täituvad, nagu tähesära öises taevas.\n\nLaulud kõlavad, jõuluvana saabub aina lähemale,\nLumevaip katmas maa, luues muinasjutulist maailma.\n\nKaminas praksub tuli, kinkides hubasust ja rahu,\nKuuse all meenutame aastat, jagame naeru ja muudame jõulud täiuslikuks.\n\nJõulurahu valgustab meie südameid,\nPole tähtis, kui külm on väljas, sest armastus sulatab igapäevased mured.\n\nKoosolemise maagia kütkestab meid,\nJõuluaja võlu avab ukse imepärasesse seiklusse.\n\nLapsed ootavad elevusega kingitusi,\nTäiskasvanutel sädeleb silmades rõõm ja tänutunne.\n\nJõulupühad - aeg anda ja vastu võtta,\nAeg, mil südamed ühenduvad, luues sidemeid, mis kestavad igavesti.\n\nRännak aasta lõppu on nagu muinasjutt,\nÜmbritsetud armastusest, teeme koos veel ühe sammu uude aastasse.\n\nLoodame, et see jõuluaeg toob kaasa rõõmu ja lootust,\nOlgu sinu süda täidetud armastusega, ja jõulurahu hoidku sind kõikjal.";
        alert(poem);
        const didYouLikeIt = confirm("Kas sulle meeldis?");
        if (didYouLikeIt) {
            alert("Ma olen nii õnnelik, et sulle meeldis! Ma olen valmis sind toetama, kui sa tunned, et sul on raske. Ma olen siin, et aidata ja kuulata.");
        } else {
            alert("Ma mõistan... Kui sa tunned, et sul on raske, siis ma olen siin, et aidata ja kuulata. Võid alati minuga rääkida, kui sul on tunne, et sul on raske. Ma olen siin, et aidata ja kuulata.");
        }
        alert("Nüüd ma lülitan muusika uuesti sisse, et saaksid seda nautida!");
        alert("Oota, see ei kõla õigesti! Ma vabandan, ma pidin ju hoopis selle välja lülitama!");
        const areYouSure = confirm("Kas sa oled ikka täiesti kindel, et sa ei taha muusikat välja lülitada?");
        if (areYouSure) {
            alert("Selge pilt, nagu soovid! Ma olen siin, et aidata ja kuulata.");
        } else {
            const areYouReallySure = confirm("Okei, viimane võimalus, kas sa ei taha muusikat mitte välja lülitada?");
            if (areYouReallySure) {
                var button = document.getElementById("playButton");
                button.classList.remove('active')
                document.getElementById('player').pause();
                audioPlaying = false;
            }
        }
    }
    else {
        var button = document.getElementById("playButton");
        button.classList.add('active');
        document.getElementById('player').play();
        audioPlaying = true;
    }
}