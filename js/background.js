var MAJOR_VERSION = 2.1,
    mainContextId, allTabs = {}, prefixedTabs={};
chrome.tabs.onActivated ? chrome.tabs.onActivated.addListener(function(a) {
    captureTabPreview(a.tabId, "onActivated")
}) : chrome.tabs.onSelectionChanged.addListener(function(a) {
    captureTabPreview(a, "onSelectionChanged")
});
chrome.tabs.onCreated.addListener(function(a) {
    try {
        var b = new tabData(a);
        allTabs[a.id] = b;
        reportNumTabs()
    } catch (c) {
        console.error(c)
    }
});
chrome.tabs.onUpdated.addListener(function(a, b, c) {
    try {
        if (c.status == "complete") {
            var d = new tabData(c);
            allTabs[a] = d;
            if (c.url) {
            	d.url = [c.url];
            	// alert(d.url);
                // alert(JSON.stringify(prefixedTabs)+/^.+?[^\/:](?=[?\/]|$)/.exec(d.url),/x.+?[\/:](?=[?\/]|$)/.exec(d.url));
                chrome.runtime.sendMessage({
                    command: "prefixed"
                });
            }
            (c.active || c.selected) && captureTabPreview(c.id, "update")
        }
    } catch (e) {
        console.error(e)
    }
});

function sendTabDataCM(a, b, c) {
    Columns.sendTabDataCM(a, b, c)
}

