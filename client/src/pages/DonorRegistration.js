import React from 'react';
import DonorForm from '../components/donors/DonorForm';

const DonorRegistration = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Register New Donor</h1>
            <p className="text-gray-600 mb-8">
                Fill out the form below to register a new donor for the Eid al-Adha sacrifice campaign.
            </p>

            <DonorForm />
        </div>
    );
};

export default DonorRegistration;
