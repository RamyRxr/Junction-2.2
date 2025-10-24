import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import apiService from '../../services/apiService';

const DonationStats = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [donationStats, setDonationStats] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMockData, setIsMockData] = useState(false);

    useEffect(() => {
        fetchDonationStats();
    }, [selectedPeriod]);

    const fetchDonationStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.getDonationStatistics(selectedPeriod);
            setDonationStats(data);

            // If the data has the isMockData flag, set the state accordingly
            if (data && data.isMockData) {
                setIsMockData(true);
            } else {
                setIsMockData(false);
            }
        } catch (err) {
            console.error('Error fetching donation statistics:', err);
            setError('Failed to load statistics');

            // Even in case of error, we should always have data from the apiService fallback
        } finally {
            setIsLoading(false);
        }
    };

    // We no longer need the generateMockData function here since it's now in apiService.js

    const calculateTotals = () => {
        if (!donationStats || donationStats.length === 0) {
            return { sheepTotal: 0, cowTotal: 0, grandTotal: 0 };
        }

        return donationStats.reduce((acc, curr) => ({
            sheepTotal: acc.sheepTotal + (curr.sheepValue || 0),
            cowTotal: acc.cowTotal + (curr.cowValue || 0),
            grandTotal: acc.grandTotal + (curr.total || 0)
        }), { sheepTotal: 0, cowTotal: 0, grandTotal: 0 });
    };

    const { sheepTotal, cowTotal, grandTotal } = calculateTotals();

    // Chart colors to match the dashboard theme
    const COLORS = {
        sheep: '#8B5CF6', // purple-500
        cow: '#10B981',   // emerald-500
        total: '#3B82F6',  // blue-500
        sheep_gradient_start: '#A78BFA', // purple-400
        sheep_gradient_end: '#7C3AED',   // purple-600
        cow_gradient_start: '#34D399',   // emerald-400
        cow_gradient_end: '#059669',     // emerald-600
        total_gradient_start: '#60A5FA', // blue-400
        total_gradient_end: '#2563EB',   // blue-600
    };

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-indigo-200">
            <div className="px-6 py-4 bg-gradient-to-br from-indigo-50 to-violet-50">
                <h3 className="text-lg font-medium text-indigo-900">Donation Statistics</h3>
                <p className="text-sm text-indigo-700">Track donation values over time</p>
            </div>

            {/* Show a note if we're using mock data */}
            {isMockData && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-sm">
                    <p className="text-amber-700">
                        <strong>Note:</strong> Using sample data. Connect to your database for real statistics.
                    </p>
                </div>
            )}

            {/* Time period filters */}
            <div className="px-6 py-3 bg-gradient-to-r from-white to-indigo-50/30 flex flex-wrap gap-2 border-b-2 border-indigo-100">
                <button
                    onClick={() => setSelectedPeriod('week')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedPeriod === 'week'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        }`}
                >
                    Last Week
                </button>
                <button
                    onClick={() => setSelectedPeriod('2weeks')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedPeriod === '2weeks'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        }`}
                >
                    2 Weeks
                </button>
                <button
                    onClick={() => setSelectedPeriod('month')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedPeriod === 'month'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        }`}
                >
                    1 Month
                </button>
                <button
                    onClick={() => setSelectedPeriod('3months')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedPeriod === '3months'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        }`}
                >
                    3 Months
                </button>
                <button
                    onClick={() => setSelectedPeriod('6months')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedPeriod === '6months'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        }`}
                >
                    6 Months
                </button>
                <button
                    onClick={() => setSelectedPeriod('9months')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedPeriod === '9months'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        }`}
                >
                    9 Months
                </button>
                <button
                    onClick={() => setSelectedPeriod('year')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedPeriod === 'year'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        }`}
                >
                    1 Year
                </button>
                <button
                    onClick={() => setSelectedPeriod('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedPeriod === 'all'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        }`}
                >
                    All Time
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : error ? (
                <div className="text-center p-6 text-red-500">{error}</div>
            ) : (
                <div className="p-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 border-2 border-violet-200 shadow-sm">
                            <h4 className="text-sm font-medium text-violet-700 mb-1">Sheep Donations</h4>
                            <p className="text-2xl font-bold text-violet-800">{sheepTotal.toLocaleString()} DA</p>
                            <div className="mt-2 h-1 w-full bg-violet-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-violet-400 to-violet-600 rounded-full"
                                    style={{ width: `${(sheepTotal / grandTotal) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border-2 border-emerald-200 shadow-sm">
                            <h4 className="text-sm font-medium text-emerald-700 mb-1">Cow Donations</h4>
                            <p className="text-2xl font-bold text-emerald-800">{cowTotal.toLocaleString()} DA</p>
                            <div className="mt-2 h-1 w-full bg-emerald-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                                    style={{ width: `${(cowTotal / grandTotal) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200 shadow-sm">
                            <h4 className="text-sm font-medium text-blue-700 mb-1">Total Value</h4>
                            <p className="text-2xl font-bold text-blue-800">{grandTotal.toLocaleString()} DA</p>
                            <div className="mt-2 h-1 w-full bg-blue-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                                    style={{ width: '100%' }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Area Chart */}
                        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
                            <h4 className="text-base font-medium text-gray-700 mb-4">Donation Trends</h4>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={donationStats}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorSheep" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.sheep_gradient_start} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={COLORS.sheep_gradient_end} stopOpacity={0.2} />
                                            </linearGradient>
                                            <linearGradient id="colorCow" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.cow_gradient_start} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={COLORS.cow_gradient_end} stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                                        <YAxis tickFormatter={(value) => `${value / 1000}K`} tick={{ fill: '#6B7280' }} />
                                        <Tooltip
                                            formatter={(value) => [`${value.toLocaleString()} DA`, undefined]}
                                            labelFormatter={(label) => `Date: ${label}`}
                                            contentStyle={{ borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="sheepValue"
                                            name="Sheep"
                                            stroke={COLORS.sheep}
                                            fillOpacity={1}
                                            fill="url(#colorSheep)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="cowValue"
                                            name="Cow"
                                            stroke={COLORS.cow}
                                            fillOpacity={1}
                                            fill="url(#colorCow)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
                            <h4 className="text-base font-medium text-gray-700 mb-4">Donation Distribution</h4>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={donationStats}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                                        <YAxis tickFormatter={(value) => `${value / 1000}K`} tick={{ fill: '#6B7280' }} />
                                        <Tooltip
                                            formatter={(value) => [`${value.toLocaleString()} DA`, undefined]}
                                            labelFormatter={(label) => `Date: ${label}`}
                                            contentStyle={{ borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="sheepValue" name="Sheep" fill={COLORS.sheep} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="cowValue" name="Cow" fill={COLORS.cow} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
                            <h4 className="text-base font-medium text-gray-700 mb-4">Donation Type Distribution</h4>
                            <div className="h-72 flex justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Sheep', value: sheepTotal },
                                                { name: 'Cow', value: cowTotal }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            <Cell fill={COLORS.sheep_gradient_start} />
                                            <Cell fill={COLORS.cow_gradient_start} />
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value.toLocaleString()} DA`, undefined]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Line Chart */}
                        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
                            <h4 className="text-base font-medium text-gray-700 mb-4">Total Donation Growth</h4>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={donationStats}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                                        <YAxis tickFormatter={(value) => `${value / 1000}K`} tick={{ fill: '#6B7280' }} />
                                        <Tooltip
                                            formatter={(value) => [`${value.toLocaleString()} DA`, undefined]}
                                            labelFormatter={(label) => `Date: ${label}`}
                                            contentStyle={{ borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#3B82F6"
                                            name="Total Value"
                                            strokeWidth={2}
                                            dot={{ fill: '#3B82F6', r: 4 }}
                                            activeDot={{ r: 6, fill: '#3B82F6', stroke: 'white', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonationStats;