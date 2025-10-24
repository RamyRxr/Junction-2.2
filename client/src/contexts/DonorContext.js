import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import apiService from '../services/apiService';

const DonorContext = createContext();

function donorReducer(state, action) {
    switch (action.type) {
        case 'ADD_DONOR':
            return {
                ...state,
                donors: [...state.donors, action.payload]
            };
        case 'SET_DONORS':
            return {
                ...state,
                donors: action.payload
            };
        case 'UPDATE_DONOR':
            return {
                ...state,
                donors: state.donors.map(donor =>
                    donor.id === action.payload.id ? action.payload : donor
                )
            };
        case 'DELETE_DONOR':
            return {
                ...state,
                donors: state.donors.filter(donor => donor.id !== action.payload)
            };
        case 'SET_AGENT_ASSIGNMENTS':
            return {
                ...state,
                agentAssignments: action.payload
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload
            };
        case 'UPDATE_AGENT_DONORS_CACHE':
            return {
                ...state,
                agentDonorsCache: {
                    ...state.agentDonorsCache,
                    [action.payload.agentId]: action.payload.donors
                }
            };
        default:
            return state;
    }
}

// Update initial state to include agentDonorsCache
const initialState = {
    donors: [],
    agentAssignments: [],
    agentDonorsCache: {}, // Add this line
    loading: false,
    error: null
};

