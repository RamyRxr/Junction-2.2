import { useState, useEffect, useCallback } from 'react';
import indexedDBService from '../services/indexedDBService';
import apiService from '../services/apiService';

/**
 * Custom hook for handling offline/online synchronization
 */
const useOfflineSync = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(0);
    const [lastSyncTime, setLastSyncTime] = useState(null);

    // Set up network status detection
    useEffect(() => {
        const cleanup = indexedDBService.setupNetworkDetection(online => {
            setIsOnline(online);
        });

        return cleanup;
    }, []);

    // Check for pending changes in the sync queue
    const checkPendingChanges = useCallback(async () => {
        try {
            const db = await indexedDBService.openDB();
            const transaction = db.transaction(indexedDBService.STORES.SYNC_QUEUE, 'readonly');
            const store = transaction.objectStore(indexedDBService.STORES.SYNC_QUEUE);
            const countRequest = store.count();

            countRequest.onsuccess = () => {
                setPendingChanges(countRequest.result);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        } catch (error) {
            console.error('Error checking pending changes:', error);
        }
    }, []);

    // Process sync queue when online
    const syncChanges = useCallback(async () => {
        if (!isOnline || isSyncing) return;

        setIsSyncing(true);
        try {
            await indexedDBService.processSyncQueue(apiService);
            await checkPendingChanges();
            setLastSyncTime(new Date());
        } catch (error) {
            console.error('Error syncing changes:', error);
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline, isSyncing, checkPendingChanges]);

    // Check pending changes on mount and when online status changes
    useEffect(() => {
        checkPendingChanges();
    }, [checkPendingChanges]);

    // Trigger sync when coming back online
    useEffect(() => {
        if (isOnline && pendingChanges > 0) {
            syncChanges();
        }
    }, [isOnline, pendingChanges, syncChanges]);

    // API wrappers that handle offline behavior
    const api = {
        // Donors
        createDonor: async (donor) => {
            if (!isOnline) {
                return indexedDBService.donors.create(donor, true);
            }

            const newDonor = await apiService.createDonor(donor);
            await indexedDBService.donors.create(newDonor);
            return newDonor;
        },

        updateDonor: async (id, donor) => {
            if (!isOnline) {
                return indexedDBService.donors.update(id, { id, ...donor }, true);
            }

            const updatedDonor = await apiService.updateDonor(id, donor);
            await indexedDBService.donors.update(id, updatedDonor);
            return updatedDonor;
        },

        // Donations
        createDonation: async (donation) => {
            if (!isOnline) {
                return indexedDBService.donations.create(donation, true);
            }

            const newDonation = await apiService.createDonation(donation);
            await indexedDBService.donations.create(newDonation);
            return newDonation;
        },

        updateDonationStatus: async (id, status) => {
            if (!isOnline) {
                return indexedDBService.donations.updateStatus(id, status, true);
            }

            const updatedDonation = await apiService.updateDonationStatus(id, status);
            await indexedDBService.donations.updateStatus(id, status);
            return updatedDonation;
        },

        // Media
        uploadMedia: async (donationId, type, file) => {
            if (!isOnline) {
                return indexedDBService.media.uploadMedia(donationId, type, file, true);
            }

            const mediaRecord = await apiService.uploadMedia(donationId, type, file);
            return mediaRecord;
        }
    };

    return {
        isOnline,
        isSyncing,
        pendingChanges,
        lastSyncTime,
        syncChanges,
        api
    };
};

export default useOfflineSync;