function compareNumbers(a, b) {
    return a - b
}
chrome.tabs.onRemoved.addListener(function(a) {
    var b = allTabs[a];
    b && (b.isIncognitoTab || Columns.addClosedTab(b), delete allTabs[a], reportNumTabs())
});
var Columns = {
    rowDataMap: {},
    init: function() {
        var a;
        try {
            a = JSON.parse(localStorage.rowDataMap || null);
            if (!a || !a[0] || !a[3]) throw 1;
            Columns.rowDataMap = a
        } catch (b) {
            a || (a = {}), a[0] || (a[0] = {
                id: 0,
                name: getMessage("suspendedTabsTitle"),
                tip: getMessage("suspendedTabsTip"),
                tabs: []
            }), a[3] || (a[3] = {
                id: 3,
                name: getMessage("recentlyClosedTitle"),
                tip: getMessage("recentlyClosedTip"),
                tabs: []
            }), localStorage.rowDataMap = JSON.stringify(a), Columns.rowDataMap = a
        }
        a[1] && delete a[1];
        a[2] && delete a[2]
    },
    getRowRegistry: function() {
        if (localStorage.usageMode ==
            0) return [0, 3];
        var a = [];
        Object.keys(Columns.rowDataMap).forEach(function(b) {
            a.push(parseInt(b, 10))
        });
        return a.sort(compareNumbers)
    },
    getCurrentRowId: function() {
        var a = parseInt(localStorage.currentRowId);
        if (a < 0 || isNaN(a)) return 0;
        return a
    },
    getCurrentRow: function() {
        return Columns.getRow(Columns.getCurrentRowId())
    },
    getRow: function(a) {
        if (!a) return Columns.rowDataMap[0];
        if (a = Columns.rowDataMap[a]) return a;
        return Columns.rowDataMap[0]
    },
    save: function() {
        localStorage.rowDataMap = JSON.stringify(Columns.rowDataMap)
    },
    sendTabDataCM: function(a, b, c) {
        if (c = Columns.getRow(c))
            if (c.id == 3 && (Columns.nextRow(), c = Columns.getCurrentRow()), a.linkUrl) {
                b = {
                    URL: [a.linkUrl],
                    title: a.selectionText || a.linkUrl
                };
                if (a.pinned) b.pinned = a.pinned;
                if (a.favIconURL) b.favIconURL = a.favIconURL;
                c.tabs.push(b);
                Columns.save();
                refreshView()
            } else {
                a = new tabData(b);
                if (b.url) a.url = [b.url];
                c.tabs.push(a);
                Columns.save();
                chrome.tabs.remove(b.id, function() {
                    refreshView()
                })
            }
    },
    addClosedTab: function(a) {
        var b = 11;
        localStorage["recentlyClosed.max"] && (b = parseInt(localStorage["recentlyClosed.max"]),
            isNaN(b) && (b = 11));
        delete a.screenCap;
        var c = Columns.getRow(3).tabs;
        for (c.unshift(a); c.length > b;) c.pop();
        Columns.save()
    },
    popTab: function(a) {
        a = allTabs[a];
        if (!a) return null;
        var b = Columns.getCurrentRow();
        delete a.screenCap;
        b.tabs.push(a);
        Columns.save();
        return a
    },
    addRow: function(a, b, c) {
        var d = 0,
            e;
        for (e in Columns.rowDataMap) var f = parseInt(e),
            d = d > f ? d : f;
        d += 1;
        Columns.rowDataMap[d] = {
            id: d,
            name: c ? a : a + " " + (parseInt(d) - 3),
            tip: b,
            tabs: []
        };
        localStorage.currentRowId = d;
        Columns.save();
        prepareContextMenu();
        return d
    },
    importRow: function(a,
        b) {
        var c = 0,
            d;
        for (d in Columns.rowDataMap) var e = parseInt(d),
            c = c > e ? c : e;
        c += 1;
        d = {
            id: c,
            name: a,
            tip: b,
            tabs: []
        };
        return Columns.rowDataMap[c] = d
    },
    nextRow: function() {
        for (var a = Columns.getCurrentRowId(), b = Columns.getRowRegistry(), c = 0, d = 0; d < b.length; d++)
            if (b[d] == a) {
                c = d + 1;
                break
            }
        localStorage.currentRowId = c == b.length ? b[0] : b[c]
    },
    prevRow: function() {
        for (var a = Columns.getCurrentRowId(), b = Columns.getRowRegistry(), c = 0, d = 0; d < b.length; d++)
            if (b[d] == a) {
                c = d - 1;
                break
            }
        localStorage.currentRowId = c < 0 ? b[b.length - 1] : b[c]
    },
    removeRow: function() {
        var a =
            Columns.getCurrentRowId();
        if (!(a == 0 || a == 3) && Columns.rowDataMap[a]) Columns.nextRow(), delete Columns.rowDataMap[a], Columns.save(), (a = menuIdMap[a]) && chrome.contextMenus.remove(a)
    },
    renameRow: function(a, b) {
        var c = Columns.rowDataMap[a];
        if (c) c.name = b, Columns.save(), (c = menuIdMap[a]) && chrome.contextMenus.update(c, {
            title: b
        })
    },
    removeTabInRow: function(a) {
        Columns.getCurrentRow().tabs.splice(a, 1);
        Columns.save()
    }
};

function clearCaptures() {
    for (var a in allTabs) delete allTabs[a].screenCap
}

function getCapture(a) {
    if (allTabs[a]) return allTabs[a].screenCap;
    return null
}

function reportNumTabs() {
    localStorage.showcount == "false" ? chrome.browserAction.setBadgeText({
        text: ""
    }) : chrome.windows.getAll({
        populate: !0
    }, function(a) {
        var b = 0;
        a.forEach(function(a) {
            a.tabs && (b += a.tabs.length)
        });
        updateBadgeText(b)
    })
}

function updateBadgeText(a) {
    chrome.browserAction.setBadgeText({
        text: "" + a
    });
    var b = [0, 255, 0, 255];
    a >= 45 ? b = [255, 0, 0, 255] : a >= 30 ? b = [255, 145, 0, 255] : a >= 20 ? b = [255, 220, 0, 255] : a >= 10 && (b = [175, 230, 50, 255]);
    chrome.browserAction.setBadgeBackgroundColor({
        color: b
    })
}

function tabData(a) {
    this.id = a.id;
    this.windowId = a.windowId;
    this.title = a.title;
    this.favIconURL = a.favIconUrl;
    this.URL = [a.url];
    this.screenCap = null;
    this.pinned = a.pinned;
    this.popped = !1;
    this.isIncognitoTab = a.incognito;
    this.parent = this.id
}

