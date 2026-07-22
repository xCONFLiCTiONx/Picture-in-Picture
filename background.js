chrome.action.onClicked.addListener(async (tab) => {

    const url = tab.url || "";

    if (
        url.startsWith("chrome://") ||
        url.startsWith("chrome-extension://") ||
        url.startsWith("edge://") ||
        url.startsWith("about:") ||
        url.startsWith("file://")
    ) {
        console.warn("Cannot run PiP on this page:", url);
        return;
    }

    if (!url.startsWith("http")) {
        console.warn("Not an HTTP(S) page:", url);
        return;
    }

    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });
    } catch (e) {
        console.warn("Failed to inject content.js:", e);
    }

});
