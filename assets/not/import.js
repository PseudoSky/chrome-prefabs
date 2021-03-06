var background = chrome.extension.getBackgroundPage();

function getMessage(a, b) {
    try {
        var c = chrome.i18n.getMessage(a, b);
        if (c) return c
    } catch (d) {}
    return null
}

function loadTMTColumns() {
    var a;
    try {
        if (localStorage.rowDataMap && (a = JSON.parse(localStorage.rowDataMap)), !a || !a[0] || !a[3]) throw 1;
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
        }), delete a[1], delete a[2]
    }
    return a
}

function main() {
    $('input[type="button"]').addClass("button");
    $("#importButton").val(getMessage("importButton"));
    $("#mergeButton").val(getMessage("mergeButton"));
    $("#import").text(getMessage("import"));
    $("#export").text(getMessage("export"));
    $("#importTextToggle").val(getMessage("import"));
    $("#exportBackup").val(getMessage("exportBackup"));
    $("#exportPrint").val(getMessage("exportPrint"));
    $("#importDescription").text(getMessage("importDescription"));
    $("#importHint").text(getMessage("importDescription2"));
    $("#mergeHint").text(getMessage("mergeHint"));
    $("#exportDescription").text(getMessage("exportDescription"));
    $("#pagetitle").text(getMessage("importPageTitle"));
    $("#importFFTextToggle").val(getMessage("importFFTextToggle"));
    $("#importFFButton").val(getMessage("confirm"));
    $("#importFFDescription").text(getMessage("importFFDescription"));
    $("#importFFDescription2").text(getMessage("importFFDescription2"));
    $('input[name="exportFormat"]').change(function() {
        $('input[name="exportFormat"]:checked').val() ==
            0 ? $("#exportText").val(exportData.text) : $("#exportText").val(exportData.html)
    });
    $("#exportText").click(function() {
        this.select()
    })
}
var exportData;

function getExportString(a) {
    $("#exportTextDiv").show();
    a ? $(exportControls).show() : $(exportControls).hide();
    var b = JSON.parse(localStorage.rowDataMap),
        c;
    for (c in b)
        if (!(b[c].id == 1 || b[c].id == 2)) {
            var d = [],
                h = b[c].tabs,
                g;
            for (g in h) try {
                var e = h[g];
                d.push({
                    title: e.title,
                    URL: [e.URL.pop()],
                    pinned: e.pinned,
                    favIconURL: e.favIconURL
                })
            } catch (f) {
                console.error(f)
            }
            b[c].tabs = d
        }
    a ? (exportData = prettyPrint(b), $("#exportText").val(exportData.text)) : $("#exportText").val(JSON.stringify({
        version: 2.2,
        rowDataMap: b,
        usageMode: localStorage.usageMode,
        currentRowId: localStorage.currentRowId
    }))
}

function prettyPrint(a) {
    exportData = {};
    exportData.text = "TooManyTabs Data (" + (new Date).toDateString() + ")\n";
    var b = $("<DL>"),
        c;
    for (c in a) {
        $('<DT><H3 LAST_MODIFIED="' + Math.round((new Date).getTime() / 1E3) + '">' + a[c].name + " (" + a[c].tabs.length + ")</H3></DT>").appendTo(b);
        exportData.text += "\n" + a[c].name + " (" + a[c].tabs.length + ") \n";
        var d = a[c].tabs,
            h = $("<DL>").appendTo(b),
            g;
        for (g in d) try {
            var e = d[g],
                f = $("<DT>").appendTo(h);
            $("<a/>", {
                text: e.title,
                href: e.URL[0],
                icon: e.favIconURL
            }).appendTo(f);
            exportData.text +=
                "    " + e.title + "\n";
            exportData.text += "        " + e.URL[0] + "\n"
        } catch (i) {
            console.error(i)
        }
    }
    exportData.html = '<!DOCTYPE NETSCAPE-Bookmark-file-1><META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8"><TITLE>TooManyTabs Data</TITLE><H1>TooManyTabs(' + (new Date).toDateString() + ")</H1><DL></DL>" + b.html();
    return exportData
}

