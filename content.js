(function () {
    let lastVideo = null;
    let lastTime = 0;

    function getRealVideo() {
        const videos = document.querySelectorAll("video");
        let active = null;

        for (const v of videos) {
            // YouTube's fake videos have frozen currentTime
            if (v.readyState >= 2 && v.currentTime !== lastTime) {
                active = v;
                lastTime = v.currentTime;
            }
        }

        return active;
    }

    function switchPiP(video) {
        if (!video || video.disablePictureInPicture) return;

        if (document.pictureInPictureElement !== video) {
            video.requestPictureInPicture().catch(() => {});
        }
    }

    setInterval(() => {
        const v = getRealVideo();
        if (!v) return;

        if (v !== lastVideo) {
            lastVideo = v;

            // If already playing, switch immediately
            if (!v.paused) {
                switchPiP(v);
            }

            // Also bind play event
            v.addEventListener("play", () => switchPiP(v));
        }
    }, 200);
})();
