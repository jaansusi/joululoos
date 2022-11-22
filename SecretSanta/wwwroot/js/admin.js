function getFamilies() {
    $.get({
        url: '/api/admin/getSantas',
        headers: { "Authorization": document.getElementById('secretInput').value }
    }).then((res) => {
        console.log(res);
        document.getElementById('results').innerHTML = JSON.stringify(res, null, 4);
    }).catch((err) => {
        document.getElementById('results').innerHTML = JSON.stringify(err, null, 4);
    });
}
function setFamilies() {
    let payload = JSON.parse(document.getElementById('familyInput').value);
    $.post({
        url: '/api/admin/generateSantas',
        headers: { "Authorization": document.getElementById('secretInput').value },
        data: JSON.stringify(payload),
        contentType: 'application/json'
    }).then((res) => {
        document.getElementById('results').innerHTML = JSON.stringify(res, null, 4);
    }).catch((err) => {
        document.getElementById('results').innerHTML = JSON.stringify(err, null, 4);
    });
}
function validateParticipants() {
    $.get({
        url: '/api/admin/validateSantas',
        headers: { "Authorization": document.getElementById('secretInput').value }
    }).then((res) => {
        document.getElementById('results').innerHTML = JSON.stringify(res, null, 4);
    }).catch((err) => {
        document.getElementById('results').innerHTML = JSON.stringify(err, null, 4);
    });
}
function getMessages() {
    $.get({
        url: '/api/admin/getMessages',
        headers: { "Authorization": document.getElementById('secretInput').value }
    }).then((res) => {
        document.getElementById('results').innerHTML = JSON.stringify(res, null, 4);
    }).catch((err) => {
        document.getElementById('results').innerHTML = JSON.stringify(err, null, 4);
    });
}