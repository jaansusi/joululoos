function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
            end = dc.length;
        }
    }
    return decodeURI(dc.substring(begin + prefix.length, end));
}

if (getCookie('santa_auth') !== null) {
    document.getElementById('logoutContainer').classList.remove('hidden');
}

function submitCode() {
    fetch("/result", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({
            code: document.getElementById('userCode').value
        }),
    }).then(res => res.json()).then(res => {
        let authContainer = document.getElementById('authContainer');
        if (authContainer !== undefined && authContainer !== null && res.error === undefined)
            authContainer.classList.add('hidden');
        if (res.error) {
            document.getElementById('recipient').innerHTML = res.error;
        } else {
            document.getElementById('inputContainer').classList.add('hidden');
            document.getElementById('logoutContainer').classList.add('hidden');
            document.getElementById('chatContainer').classList.remove('hidden');
            initializeChat(res);
            if (!snowActive) {
                snowActive = true;
                createSnowFlakes();
            }
            if (!audioPlaying)
                playPause();
        }
    });
}

function isInWebView() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const webViewIndicators = [
        'WebView',           // Generic Android WebView
        '(iPhone|iPod|iPad).+AppleWebKit(?!.*Safari)',  // iOS WebView
        'Android.*Version/\\d+\\.\\d+.*Chrome/',       // Android Chrome Custom Tab
        'FBAN', 'FBAV'      // Facebook App WebView
    ];

    const pattern = new RegExp(webViewIndicators.join('|'), 'i');
    return pattern.test(userAgent);
}

window.addEventListener("load", (event) => {
    const togglePassword = document.querySelector('#toggleUserCodeVisibility');
    if (togglePassword === null) return;
    togglePassword.addEventListener('click', function () {
        const password = document.querySelector('#userCode');

        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);

        this.querySelector('i').classList.toggle('bi-eye');
        this.querySelector('i').classList.toggle('bi-eye-slash');
    });

    document.getElementById('pageUrl').innerHTML = window.location.href;
    if (isInWebView()) {
        document.getElementById('googleAuthButton').classList.add('hidden');
        document.getElementById('webViewWarning').classList.remove('hidden');
    }
});

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });

    Toastify({
        text: "Link kopeeritud",
        duration: 5000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            borderRadius: "10px",
        }
    }).showToast();
}
