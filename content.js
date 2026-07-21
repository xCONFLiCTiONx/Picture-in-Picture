(() => {

    if (window.universalPiPLoaded) {
        console.log("PiP script already loaded");

        if (window.startUniversalPiP) {
            window.startUniversalPiP();
        }

        return;
    }

    window.universalPiPLoaded = true;

    console.log("Universal PiP loaded");


    let currentVideo = null;
    let lastSrc = "";
    let pipActive = false;



    function findVideo() {

        const videos = [...document.querySelectorAll("video")];

        if (!videos.length)
            return null;


        return videos.sort((a, b) => {

            return (
                (b.videoWidth * b.videoHeight) -
                (a.videoWidth * a.videoHeight)
            );

        })[0];

    }



    async function startUniversalPiP() {

        const video = findVideo();


        if (!video) {

            console.log("No video found");
            return;

        }


        try {

            await video.play().catch(() => {});


            // Already showing this exact video
            if (document.pictureInPictureElement === video) {

                console.log("Already in PiP");
                return;

            }


            // Switch directly to the new video
            await video.requestPictureInPicture();


            currentVideo = video;
            lastSrc = video.currentSrc;
            pipActive = true;


            console.log("PiP started/switched");


        }
        catch(e) {

            console.log("PiP error:", e);

        }

    }



    window.startUniversalPiP = startUniversalPiP;



    document.addEventListener(
        "enterpictureinpicture",
        () => {

            pipActive = true;

            console.log("PiP active");

        }
    );



    document.addEventListener(
        "leavepictureinpicture",
        () => {

            pipActive = false;

            console.log("PiP closed");

        }
    );



    async function checkVideo() {


        if (!pipActive)
            return;


        const video = findVideo();


        if (!video)
            return;



        const src = video.currentSrc;



        // Peacock replaced the video element
        if (video !== currentVideo) {

            console.log("New video element detected");

            await startUniversalPiP();

            return;

        }



        // Peacock reused the same video element
        if (src && src !== lastSrc) {

            console.log("New video source detected");

            await startUniversalPiP();

            return;

        }



        // Video ended and PiP is stuck
        if (video.ended) {

            console.log("Video ended");

            setTimeout(() => {

                startUniversalPiP();

            }, 1500);

        }


    }



    const observer = new MutationObserver(() => {

        checkVideo();

    });



    observer.observe(
        document.documentElement,
        {
            childList: true,
            subtree: true
        }
    );



    setInterval(() => {

        checkVideo();

    }, 2000);



    // Start PiP from extension button click
    startUniversalPiP();



})();