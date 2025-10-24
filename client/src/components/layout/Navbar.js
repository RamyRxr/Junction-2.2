import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useOffline } from '../../contexts/OfflineContext';
import { useDonors } from '../../contexts/DonorContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isOffline } = useOffline();
    const { agentAssignments, loading, checkEmptyAgents } = useDonors();
    const location = useLocation();
    const navigate = useNavigate();

    // Check for completed agents on initial load and navigation
    useEffect(() => {
        checkEmptyAgents();
    }, [location.pathname, checkEmptyAgents]);

    // Use useMemo to stabilize agent links and prevent unnecessary re-renders
    const agentLinks = useMemo(() => {
        if (!agentAssignments || loading) return [];

        return agentAssignments
            .filter(agent => agent?.total_donations !== agent?.completed_donations) // Filter out agents with only completed tasks
            .map(agent => ({
                id: agent.id,
                name: agent.name || agent.agent_name,
                path: `/agent/${agent.id}`
            }));
    }, [agentAssignments, loading]);

    // Redirect to dashboard if current agent page no longer exists
    useEffect(() => {
        if (location.pathname.startsWith('/agent/') && agentLinks.length > 0) {
            const agentId = location.pathname.split('/')[2];
            if (!agentLinks.find(link => link.id.toString() === agentId)) {
                navigate('/');
            }
        }
    }, [location.pathname, agentLinks, navigate]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="font-bold text-xl flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">Al-Insan Foundation</span>
                        </Link>
                        {isOffline && (
                            <span className="ml-3 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-inner border border-red-400 animate-pulse flex items-center">
                                <span className="w-2 h-2 bg-red-300 rounded-full mr-1"></span>
                                Offline
                            </span>
                        )}
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-2">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                                    isActive('/') 
                                        ? 'bg-white text-indigo-700 shadow-md' 
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${isActive('/') ? 'text-indigo-700' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Dashboard
                            </Link>
                            <Link
                                to="/register"
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                                    isActive('/register') 
                                        ? 'bg-white text-indigo-700 shadow-md' 
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${isActive('/register') ? 'text-indigo-700' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Register Donor
                            </Link>
                            <Link
                                to="/donors"
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                                    isActive('/donors') 
                                        ? 'bg-white text-indigo-700 shadow-md' 
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${isActive('/donors') ? 'text-indigo-700' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Donor List
                            </Link>

                            {/* Dynamic Agent Tabs - Stable rendering with key by ID */}
                            {agentLinks.length > 0 && (
                                <div className="h-6 w-px bg-white/20 mx-1"></div>
                            )}
                            
                            {agentLinks.map((agent) => (
                                <Link
                                    key={`desktop-${agent.id}`}
                                    to={agent.path}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                                        isActive(agent.path) 
                                            ? 'bg-white text-indigo-700 shadow-md' 
                                            : 'text-white hover:bg-white/10'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${isActive(agent.path) ? 'text-indigo-700' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {agent.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none transition-colors"
                            aria-expanded={isOpen}
                        >
                            <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu - Added transition for smooth opening/closing */}
            <div
                className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100 border-t border-white/20' : 'max-h-0 opacity-0 overflow-hidden'}`}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link
                        to="/"
                        className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                            isActive('/') 
                                ? 'bg-white text-indigo-700 shadow-md' 
                                : 'text-white hover:bg-white/10'
                        }`}
                    >
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isActive('/') ? 'text-indigo-700' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </div>
                    </Link>
                    <Link
                        to="/register"
                        className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                            isActive('/register') 
                                ? 'bg-white text-indigo-700 shadow-md' 
                                : 'text-white hover:bg-white/10'
                        }`}
                    >
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isActive('/register') ? 'text-indigo-700' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Register Donor
                        </div>
                    </Link>
                    <Link
                        to="/donors"
                        className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                            isActive('/donors') 
                                ? 'bg-white text-indigo-700 shadow-md' 
                                : 'text-white hover:bg-white/10'
                        }`}
                    >
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isActive('/donors') ? 'text-indigo-700' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Donor List
                        </div>
                    </Link>

                    {agentLinks.length > 0 && (
                        <div className="h-px bg-white/20 my-2"></div>
                    )}

                    {/* Dynamic Agent Tabs - Mobile version */}
                    {agentLinks.map((agent) => (
                        <Link
                            key={`mobile-${agent.id}`}
                            to={agent.path}
                            className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                                isActive(agent.path) 
                                    ? 'bg-white text-indigo-700 shadow-md' 
                                    : 'text-white hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isActive(agent.path) ? 'text-indigo-700' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {agent.name}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default React.memo(Navbar);