function captureTabPreview(a) {
    try {
        var b = allTabs[a];
        if (b && !b.screenCap && (!localStorage.disablePreview || localStorage.disablePreview == "false")) {
            var c = b.URL[0];
            c && !(c.indexOf("chrome://") == 0 || c.indexOf("chrome-extension://") == 0 || c.indexOf("chrome-devtools://") == 0) && chrome.tabs.captureVisibleTab(b.windowId, null, function(b) {
                if (b) allTabs[a].screenCap = b
            })
        }
    } catch (d) {
        console.error("captureTabPreview", d)
    }
}

function init() {
    console.log("Background version 2.2");
    try {
        !localStorage.welcomeshown && !localStorage.rowDataMap && chrome.tabs.create({
            url: "http://blog.visibotech.com/2010/01/thank-you-for-installing-toomanytabs.html"
        }, function() {
            localStorage.welcomeshown = "true";
            localStorage.updateread = MAJOR_VERSION
        })
    } catch (a) {
        console.error(a)
    }
    localStorage.shortcut || (localStorage.shortcut = 192);
    chrome.windows.getAll({
        populate: !0
    }, function(a) {
        var c = 0;
        a.forEach(function(a) {
            c += a.tabs.length;
            a.tabs.forEach(function(a) {
                if(!prefixedTabs[/^.+?[^\/:](?=[?\/]|$)/.exec(a.url)]){
                    prefixedTabs[/^.+?[^\/:](?=[?\/]|$)/.exec(a.url)]={};
                    // console.log('Tab added',prefixedTabs[/^.+?[^\/:](?=[?\/]|$)/.exec(a.url)]);
                }
                // else{
                    // prefixedTabs[/^.+?[^\/:](?=[?\/]|$)/.exec(a.url)][a.url]=new tabData(a);
                    // console.log('Tab added',prefixedTabs[/^.+?[^\/:](?=[?\/]|$)/.exec(a.url)]);
                // }
                prefixedTabs[/^.+?[^\/:](?=[?\/]|$)/.exec(a.url)][a.url]=new tabData(a);
                prefixedTabs[a.url].title = a.title;
                prefixedTabs[a.url].favIconURL = a.favIconUrl
                allTabs[a.id] =
                    new tabData(a);
                allTabs[a.id].title = a.title;
                allTabs[a.id].favIconURL = a.favIconUrl
            })
        });
        updateBadgeText(c)
    });
    Columns.init();
    prepareContextMenu();
    prepareBackup()
}

function refreshView() {
    var a = chrome.extension.getViews({
        type: "tab"
    });
    a.push.apply(a, chrome.extension.getViews({
        type: "popup"
    }));
    a.forEach(function(a) {
        a.location.href.indexOf("popup.html") > 0 && a.location.reload()
    })
}
var menuIdMap = {};

function prepareContextMenu() {
    chrome.contextMenus.removeAll();
    menuIdMap = {};
    mainContextId = null;
    if (!localStorage.disableContextMenu || localStorage.disableContextMenu == "false")
        if (mainContextId = chrome.contextMenus.create({
                title: getMessage("sendToTMT"),
                contexts: ["page", "link"],
                onclick: function(a, c) {
                    sendTabDataCM(a, c, 0)
                }
            }), localStorage.usageMode == "1") {
            var a = Columns.getRowRegistry();
            a.length <= 2 || a.forEach(function(a) {
                if (a == 0 || a > 3) {
                    var c = Columns.getRow(a);
                    if (c) {
                        if (!c.tabs) c.tabs = [];
                        c = chrome.contextMenus.create({
                            title: c.name,
                            contexts: ["page", "link"],
                            parentId: mainContextId,
                            onclick: function(a, b) {
                                for (var c in menuIdMap)
                                    if (menuIdMap[c] == a.menuItemId) {
                                        sendTabDataCM(a, b, c);
                                        break
                                    }
                            }
                        });
                        menuIdMap[a] = c
                    }
                }
            })
        }
}

