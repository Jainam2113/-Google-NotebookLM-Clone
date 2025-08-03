import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp, actionTypes } from '../contexts/AppContext';

const CitationLink = ({ citation, index }) => {
    const { dispatch } = useApp();

    // Handle citation click to navigate to page
    const handleCitationClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('🔗 Citation clicked:', citation);

        if (citation.page) {
            // Update current page in state
            dispatch({
                type: actionTypes.SET_CURRENT_PAGE,
                payload: citation.page
            });

            // Dispatch custom event for PDF viewer
            const event = new CustomEvent('navigateToPage', {
                detail: { page: citation.page }
            });
            window.dispatchEvent(event);

            console.log('📄 Navigating to page:', citation.page);

            // Scroll PDF viewer into view
            setTimeout(() => {
                const pdfViewer = document.querySelector('.pdf-viewer-container');
                if (pdfViewer) {
                    pdfViewer.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 200);
        }
    }, [citation.page, dispatch]);

    // Determine citation display text
    const getCitationText = () => {
        if (citation.page) {
            return `Page ${citation.page}`;
        }
        if (citation.section) {
            return citation.section;
        }
        return `Source ${index + 1}`;
    };

    return (
        <motion.button
            onClick={handleCitationClick}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
            title={`Click to navigate to ${getCitationText()}`}
        >
            <span className="mr-2 text-sm">📄</span>
            <span className="font-bold">{getCitationText()}</span>
            <span className="ml-2 text-xs opacity-70 font-bold">→</span>
        </motion.button>
    );
};

export default CitationLink;