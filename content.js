(function () {
    function getRealVideo() {
        const videos = document.querySelectorAll("video");
        let active = null;
        let lastTime = 0;

        for (const v of videos) {
            // Skip ad videos (usually < 20s)
            if (v.duration && v.duration < 20) continue;

            if (v.readyState >= 2 && v.currentTime !== lastTime) {
                active = v;
                lastTime = v.currentTime;
            }
        }
        
        // Fallback to the first video if no active time change is caught yet
        return active || videos[0];
    }

    const video = getRealVideo();
    if (!video || video.disablePictureInPicture) return;

    if (document.pictureInPictureElement === video) {
        document.exitPictureInPicture().catch(() => {});
    } else {
        video.requestPictureInPicture().catch(() => {});
    }
})();