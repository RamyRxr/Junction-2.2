/**
 * Utility functions for compressing images and videos before upload
 */

/**
 * Compress an image file to a specified quality
 * @param {File} file - The image file to compress
 * @param {Number} quality - Quality from 0 to 1 (default 0.6 = 60%)
 * @param {Number} maxWidth - Maximum width in pixels (optional)
 * @returns {Promise<Blob>} - A promise that resolves to the compressed image as a Blob
 */
export const compressImage = (file, quality = 0.6, maxWidth = 1200) => {
    return new Promise((resolve, reject) => {
        // Create a FileReader to read the file
        const reader = new FileReader();

        // Set up the FileReader onload callback
        reader.onload = (event) => {
            // Create an Image object
            const img = new Image();

            // Set up the onload callback for the Image object
            img.onload = () => {
                // Create a canvas element
                const canvas = document.createElement('canvas');

                // Calculate the new dimensions
                let width = img.width;
                let height = img.height;

                // Scale down the image if it exceeds maxWidth
                if (width > maxWidth) {
                    const ratio = maxWidth / width;
                    width = maxWidth;
                    height = height * ratio;
                }

                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw the image onto the canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert the canvas to a Blob
                canvas.toBlob(
                    (blob) => {
                        // Get the compressed size
                        const originalSize = file.size / 1024 / 1024;
                        const compressedSize = blob.size / 1024 / 1024;

                        console.log(`Image compressed: ${originalSize.toFixed(2)} MB → ${compressedSize.toFixed(2)} MB (${((1 - compressedSize / originalSize) * 100).toFixed(0)}% reduction)`);

                        // Create a new File from the blob with the same name
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: new Date().getTime()
                        });

                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };

            // Handle image loading error
            img.onerror = (error) => {
                reject(error);
            };

            // Set the Image source to the FileReader result
            img.src = event.target.result;
        };

        // Handle FileReader errors
        reader.onerror = (error) => {
            reject(error);
        };

        // Read the file as a data URL
        reader.readAsDataURL(file);
    });
};

/**
 * Get video metadata (duration, dimensions)
 * @param {File} videoFile - The video file
 * @returns {Promise<Object>} - Promise resolving to video metadata
 */
export const getVideoMetadata = (videoFile) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve({
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight
            });
        };

        video.onerror = () => {
            reject(new Error('Failed to load video metadata'));
        };

        video.src = URL.createObjectURL(videoFile);
    });
};

/**
 * Create a thumbnail image from a video
 * @param {File} videoFile - The video file
 * @returns {Promise<Blob>} - Promise resolving to thumbnail image blob
 */
export const createVideoThumbnail = (videoFile) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.playsInline = true;
        video.muted = true;

        video.onloadedmetadata = () => {
            // Seek to 25% of the video
            video.currentTime = video.duration * 0.25;
        };

        video.onseeked = () => {
            // Create canvas and draw video frame
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to blob
            canvas.toBlob((blob) => {
                window.URL.revokeObjectURL(video.src);
                resolve(blob);
            }, 'image/jpeg', 0.7);
        };

        video.onerror = () => {
            reject(new Error('Failed to create video thumbnail'));
        };

        video.src = URL.createObjectURL(videoFile);
    });
};

/**
 * Compress a video using ffmpeg.wasm
 * @param {File} videoFile - The video file to compress
 * @returns {Promise<File>} - Promise resolving to compressed video file
 */
export const compressVideo = async (videoFile) => {
    try {
        // Load FFmpeg dynamically only when needed
        const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg');

        // Log the video file details
        const originalSize = videoFile.size / 1024 / 1024;
        console.log(`Original video size: ${originalSize.toFixed(2)} MB`);

        // Create and load FFmpeg instance
        const ffmpeg = createFFmpeg({
            log: true,
            corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
        });

        await ffmpeg.load();

        // Get original video name and extension
        const nameArray = videoFile.name.split('.');
        const fileExtension = nameArray.pop();
        const fileName = nameArray.join('.');

        // Input and output file names
        const inputFileName = `input-${Date.now()}.${fileExtension}`;
        const outputFileName = `${fileName}-compressed.mp4`;

        // Write the video file to memory
        ffmpeg.FS('writeFile', inputFileName, await fetchFile(videoFile));

        // Get video metadata
        const metadata = await getVideoMetadata(videoFile);

        // Calculate target bitrate based on original size (aim for ~70% reduction)
        // Higher bitrate = higher quality but larger file size
        const targetSizeMB = originalSize * 0.3;
        const durationSeconds = metadata.duration;
        let targetBitrate = Math.floor((targetSizeMB * 8 * 1024) / durationSeconds);

        // Ensure minimum quality (300k) and maximum quality (2000k)
        targetBitrate = Math.max(300, Math.min(2000, targetBitrate));

        console.log(`Compressing video with bitrate: ${targetBitrate}k`);

        // Run FFmpeg command for compression
        await ffmpeg.run(
            '-i', inputFileName,                // Input file
            '-c:v', 'libx264',                  // Video codec
            '-preset', 'fast',                  // Encoding speed/compression ratio preset
            '-b:v', `${targetBitrate}k`,        // Video bitrate
            '-maxrate', `${targetBitrate * 1.5}k`,  // Maximum bitrate
            '-bufsize', `${targetBitrate * 3}k`,    // Buffer size
            '-vf', `scale='min(1280,iw):-2'`,   // Scale video down to max 720p, maintain aspect ratio
            '-c:a', 'aac',                      // Audio codec
            '-b:a', '128k',                     // Audio bitrate
            outputFileName                      // Output file
        );

        // Read the output file from memory
        const data = ffmpeg.FS('readFile', outputFileName);

        // Create a new File from the output data
        const compressedFile = new File([data.buffer], outputFileName, {
            type: 'video/mp4',
            lastModified: new Date().getTime()
        });

        // Log compression results
        const compressedSize = compressedFile.size / 1024 / 1024;
        console.log(`Video compressed: ${originalSize.toFixed(2)} MB → ${compressedSize.toFixed(2)} MB (${((1 - compressedSize / originalSize) * 100).toFixed(0)}% reduction)`);

        // Clean up
        ffmpeg.FS('unlink', inputFileName);
        ffmpeg.FS('unlink', outputFileName);

        return compressedFile;
    } catch (error) {
        console.error('Video compression failed:', error);
        // Return original file as fallback
        return videoFile;
    }
};
