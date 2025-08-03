import { useCallback, useEffect } from 'react';
import { useApp, actionTypes } from '../contexts/AppContext';
import { apiService, handleApiError } from '../services/api';
import { MESSAGE_TYPES, ERROR_MESSAGES, STORAGE_KEYS } from '../utils/constants';

export const useChat = () => {
    const { state, dispatch } = useApp();
    const { chatMessages, sessionId, isLoading } = state;

    // Send a message to the AI
    const sendMessage = useCallback(async (message, options = {}) => {
        if (!message.trim() || !sessionId || isLoading) {
            return { success: false, error: 'Invalid message or session' };
        }

        const userMessage = {
            id: Date.now(),
            type: MESSAGE_TYPES.USER,
            content: message.trim(),
            timestamp: new Date().toISOString(),
        };

        try {
            // Add user message to chat
            dispatch({ type: actionTypes.ADD_CHAT_MESSAGE, payload: userMessage });
            dispatch({ type: actionTypes.CLEAR_ERROR });
            dispatch({ type: actionTypes.SET_LOADING, payload: true });

            // Send to backend
            const response = await apiService.sendMessage(message.trim(), sessionId);

            // Add AI response
            const aiMessage = {
                id: Date.now() + 1,
                type: MESSAGE_TYPES.ASSISTANT,
                content: response.response,
                citations: response.citations || [],
                timestamp: new Date().toISOString(),
                tokenUsage: response.token_usage,
            };

            dispatch({ type: actionTypes.ADD_CHAT_MESSAGE, payload: aiMessage });
            dispatch({ type: actionTypes.SET_LOADING, payload: false });

            // Store citations
            if (response.citations?.length > 0) {
                response.citations.forEach(citation => {
                    dispatch({ type: actionTypes.ADD_CITATION, payload: citation });
                });
            }

            return {
                success: true,
                response: aiMessage,
                citations: response.citations
            };

        } catch (error) {
            const errorMessage = handleApiError(error, ERROR_MESSAGES.CHAT_FAILED);

            const errorChatMessage = {
                id: Date.now() + 1,
                type: MESSAGE_TYPES.ERROR,
                content: errorMessage,
                timestamp: new Date().toISOString(),
            };

            dispatch({ type: actionTypes.ADD_CHAT_MESSAGE, payload: errorChatMessage });
            dispatch({ type: actionTypes.SET_LOADING, payload: false });

            return { success: false, error: errorMessage };
        }
    }, [sessionId, isLoading, dispatch]);

    // Clear chat history
    const clearChat = useCallback(() => {
        dispatch({ type: actionTypes.CLEAR_CHAT });
        // Also clear from localStorage
        localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    }, [dispatch]);

    // Load chat history from backend
    const loadChatHistory = useCallback(async (targetSessionId) => {
        if (!targetSessionId) return { success: false, error: 'No session ID' };

        try {
            const response = await apiService.getChatHistory(targetSessionId);

            if (response.messages && response.messages.length > 0) {
                // Clear existing messages and load history
                dispatch({ type: actionTypes.CLEAR_CHAT });

                response.messages.forEach(msg => {
                    dispatch({ type: actionTypes.ADD_CHAT_MESSAGE, payload: msg });
                });
            }

            return { success: true, messages: response.messages };
        } catch (error) {
            const errorMessage = handleApiError(error, 'Failed to load chat history');
            return { success: false, error: errorMessage };
        }
    }, [dispatch]);

    // Save chat history to localStorage (backup)
    const saveChatToLocal = useCallback(() => {
        try {
            const chatData = {
                sessionId,
                messages: chatMessages,
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chatData));
        } catch (error) {
            console.warn('Failed to save chat to localStorage:', error);
        }
    }, [sessionId, chatMessages]);

    // Load chat history from localStorage
    const loadChatFromLocal = useCallback(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
            if (!saved) return null;

            const chatData = JSON.parse(saved);

            // Check if it's for the current session
            if (chatData.sessionId === sessionId && chatData.messages) {
                return chatData;
            }

            return null;
        } catch (error) {
            console.warn('Failed to load chat from localStorage:', error);
            return null;
        }
    }, [sessionId]);

    // Auto-save chat to localStorage when messages change
    useEffect(() => {
        if (chatMessages.length > 0 && sessionId) {
            saveChatToLocal();
        }
    }, [chatMessages, sessionId, saveChatToLocal]);

    // Get chat statistics
    const getChatStats = useCallback(() => {
        const userMessages = chatMessages.filter(msg => msg.type === MESSAGE_TYPES.USER);
        const aiMessages = chatMessages.filter(msg => msg.type === MESSAGE_TYPES.ASSISTANT);
        const errorMessages = chatMessages.filter(msg => msg.type === MESSAGE_TYPES.ERROR);

        const totalTokens = aiMessages.reduce((sum, msg) => {
            return sum + (msg.tokenUsage?.total || 0);
        }, 0);

        return {
            totalMessages: chatMessages.length,
            userMessages: userMessages.length,
            aiMessages: aiMessages.length,
            errorMessages: errorMessages.length,
            totalTokens,
            hasHistory: chatMessages.length > 0,
        };
    }, [chatMessages]);

    // Get last AI response
    const getLastResponse = useCallback(() => {
        const aiMessages = chatMessages.filter(msg => msg.type === MESSAGE_TYPES.ASSISTANT);
        return aiMessages[aiMessages.length - 1] || null;
    }, [chatMessages]);

    // Regenerate last response
    const regenerateResponse = useCallback(async () => {
        const userMessages = chatMessages.filter(msg => msg.type === MESSAGE_TYPES.USER);
        const lastUserMessage = userMessages[userMessages.length - 1];

        if (!lastUserMessage) {
            return { success: false, error: 'No user message to regenerate from' };
        }

        // Remove the last AI response if it exists
        const lastMessage = chatMessages[chatMessages.length - 1];
        if (lastMessage && lastMessage.type === MESSAGE_TYPES.ASSISTANT) {
            // Remove last AI message - this would need to be implemented in the reducer
            // For now, we'll just send the message again
        }

        return await sendMessage(lastUserMessage.content);
    }, [chatMessages, sendMessage]);

    return {
        // State
        messages: chatMessages,
        isLoading,
        sessionId,

        // Actions
        sendMessage,
        clearChat,
        loadChatHistory,
        loadChatFromLocal,
        regenerateResponse,

        // Utilities
        getChatStats,
        getLastResponse,

        // Computed values
        hasMessages: chatMessages.length > 0,
        canSendMessage: !isLoading && sessionId && Boolean(sessionId),
    };
};