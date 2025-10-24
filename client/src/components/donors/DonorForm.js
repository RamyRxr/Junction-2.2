import React, { useState } from 'react';
import { useDonors } from '../../contexts/DonorContext';

const DonorForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        whatsappNumber: '',
        price: '',
        type: 'sheep' // Default to sheep
    });

    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addDonor } = useDonors();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) return "First name is required";
        if (!formData.lastName.trim()) return "Last name is required";
        if (!formData.whatsappNumber.trim()) return "WhatsApp number is required";
        if (!/^\+?\d{10,15}$/.test(formData.whatsappNumber.replace(/\s/g, ''))) {
            return "Please enter a valid WhatsApp number";
        }
        if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
            return "Please enter a valid price";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        const error = validateForm();
        if (error) {
            setFormError(error);
            return;
        }

        setIsSubmitting(true);
        try {
            const newDonor = await addDonor({
                ...formData,
                price: Number(formData.price)
            });

            setFormSuccess(`Donor ${formData.firstName} ${formData.lastName} registered successfully!`);
            setFormData({
                firstName: '',
                lastName: '',
                whatsappNumber: '',
                price: '',
                type: 'sheep'
            });
        } catch (error) {
            setFormError(`Failed to register donor: ${error.message}`);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl border-2 border-indigo-200 shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 border-b-2 border-indigo-100 pb-4">Register New Donor</h2>

                {formError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-8 flex items-start">
                        <div className="flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="ml-3 text-red-700 text-sm font-medium">{formError}</p>
                    </div>
                )}

                {formSuccess && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-8 flex items-start">
                        <div className="flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="ml-3 text-green-700 text-sm font-medium">{formSuccess}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">
                                First Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all"
                                    placeholder="Enter first name"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">
                                Last Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all"
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">
                                WhatsApp Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    id="whatsappNumber"
                                    name="whatsappNumber"
                                    value={formData.whatsappNumber}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all"
                                    placeholder="+213 XXXXXXXXX"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">
                                Donation Amount
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all"
                                    placeholder="Enter amount"
                                    min="0"
                                    step="0.01"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 font-medium">DA</span>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 bg-gradient-to-r from-white to-gray-50 p-6 rounded-lg border-2 border-gray-200 shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Sacrifice Type
                            </label>
                            <div className="flex flex-wrap gap-4">
                                <label className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer ${formData.type === 'sheep' 
                                    ? 'bg-gradient-to-r from-sky-50 to-sky-100 border-sky-300 shadow-md' 
                                    : 'border-gray-200 bg-white hover:bg-sky-50 hover:border-sky-200'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="sheep"
                                        checked={formData.type === 'sheep'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <span className={`h-5 w-5 rounded-full flex items-center justify-center border-2 mr-3 ${formData.type === 'sheep' 
                                        ? 'border-sky-500 bg-sky-100' 
                                        : 'border-gray-300'}`}>
                                        {formData.type === 'sheep' && <span className="h-2.5 w-2.5 bg-sky-600 rounded-full"></span>}
                                    </span>
                                    <div>
                                        <span className="font-medium text-gray-800">Sheep</span>
                                        <p className="text-xs text-gray-500 mt-1">Full sheep sacrifice</p>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer ${formData.type === 'cow' 
                                    ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-300 shadow-md' 
                                    : 'border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-200'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="cow"
                                        checked={formData.type === 'cow'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <span className={`h-5 w-5 rounded-full flex items-center justify-center border-2 mr-3 ${formData.type === 'cow' 
                                        ? 'border-purple-500 bg-purple-100' 
                                        : 'border-gray-300'}`}>
                                        {formData.type === 'cow' && <span className="h-2.5 w-2.5 bg-purple-600 rounded-full"></span>}
                                    </span>
                                    <div>
                                        <span className="font-medium text-gray-800">Cow (1/7 share)</span>
                                        <p className="text-xs text-gray-500 mt-1">One share in a cow sacrifice</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10">
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Register Donor
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DonorForm;