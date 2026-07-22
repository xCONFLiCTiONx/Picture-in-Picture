(() => {

    if (window.universalPiPLoaded) {
        if (window.startUniversalPiP) {
            window.startUniversalPiP();
        }
        return;
    }

    window.universalPiPLoaded = true;

    let currentVideo = null;
    let lastSrc = "";
    let pipActive = false;

    let initialAttemptDone = false;
    let popupShown = false; // <-- permanent lock

    // ------------------------------------------------------------
    // SAFE POPUP (DOM overlay, NOT an extension error)
    // ------------------------------------------------------------
    function showPopup(reason) {
        if (popupShown) return;
        popupShown = true;

        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.bottom = "20px";
        popup.style.right = "20px";
        popup.style.padding = "14px 18px";
        popup.style.background = "rgba(0,0,0,0.85)";
        popup.style.color = "white";
        popup.style.fontSize = "14px";
        popup.style.borderRadius = "8px";
        popup.style.zIndex = "999999999";
        popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
        popup.style.maxWidth = "260px";
        popup.style.lineHeight = "1.4";
        popup.style.fontFamily = "Arial, sans-serif";

        popup.innerText = `Picture-in-Picture is not supported on ${location.hostname}\nReason: ${reason}`;

        document.body.appendChild(popup);

        setTimeout(() => popup.remove(), 6000);
    }

    // ------------------------------------------------------------
    // FIND VIDEO (normal + deep shadow DOM)
    // ------------------------------------------------------------
    function findVideo() {
        const normalVideos = [...document.querySelectorAll("video")];
        if (normalVideos.length) {
            return normalVideos.sort((a, b) => (b.videoWidth * b.videoHeight) - (a.videoWidth * a.videoHeight))[0];
        }

        function deepSearch(root) {
            const found = [];
            function walk(node) {
                if (!node) return;
                if (node.nodeName.toLowerCase() === "video") found.push(node);
                node.childNodes.forEach(walk);
                if (node.children) [...node.children].forEach(walk);
                if (node.shadowRoot) {
                    node.shadowRoot.childNodes.forEach(walk);
                    if (node.shadowRoot.children) [...node.shadowRoot.children].forEach(walk);
                }
            }
            walk(root);
            return found;
        }

        const deepVideos = deepSearch(document);
        if (deepVideos.length) {
            return deepVideos.sort((a, b) => (b.videoWidth * b.videoHeight) - (a.videoWidth * a.videoHeight))[0];
        }

        return null;
    }

    // ------------------------------------------------------------
    // START PIP (silent except first attempt popup)
    // ------------------------------------------------------------
    async function startUniversalPiP() {

        if (initialAttemptDone && popupShown) return;

        const video = findVideo();

        if (!video) {
            if (!initialAttemptDone && !popupShown) {
                showPopup("No accessible <video> element found");
            }
            initialAttemptDone = true;
            return;
        }

        try {
            await video.play().catch(() => {});

            if (document.pictureInPictureElement === video) return;

            await video.requestPictureInPicture();

            currentVideo = video;
            lastSrc = video.currentSrc;
            pipActive = true;
            initialAttemptDone = true;

        } catch (e) {

            if (!initialAttemptDone && !popupShown) {
                showPopup("Browser refused PiP request (site may block PiP or use DRM)");
            }

            initialAttemptDone = true;
            return;
        }
    }

    window.startUniversalPiP = startUniversalPiP;

    document.addEventListener("enterpictureinpicture", () => {
        pipActive = true;
    });

    document.addEventListener("leavepictureinpicture", () => {
        pipActive = false;
    });

    // ------------------------------------------------------------
    // CHECK VIDEO CHANGES (NO POPUPS EVER)
    // ------------------------------------------------------------
    async function checkVideo() {
        if (!pipActive) return;

        const video = findVideo();
        if (!video) return;

        const src = video.currentSrc;

        if (video !== currentVideo) {
            await startUniversalPiP();
            return;
        }

        if (src && src !== lastSrc) {
            await startUniversalPiP();
            return;
        }

        if (video.ended) {
            setTimeout(() => startUniversalPiP(), 1500);
        }
    }

    const observer = new MutationObserver(() => checkVideo());
    observer.observe(document.documentElement, { childList: true, subtree: true });

    setInterval(() => checkVideo(), 2000);

    startUniversalPiP();

})();
