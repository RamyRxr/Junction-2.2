import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { openDB } from 'idb';
import { supabase } from '../supabase';

const OfflineContext = createContext();

const initDB = async () => {
    return openDB('junctionOfflineDB', 2, {
        upgrade(db) {
            // Store for media files
            if (!db.objectStoreNames.contains('mediaFiles')) {
                const mediaStore = db.createObjectStore('mediaFiles', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                mediaStore.createIndex('by_upload_id', 'uploadId', { unique: false });
            }
            // Store for pending uploads metadata
            if (!db.objectStoreNames.contains('pendingUploads')) {
                db.createObjectStore('pendingUploads', {
                    keyPath: 'id',
                    autoIncrement: false
                });
            }
        }
    });
};

const fileToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

const base64ToBlob = (base64String) => {
    try {
        const parts = base64String.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(parts[1]);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);

        for (let i = 0; i < n; i++) {
            u8arr[i] = bstr.charCodeAt(i);
        }

        return new Blob([u8arr], { type: mime });
    } catch (error) {
        console.error('Error converting base64 to blob:', error);
        throw error;
    }
};

const addPendingUpload = async (db, upload) => {
    const tx = db.transaction('pendingUploads', 'readwrite');
    await tx.objectStore('pendingUploads').add(upload);
    await tx.done;
};

const getAllPendingUploads = async (db) => {
    const tx = db.transaction('pendingUploads', 'readonly');
    const items = await tx.objectStore('pendingUploads').getAll();
    await tx.done;
    return items;
};

const removePendingUploadById = async (db, id) => {
    const tx = db.transaction('pendingUploads', 'readwrite');
    await tx.objectStore('pendingUploads').delete(id);
    await tx.done;
};

const addMediaFile = async (db, uploadId, base64Data, fileName, fileType) => {
    const tx = db.transaction('mediaFiles', 'readwrite');
    const mediaStore = tx.objectStore('mediaFiles');
    const id = await mediaStore.add({
        uploadId,
        base64Data,
        fileName,
        fileType,
        createdAt: new Date().toISOString()
    });
    await tx.done;
    return id;
};

const getMediaFileByUploadId = async (db, uploadId) => {
    const tx = db.transaction('mediaFiles', 'readonly');
    const mediaStore = tx.objectStore('mediaFiles');
    const index = mediaStore.index('by_upload_id');
    const result = await index.getAll(uploadId);
    await tx.done;
    return result;
};

const removeMediaFilesByUploadId = async (db, uploadId) => {
    const tx = db.transaction('mediaFiles', 'readwrite');
    const mediaStore = tx.objectStore('mediaFiles');
    const index = mediaStore.index('by_upload_id');
    const keys = await index.getAllKeys(uploadId);
    await tx.done;

    const deleteTx = db.transaction('mediaFiles', 'readwrite');
    for (const key of keys) {
        await deleteTx.objectStore('mediaFiles').delete(key);
    }
    await deleteTx.done;
};

