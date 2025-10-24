import React from 'react';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    sending: 'bg-blue-100 text-blue-800 border-blue-300',
    done: 'bg-green-100 text-green-800 border-green-300'
};

const typeStyles = {
    sheep: 'from-blue-50 to-sky-50 border-blue-200',
    cow: 'from-purple-50 to-fuchsia-50 border-purple-200'
};

const DonorCard = ({ donor, onClick, showStatus = true, isSelected = false }) => {
    const statusColor = statusColors[donor.status] || 'bg-gray-100 text-gray-800 border-gray-200';
    const typeStyle = typeStyles[donor.type] || 'from-gray-50 to-slate-50 border-gray-200';

    return (
        <div
            className={`bg-gradient-to-r ${typeStyle} rounded-lg mb-3 transition-all duration-200 border-2 
                ${isSelected
                    ? 'border-green-500 shadow-md'
                    : `hover:shadow-md hover:border-opacity-80 ${donor.status === 'pending'
                        ? 'border-yellow-300'
                        : donor.status === 'sending'
                            ? 'border-blue-300'
                            : 'border-green-300'}`}`}
            onClick={onClick}
        >
            <div className="p-4 flex justify-between items-center">
                <div className="flex-1">
                    <h3 className="font-medium text-lg">{donor.firstName} {donor.lastName}</h3>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                        <p>WhatsApp: {donor.whatsappNumber}</p>
                        <p>Donation: <span className="font-medium">{donor.price.toLocaleString()} DA</span></p>
                        <p>Type: {donor.type === 'sheep'
                            ? <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs border border-blue-200">Sheep</span>
                            : <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs border border-purple-200">Cow (1/7 share)</span>}
                        </p>
                    </div>
                </div>

                {showStatus && (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                        {donor.status === 'pending' && 'Pending'}
                        {donor.status === 'sending' && 'Processing'}
                        {donor.status === 'done' && 'Completed'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonorCard;