function selectTab(a, b) {
    console.log('TAB',a,b);
    if (a) {
        var c = allTabs[a],
            d = function() {
                chrome.tabs.update(a, {
                    active: !0,
                    selected: !0
                }, function(b) {
                    b.active || b.selected ? closeAllViews() : console.error("cannot focus tab", a)
                })
            };
        c && c.windowId == b ? d() : chrome.windows.update(c.windowId, {
            focused: !0
        }, function() {
            d()
        })
    }
}

function closeAllViews() {
    var a = chrome.extension.getViews({
        type: "tab"
    });
    a.push.apply(a, chrome.extension.getViews({
        type: "popup"
    }));
    a.forEach(function(a) {
        a.location.href.indexOf("popup.html") > 0 && a.close()
    })
}
chrome.runtime.onMessage.addListener(function(a, b, c) {
    if (!(b.tab && b.tab.id < 0)) switch (a.command) {
        case "getShortcut":
            c(localStorage.shortcut ? parseInt(localStorage.shortcut) : 0);
            break;
        case "prefixed":
            try {
                localStorage.lastFocusId = b.tab.windowId;
                var d = chrome.extension.getViews({
                        type: "tab"
                    }),
                    e = 0;
                d.length > 0 && d.forEach(function(a) {
                    a.location.href.indexOf("prefix.html") > 0 && (a.location.reload(), e++)
                });
                e == 0 && chrome.windows.create({
                    url: "/core/prefix.html?tmtwindow",
                    height: 636,
                    width: parseInt(localStorage.winpopupWidth) ||
                        800,
                    focused: !0,
                    type: "popup"
                }, function() {})
            } catch (f) {
                console.error("opentmtwindow", f)
            }
            break;
        case "popup":
            try {
                localStorage.lastFocusId = b.tab.windowId;
                var d = chrome.extension.getViews({
                        type: "tab"
                    }),
                    e = 0;
                d.length > 0 && d.forEach(function(a) {
                    a.location.href.indexOf("popup.html") > 0 && (a.location.reload(), e++)
                });
                e == 0 && chrome.windows.create({
                    url: "/core/popup.html?tmtwindow",
                    height: 636,
                    width: parseInt(localStorage.winpopupWidth) ||
                        800,
                    focused: !0,
                    type: "popup"
                }, function() {})
            } catch (f) {
                console.error("opentmtwindow", f)
            }
            break;
        case "popupLoaded":
            b.tab && chrome.tabs.update(b.tab.id, {
                active: !0,
                selected: !0
            })
    }
});

function setUsageMode(a, b) {
    if (localStorage.usageMode != a || b) localStorage.usageMode = a, localStorage.currentRowId = 0, prepareContextMenu(), refreshView()
}

function afterImport(a) {
    Columns.init();
    !a && a != 0 && (a = localStorage.usageMode);
    localStorage.currentRowId = 0;
    setUsageMode(a, !0)
}

function getMessage(a, b) {
    try {
        var c = chrome.i18n.getMessage(a, b);
        if (c) return c
    } catch (d) {}
}

function prepareBackup(a) {
    if (a) console.log("Force Backup now");
    else if ((new Date).getTime() - 864E5 < (localStorage.driveLastBackup || 0)) {
        console.log("backup still valid");
        window.setTimeout(prepareBackup, 36E5);
        return
    }
    window.gapi ? handleClientLoad() : window.setTimeout(function() {
        var a = document.createElement("script");
        a.type = "text/javascript";
        a.src = "https://apis.google.com/js/client.js?onload=handleClientLoad";
        document.head.appendChild(a)
    }, 1E3)
}

function handleClientLoad() {
    gapi.auth.authorize({
        client_id: "109625613373-ajtdrbojqhcinjhu0slmjo6k8smks0ru.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/drive.appdata",
        immediate: !0
    }, handleAuthResult)
}
var driveState = {
    authorized: !1
};

