import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingSpinner = ({
                            isVisible = true,
                            message = 'Processing...',
                            overlay = true
                        }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`
            ${overlay ? 'fixed inset-0 z-50' : 'relative'} 
            flex items-center justify-center
            ${overlay ? 'bg-black/30 backdrop-blur-sm' : ''}
          `}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="glass-card rounded-2xl p-8 max-w-sm mx-4"
                    >
                        <div className="text-center space-y-4">
                            {/* Animated loading icon */}
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 1, repeat: Infinity }
                                }}
                                className="text-4xl mx-auto"
                            >
                                ⚙️
                            </motion.div>

                            {/* Loading message */}
                            <div className="space-y-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg font-medium text-gray-800"
                                >
                                    {message}
                                </motion.div>

                                {/* Animated dots */}
                                <motion.div
                                    className="flex justify-center space-x-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 bg-primary-500 rounded-full"
                                            animate={{
                                                y: [-4, 4, -4],
                                                opacity: [0.5, 1, 0.5]
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            </div>

                            {/* Progress indicator (optional) */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full overflow-hidden"
                            >
                                <motion.div
                                    animate={{ x: [-100, 100] }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="h-full w-1/3 bg-white/50 rounded-full"
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Inline spinner for smaller components
export const InlineSpinner = ({ size = 'sm', className = '' }) => {
    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`${sizeClasses[size]} ${className}`}
        >
            <div className="w-full h-full border-2 border-primary-200 border-t-primary-500 rounded-full"></div>
        </motion.div>
    );
};

// Pulsing dots loader
export const PulseLoader = ({ count = 3, className = '' }) => {
    return (
        <div className={`flex space-x-1 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 bg-primary-500 rounded-full"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                    }}
                />
            ))}
        </div>
    );
};

export default LoadingSpinner;