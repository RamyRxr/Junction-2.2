import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDonors } from '../contexts/DonorContext';
import { useOffline } from '../contexts/OfflineContext';
import apiService from '../services/apiService';
import DonationStats from '../components/dashboard/DonationStats'; // Import the stats component

const Dashboard = () => {
    const { donors, loading, error, agentAssignments } = useDonors();
    const { isOffline, pendingUploads } = useOffline();
    const [dashboardStats, setDashboardStats] = useState({
        pendingSheepCount: 0,
        pendingCowSharesCount: 0,
        pendingCowGroups: 0,
        remainingCowShares: 0,
        totalValue: 0
    });
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(null);

    // Get agent work stats with real data
    const [agentStats, setAgentStats] = useState({});
    const [agentStatsLoading, setAgentStatsLoading] = useState(false);

    // Fetch dashboard stats directly from API for real-time data
    useEffect(() => {
        const fetchDashboardStats = async () => {
            setStatsLoading(true);
            setStatsError(null);

            try {
                // Try to get stats from the server
                const data = await apiService.getDashboardCounts();
                setDashboardStats(data);
            } catch (error) {
                console.error("Error loading dashboard stats:", error);
                setStatsError("Unable to load dashboard statistics");

                // Calculate basic stats from local data as fallback
                if (donors) {
                    const pendingSheep = donors.filter(d => d.type === 'sheep' && d.status !== 'done').length;
                    const pendingCows = donors.filter(d => d.type === 'cow' && d.status !== 'done').length;

                    setDashboardStats(prev => ({
                        ...prev,
                        pendingSheepCount: pendingSheep,
                        pendingCowSharesCount: pendingCows,
                    }));
                }
            } finally {
                setStatsLoading(false);
            }
        };
        

        fetchDashboardStats();
    }, [donors]); // Refresh when donors change

    // Fetch actual agent statistics
    useEffect(() => {
        const fetchAgentStats = async () => {
            setAgentStatsLoading(true);
            try {
                const agents = await apiService.getAllAgents();

                // Create a map of agent stats by ID
                const statsMap = {};
                agents.forEach(agent => {
                    statsMap[agent.id] = {
                        total: parseInt(agent.total_donations) || 0,
                        completed: parseInt(agent.completed_donations) || 0,
                        progress: agent.total_donations > 0
                            ? Math.round((agent.completed_donations / agent.total_donations) * 100)
                            : 0
                    };
                });

                setAgentStats(statsMap);
            } catch (error) {
                console.error('Error fetching agent stats:', error);
            } finally {
                setAgentStatsLoading(false);
            }
        };

        fetchAgentStats();
    }, []);

    // Filter agents to show only those with pending work
    const activeAgents = useMemo(() => {
        if (!agentAssignments) return [];

        return agentAssignments.filter(agent => {
            const stats = agentStats[agent.id];
            if (!stats) return false; // No stats available yet

            // Check if agent has pending donations (total > completed)
            return stats.total > stats.completed;
        });
    }, [agentAssignments, agentStats]);

    // Count statistics from current state (for other numbers)
    const totalDonors = donors.length;
    const pendingDonors = donors.filter(d => d.status === 'pending');
    const totalPending = pendingDonors.length;
    const totalProcessing = donors.filter(d => d.status === 'sending').length;
    const totalCompleted = donors.filter(d => d.status === 'done').length;

    const pendingUploadsCount = pendingUploads.length;

    return (
        <div className="px-1">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-3">Dashboard</h1>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link to="/register" className="bg-gradient-to-br from-white to-emerald-50 rounded-xl border-2 border-emerald-300 shadow-md p-6 flex items-center hover:shadow-lg hover:bg-gradient-to-br hover:from-white hover:to-emerald-100 transition-all duration-200">
                    <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-4 rounded-full shadow-inner border-2 border-emerald-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <div className="ml-5">
                        <h2 className="text-xl font-semibold text-emerald-800">Register New Donor</h2>
                        <p className="text-emerald-600 mt-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">Add new donation for sheep or cow</p>
                    </div>
                </Link>

                <Link to="/donors" className="bg-gradient-to-br from-white to-indigo-50 rounded-xl border-2 border-indigo-300 shadow-md p-6 flex items-center hover:shadow-lg hover:bg-gradient-to-br hover:from-white hover:to-indigo-100 transition-all duration-200">
                    <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-4 rounded-full shadow-inner border-2 border-indigo-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                    </div>
                    <div className="ml-5">
                        <h2 className="text-xl font-semibold text-indigo-800">View All Donors</h2>
                        <p className="text-indigo-600 mt-1 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 inline-block">Manage and track donations</p>
                    </div>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Pending Donors */}
                <div className="bg-gradient-to-br from-white to-blue-100 rounded-xl border-2 border-blue-300 shadow-md p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-between items-start">
                        <div className="w-full">
                            <p className="text-sm font-medium text-blue-700">Pending Donors</p>
                            {statsLoading ? (
                                <div className="h-8 w-8 mt-1 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                            ) : (
                                <h3 className="text-3xl font-bold text-gray-800 whitespace-nowrap">{totalPending}</h3>
                            )}
                        </div>
                        <div className="bg-blue-200 p-2 rounded-full shadow-inner border-2 border-blue-300 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex space-x-3 overflow-x-auto pb-1">
                        <div className="bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium text-yellow-800 border-2 border-yellow-300 whitespace-nowrap">{totalPending} Pending</div>
                        <div className="bg-blue-100 px-2 py-1 rounded-full text-xs font-medium text-blue-800 border-2 border-blue-300 whitespace-nowrap">{totalProcessing} Processing</div>
                        <div className="bg-green-100 px-2 py-1 rounded-full text-xs font-medium text-green-800 border-2 border-green-300 whitespace-nowrap">{totalCompleted} Completed</div>
                    </div>
                </div>

                {/* Pending Value */}
                <div className="bg-gradient-to-br from-white to-emerald-100 rounded-xl border-2 border-emerald-300 shadow-md p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-between items-start">
                        <div className="w-full">
                            <p className="text-sm font-medium text-emerald-700">Pending Value</p>
                            {statsLoading ? (
                                <div className="h-8 w-8 mt-1 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                            ) : (
                                <h3 className="text-3xl font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
                                    {pendingDonors.reduce((sum, donor) => sum + parseFloat(donor.price || 0), 0).toLocaleString()} DA
                                </h3>
                            )}
                        </div>
                        <div className="bg-emerald-200 p-2 rounded-full shadow-inner border-2 border-emerald-300 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-sm text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border-2 border-emerald-200 inline-block whitespace-nowrap">
                            From {totalPending} pending donations
                        </div>
                    </div>
                </div>

                {/* Pending Sacrifices */}
                <div className="bg-gradient-to-br from-white to-amber-100 rounded-xl border-2 border-amber-300 shadow-md p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-between items-start">
                        <div className="w-full">
                            <p className="text-sm font-medium text-amber-700">Pending Sacrifices</p>
                            {statsLoading ? (
                                <div className="h-8 w-8 mt-1 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
                            ) : (
                                <h3 className="text-3xl font-bold text-gray-800 whitespace-nowrap">
                                    {(dashboardStats.pendingSheepCount || 0) + (dashboardStats.pendingCowGroups || 0)}
                                </h3>
                            )}
                        </div>
                        <div className="bg-amber-200 p-2 rounded-full shadow-inner border-2 border-amber-300 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex space-x-3 overflow-x-auto pb-1">
                        <div className="bg-sky-100 px-2 py-1 rounded-full text-xs font-medium text-sky-800 border-2 border-sky-300 whitespace-nowrap">
                            {dashboardStats.pendingSheepCount || 0} Sheep
                        </div>
                        <div className="bg-violet-100 px-2 py-1 rounded-full text-xs font-medium text-violet-800 border-2 border-violet-300 whitespace-nowrap">
                            {dashboardStats.pendingCowGroups || 0} Cows
                            {dashboardStats.remainingCowShares > 0 &&
                                <span className="ml-1">+{dashboardStats.remainingCowShares}/7</span>}
                        </div>
                    </div>
                </div>

                {/* Agents */}
                <div className="bg-gradient-to-br from-white to-violet-100 rounded-xl border-2 border-violet-300 shadow-md p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-between items-start">
                        <div className="w-full">
                            <p className="text-sm font-medium text-violet-700">Agents</p>
                            <h3 className="text-3xl font-bold text-gray-800 whitespace-nowrap">{agentAssignments?.length || 0}</h3>
                        </div>
                        <div className="bg-violet-200 p-2 rounded-full shadow-inner border-2 border-violet-300 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        {agentAssignments?.length > 0 ? (
                            <div className="text-sm text-violet-800 bg-violet-50 px-3 py-1 rounded-full border-2 border-violet-200 inline-block whitespace-nowrap">
                                Working on {totalProcessing} donations
                            </div>
                        ) : (
                            <div className="text-sm text-violet-800 bg-violet-50 px-3 py-1 rounded-full border-2 border-violet-200 inline-block whitespace-nowrap">
                                No agents assigned yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Agent list */}
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">Agent Workspaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {activeAgents && activeAgents.length > 0 ? (
                    activeAgents.map(agent => {
                        // Get stats for this agent
                        const stats = agentStats[agent.id] || { total: 0, completed: 0, progress: 0 };
                        const pending = stats.total - stats.completed;

                        return (
                            <Link to={`/agent/${agent.id}`} key={agent.id}
                                className="bg-gradient-to-br from-white to-indigo-50 rounded-xl border-2 border-indigo-200 shadow-md hover:shadow-lg hover:border-indigo-400 transition-all duration-200">
                                <div className="p-6">
                                    <h3 className="font-medium text-lg text-gray-800 border-b-2 border-indigo-100 pb-2">{agent.name || agent.agent_name}</h3>
                                    <div className="mt-3 text-sm text-gray-600">
                                        <p>Assigned: {stats.total} donors</p>
                                        <p className="flex justify-between mt-1">
                                            <span>Completed: <span className="font-medium text-emerald-600">{stats.completed}</span></span>
                                            <span className="font-semibold text-amber-700">Pending: {pending}</span>
                                        </p>
                                    </div>
                                    <div className="mt-4 w-full bg-indigo-100 rounded-full h-3 overflow-hidden border border-indigo-200">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-violet-600 h-3 rounded-full"
                                            style={{ width: `${stats.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : agentStatsLoading ? (
                    <div className="col-span-full bg-white rounded-xl border-2 border-indigo-200 shadow-md p-6 flex justify-center items-center">
                        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                        <span className="ml-3 text-gray-500">Loading agent data...</span>
                    </div>
                ) : (
                    <div className="col-span-full bg-gradient-to-br from-white to-slate-100 rounded-xl border-2 border-slate-300 shadow-md p-8 text-center">
                        <p className="text-gray-600">No agents with pending work. Go to Donor List to split donations between agents.</p>
                        <Link to="/donors" className="mt-5 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white py-2 px-6 rounded-lg inline-block shadow-md hover:shadow-lg transition-all duration-200">
                            Manage Donors
                        </Link>
                    </div>
                )}
            </div>

            {/* NEW: Statistics Dashboard */}
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">Donation Analytics</h2>
            <div className="mb-8">
                <DonationStats />
            </div>

            {/* Offline status */}
            {isOffline && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg shadow-md">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-amber-800">
                                You're currently offline. Don't worry, all your work is saved locally and will sync once you're back online.
                            </p>
                            {pendingUploadsCount > 0 && (
                                <p className="mt-1 text-sm text-amber-800 font-medium">
                                    <strong>{pendingUploadsCount}</strong> pending uploads will be processed when connection is restored.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