function handleAuthResult(a) {
    a && !a.error ? (driveState.authorized = !0, startBackup()) : driveState.authorized = !1
}

function startBackup() {
    if (driveState.authorized) {
        var a = exportData();
        a && listFile(function(b) {
            gd_updateFile(b, a, function() {
                localStorage.driveLastBackup = (new Date).getTime();
                try {
                    chrome.extension.getViews({
                        type: "tab"
                    }).forEach(function(a) {
                        a.location.href.indexOf("import.html") > 0 && a.backupComplete()
                    })
                } catch (a) {}
            })
        })
    }
}

function listFile(a) {
    gapi.client.load("drive", "v2", function() {
        var b;
        gapi.client.drive.files.list({
            q: "'appdata' in parents"
        }).execute(function(c) {
            if (c.items) {
                c = c.items.filter(function(a) {
                    return a.title.indexOf("toomanytabs.json") >= 0
                });
                if (c.length >= 10) c.sort(function(a, b) {
                    return (new Date(b.modifiedDate)).getTime() - (new Date(a.modifiedDate)).getTime()
                }), b = c[c.length - 1].id;
                a(b)
            } else a()
        })
    })
}

function exportData() {
    var a = JSON.parse(localStorage.rowDataMap),
        b;
    for (b in a)
        if (!(a[b].id == 1 || a[b].id == 2)) {
            var c = [],
                d = a[b].tabs,
                e;
            for (e in d) try {
                var f = d[e];
                c.push({
                    title: f.title,
                    URL: [f.URL.pop()],
                    pinned: f.pinned,
                    favIconURL: f.favIconURL
                })
            } catch (g) {
                console.error(g)
            }
            a[b].tabs = c
        }
    return JSON.stringify({
        version: 2.2,
        rowDataMap: a,
        usageMode: localStorage.usageMode,
        currentRowId: localStorage.currentRowId
    })
}

function gd_updateFile(a, b, c) {
    var d = {
        title: "toomanytabs.json",
        mimeType: "application/json",
        parents: [{
            id: "appdata"
        }]
    };
    d.description = localStorage.backupfileDesc ? localStorage.backupfileDesc : "";
    b = "\r\n---------314159265358979323846\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify(d) + "\r\n---------314159265358979323846\r\nContent-Type: application/json\r\n\r\n" + b + "\r\n---------314159265358979323846--";
    c || (c = function(a) {
        console.log("Update Complete ", a)
    });
    gapi.client.request({
        path: "/upload/drive/v2/files" +
            (a != null ? "/" + a : "") + "?uploadType=multipart",
        method: a != null ? "PUT" : "POST",
        params: {
            fileId: a,
            uploadType: "multipart"
        },
        headers: {
            "Content-Type": 'multipart/mixed; boundary="-------314159265358979323846"'
        },
        body: b,
        callback: c
    })
}
chrome.commands && chrome.commands.onCommand.addListener(function(a) {
    switch (a) {
        case "open-tmt-window":
            chrome.windows.getCurrent({}, function(a) {
                openTMTWin(a.id)
            });
            break;
        case "send-active-tmt":
            chrome.tabs.query({
                active: !0,
                currentWindow: !0
            }, function(a) {
                if (a.length == 1) a = a[0].id, Columns.getCurrentRowId() == 3 && Columns.nextRow(), Columns.popTab(a), delete allTabs[a], chrome.tabs.remove(a)
            })
    }
});

function openTMTWin(a) {
    try {
        localStorage.lastFocusId = a;
        var b = chrome.extension.getViews({
                type: "tab"
            }),
            c = 0;
        b.length > 0 && b.forEach(function(a) {
            a.location.href.indexOf("popup.html") > 0 && (a.location.reload(), c++)
        });
        c == 0 && chrome.windows.create({
            url: "/core/popup.html?tmtwindow",
            height: 636,
            width: parseInt(localStorage.winpopupWidth) || 800,
            focused: !0,
            type: "popup"
        }, function() {})
    } catch (d) {
        console.error("opentmtwindow", d)
    }
}
init();
