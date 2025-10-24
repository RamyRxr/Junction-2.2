import React from 'react';

const StatCard = ({ title, value, icon, color, badges }) => {
    const bgColor = `bg-${color}-100`;
    const textColor = `text-${color}-600`;
    const iconBgColor = `bg-${color}-50`;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <h3 className="text-3xl font-bold">{value}</h3>
                </div>
                <div className={`${iconBgColor} p-2 rounded-full`}>
                    {icon}
                </div>
            </div>

            {badges && badges.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {badges.map((badge, index) => (
                        <div
                            key={index}
                            className={`${badge.bgColor} px-2 py-1 rounded-full text-xs font-medium ${badge.textColor}`}
                        >
                            {badge.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StatCard;
