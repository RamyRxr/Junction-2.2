/**
 * Utility functions for offline storage and synchronization
 */

// Save donor media to IndexedDB
export const saveDonorMedia = async (donorId, media) => {
    if (!('indexedDB' in window)) {
        console.error('IndexedDB not supported');
        return false;
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open('donor-media-db', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('media')) {
                db.createObjectStore('media', { keyPath: 'id' });
            }
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['media'], 'readwrite');
            const store = transaction.objectStore('media');

            // Store media files as objects with metadata
            const mediaRecord = {
                id: donorId,
                images: media.images.map(file => ({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: file.lastModified,
                    // We'll store the file as base64
                    data: null // Will be filled after FileReader
                })),
                video: {
                    name: media.video?.name,
                    type: media.video?.type,
                    size: media.video?.size,
                    lastModified: media.video?.lastModified,
                    data: null // Will be filled after FileReader
                },
                timestamp: Date.now()
            };

            // Read image files as base64
            const imagePromises = media.images.map((file, index) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        mediaRecord.images[index].data = e.target.result;
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
            });

            // Read video file as base64
            const videoPromise = media.video ? new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    mediaRecord.video.data = e.target.result;
                    resolve();
                };
                reader.readAsDataURL(media.video);
            }) : Promise.resolve();

            // When all files are read, save to IndexedDB
            Promise.all([...imagePromises, videoPromise])
                .then(() => {
                    const storeRequest = store.put(mediaRecord);

                    storeRequest.onsuccess = () => {
                        console.log('Media saved to IndexedDB');
                        resolve(true);
                    };

                    storeRequest.onerror = (event) => {
                        console.error('Error saving media:', event.target.error);
                        reject(event.target.error);
                    };
                })
                .catch(error => {
                    console.error('Error reading files:', error);
                    reject(error);
                });
        };
    });
};

// Get all pending media uploads
export const getPendingMedia = async () => {
    if (!('indexedDB' in window)) {
        console.error('IndexedDB not supported');
        return [];
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open('donor-media-db', 1);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['media'], 'readonly');
            const store = transaction.objectStore('media');
            const getRequest = store.getAll();

            getRequest.onsuccess = () => {
                resolve(getRequest.result || []);
            };

            getRequest.onerror = (event) => {
                console.error('Error getting media:', event.target.error);
                reject(event.target.error);
            };
        };
    });
};

// Remove media record after successful upload
export const removeMedia = async (donorId) => {
    if (!('indexedDB' in window)) {
        console.error('IndexedDB not supported');
        return false;
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open('donor-media-db', 1);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['media'], 'readwrite');
            const store = transaction.objectStore('media');
            const deleteRequest = store.delete(donorId);

            deleteRequest.onsuccess = () => {
                console.log('Media record removed from IndexedDB');
                resolve(true);
            };

            deleteRequest.onerror = (event) => {
                console.error('Error removing media:', event.target.error);
                reject(event.target.error);
            };
        };
    });
};
