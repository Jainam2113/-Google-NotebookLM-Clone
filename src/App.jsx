import React from 'react';
import { motion } from 'framer-motion';
import { AppProvider } from './contexts/AppContext';
import FileUpload from './components/FileUpload';
import PDFViewer from './components/PDFViewer';
import ChatInterface from './components/ChatInterface';
import LoadingSpinner from './components/LoadingSpinner';
import { useApp } from './contexts/AppContext';

// Main app component that uses context
const AppContent = () => {
    const { state } = useApp();
    const { pdfFile, isLoading, error } = state;

    return (
        <div className="min-h-screen gradient-bg-light">


            {/* Error Display */}
            {error && (
                <motion.div
                    className="mx-6 mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg glass"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    <div className="flex items-center">
                        <span className="text-xl mr-2">⚠️</span>
                        <span>{error}</span>
                    </div>
                </motion.div>
            )}

            {/* Main Content */}
            <div className="px-6 pb-6">
                {!pdfFile ? (
                    /* File Upload Screen */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <FileUpload />
                    </motion.div>
                ) : (
                    /* PDF + Chat Interface */
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-2  gap-6 h-[calc(100vh-20px)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* PDF Viewer */}
                        <motion.div
                            className="glass-card rounded-2xl overflow-hidden"
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <PDFViewer />
                        </motion.div>

                        {/* Chat Interface */}
                        <motion.div
                            className="glass-card rounded-2xl overflow-hidden"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <ChatInterface />
                        </motion.div>
                    </motion.div>
                )}
            </div>

            {/* Loading Overlay */}
            {isLoading && <LoadingSpinner />}

            {/* Footer */}
            <motion.footer
                className="text-center py-4 text-gray-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >

            </motion.footer>
        </div>
    );
};

// Root App component with provider
function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}

export default App;