export const DonorProvider = ({ children }) => {
    const [state, dispatch] = useReducer(donorReducer, initialState);
    const [initialized, setInitialized] = useState(false);
    // Create a ref for tracking loading operations
    const loadingOpsRef = useRef({});

    // Load donors from API on component mount and after any page refresh
    useEffect(() => {
        const loadData = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                // First load all donors
                const allDonations = await apiService.getDonations();
                if (allDonations && allDonations.length > 0) {
                    // Transform donation data to match our frontend model
                    const transformedDonors = allDonations.map(donation => ({
                        id: donation.donor_id,
                        firstName: donation.first_name,
                        lastName: donation.last_name,
                        whatsappNumber: donation.whatsapp_number,
                        price: donation.price,
                        type: donation.type,
                        status: donation.status,
                        donationId: donation.id,
                        cowGroupId: donation.cow_group_id,
                        createdAt: donation.created_at,
                        completedAt: donation.completed_at
                    }));
                    dispatch({ type: 'SET_DONORS', payload: transformedDonors });
                }

                // Get all agents
                try {
                    const agents = await apiService.getAllAgents();
                    if (agents && agents.length > 0) {
                        dispatch({ type: 'SET_AGENT_ASSIGNMENTS', payload: agents });
                    }
                } catch (agentError) {
                    console.error('Error loading agents:', agentError);
                }

                setInitialized(true);
            } catch (error) {
                console.error('Error loading data:', error);
                dispatch({ type: 'SET_ERROR', payload: error.message });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        loadData();
    }, []);

    // Get donors for a specific agent - Simpler implementation with useCallback to prevent recreation
    const getDonorsByAgent = useCallback(async (agentId) => {
        if (!agentId) return { sheepDonors: [], cowDonors: [] };

        const cacheKey = `agent_${agentId}`;

        // Don't update loading state if we're already tracking this operation
        if (!loadingOpsRef.current[cacheKey]) {
            dispatch({ type: 'SET_LOADING', payload: true });
            loadingOpsRef.current[cacheKey] = true;
        }

        try {
            // Check cache first
            if (state.agentDonorsCache && state.agentDonorsCache[agentId]) {
                return state.agentDonorsCache[agentId];
            }

            // Fetch from API
            const result = await apiService.getAgentDonations(agentId);

            // Transform the data to the format our frontend expects
            const sheepDonors = result.sheepDonations.map(d => ({
                id: d.donor_id,
                firstName: d.first_name,
                lastName: d.last_name,
                whatsappNumber: d.whatsapp_number,
                status: d.status,
                type: 'sheep',
                donationId: d.id,
                price: d.price,
                createdAt: d.created_at
            }));

            const cowDonors = [];
            Object.values(result.cowGroups || {}).forEach(group => {
                if (!Array.isArray(group)) return;

                group.forEach(d => {
                    cowDonors.push({
                        id: d.donor_id,
                        firstName: d.first_name,
                        lastName: d.last_name,
                        whatsappNumber: d.whatsapp_number,
                        status: d.status,
                        type: 'cow',
                        donationId: d.id,
                        price: d.price,
                        cowGroupId: d.cow_group_id,
                        createdAt: d.created_at
                    });
                });
            });

            const donorData = { sheepDonors, cowDonors };

            // Cache the result
            dispatch({
                type: 'UPDATE_AGENT_DONORS_CACHE',
                payload: { agentId, donors: donorData }
            });

            return donorData;
        } catch (error) {
            console.error('Error fetching donors for agent:', error);
            return { sheepDonors: [], cowDonors: [] };
        } finally {
            if (loadingOpsRef.current[cacheKey]) {
                delete loadingOpsRef.current[cacheKey];
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        }
    }, [state.agentDonorsCache]);

    // Add a new donor
    const addDonor = async (donor) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            // Format donor data for the API
            const donorData = {
                first_name: donor.firstName,
                last_name: donor.lastName,
                whatsapp_number: donor.whatsappNumber
            };

            // Create donor in the database
            const newDonor = await apiService.createDonor(donorData);

            // Create donation for the donor
            const donationData = {
                donor_id: newDonor.id,
                price: donor.price,
                type: donor.type
            };

            const newDonation = await apiService.createDonation(donationData);

            // Format the result for the frontend
            const formattedDonor = {
                id: newDonor.id,
                firstName: newDonor.first_name,
                lastName: newDonor.last_name,
                whatsappNumber: newDonor.whatsapp_number,
                price: newDonation.price,
                type: newDonation.type,
                status: newDonation.status,
                donationId: newDonation.id,
                createdAt: newDonor.created_at
            };

            dispatch({ type: 'ADD_DONOR', payload: formattedDonor });
            return formattedDonor;
        } catch (error) {
            console.error('Error adding donor:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // Update donor status and information
    const updateDonor = async (donor) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const donorData = {
                first_name: donor.firstName,
                last_name: donor.lastName,
                whatsapp_number: donor.whatsappNumber
            };

            await apiService.updateDonor(donor.id, donorData);

            if (donor.donationId && donor.status) {
                await apiService.updateDonationStatus(donor.donationId, donor.status);
            }

            dispatch({ type: 'UPDATE_DONOR', payload: donor });
            return donor;
        } catch (error) {
            console.error('Error updating donor:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // Delete a donor
    const deleteDonor = async (id) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await apiService.deleteDonor(id);
            dispatch({ type: 'DELETE_DONOR', payload: id });
        } catch (error) {
            console.error('Error deleting donor:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // Split donors among agents
    const splitDonors = async (agentCount, agentNames) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            // Use the API to split donations
            const result = await apiService.splitDonations(agentNames);

            // Update the local state with the new agent assignments
            dispatch({ type: 'SET_AGENT_ASSIGNMENTS', payload: result.agents });

            return result.agents;
        } catch (error) {
            console.error('Error splitting donors:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // Check for agents with all completed donations and remove them
    const checkEmptyAgents = useCallback(async () => {
        if (!state.agentAssignments || state.agentAssignments.length === 0) return;

        try {
            // Get all agents with their donation stats
            const agents = await apiService.getAllAgents();

            if (!agents || agents.length === 0) return;

            // Filter to keep only agents with pending or in-progress work
            const activeAgents = agents.filter(agent => {
                // If the agent has no donations, they're not active
                if (!agent.total_donations || agent.total_donations === 0) return false;

                // If all their donations are completed, they're not active
                if (agent.total_donations === agent.completed_donations) return false;

                // Otherwise, they're active
                return true;
            });

            // Update if there's a change in the agent list
            if (activeAgents.length !== state.agentAssignments.length) {
                console.log('Removing completed agents:', state.agentAssignments.length - activeAgents.length);
                dispatch({ type: 'UPDATE_AGENT_ASSIGNMENTS', payload: activeAgents });
            }
        } catch (error) {
            console.error('Error checking empty agents:', error);
        }
    }, [state.agentAssignments]);

    // Mark donor as done with uploaded media
    const markDonorAsDone = async (id, media) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const donor = state.donors.find(d => d.id === id);
            if (!donor) throw new Error('Donor not found');

            const donationId = donor.donationId;

            // Upload images - Using Promise.all to upload all images simultaneously
            if (media.images && media.images.length > 0) {
                await Promise.all(media.images.map(image =>
                    apiService.uploadMedia(donationId, 'image', image)
                ));
            }

            // Upload video
            if (media.video) {
                await apiService.uploadMedia(donationId, 'video', media.video);
            }

            // Update donation status to 'done'
            await apiService.updateDonationStatus(donationId, 'done');

            // Update local state
            const updatedDonor = {
                ...donor,
                status: 'done',
                completedAt: new Date().toISOString()
            };

            dispatch({ type: 'UPDATE_DONOR', payload: updatedDonor });

            // After updating donor status, check if any agents should be removed
            await checkEmptyAgents();

            // Refresh the donations to get the updated status
            const allDonations = await apiService.getDonations();
            if (allDonations && allDonations.length > 0) {
                const transformedDonors = allDonations.map(donation => ({
                    id: donation.donor_id,
                    firstName: donation.first_name,
                    lastName: donation.last_name,
                    whatsappNumber: donation.whatsapp_number,
                    price: donation.price,
                    type: donation.type,
                    status: donation.status,
                    donationId: donation.id,
                    cowGroupId: donation.cow_group_id,
                    createdAt: donation.created_at,
                    completedAt: donation.completed_at
                }));
                dispatch({ type: 'SET_DONORS', payload: transformedDonors });
            }

            return updatedDonor;
        } catch (error) {
            console.error('Error marking donor as done:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    return (
        <DonorContext.Provider value={{
            donors: state.donors,
            loading: state.loading,
            error: state.error,
            agentAssignments: state.agentAssignments,
            addDonor,
            updateDonor,
            deleteDonor,
            splitDonors,
            markDonorAsDone,
            getDonorsByAgent,
            checkEmptyAgents  // Add this new function to the context
        }}>
            {children}
        </DonorContext.Provider>
    );
};

export const useDonors = () => useContext(DonorContext);
