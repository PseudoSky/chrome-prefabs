document.addEventListener("keyup", triggerTMTHotkey, !1);

function triggerTMTHotkey(a) {
    !a.altKey && !a.shiftKey && a.ctrlKey && chrome && chrome.runtime && chrome.runtime.sendMessage && chrome.runtime.sendMessage({
        command: "getShortcut"
    }, function(b) {
        b && a.keyCode == b && chrome.runtime.sendMessage({
            command: "popup"
        })
    })
};
