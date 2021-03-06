var background = chrome.extension.getBackgroundPage();

function restore_options() {
    if (localStorage.getItem("popupsize"))
        if (localStorage.getItem("popupsize") == "narrow") narrowbutton.checked = !0;
        else if (localStorage.getItem("popupsize") == "wide") widebutton.checked = !0;
    else {
        if (localStorage.getItem("popupsize") == "small") smallbutton.checked = !0
    } else widebutton.checked = !0;
    !localStorage.usageMode || localStorage.usageMode == "0" ? basicbutton.checked = !0 : probutton.checked = !0;
    if (localStorage.getItem("showcount"))
        if (localStorage.getItem("showcount") == "true") showcountbutton.checked = !0;
        else {
            if (localStorage.getItem("showcount") == "false") hidecountbutton.checked = !0
        } else showcountbutton.checked = !0;
    if (localStorage.getItem("crosswindow"))
        if (localStorage.getItem("crosswindow") == "true") showcrosswindow.checked = !0;
        else {
            if (localStorage.getItem("crosswindow") == "false") hidecrosswindow.checked = !0
        } else hidecrosswindow.checked = !0;
    for (var b = document.getElementById("shortcutkey"), a = 48; a < 58; ++a) b.innerHTML += "<option value='" + a + "'>" + String.fromCharCode(a) + "</option>";
    for (a = 65; a < 91; ++a) b.innerHTML +=
        "<option value='" + a + "'>" + String.fromCharCode(a) + "</option>";
    if (localStorage.shortcut) {
        for (var c = !1, a = 0; a < b.children.length; ++a)
            if (b.children[a].getAttribute("value") == localStorage.shortcut) {
                b.selectedIndex = a;
                c = !0;
                break
            }
        if (!c) b.selectedIndex = 0
    }
    b = 11;
    if (localStorage["recentlyClosed.max"]) try {
        b = parseInt(localStorage["recentlyClosed.max"])
    } catch (d) {}
    $("#maxRcTabs-select").val(b);
    $("#disablePreview").attr("checked", localStorage.disablePreview == "true");
    $("#disablePreview").change(function() {
        localStorage.disablePreview =
            isChecked(this);
        localStorage.disablePreview == "true" && background.clearCaptures()
    });
    $("#disableContextMenu").attr("checked", localStorage.disableContextMenu == "true");
    $("#disableContextMenu").change(function() {
        localStorage.disableContextMenu = isChecked(this);
        background.prepareContextMenu()
    });
    $("#winpopupWidth").val(localStorage.winpopupWidth || 800);
    $("#winpopupWidth").change(function() {
        var a = parseInt($("#winpopupWidth").val());
        isNaN(a) ? $("#winpopupWidth").val(localStorage.winpopupWidth) : localStorage.winpopupWidth =
            a
    });
    localStorage.hidePinTab == "true" && $("#hidePinTab").attr("checked", !0);
    $("#hidePinTab").change(function() {
        localStorage.hidePinTab = isChecked(this)
    });
    customColor1.value = localStorage.customThemeColor1 ? localStorage.customThemeColor1 : "ffffff";
    customColor2.value = localStorage.customThemeColor2 ? localStorage.customThemeColor2 : "7777ff"
}

function isChecked(b) {
    return b.checked
}

function init() {
    $("#pagetitle").text(getMessage("optionsPageTitle"));
    $("#welcomemessage").html(getMessage("welcomeMessage"));
    $("#popupWidth").text(getMessage("popupWidth"));
    $("#popupWidth1").text(getMessage("popupWidth1"));
    $("#popupWidth2").text(getMessage("popupWidth2"));
    $("#popupWidth3").text(getMessage("popupWidth3"));
    $("#showTabCount").text(getMessage("showTabCount"));
    $("#showTabCount1").text(getMessage("optionsYes"));
    $("#showTabCount2").text(getMessage("optionsNo"));
    $("#crossWindow").text(getMessage("crossWindow"));
    $("#crossWindow1").text(getMessage("crossWindow1"));
    $("#crossWindow2").text(getMessage("crossWindow2"));
    $("#crossWindow3").text(getMessage("crossWindow3"));
    $("#customThemeColor").text(getMessage("customThemeColor"));
    $("#advancedFeatures").text(getMessage("advancedFeatures"));
    $("#customRows1").text(getMessage("customRows1"));
    $("#customRows2").text(getMessage("customRows2"));
    $("#customRows3").text(getMessage("customRows3"));
    $("#shortcut1").text(getMessage("shortcut1"));
    $("#shortcut2").text(getMessage("shortcut2"));
    $("#shortcut3").text(getMessage("shortcut3"));
    $("#quickSupport").html(getMessage("quickSupport"));
    $("#quickSupport1").html(getMessage("quickSupport1"));
    $("#quickSupport2").html(getMessage("quickSupport2"));
    $("#donateBtn").html(getMessage("supportMsg"));
    $("#maxRcTabs").text(getMessage("recentClosedMsg"));
    $("#disablePreviewLabel").text(getMessage("disablePreviewLabel"));
    $("#disablePreviewTip").text(getMessage("disablePreviewTip"));
    $("#disableContextMenuLabel").text(getMessage("disableContextMenuLabel"));
    $("#winpopupWidthLabel").text(getMessage("winpopupWidthLabel"));
    $("#hidePinTabLabel").text(getMessage("hidePinTabLabel"));
    restore_options()
}

function getMessage(b, a) {
    try {
        var c = chrome.i18n.getMessage(b, a);
        if (c) return c
    } catch (d) {}
}
$(document).ready(function() {
    init();
    shortcutkey.onchange = function() {
        localStorage.shortcut = this.value
    };
    $(widebutton).click(function() {
        localStorage.popupsize = "wide"
    });
    $(narrowbutton).click(function() {
        localStorage.popupsize = "narrow"
    });
    $(smallbutton).click(function() {
        localStorage.popupsize = "small"
    });
    $(showcountbutton).click(function() {
        localStorage.showcount = "true";
        background.reportNumTabs()
    });
    $(hidecountbutton).click(function() {
        localStorage.showcount = "false";
        background.reportNumTabs()
    });
    $("#maxRcTabs-select").change(function() {
        localStorage["recentlyClosed.max"] =
            this.value
    });
    $(customColor1).change(function() {
        localStorage.customThemeColor1 = this.color.toString()
    });
    $(customColor2).change(function() {
        localStorage.customThemeColor2 = this.color.toString()
    });
    $(basicbutton).click(function() {
        background.setUsageMode(0)
    });
    $(probutton).click(function() {
        background.setUsageMode(1)
    });
    $(showcrosswindow).click(function() {
        localStorage.crosswindow = "true";
        background.refreshView()
    });
    $(hidecrosswindow).click(function() {
        localStorage.crosswindow = "false";
        background.refreshView()
    })
});
