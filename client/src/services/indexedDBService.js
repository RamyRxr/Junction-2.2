import { openDB } from 'idb';

const DB_NAME = 'junctionDB';
const DB_VERSION = 1;
const STORES = {
    DONORS: 'donors',
    DONATIONS: 'donations',
    MEDIA: 'media',
    SYNC_QUEUE: 'sync_queue'
};

let db;

const openIndexedDB = async () => {
    db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            db.createObjectStore(STORES.DONORS, { keyPath: 'id' });
            db.createObjectStore(STORES.DONATIONS, { keyPath: 'id' });
            db.createObjectStore(STORES.MEDIA, { keyPath: 'id' });
            db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        }
    });
};

const performOperation = async (store, method, ...args) => {
    return db.transaction(store, 'readwrite')[method](...args);
};

const addToSyncQueue = async (operation, entity, data) => {
    const syncItem = { operation, entity, data, id: new Date().toISOString() };
    return performOperation(STORES.SYNC_QUEUE, 'add', syncItem);
};

const processSyncQueue = async () => {
    const syncQueue = await performOperation(STORES.SYNC_QUEUE, 'getAll');
    for (const item of syncQueue) {
        // Process each item based on its operation type
        // For example, if item.operation === 'upload', handle the upload
    }
};

// Donor operations
const donorOperations = {
    add: async (donor, isOffline = false) => {
        if (isOffline) {
            donor._synced = false;
            await performOperation(STORES.DONORS, 'add', donor);
            await addToSyncQueue('add', 'donor', donor);
        } else {
            donor._synced = true;
            await performOperation(STORES.DONORS, 'add', donor);
        }
    },

    update: async (id, updatedData, isOffline = false) => {
        const donor = await performOperation(STORES.DONORS, 'get', id);
        if (!donor) return null;

        Object.assign(donor, updatedData);

        if (isOffline) {
            donor._synced = false;
            await performOperation(STORES.DONORS, 'put', donor);
            await addToSyncQueue('update', 'donor', { id, updatedData });
        } else {
            donor._synced = true;
            await performOperation(STORES.DONORS, 'put', donor);
        }

        return donor;
    },

    delete: async (id, isOffline = false) => {
        if (isOffline) {
            await addToSyncQueue('delete', 'donor', { id });
        }
        return performOperation(STORES.DONORS, 'delete', id);
    }
};

// Donation operations
const donationOperations = {
    add: async (donation, isOffline = false) => {
        if (isOffline) {
            donation._synced = false;
            await performOperation(STORES.DONATIONS, 'add', donation);
            await addToSyncQueue('add', 'donation', donation);
        } else {
            donation._synced = true;
            await performOperation(STORES.DONATIONS, 'add', donation);
        }
    },

    updateStatus: async (id, status, isOffline = false) => {
        const donation = await performOperation(STORES.DONATIONS, 'get', id);
        if (!donation) return null;

        donation.status = status;
        if (status === 'done') {
            donation.completed_at = new Date().toISOString();
        }

        if (isOffline) {
            donation._synced = false;
            await performOperation(STORES.DONATIONS, 'put', donation);
            await addToSyncQueue('update', 'donation', { id, status });
            return donation;
        }

        donation._synced = true;
        return performOperation(STORES.DONATIONS, 'put', donation);
    },

    delete: async (id, isOffline = false) => {
        if (isOffline) {
            await addToSyncQueue('delete', 'donation', { id });
        }
        return performOperation(STORES.DONATIONS, 'delete', id);
    }
};

// Media operations
const mediaOperations = {
    getByDonation: async (donationId) => {
        return performOperation(STORES.MEDIA, 'getAllByIndex', {
            indexName: 'by_donation',
            key: donationId
        });
    },

    uploadMedia: async (donationId, type, file, isOffline = false) => {
        // Create a media record
        const media = {
            donation_id: donationId,
            type,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            created_at: new Date().toISOString()
        };

        if (isOffline) {
            // Store file data as base64 when offline
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        media.file_data = e.target.result;
                        media._synced = false;

                        const id = await performOperation(STORES.MEDIA, 'add', media);
                        await addToSyncQueue('upload', 'media', {
                            donation_id: donationId,
                            type,
                            file_data: media.file_data
                        });

                        resolve({ id, ...media });
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(file);
            });
        }

        // If online, don't store the file data (it will be uploaded directly)
        media._synced = true;
        return performOperation(STORES.MEDIA, 'add', media);
    },

    delete: async (id, isOffline = false) => {
        if (isOffline) {
            await addToSyncQueue('delete', 'media', { id });
        }
        return performOperation(STORES.MEDIA, 'delete', id);
    }
};

// Network status detection
const setupNetworkDetection = (callback) => {
    const updateOnlineStatus = () => {
        const isOnline = navigator.onLine;
        callback(isOnline);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial status
    updateOnlineStatus();

    // Return cleanup function
    return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
    };
};

export default {
    STORES,
    openIndexedDB,
    addToSyncQueue,
    processSyncQueue,
    donors: donorOperations,
    donations: donationOperations,
    media: mediaOperations,
    setupNetworkDetection
};