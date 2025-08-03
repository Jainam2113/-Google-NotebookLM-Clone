import { useCallback, useEffect } from 'react';
import { useApp, actionTypes } from '../contexts/AppContext';
import { apiService, handleApiError } from '../services/api';
import { ERROR_MESSAGES, STORAGE_KEYS } from '../utils/constants';

export const usePDF = () => {
    const { state, dispatch } = useApp();
    const { pdfFile, pdfDocument, currentPage, totalPages, sessionId } = state;

    // Upload PDF file
    const uploadPDF = useCallback(async (file) => {
        try {
            // Validate file
            if (!file) throw new Error('No file provided');
            if (file.type !== 'application/pdf') {
                throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
            }

            dispatch({ type: actionTypes.SET_LOADING, payload: true });
            dispatch({ type: actionTypes.CLEAR_ERROR });

            // Upload to backend
            const response = await apiService.uploadPDF(file);

            // Update state
            dispatch({ type: actionTypes.SET_PDF_FILE, payload: file });
            dispatch({ type: actionTypes.SET_SESSION_ID, payload: response.session_id });
            dispatch({ type: actionTypes.SET_LOADING, payload: false });

            // Store session info in localStorage
            localStorage.setItem(STORAGE_KEYS.SESSION_ID, response.session_id);

            return {
                success: true,
                sessionId: response.session_id,
                message: response.message
            };

        } catch (error) {
            const errorMessage = handleApiError(error, ERROR_MESSAGES.UPLOAD_FAILED);
            dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
            return { success: false, error: errorMessage };
        }
    }, [dispatch]);

    // Navigate to specific page
    const goToPage = useCallback((pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: pageNumber });
            return true;
        }
        return false;
    }, [totalPages, dispatch]);

    // Navigate to next page
    const nextPage = useCallback(() => {
        if (currentPage < totalPages) {
            dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: currentPage + 1 });
            return true;
        }
        return false;
    }, [currentPage, totalPages, dispatch]);

    // Navigate to previous page
    const prevPage = useCallback(() => {
        if (currentPage > 1) {
            dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: currentPage - 1 });
            return true;
        }
        return false;
    }, [currentPage, dispatch]);

    // Jump to first page
    const firstPage = useCallback(() => {
        if (totalPages > 0) {
            dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 1 });
            return true;
        }
        return false;
    }, [totalPages, dispatch]);

    // Jump to last page
    const lastPage = useCallback(() => {
        if (totalPages > 0) {
            dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: totalPages });
            return true;
        }
        return false;
    }, [totalPages, dispatch]);

    // Clear PDF and reset state
    const clearPDF = useCallback(() => {
        dispatch({ type: actionTypes.RESET_STATE });
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
        localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    }, [dispatch]);

    // Get PDF info
    const getPDFInfo = useCallback(() => {
        if (!pdfFile) return null;

        return {
            name: pdfFile.name,
            size: pdfFile.size,
            sizeFormatted: `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB`,
            type: pdfFile.type,
            lastModified: pdfFile.lastModified ? new Date(pdfFile.lastModified) : null,
            currentPage,
            totalPages,
            hasDocument: Boolean(pdfDocument),
        };
    }, [pdfFile, currentPage, totalPages, pdfDocument]);

    // Check if can navigate
    const getNavigationState = useCallback(() => {
        return {
            canGoNext: currentPage < totalPages,
            canGoPrev: currentPage > 1,
            canGoFirst: currentPage > 1,
            canGoLast: currentPage < totalPages,
            isFirstPage: currentPage === 1,
            isLastPage: currentPage === totalPages,
            progress: totalPages > 0 ? (currentPage / totalPages) * 100 : 0,
        };
    }, [currentPage, totalPages]);

    // Search within PDF (client-side text search)
    const searchInPDF = useCallback(async (searchTerm) => {
        if (!pdfDocument || !searchTerm.trim()) {
            return { results: [], totalMatches: 0 };
        }

        try {
            const results = [];
            const normalizedSearch = searchTerm.toLowerCase().trim();

            // Search through all pages (this is a simplified implementation)
            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                const page = await pdfDocument.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ')
                    .toLowerCase();

                if (pageText.includes(normalizedSearch)) {
                    results.push({
                        page: pageNum,
                        preview: pageText.substring(
                            Math.max(0, pageText.indexOf(normalizedSearch) - 50),
                            pageText.indexOf(normalizedSearch) + searchTerm.length + 50
                        ),
                    });
                }
            }

            return {
                results,
                totalMatches: results.length,
                searchTerm,
            };
        } catch (error) {
            console.error('Search error:', error);
            return { results: [], totalMatches: 0, error: error.message };
        }
    }, [pdfDocument, totalPages]);

    // Extract text from current page
    const getCurrentPageText = useCallback(async () => {
        if (!pdfDocument || currentPage < 1 || currentPage > totalPages) {
            return null;
        }

        try {
            const page = await pdfDocument.getPage(currentPage);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join(' ');
            return text;
        } catch (error) {
            console.error('Error extracting page text:', error);
            return null;
        }
    }, [pdfDocument, currentPage, totalPages]);

    // Get page thumbnail (simplified)
    const getPageThumbnail = useCallback(async (pageNumber) => {
        if (!pdfDocument || pageNumber < 1 || pageNumber > totalPages) {
            return null;
        }

        try {
            const page = await pdfDocument.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 0.2 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport,
            }).promise;

            return canvas.toDataURL();
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            return null;
        }
    }, [pdfDocument, totalPages]);

    // Restore session from localStorage
    const restoreSession = useCallback(async () => {
        try {
            const savedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
            if (savedSessionId) {
                // Try to restore session from backend
                const sessionInfo = await apiService.getSessionInfo(savedSessionId);
                if (sessionInfo.valid) {
                    dispatch({ type: actionTypes.SET_SESSION_ID, payload: savedSessionId });
                    return { success: true, sessionId: savedSessionId };
                } else {
                    // Session expired, clean up
                    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
                    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
                }
            }
            return { success: false, error: 'No valid session found' };
        } catch (error) {
            console.warn('Failed to restore session:', error);
            return { success: false, error: 'Failed to restore session' };
        }
    }, [dispatch]);

    // Auto-restore session on mount
    useEffect(() => {
        if (!sessionId) {
            restoreSession();
        }
    }, [sessionId, restoreSession]);

    return {
        // State
        pdfFile,
        pdfDocument,
        currentPage,
        totalPages,
        sessionId,

        // Actions
        uploadPDF,
        clearPDF,
        goToPage,
        nextPage,
        prevPage,
        firstPage,
        lastPage,

        // Utilities
        getPDFInfo,
        getNavigationState,
        searchInPDF,
        getCurrentPageText,
        getPageThumbnail,
        restoreSession,

        // Computed values
        hasPDF: Boolean(pdfFile),
        hasDocument: Boolean(pdfDocument),
        hasSession: Boolean(sessionId),
        isValidPage: currentPage >= 1 && currentPage <= totalPages,
    };
};