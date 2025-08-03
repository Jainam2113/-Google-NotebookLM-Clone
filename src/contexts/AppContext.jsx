import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
    pdfFile: null,
    pdfDocument: null,
    currentPage: 1,
    totalPages: 0,
    chatMessages: [],
    isLoading: false,
    sessionId: null,
    error: null,
    citations: [],
};

// Action types
export const actionTypes = {
    SET_PDF_FILE: 'SET_PDF_FILE',
    SET_PDF_DOCUMENT: 'SET_PDF_DOCUMENT',
    SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
    SET_TOTAL_PAGES: 'SET_TOTAL_PAGES',
    ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
    SET_LOADING: 'SET_LOADING',
    SET_SESSION_ID: 'SET_SESSION_ID',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    ADD_CITATION: 'ADD_CITATION',
    CLEAR_CHAT: 'CLEAR_CHAT',
    RESET_STATE: 'RESET_STATE',
};

// Reducer function
const appReducer = (state, action) => {
    switch (action.type) {
        case actionTypes.SET_PDF_FILE:
            return { ...state, pdfFile: action.payload };

        case actionTypes.SET_PDF_DOCUMENT:
            return { ...state, pdfDocument: action.payload };

        case actionTypes.SET_CURRENT_PAGE:
            return { ...state, currentPage: action.payload };

        case actionTypes.SET_TOTAL_PAGES:
            return { ...state, totalPages: action.payload };

        case actionTypes.ADD_CHAT_MESSAGE:
            return {
                ...state,
                chatMessages: [...state.chatMessages, action.payload]
            };

        case actionTypes.SET_LOADING:
            return { ...state, isLoading: action.payload };

        case actionTypes.SET_SESSION_ID:
            return { ...state, sessionId: action.payload };

        case actionTypes.SET_ERROR:
            return { ...state, error: action.payload, isLoading: false };

        case actionTypes.CLEAR_ERROR:
            return { ...state, error: null };

        case actionTypes.ADD_CITATION:
            return {
                ...state,
                citations: [...state.citations, action.payload]
            };

        case actionTypes.CLEAR_CHAT:
            return {
                ...state,
                chatMessages: [],
                citations: [],
                error: null
            };

        case actionTypes.RESET_STATE:
            return { ...initialState };

        default:
            return state;
    }
};

// Create contexts
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
        <AppStateContext.Provider value={state}>
            <AppDispatchContext.Provider value={dispatch}>
                {children}
            </AppDispatchContext.Provider>
        </AppStateContext.Provider>
    );
};

// Custom hooks
export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error('useAppState must be used within an AppProvider');
    }
    return context;
};

export const useAppDispatch = () => {
    const context = useContext(AppDispatchContext);
    if (!context) {
        throw new Error('useAppDispatch must be used within an AppProvider');
    }
    return context;
};

// Combined hook for convenience
export const useApp = () => {
    return {
        state: useAppState(),
        dispatch: useAppDispatch(),
    };
};