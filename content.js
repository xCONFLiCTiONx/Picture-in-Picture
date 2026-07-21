(function () {
    let pipVideo = null;

    function findVideo() {
        let videos = [...document.querySelectorAll("video")];

        if (!videos.length) return null;

        // Pick the visible playing video
        return videos.find(v =>
            !v.paused &&
            v.readyState >= 2 &&
            v.offsetWidth > 0 &&
            v.offsetHeight > 0
        ) || videos[0];
    }

    async function switchPiP() {
        let video = findVideo();

        if (!video) return;

        if (video === pipVideo) return;

        pipVideo = video;

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            }
        } catch {}

        try {
            if (!video.disablePictureInPicture) {
                await video.requestPictureInPicture();
            }
        } catch {}
    }


    // Detect when sites replace the player
    const observer = new MutationObserver(() => {
        setTimeout(() => {
            switchPiP();
        }, 500);
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });


    // Detect normal play events
    document.addEventListener("play", e => {
        if (e.target.tagName === "VIDEO") {
            setTimeout(switchPiP, 200);
        }
    }, true);


    // Detect source changes
    document.addEventListener("loadeddata", e => {
        if (e.target.tagName === "VIDEO") {
            setTimeout(switchPiP, 200);
        }
    }, true);


    // Initial attempt
    switchPiP();

})();