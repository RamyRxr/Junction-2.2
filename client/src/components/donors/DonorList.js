import React, { useState } from 'react';
import { useDonors } from '../../contexts/DonorContext';
import DonorCard from './DonorCard';
import SplitModal from './SplitModal';

const DonorList = () => {
    const { donors } = useDonors();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showSplitModal, setShowSplitModal] = useState(false);

    // Count donors by status
    const pendingCount = donors.filter(d => d.status === 'pending').length;
    const processingCount = donors.filter(d => d.status === 'sending').length;
    const completedCount = donors.filter(d => d.status === 'done').length;

    // Count pending sheep and cow donors
    const pendingSheepCount = donors.filter(d => d.status === 'pending' && d.type === 'sheep').length;
    const pendingCowCount = donors.filter(d => d.status === 'pending' && d.type === 'cow').length;

    // Count cow shares (7 donors = 1 cow)
    const cowGroups = Math.floor(pendingCowCount / 7);
    const remainingCowShares = pendingCowCount % 7;

    // Filter donors based on search term and filters
    const filteredDonors = donors.filter(donor => {
        const matchesSearch =
            searchTerm === '' ||
            donor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donor.whatsappNumber.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || donor.status === statusFilter;
        const matchesType = typeFilter === 'all' || donor.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <div>
            {/* Enhanced Header with Gradient */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl shadow-sm border border-indigo-100">
                <h1 className="text-2xl font-bold text-indigo-800">Donor Management</h1>

                <div className="mt-4 md:mt-0">
                    <button
                        className={`px-4 py-2 rounded-lg shadow-md font-medium transition-all duration-200 ${pendingCount === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                            }`}
                        onClick={() => setShowSplitModal(true)}
                        disabled={pendingCount === 0}
                    >
                        Split Donors Between Agents
                    </button>
                </div>
            </div>

            {/* Enhanced Stats Cards with Gradients */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg shadow-sm p-4 border-l-4 border-yellow-400 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-medium text-yellow-800">Pending</h3>
                            <p className="text-3xl font-bold text-yellow-900">{pendingCount}</p>
                        </div>
                        <div className="bg-yellow-200 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-sm p-4 border-l-4 border-blue-400 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-medium text-blue-800">Processing</h3>
                            <p className="text-3xl font-bold text-blue-900">{processingCount}</p>
                        </div>
                        <div className="bg-blue-200 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3m0 0l3 3m-3-3v12m6-6l3 3-3 3" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm p-4 border-l-4 border-green-400 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-medium text-green-800">Completed</h3>
                            <p className="text-3xl font-bold text-green-900">{completedCount}</p>
                        </div>
                        <div className="bg-green-200 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg shadow-sm p-4 border-l-4 border-purple-400 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-medium text-purple-800">Cow Groups</h3>
                            <p className="text-3xl font-bold text-purple-900">{cowGroups} <span className="text-sm font-normal">+ {remainingCowShares}/7 shares</span></p>
                        </div>
                        <div className="bg-purple-200 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Search and Filters with Amazing Styling */}
            <div className="bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-50 p-6 rounded-xl shadow-lg mb-6 border-2 border-indigo-200 border-opacity-50 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-full opacity-20 -ml-12 -mb-12"></div>

                <h3 className="text-lg font-medium text-indigo-800 mb-3 border-b border-indigo-200 pb-2">Search & Filter Donors</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-indigo-700 mb-2">Search Donors</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border-2 border-indigo-200 bg-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200 hover:border-indigo-300"
                                placeholder="Search by name or number..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-indigo-700 mb-2">Status Filter</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="py-2 px-4 w-full border-2 border-indigo-200 bg-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200 hover:border-indigo-300"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="sending">Processing</option>
                            <option value="done">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-indigo-700 mb-2">Type Filter</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="py-2 px-4 w-full border-2 border-indigo-200 bg-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200 hover:border-indigo-300"
                        >
                            <option value="all">All Types</option>
                            <option value="sheep">Sheep</option>
                            <option value="cow">Cow (1/7 share)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Donor list with enhanced empty state */}
            <div>
                {filteredDonors.length > 0 ? (
                    <div className="space-y-4">
                        {filteredDonors.map(donor => (
                            <DonorCard
                                key={donor.id}
                                donor={donor}
                                onClick={() => { }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl shadow-sm border border-slate-200">
                        <svg className="mx-auto h-12 w-12 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-slate-700">No donors found</h3>
                        <p className="mt-1 text-slate-500">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>

            {/* Split Modal */}
            {showSplitModal && (
                <SplitModal
                    onClose={() => setShowSplitModal(false)}
                    pendingSheep={pendingSheepCount}
                    pendingCowShares={pendingCowCount}
                    cowGroups={cowGroups}
                />
            )}
        </div>
    );
};

export default DonorList;
