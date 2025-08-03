import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, actionTypes } from '../contexts/AppContext';
import { ERROR_MESSAGES } from '../utils/constants';

const PDFViewer = () => {
    const { state, dispatch } = useApp();
    const { pdfFile } = state;

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        if (pdfFile) {
            setIsLoading(true);
            setLoadError(null);

            try {
                const url = URL.createObjectURL(pdfFile);
                setPdfUrl(url);
                setIsLoading(false);

                return () => {
                    URL.revokeObjectURL(url);
                };
            } catch (error) {
                console.error('PDF URL creation error:', error);
                setLoadError(ERROR_MESSAGES.PDF_LOAD_ERROR);
                setIsLoading(false);
                dispatch({ type: actionTypes.SET_ERROR, payload: ERROR_MESSAGES.PDF_LOAD_ERROR });
            }
        } else {
            setPdfUrl(null);
            setIsLoading(false);
        }
    }, [pdfFile, dispatch]);

    if (!pdfFile) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <div>No PDF loaded</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <motion.div
                className="flex items-center justify-between p-4 border-b border-white/20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                        {pdfFile.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded">
                        {(pdfFile.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <motion.button
                        onClick={() => dispatch({ type: actionTypes.RESET_STATE })}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Start new chat with different PDF"
                    >
                        🗑️ New Chat
                    </motion.button>
                </div>
            </motion.div>

            {/* PDF content area */}
            <div className="flex-1 overflow-hidden bg-gray-50 relative">
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-white/80 z-10"
                        >
                            <div className="text-center">
                                <div className="animate-spin text-4xl mb-4">📄</div>
                                <div className="text-gray-600">Loading PDF...</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {loadError ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center text-red-600">
                            <div className="text-4xl mb-4">⚠️</div>
                            <div className="font-medium mb-2">Failed to load PDF</div>
                            <div className="text-sm text-gray-500">{loadError}</div>
                        </div>
                    </div>
                ) : pdfUrl ? (
                    <motion.div
                        className="h-full w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full border-none"
                            title="PDF Viewer"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setLoadError('Failed to display PDF');
                                setIsLoading(false);
                            }}
                        />
                    </motion.div>
                ) : null}
            </div>

            {/* Footer */}
            <div className="px-4 pb-2">
                <div className="text-xs text-gray-400 text-center">
                    PDF loaded successfully
                </div>
            </div>
        </div>
    );
};

export default PDFViewer;