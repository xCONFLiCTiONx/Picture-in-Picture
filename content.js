(function() {
    try {
        let video = document.querySelector('video');

        if (!video) {
            const iframes = document.querySelectorAll('iframe');
            for (let iframe of iframes) {
                try {
                    if (iframe.contentDocument) {
                        video = iframe.contentDocument.querySelector('video');
                        if (video) break;
                    }
                } catch (e) {
                    continue;
                }
            }
        }

        if (!video) {
            return;
        }

        if (document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(() => {});
        } else if (!video.disablePictureInPicture) {
            video.requestPictureInPicture().catch(() => {});
        }
    } catch (e) {}
})();