export const OfflineProvider = ({ children }) => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [pendingUploads, setPendingUploads] = useState([]);
    const [db, setDb] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const setupDB = async () => {
            try {
                const database = await initDB();
                setDb(database);
                const items = await getAllPendingUploads(database);
                setPendingUploads(items);
                console.log('Loaded pending uploads:', items.length);
            } catch (error) {
                console.error('Error initializing IndexedDB:', error);
            }
        };

        setupDB();
    }, []);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            console.log('✅ Back online. Attempting to sync...');
        };

        const handleOffline = () => {
            setIsOffline(true);
            console.log('📴 Device is offline. Changes will be synced later.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const queueMediaUpload = async (donorId, { type, file, donorInfo }) => {
        if (!db) {
            console.error('❌ Database not initialized');
            return;
        }

        if (!donorId) {
            console.error('❌ Donor ID is required for queuing uploads');
            return;
        }

        if (!file) {
            console.error('❌ File is required for queuing uploads');
            return;
        }

        try {
            // Convert file to base64
            const base64Data = await fileToBase64(file);
            const uploadId = `${donorId}_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            // Store media file with metadata
            const mediaId = await addMediaFile(db, uploadId, base64Data, file.name, file.type);

            // Queue upload with proper metadata
            const upload = {
                id: uploadId,
                donorId: String(donorId),        // Ensure it's a string
                mediaId,
                uploadId,
                type,
                mediaType: type,
                donorInfo,
                status: 'pending',
                createdAt: new Date().toISOString(),
                attempts: 0
            };

            await addPendingUpload(db, upload);
            const items = await getAllPendingUploads(db);
            setPendingUploads(items);
            console.log(`✓ Queued upload: ${uploadId}`);
        } catch (error) {
            console.error('❌ Error queueing media upload:', error);
        }
    };

    const syncPendingUploads = useCallback(async () => {
        if (isOffline || !db || isSyncing || pendingUploads.length === 0) {
            return;
        }

        setIsSyncing(true);
        console.log(`🔄 Starting to sync ${pendingUploads.length} pending uploads`);

        const failedUploads = [];

        try {
            for (const upload of pendingUploads) {
                try {
                    // Validate required fields
                    if (!upload.donorId || !upload.uploadId) {
                        console.error(`❌ Invalid upload data: missing donorId or uploadId`, upload);
                        await removePendingUploadById(db, upload.id);
                        continue;
                    }

                    // Get media file from IndexedDB by uploadId
                    const mediaFiles = await getMediaFileByUploadId(db, upload.uploadId);

                    if (!mediaFiles || mediaFiles.length === 0) {
                        console.error(`❌ Media file not found for uploadId ${upload.uploadId}`);
                        await removePendingUploadById(db, upload.id);
                        continue;
                    }

                    const mediaFile = mediaFiles[0];

                    if (!mediaFile.base64Data) {
                        console.error(`❌ Base64 data is missing for upload ${upload.id}`);
                        await removePendingUploadById(db, upload.id);
                        continue;
                    }

                    // Convert base64 to blob
                    const blob = base64ToBlob(mediaFile.base64Data);

                    // Upload to Supabase
                    const fileName = `${upload.donorId}_${upload.mediaType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                    const filePath = `${upload.mediaType === 'image' ? 'images' : 'videos'}/${fileName}`;

                    console.log(`⬆️  Uploading ${upload.mediaType} to: ${filePath}`);

                    const { data, error } = await supabase.storage
                        .from('media')
                        .upload(filePath, blob, {
                            contentType: mediaFile.fileType,
                            upsert: false
                        });

                    if (error) {
                        throw error;
                    }

                    // Get public URL
                    const { data: urlData } = supabase.storage
                        .from('media')
                        .getPublicUrl(filePath);

                    console.log(`✅ Upload successful! URL: ${urlData.publicUrl}`);

                    // Remove from pending uploads and media storage
                    await removePendingUploadById(db, upload.id);
                    await removeMediaFilesByUploadId(db, upload.uploadId);

                } catch (uploadError) {
                    console.error(`❌ Error processing upload ${upload.id}:`, uploadError);
                    failedUploads.push(upload.id);

                    // Increment attempt counter
                    upload.attempts = (upload.attempts || 0) + 1;

                    // Remove after 3 failed attempts
                    if (upload.attempts >= 3) {
                        console.warn(`⚠️  Removing upload ${upload.id} after 3 failed attempts`);
                        await removePendingUploadById(db, upload.id);
                        await removeMediaFilesByUploadId(db, upload.uploadId);
                    }
                }
            }

            // Refresh pending uploads list
            const items = await getAllPendingUploads(db);
            setPendingUploads(items);

            if (failedUploads.length === 0) {
                console.log(`✅ All uploads synced successfully!`);
            } else {
                console.warn(`⚠️  ${failedUploads.length} uploads failed and will be retried`);
            }

        } catch (error) {
            console.error('❌ Error syncing pending uploads:', error);
        } finally {
            setIsSyncing(false);
        }
    }, [isOffline, db, isSyncing, pendingUploads]);

    // Trigger sync when coming online
    useEffect(() => {
        if (!isOffline && db && pendingUploads.length > 0 && !isSyncing) {
            syncPendingUploads();
        }
    }, [isOffline, db, pendingUploads.length, isSyncing, syncPendingUploads]);

    return (
        <OfflineContext.Provider value={{
            isOffline,
            queueMediaUpload,
            pendingUploads,
            isSyncing,
            syncPendingUploads,
            supabase
        }}>
            {children}
        </OfflineContext.Provider>
    );
};

export const useOffline = () => {
    const context = useContext(OfflineContext);
    if (context === undefined) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
};