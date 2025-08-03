// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// File upload constraints
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['application/pdf'];
export const ALLOWED_EXTENSIONS = ['.pdf'];

// PDF display settings
export const PDF_SCALE = 1.5;
export const PDF_PAGE_GAP = 20;

// Chat settings
export const MAX_MESSAGE_LENGTH = 1000;
export const TYPING_INDICATOR_DELAY = 500;

// UI Constants
export const ANIMATION_DURATION = 0.3;
export const DEBOUNCE_DELAY = 300;

// Error messages
export const ERROR_MESSAGES = {
    FILE_TOO_LARGE: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    INVALID_FILE_TYPE: 'Only PDF files are allowed',
    UPLOAD_FAILED: 'Failed to upload file. Please try again.',
    CHAT_FAILED: 'Failed to send message. Please try again.',
    CONNECTION_ERROR: 'Unable to connect to server. Please check your connection.',
    SESSION_EXPIRED: 'Your session has expired. Please upload the PDF again.',
    PDF_LOAD_ERROR: 'Failed to load PDF. The file might be corrupted.',
    GEMINI_ERROR: 'AI service is temporarily unavailable. Please try again later.',
};

// Success messages
export const SUCCESS_MESSAGES = {
    FILE_UPLOADED: 'PDF uploaded successfully! You can now ask questions.',
    MESSAGE_SENT: 'Message sent successfully',
};

// Chat message types
export const MESSAGE_TYPES = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
    ERROR: 'error',
};

// Citation types
export const CITATION_TYPES = {
    PAGE_REFERENCE: 'page_reference',
    DIRECT_QUOTE: 'direct_quote',
    PARAPHRASE: 'paraphrase',
};

// PDF viewer settings
export const PDF_VIEWER_CONFIG = {
    scale: PDF_SCALE,
    canvasBackground: 'transparent',
    textLayerMode: 1, // Enable text selection
    annotationMode: 1, // Enable annotations
    renderTextMode: 1, // Render text for selection
};

// Theme colors (matching Tailwind config)
export const THEME_COLORS = {
    primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
    },
    glass: {
        50: 'rgba(255, 255, 255, 0.9)',
        100: 'rgba(255, 255, 255, 0.8)',
        200: 'rgba(255, 255, 255, 0.6)',
        300: 'rgba(255, 255, 255, 0.4)',
        400: 'rgba(255, 255, 255, 0.2)',
        500: 'rgba(255, 255, 255, 0.1)',
    }
};

// Local storage keys
export const STORAGE_KEYS = {
    SESSION_ID: 'notebooklm_session_id',
    CHAT_HISTORY: 'notebooklm_chat_history',
    USER_PREFERENCES: 'notebooklm_preferences',
};

// Environment detection
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;

// Feature flags
export const FEATURES = {
    ENABLE_REDIS: import.meta.env.VITE_ENABLE_REDIS === 'true',
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    ENABLE_DEBUG_LOGS: IS_DEVELOPMENT,
};

// Supported languages for syntax highlighting (if needed)
export const SUPPORTED_LANGUAGES = [
    'javascript',
    'python',
    'java',
    'cpp',
    'html',
    'css',
    'json',
    'markdown',
];

// Default system prompts
export const SYSTEM_PROMPTS = {
    DEFAULT: "You are a helpful AI assistant that answers questions based on the provided PDF document. Always cite the specific page numbers where you found the information.",
    FOLLOW_UP: "Please provide more details or clarification on the previous topic.",
    SUMMARIZE: "Please provide a concise summary of the main points.",
};