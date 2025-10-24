import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDonors } from '../contexts/DonorContext';
import { useOffline } from '../contexts/OfflineContext';
import DonorCard from '../components/donors/DonorCard';
import MediaUploader from '../components/media/MediaUploader';
import { supabase } from '../supabase';

const AgentDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getDonorsByAgent, markDonorAsDone, agentAssignments, loading, checkEmptyAgents } = useDonors();
    const { isOffline, queueMediaUpload } = useOffline();  // Added queueMediaUpload

    const [selectedDonor, setSelectedDonor] = useState(null);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [donorsData, setDonorsData] = useState({ sheepDonors: [], cowDonors: [] });
    const [isLoadingDonors, setIsLoadingDonors] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Get agent details
    const agent = agentAssignments?.find(a => a.id === id) ||
        { name: 'Unknown Agent', agent_name: 'Unknown Agent', donors: [], cowGroups: [] };

    // Filter out completed donors for display
    const filterIncompleteDonors = useCallback((donorsData) => {
        if (!donorsData) return { sheepDonors: [], cowDonors: [] };

        return {
            sheepDonors: donorsData.sheepDonors.filter(donor => donor.status !== 'done'),
            cowDonors: donorsData.cowDonors.filter(donor => donor.status !== 'done')
        };
    }, []);

    // Load donors for this agent
    const loadDonorsData = useCallback(async () => {
        if (!id) return;

        setIsLoadingDonors(true);
        try {
            const data = await getDonorsByAgent(id);
            setDonorsData(data || { sheepDonors: [], cowDonors: [] });

            // Check if there are any remaining donors after filtering completed ones
            const filteredData = filterIncompleteDonors(data);
            if (
                filteredData.sheepDonors.length === 0 &&
                filteredData.cowDonors.length === 0 &&
                data.sheepDonors.length > 0 || data.cowDonors.length > 0
            ) {
                // This agent has only completed donors - check if we should remove the tab
                await checkEmptyAgents();
                // If we're still on this page but agent tab should be gone, redirect to dashboard
                if (!agentAssignments.find(a => a.id === id)) {
                    navigate('/');
                }
            }
        } catch (error) {
            console.error("Error loading agent donors:", error);
        } finally {
            setIsLoadingDonors(false);
        }
    }, [id, getDonorsByAgent, filterIncompleteDonors, checkEmptyAgents, agentAssignments, navigate]);

    // Load donors when agent changes
    useEffect(() => {
        loadDonorsData();
    }, [loadDonorsData]);

    // Handle donor selection
    const handleDonorSelect = (donor) => {
        // Clear previous selections when selecting a new donor
        setSelectedDonor(donor);
        setUploadedImages([]);
        setUploadedVideo(null);
        setSubmitSuccess(false);
    };

    // Handle image upload with compression
    const handleImageUpload = (files) => {
        // Handle null case
        if (!files) {
            setUploadedImages([]);
            return;
        }

        // If passed a single file (not in an array), convert to array
        const fileArray = Array.isArray(files) ? files : [files];

        // Check if files are already formatted with preview
        const imageFiles = fileArray.map(item => {
            // If already has a preview property, it's already formatted
            if (item && item.preview) {
                return item;
            }
            // Otherwise create a preview from the file
            return {
                file: item,
                preview: URL.createObjectURL(item)
            };
        });

        setUploadedImages(imageFiles);
    };

    // Handle video upload with compression
    const handleVideoUpload = (file) => {
        // Handle both single file and array format
        const videoFile = Array.isArray(file) ? file[0] : file;

        if (videoFile) {
            setUploadedVideo({
                file: videoFile,
                preview: URL.createObjectURL(videoFile)
            });
        }
    };

    // Handle print name for recording
    const handlePrintName = () => {
        if (!selectedDonor) return;

        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=600,height=600');

        // Create the content for the print window
        const donorType = selectedDonor.type === 'sheep' ? 'Sheep' : 'Cow (1/7 share)';
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Donor Information</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        text-align: center;
                    }
                    .donor-card {
                        border: 2px solid #000;
                        padding: 20px;
                        margin: 20px auto;
                        max-width: 400px;
                    }
                    .donor-name {
                        font-size: 32px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .donor-type {
                        font-size: 24px;
                        margin-bottom: 15px;
                    }
                    .donor-info {
                        font-size: 18px;
                        margin-bottom: 5px;
                        text-align: left;
                    }
                    .print-btn {
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        font-size: 16px;
                        cursor: pointer;
                        margin-top: 20px;
                    }
                    @media print {
                        .print-btn {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="donor-card">
                    <div class="donor-name">${selectedDonor.firstName} ${selectedDonor.lastName}</div>
                    <div class="donor-type">${donorType}</div>
                    <div class="donor-info"><strong>Donation ID:</strong> ${selectedDonor.id}</div>
                    <div class="donor-info"><strong>WhatsApp:</strong> ${selectedDonor.whatsappNumber || 'N/A'}</div>
                    <div class="donor-info"><strong>Price:</strong> ${selectedDonor.price?.toLocaleString() || '0'} DA</div>
                    ${selectedDonor.type === 'cow' ?
                `<div class="donor-info"><strong>Cow Group:</strong> ${selectedDonor.cowGroupId || 'N/A'}</div>` : ''}
                </div>
                <button class="print-btn" onclick="window.print(); window.close();">Print</button>
            </body>
            </html>
        `;

        // Write the content to the new window
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Auto print once loaded (optional)
        printWindow.onload = function () {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 250);
        };
    };

    // Handle mark as done
    const handleMarkDone = async () => {
        if (!selectedDonor) return;
        setIsSubmitting(true);

        try {
            // Handle media uploads with offline support
            let mediaUrls = { images: [], video: null };
            const donorPhone = selectedDonor.whatsappNumber || selectedDonor.telegram_number;

            if (isOffline) {
                console.log("Offline mode: Storing media for later upload and Telegram sending");
                // Queue media for upload later when online
                // Prepare donor info except price
                const { price, ...donorInfo } = selectedDonor;
                if (uploadedImages.length > 0) {
                    const imagePromises = uploadedImages.map(img => queueMediaUpload(selectedDonor.id, {
                        type: 'image',
                        file: img.file,
                        donorInfo
                    }));
                    await Promise.all(imagePromises);
                }
                if (uploadedVideo) {
                    await queueMediaUpload(selectedDonor.id, {
                        type: 'video',
                        file: uploadedVideo.file,
                        donorInfo
                    });
                }

                // Queue a Telegram notification for when we're back online
                if (window.localStorage) {
                    const telegramQueue = JSON.parse(localStorage.getItem('telegramQueue') || '[]');
                    telegramQueue.push({
                        donorId: selectedDonor.id,
                        donorName: `${selectedDonor.firstName} ${selectedDonor.lastName}`,
                        telegramNumber: donorPhone,
                        timestamp: new Date().toISOString(),
                        mediaCount: uploadedImages.length + (uploadedVideo ? 1 : 0),
                        donationType: selectedDonor.type
                    });
                    localStorage.setItem('telegramQueue', JSON.stringify(telegramQueue));
                }
            } else {
                console.log("Online mode: Uploading media directly");
                // Direct upload to Supabase
                if (uploadedImages.length > 0) {
                    const imagePromises = uploadedImages.map(async (img) => {
                        // Make sure we have a valid file and donor ID
                        if (!img.file || !selectedDonor || !selectedDonor.id) {
                            console.error("Missing file or donor ID for upload");
                            return null;
                        }

                        const fileName = `${selectedDonor.id}_image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        const { data, error } = await supabase.storage
                            .from('media')
                            .upload(`images/${fileName}`, img.file, {
                                contentType: img.file.type,
                                upsert: true
                            });

                        if (error) {
                            console.error("Error uploading image:", error);
                            return null;
                        }

                        const { data: urlData } = supabase.storage
                            .from('media')
                            .getPublicUrl(`images/${fileName}`);

                        // If donor has a Telegram number, try to send the image
                        if (donorPhone) {
                            try {
                                // This would be your actual API call to your backend that handles Telegram messages
                                // We'll mock this for now since it needs a proper backend implementation
                                console.log(`Would send image to ${donorPhone} via Telegram: ${urlData.publicUrl}`);

                                // Example API call (commented out since backend doesn't exist yet)
                                /*
                                await fetch('/api/telegram/sendMedia', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        phoneNumber: donorPhone,
                                        mediaUrl: urlData.publicUrl,
                                        type: 'image',
                                        caption: `Sacrifice image for ${selectedDonor.firstName} ${selectedDonor.lastName}`
                                    }),
                                });
                                */
                            } catch (telegramError) {
                                console.error("Failed to send to Telegram:", telegramError);
                            }
                        }

                        return urlData.publicUrl;
                    });

                    mediaUrls.images = (await Promise.all(imagePromises)).filter(url => url);
                }

                if (uploadedVideo) {
                    const fileName = `${selectedDonor.id}_video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    const { data, error } = await supabase.storage
                        .from('media')
                        .upload(`videos/${fileName}`, uploadedVideo.file);

                    if (!error) {
                        const { data: urlData } = supabase.storage
                            .from('media')
                            .getPublicUrl(`videos/${fileName}`);

                        mediaUrls.video = urlData.publicUrl;

                        // If donor has a Telegram number, try to send the video
                        if (donorPhone) {
                            try {
                                console.log(`Would send video to ${donorPhone} via Telegram: ${urlData.publicUrl}`);

                                // Example API call (commented out since backend doesn't exist yet)
                                /*
                                await fetch('/api/telegram/sendMedia', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        phoneNumber: donorPhone,
                                        mediaUrl: urlData.publicUrl,
                                        type: 'video',
                                        caption: `Sacrifice video for ${selectedDonor.firstName} ${selectedDonor.lastName}`
                                    }),
                                });
                                */
                            } catch (telegramError) {
                                console.error("Failed to send to Telegram:", telegramError);
                            }
                        }
                    } else {
                        console.error("Error uploading video:", error);
                    }
                }
            }

            // Mark donor as done with or without the media URLs
            await markDonorAsDone(selectedDonor.id, mediaUrls);

            // Show success message and clear form
            setSubmitSuccess(true);

        } catch (error) {
            console.error('Error marking donor as done:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canMarkDone = uploadedImages.length > 0 && uploadedVideo !== null && !isSubmitting;

    // Extract incomplete donors for display
    const incompleteDonors = filterIncompleteDonors(donorsData);
    const noIncompleteSheep = incompleteDonors.sheepDonors.length === 0;
    const noIncompleteCows = incompleteDonors.cowDonors.length === 0;
    const allDonorsCompleted = noIncompleteSheep && noIncompleteCows;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donor List Column */}
            <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl border-2 border-indigo-200 shadow-md p-6 hover:shadow-lg transition-all duration-200">
                    <h2 className="text-lg font-medium mb-4 text-indigo-800 border-b-2 border-indigo-100 pb-2">
                        {agent.name || agent.agent_name}'s Workspace
                    </h2>

                    {isLoadingDonors || loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : allDonorsCompleted ? (
                        <div className="text-center py-6">
                            <div className="bg-green-100 p-4 rounded-full w-24 h-24 mx-auto mb-3 flex items-center justify-center shadow-inner border-2 border-green-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-700 mb-1">All Tasks Completed!</h3>
                            <p className="text-gray-500 text-sm">Great job! All sacrifices have been processed.</p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h3 className="font-medium text-indigo-700 mb-2 border-l-4 border-indigo-400 pl-2">Sheep Donors</h3>
                                {incompleteDonors.sheepDonors.length > 0 ? (
                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 pb-1">
                                        {incompleteDonors.sheepDonors.map(donor => (
                                            <div
                                                key={donor.id}
                                                className={`border-2 ${selectedDonor?.id === donor.id
                                                    ? 'border-sky-400 bg-gradient-to-r from-sky-50 to-sky-100'
                                                    : 'border-gray-200 bg-white hover:border-sky-200 hover:bg-sky-50'} 
                                                    rounded-lg p-3 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md`}
                                                onClick={() => handleDonorSelect(donor)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium">{donor.firstName} {donor.lastName}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs border border-sky-200 whitespace-nowrap">
                                                                Sheep
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${donor.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
                                                        : donor.status === 'sending'
                                                            ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-200'
                                                            : 'bg-green-100 text-green-800 border-2 border-green-200'
                                                        }`}>
                                                        {donor.status}
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-sm">
                                                    <p className="text-gray-600">Price: <span className="font-medium">{donor.price.toLocaleString()} DA</span></p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : donorsData.sheepDonors.length > 0 ? (
                                    <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg border-2 border-green-200">All sheep sacrifices completed ✓</p>
                                ) : (
                                    <p className="text-gray-500 text-sm bg-gray-50 px-3 py-2 rounded-lg border-2 border-gray-200">No sheep donors assigned</p>
                                )}
                            </div>

                            <div>
                                <h3 className="font-medium text-purple-700 mb-2 border-l-4 border-purple-400 pl-2">Cow Groups</h3>
                                {incompleteDonors.cowDonors.length > 0 ? (
                                    // Group cow donors by cowGroupId
                                    (() => {
                                        const groups = {};
                                        incompleteDonors.cowDonors.forEach(donor => {
                                            const groupId = donor.cowGroupId;
                                            if (!groups[groupId]) groups[groupId] = [];
                                            groups[groupId].push(donor);
                                        });

                                        return Object.entries(groups).map(([groupId, donors]) => (
                                            <div key={groupId} className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 rounded-lg p-3 mb-3 shadow-sm">
                                                <h4 className="font-medium text-sm mb-2 text-purple-800 border-b border-purple-100 pb-1">Cow Group {groupId}</h4>
                                                <div className="space-y-2">
                                                    {donors.map(donor => (
                                                        <div
                                                            key={donor.id}
                                                            className={`border-2 ${selectedDonor?.id === donor.id
                                                                ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-purple-100'
                                                                : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50'} 
                                                                rounded-lg p-3 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md`}
                                                            onClick={() => handleDonorSelect(donor)}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-medium">{donor.firstName} {donor.lastName}</h4>
                                                                    <p className="text-sm text-gray-500">
                                                                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs border border-purple-200 whitespace-nowrap">
                                                                            Cow (1/7 share)
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${donor.status === 'pending'
                                                                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
                                                                    : donor.status === 'sending'
                                                                        ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-200'
                                                                        : 'bg-green-100 text-green-800 border-2 border-green-200'
                                                                    }`}>
                                                                    {donor.status}
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 text-sm">
                                                                <p className="text-gray-600">Price: <span className="font-medium">{donor.price.toLocaleString()} DA</span></p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ));
                                    })()
                                ) : donorsData.cowDonors.length > 0 ? (
                                    <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg border-2 border-green-200">All cow sacrifices completed ✓</p>
                                ) : (
                                    <p className="text-gray-500 text-sm bg-gray-50 px-3 py-2 rounded-lg border-2 border-gray-200">No cow groups assigned</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Media Upload Column */}
            <div className="lg:col-span-2">
                {selectedDonor ? (
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 shadow-md p-6 hover:shadow-lg transition-all duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-medium text-gray-800">{selectedDonor.firstName} {selectedDonor.lastName}</h2>
                                <p className="text-gray-500">
                                    {selectedDonor.type === 'sheep' ? (
                                        <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs border border-sky-200">
                                            Sheep
                                        </span>
                                    ) : (
                                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs border border-purple-200">
                                            Cow (1/7 share)
                                        </span>
                                    )}
                                </p>
                                <p className="text-gray-500 mt-1">
                                    Status: {selectedDonor.status === 'done' ? (
                                        <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-sm border border-green-200">Completed</span>
                                    ) : selectedDonor.status === 'sending' ? (
                                        <span className="font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-sm border border-amber-200">Processing</span>
                                    ) : (
                                        <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-sm border border-blue-200">Pending</span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={handlePrintName}
                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                disabled={selectedDonor.status === 'done'}
                            >
                                Print Name for Video
                            </button>
                        </div>

                        {selectedDonor.status === 'done' ? (
                            <div className="text-center py-8">
                                <div className="bg-green-100 p-6 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center shadow-inner border-2 border-green-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-green-600">Sacrifice Completed</h3>
                                <p className="text-gray-500 mt-2">This sacrifice has been recorded and the media has been uploaded.</p>
                            </div>
                        ) : submitSuccess ? (
                            <div className="text-center py-8">
                                <div className="bg-green-100 p-6 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center shadow-inner border-2 border-green-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-green-600">Successfully Submitted!</h3>
                                <p className="text-gray-500 mt-2">The sacrifice has been marked as complete.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg border-2 border-blue-200 p-4 shadow-sm">
                                        <h3 className="font-medium text-blue-700 mb-2 border-b border-blue-100 pb-1">Upload Images</h3>
                                        <MediaUploader
                                            type="image"
                                            multiple={true}
                                            onUpload={handleImageUpload}
                                            uploadedFiles={uploadedImages}
                                            setUploadedFiles={setUploadedImages}
                                            disabled={isSubmitting}
                                        />
                                        {uploadedImages.length > 0 && (
                                            <p className="text-xs text-green-500 mt-1 bg-green-50 px-2 py-1 rounded border border-green-200 inline-block">
                                                Images will be compressed automatically
                                            </p>
                                        )}
                                    </div>

                                    <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg border-2 border-emerald-200 p-4 shadow-sm">
                                        <h3 className="font-medium text-emerald-700 mb-2 border-b border-emerald-100 pb-1">Upload Video</h3>
                                        <MediaUploader
                                            type="video"
                                            multiple={false}
                                            onUpload={handleVideoUpload}
                                            uploadedFiles={uploadedVideo ? [uploadedVideo] : []}
                                            setUploadedFiles={(files) => setUploadedVideo(files[0] || null)}
                                            disabled={isSubmitting}
                                        />
                                        {uploadedVideo && (
                                            <p className="text-xs text-green-500 mt-1 bg-green-50 px-2 py-1 rounded border border-green-200 inline-block">
                                                Video will be compressed automatically
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t-2 border-gray-200 pt-6">
                                    <button
                                        onClick={handleMarkDone}
                                        disabled={!canMarkDone}
                                        className={`w-full py-3 px-6 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 ${isSubmitting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : canMarkDone
                                                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                                                : 'bg-gradient-to-r from-gray-400 to-gray-500 opacity-70 cursor-not-allowed'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : isOffline ? 'Mark as Done (Will Sync Later)' : 'Mark as Done & Send Confirmation'}
                                    </button>
                                    {!canMarkDone && !isSubmitting && (
                                        <p className="text-sm text-center mt-2 text-gray-500 bg-gray-50 py-1 px-3 rounded-lg border border-gray-200">
                                            Please upload both images and video to continue
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 shadow-md p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
                        <div className="bg-gray-100 p-6 rounded-full w-32 h-32 flex items-center justify-center shadow-inner border-2 border-gray-200 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-500 mb-2">No Donor Selected</h3>
                        <p className="text-gray-400 text-center max-w-md bg-gray-50 py-2 px-4 rounded-lg border border-gray-200">
                            Select a donor from the list to upload images and video of their sacrifice.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentDashboard;