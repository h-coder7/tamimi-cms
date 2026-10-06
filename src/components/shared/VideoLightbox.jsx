"use client";

import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

/**
 * VideoLightbox Component
 * @param {boolean} open - Whether the lightbox is open
 * @param {function} close - Function to close the lightbox
 * @param {Array} slides - Array of slides [{ type: "video", width, height, posters, sources: [{ src, type }] }]
 */
export default function VideoLightbox({ open, close, videoUrl }) {
    if (!videoUrl) return null;

    return (
        <Lightbox
            open={open}
            close={close}
            plugins={[Video]}
            slides={[
                {
                    type: "video",
                    width: 1280,
                    height: 720,
                    sources: [
                        {
                            src: videoUrl,
                            type: "video/mp4", // This is a safe default, browser will detect if blob
                        },
                    ],
                },
            ]}
        />
    );
}
