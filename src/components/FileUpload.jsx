import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, actionTypes } from '../contexts/AppContext';
import { apiService, handleApiError } from '../services/api';
import {
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
} from '../utils/constants';

const FileUpload = () => {
    const { dispatch } = useApp();
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    // Validate file before upload
    const validateFile = (file) => {
        if (!file) {
            throw new Error('No file selected');
        }

        if (file.size > MAX_FILE_SIZE) {
            throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
        }

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
        }

        return true;
    };

    // Handle file upload
    const handleFileUpload = useCallback(async (file) => {
        try {
            validateFile(file);
            setIsUploading(true);
            setUploadProgress(0);
            dispatch({ type: actionTypes.CLEAR_ERROR });
            dispatch({ type: actionTypes.SET_LOADING, payload: true });

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + Math.random() * 20;
                });
            }, 200);

            // Upload file to backend
            const response = await apiService.uploadPDF(file);

            clearInterval(progressInterval);
            setUploadProgress(100);

            // Update state with uploaded file and session
            dispatch({ type: actionTypes.SET_PDF_FILE, payload: file });
            dispatch({ type: actionTypes.SET_SESSION_ID, payload: response.session_id });

            // Show success message briefly
            setTimeout(() => {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
                setIsUploading(false);
                setUploadProgress(0);
            }, 500);

        } catch (error) {
            const errorMessage = handleApiError(error, ERROR_MESSAGES.UPLOAD_FAILED);
            dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [dispatch]);

    // Drag and drop handlers
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set false if we're leaving the drop zone completely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    }, [handleFileUpload]);

    // File input handler
    const handleFileInput = useCallback((e) => {
        console.log('File input triggered:', e.target.files);
        const file = e.target.files?.[0];
        if (file) {
            console.log('File selected:', file.name, file.size);
            handleFileUpload(file);
        }
        // Reset input value to allow same file selection
        e.target.value = '';
    }, [handleFileUpload]);

    // Handle click on upload area
    const handleUploadAreaClick = useCallback(() => {
        console.log('Upload area clicked, triggering file input');
        fileInputRef.current?.click();
    }, []);

    // Handle browse button click
    const handleBrowseClick = useCallback((e) => {
        e.stopPropagation();
        console.log('Browse button clicked');
        fileInputRef.current?.click();
    }, []);

    return (
        <div className="min-h-[40vh] flex items-center justify-center p-4">
            <div className="max-w-3xl w-full">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-6"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 3, -3, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        className="text-4xl mb-3"
                    >
                        📚
                    </motion.div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Upload Your PDF Document
                    </h1>
                    <p className="text-sm text-gray-600 max-w-xl mx-auto">
                        Transform your PDFs into interactive conversations. Upload any document and start asking questions with AI-powered insights.
                    </p>
                </motion.div>

                {/* Upload Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center glass-card transition-all duration-300 cursor-pointer
            ${isDragOver
                        ? 'border-primary-500 bg-primary-50 scale-102 shadow-lg'
                        : 'border-gray-300 hover:border-primary-400 hover:scale-101'
                    }
            ${isUploading ? 'pointer-events-none opacity-75' : ''}
          `}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={handleUploadAreaClick}
                    whileHover={{ scale: isUploading ? 1 : 1.01 }}
                    whileTap={{ scale: isUploading ? 1 : 0.99 }}
                >
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={isUploading}
                    />

                    <AnimatePresence mode="wait">
                        {isUploading ? (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="space-y-4"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="text-3xl"
                                >
                                    📤
                                </motion.div>
                                <div className="space-y-3">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        Processing Your PDF...
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        We're analyzing your document and preparing it for AI chat
                                    </p>

                                    {/* Enhanced Progress Bar */}
                                    <div className="w-full max-w-xs mx-auto">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Progress</span>
                                            <span>{Math.round(uploadProgress)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${uploadProgress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Upload steps */}
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <div className={uploadProgress > 20 ? 'text-green-600 font-medium' : ''}>
                                            ✓ Uploading file...
                                        </div>
                                        <div className={uploadProgress > 50 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                            {uploadProgress > 50 ? '✓' : '○'} Extracting text...
                                        </div>
                                        <div className={uploadProgress > 80 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                            {uploadProgress > 80 ? '✓' : '○'} Generating AI embeddings...
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="space-y-4"
                            >
                                <motion.div
                                    className="text-4xl"
                                    animate={{
                                        y: [0, -5, 0],
                                        rotateZ: isDragOver ? [0, 3, -3, 0] : 0
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {isDragOver ? '📥' : '📄'}
                                </motion.div>

                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {isDragOver
                                                ? 'Drop your PDF here!'
                                                : 'Drag & drop your PDF file here'
                                            }
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            or click anywhere to browse files
                                        </p>
                                    </div>

                                    <motion.button
                                        onClick={handleBrowseClick}
                                        className="btn-glass bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-2 rounded-lg font-semibold text-sm shadow-lg transform transition-all duration-200"
                                        whileHover={{ scale: 1.03, y: -1 }}
                                        whileTap={{ scale: 0.97 }}
                                        type="button"
                                    >
                    <span className="flex items-center space-x-2">
                      <span className="text-lg">📁</span>
                      <span>Choose PDF File</span>
                    </span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* File Requirements */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-4"
                >
                    <div className="glass-card rounded-xl p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="space-y-1">
                                <div className="text-2xl">📋</div>
                                <div className="font-semibold text-gray-700 text-sm">PDF Format Only</div>
                                <div className="text-xs text-gray-500">
                                    Supports all standard PDF documents
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl">📏</div>
                                <div className="font-semibold text-gray-700 text-sm">Max 10MB Size</div>
                                <div className="text-xs text-gray-500">
                                    Optimal performance for most documents
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl">📝</div>
                                <div className="font-semibold text-gray-700 text-sm">Text-Based PDFs</div>
                                <div className="text-xs text-gray-500">
                                    Works best with searchable text content
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Features Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {[
                        {
                            emoji: '🤖',
                            title: 'AI-Powered Chat',
                            desc: 'Ask natural language questions about your document content',
                            color: 'from-blue-500 to-purple-600'
                        },
                        {
                            emoji: '📖',
                            title: 'Smart Citations',
                            desc: 'Get precise page references and clickable source links',
                            color: 'from-green-500 to-teal-600'
                        },
                        {
                            emoji: '⚡',
                            title: 'Instant Search',
                            desc: 'Find information quickly with semantic understanding',
                            color: 'from-orange-500 to-red-600'
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="glass-card rounded-xl p-4 text-center hover:scale-102 transition-transform duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                            whileHover={{ y: -2 }}
                        >
                            <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-lg`}>
                                {feature.emoji}
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1 text-sm">{feature.title}</h3>
                            <p className="text-xs text-gray-600">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>


            </div>
        </div>
    );
};

export default FileUpload;