function parseData(a) {
    try {
        var b = JSON.parse(a);
        if (!b.version) b.rowDataMap = JSON.parse(b.rowDataMap);
        delete b.rowDataMap[1];
        delete b.rowDataMap[2];
        if (!b.rowDataMap[0] || b.rowDataMap[0].id != 0 || !b.rowDataMap[3] || b.rowDataMap[3].id != 3) return console.log("Inconsistent column data"), alert(getMessage("formatError")), null;
        return b
    } catch (c) {
        console.error(c), alert(getMessage("formatError"))
    }
    return null
}

function beforeImport() {
    try {
        chrome.extension.getViews({
            type: "tab"
        }).forEach(function(a) {
            a != window && a.close()
        }), chrome.extension.getViews({
            type: "popup"
        }).forEach(function(a) {
            a.close()
        })
    } catch (a) {}
}

function importColumn() {
    var a = $("#importText").val();
    if (a && (beforeImport(), a = parseData(a))) {
        localStorage.rowDataMap = JSON.stringify(a.rowDataMap);
        if (a.currentRowId) localStorage.currentRowId = a.currentRowId;
        background.afterImport(a.usageMode);
        alert(getMessage("importedSuccessfully"))
    }
}

function showDiv(a) {
    $("#" + a + "Div").show();
    $("#" + a + "Toggle").hide()
}

function importFFColumn() {
    var a = $("#importFFText").val();
    try {
        JSON.parse(a).tmt.forEach(function(a) {
            var b = background.Columns.importRow(a.title, "From Firefox");
            a.children.forEach(function(a) {
                var c = {
                    title: a.title || a.uri,
                    URL: [a.uri]
                };
                try {
                    if (a.annos && a.annos[0].value && !JSON.parse(a.annos[0].value).unpin) c.pinned = !0
                } catch (e) {
                    console.error("parse annos fail", e)
                }
                b.tabs.push(c)
            });
            console.log("Added row", b)
        }), background.Columns.save(), background.afterImport(1), alert(getMessage("importedSuccessfully"))
    } catch (b) {
        throw console.error("Fail when import",
            b), alert(getMessage("formatError")), b;
    }
}

function mergeTMT() {
    var a = $("#importText").val();
    if (a) {
        a = parseData(a);
        beforeImport();
        try {
            var b = loadTMTColumns(),
                c = 3,
                d;
            for (d in b) d > c && (c = d);
            var h = {};
            $("#mergeCheck").is(":checked") && (console.log("mergeSameColumn"), $.each(b, function(a, b) {
                h[b.name] = b
            }));
            $.each(a.rowDataMap, function(a, f) {
                console.log("Merge:", f.id, f);
                var d = null;
                if (f.id == 0) console.log("Merged suspend column"), d = b[0];
                else if (f.id == 3) {
                    console.log("Skip recently closed tabs");
                    return
                } else d = h[f.name], d || (c++, d = {
                        id: c,
                        name: f.name,
                        tabs: []
                    }, b[c] =
                    d);
                $.each(f.tabs, function(a, b) {
                    d.tabs.push({
                        title: b.title,
                        URL: b.URL[0],
                        pinned: b.pinned
                    })
                });
                console.log("merge", d.name, d.tabs.length)
            });
            localStorage.rowDataMap = JSON.stringify(b);
            background.afterImport(1);
            alert(getMessage("importedSuccessfully"))
        } catch (g) {
            throw console.error("Fail when import", g), alert(getMessage("formatError")), g;
        }
    }
}
$(document).ready(function() {
    main();
    $(exportBackup).click(function() {
        getExportString()
    });
    $(exportPrint).click(function() {
        getExportString(!0)
    });
    $(importTextToggle).click(function() {
        showDiv("importText")
    });
    $(importButton).click(function() {
        importColumn()
    });
    $(mergeButton).click(function() {
        mergeTMT()
    });
    $(importFFTextToggle).click(function() {
        showDiv("importFFText")
    });
    $(importFFButton).click(function() {
        importFFColumn()
    })
});
