import React, { useRef, useState } from 'react';
import { useOffline } from '../../contexts/OfflineContext';

const MediaUploader = ({ type, multiple, onUpload, uploadedFiles, setUploadedFiles, disabled }) => {
    const { isOffline } = useOffline();
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e) => {
        if (disabled) return;
        
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        processFiles(files);
    };

    const processFiles = (fileList) => {
        // Convert FileList to array
        const filesArray = Array.from(fileList);
        
        // Filter files based on type
        const validFiles = filesArray.filter(file => {
            const isValid = type === 'image' 
                ? file.type.startsWith('image/')
                : file.type.startsWith('video/');
                
            if (!isValid) {
                console.warn(`Rejected file: ${file.name} (${file.type}) - not a valid ${type}`);
            }
            
            return isValid;
        });
        
        if (validFiles.length === 0) return;
        
        // If not multiple, just use the first file
        if (!multiple && validFiles.length > 0) {
            const file = validFiles[0];
            const fileWithPreview = {
                file,
                preview: URL.createObjectURL(file)
            };
            
            setUploadedFiles([fileWithPreview]);
            onUpload(file); // This line now sends just the file
        } 
        
        // If multiple, add all files
        else if (multiple) {
            const filesWithPreviews = validFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            
            setUploadedFiles(prev => [...prev, ...filesWithPreviews]);
            onUpload(filesWithPreviews);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const removeFile = (index) => {
        if (disabled) return;
        
        const newFiles = [...uploadedFiles];
        
        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(newFiles[index].preview);
        
        newFiles.splice(index, 1);
        setUploadedFiles(newFiles);
        
        // Safely reset file input if it exists
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        
        if (type === 'video') {
            onUpload(null);
        } else {
            onUpload(newFiles);
        }
    };

    const openFileDialog = () => {
        if (disabled) return;
        
        // Add null check before accessing fileInputRef.current
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
    // For videos, show a thumbnail or preview
    const renderVideoPreview = (file) => {
        return (
            <div className="relative">
                <video 
                    src={file.preview} 
                    className="h-32 w-full object-cover rounded-lg shadow-sm" 
                    controls
                />
                <button
                    onClick={() => removeFile(0)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                    disabled={disabled}
                >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* File Drop Zone */}
            <div 
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                    dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : disabled 
                            ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onClick={openFileDialog}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={type === 'image' ? 'image/*' : 'video/*'}
                    multiple={multiple}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                />
                <div className="flex flex-col items-center">
                    <svg 
                        className={`h-10 w-10 ${disabled ? 'text-gray-400' : 'text-blue-500'}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        {type === 'image' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        )}
                    </svg>
                    <p className={`mt-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                        {type === 'image' 
                            ? `Drop images here or click to ${multiple ? 'select files' : 'select a file'}`
                            : 'Drop video here or click to select'
                        }
                    </p>
                    <span className={`text-xs mt-1 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
                        {type === 'image' ? 'JPG, PNG, GIF' : 'MP4, MOV, WebM'} {isOffline && '(Will sync when online)'}
                    </span>
                </div>
            </div>

            {/* Preview Area */}
            {uploadedFiles && uploadedFiles.length > 0 && (
                <div className={`${type === 'image' && multiple ? 'grid grid-cols-2 gap-2' : ''}`}>
                    {type === 'video' ? (
                        // Single video preview
                        renderVideoPreview(uploadedFiles[0])
                    ) : (
                        // Multiple image previews
                        uploadedFiles.map((file, index) => (
                            <div key={index} className="relative">
                                <img 
                                    src={file.preview} 
                                    alt={`Preview ${index}`} 
                                    className="h-32 w-full object-cover rounded-lg shadow-sm" 
                                />
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                                    disabled={disabled}
                                >
                                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MediaUploader;
