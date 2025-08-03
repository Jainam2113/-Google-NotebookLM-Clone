import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useApp, actionTypes } from '../contexts/AppContext';
import { apiService, handleApiError } from '../services/api';
import CitationLink from './CitationLink';
import {
    MAX_MESSAGE_LENGTH,
    MESSAGE_TYPES,
    ERROR_MESSAGES,
    TYPING_INDICATOR_DELAY
} from '../utils/constants';

const ChatInterface = () => {
    const { state, dispatch } = useApp();
    const { chatMessages, sessionId, isLoading } = state;

    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, scrollToBottom]);

    // Auto-resize textarea
    const adjustTextareaHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    }, []);

    useEffect(() => {
        adjustTextareaHeight();
    }, [message, adjustTextareaHeight]);

    // Extract citations from text
    const extractCitations = useCallback((text) => {
        const citations = [];
        const citationRegex = /\(Page\s+(\d+)\)/gi;
        let match;

        while ((match = citationRegex.exec(text)) !== null) {
            citations.push({
                page: parseInt(match[1]),
                text: `Page ${match[1]}`,
                confidence: 0.9,
                type: 'page_reference'
            });
        }

        return citations;
    }, []);

    // Send message handler
    const handleSendMessage = useCallback(async () => {
        if (!message.trim() || !sessionId || isLoading) return;

        const userMessage = message.trim();
        setMessage('');

        // Add user message to chat
        const userChatMessage = {
            id: Date.now(),
            type: MESSAGE_TYPES.USER,
            content: userMessage,
            timestamp: new Date().toISOString(),
        };

        dispatch({ type: actionTypes.ADD_CHAT_MESSAGE, payload: userChatMessage });
        dispatch({ type: actionTypes.CLEAR_ERROR });

        try {
            // Show typing indicator
            setIsTyping(true);

            // Small delay for better UX
            await new Promise(resolve => setTimeout(resolve, TYPING_INDICATOR_DELAY));

            // Send message to backend
            const response = await apiService.sendMessage(userMessage, sessionId);

            setIsTyping(false);

            // Extract citations from response text
            const extractedCitations = extractCitations(response.response);

            // Add AI response to chat
            const aiChatMessage = {
                id: Date.now() + 1,
                type: MESSAGE_TYPES.ASSISTANT,
                content: response.response,
                citations: [...(response.citations || []), ...extractedCitations],
                timestamp: new Date().toISOString(),
                tokenUsage: response.token_usage,
            };

            dispatch({ type: actionTypes.ADD_CHAT_MESSAGE, payload: aiChatMessage });

        } catch (error) {
            setIsTyping(false);
            const errorMessage = handleApiError(error, ERROR_MESSAGES.CHAT_FAILED);

            const errorChatMessage = {
                id: Date.now() + 1,
                type: MESSAGE_TYPES.ERROR,
                content: errorMessage,
                timestamp: new Date().toISOString(),
            };

            dispatch({ type: actionTypes.ADD_CHAT_MESSAGE, payload: errorChatMessage });
        }
    }, [message, sessionId, isLoading, dispatch, extractCitations]);

    // Handle form submission
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        handleSendMessage();
    }, [handleSendMessage]);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    // Clear chat handler
    const handleClearChat = useCallback(() => {
        dispatch({ type: actionTypes.CLEAR_CHAT });
    }, [dispatch]);

    // Custom markdown components with compact spacing
    const markdownComponents = {
        // Headers - compact spacing
        h1: ({ children }) => <h1 className="text-lg font-bold mb-1 mt-2 first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-bold mb-1 mt-2 first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-1 first:mt-0">{children}</h3>,

        // Text formatting
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
        em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
        code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-600">{children}</code>,

        // Lists - compact spacing
        ul: ({ children }) => <ul className="list-disc list-inside my-1 space-y-0">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside my-1 space-y-0">{children}</ol>,
        li: ({ children }) => <li className="mb-0.5 leading-relaxed">{children}</li>,

        // Paragraphs - minimal spacing
        p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,

        // Blockquotes
        blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-blue-500 pl-3 my-2 italic text-gray-700 bg-blue-50 py-1 rounded-r">
                {children}
            </blockquote>
        ),

        // Code blocks
        pre: ({ children }) => (
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto my-2">
        {children}
      </pre>
        ),
    };

    // Render message component
    const renderMessage = (msg) => {
        const isUser = msg.type === MESSAGE_TYPES.USER;
        const isError = msg.type === MESSAGE_TYPES.ERROR;

        return (
            <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
            >
                <div className={`
          max-w-[85%] rounded-2xl px-4 py-3 
          ${isUser
                    ? 'bg-primary-500 text-white'
                    : isError
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'glass-card text-gray-800'
                }
          ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}
        `}>
                    {/* Message content */}
                    <div className="text-sm">
                        {isUser ? (
                            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                        ) : (
                            <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                <ReactMarkdown components={markdownComponents}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-white/20">
                            <div className="text-xs font-medium mb-2 opacity-80">
                                Sources:
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {/* Remove duplicate citations */}
                                {Array.from(new Map(msg.citations.map(c => [c.page, c])).values())
                                    .map((citation, index) => (
                                        <CitationLink
                                            key={`${citation.page}-${index}`}
                                            citation={citation}
                                            index={index}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                   

                    {/* Timestamp */}
                    <div className={`text-xs mt-2 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <motion.div
                className="flex items-center justify-between p-4 border-b border-white/20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center space-x-3">
                    <div className="text-xl">🤖</div>
                    <div>
                        <div className="font-medium text-gray-800">AI Assistant</div>
                        <div className="text-sm text-gray-500">
                            Ask questions about your PDF
                        </div>
                    </div>
                </div>

                {chatMessages.length > 0 && (
                    <motion.button
                        onClick={handleClearChat}
                        className="px-3 py-1 text-sm glass hover:bg-white/20 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Clear chat history"
                    >
                        🗑️ Clear
                    </motion.button>
                )}
            </motion.div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4">
                {chatMessages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="h-full flex items-center justify-center"
                    >
                        <div className="text-center space-y-4">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-4xl"
                            >
                                💬
                            </motion.div>
                            <div className="text-gray-600">
                                <div className="font-medium mb-2">Start a conversation!</div>
                                <div className="text-sm space-y-1">
                                    <div>• Ask questions about the document</div>
                                    <div>• Request summaries or explanations</div>
                                    <div>• Get specific information with citations</div>
                                </div>
                            </div>

                            {/* Sample questions */}
                            <div className="space-y-2 pt-4">
                                <div className="text-sm font-medium text-gray-700">Try asking:</div>
                                <div className="space-y-2">
                                    {[
                                        "What is this document about?",
                                        "Can you summarize the main points?",
                                        "What are the key findings?",
                                    ].map((question, index) => (
                                        <motion.button
                                            key={question}
                                            onClick={() => setMessage(question)}
                                            className="block w-full text-left px-3 py-2 text-sm glass hover:bg-white/20 rounded-lg transition-colors"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            "{question}"
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {chatMessages.map(renderMessage)}

                        {/* Typing indicator */}
                        <AnimatePresence>
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex justify-start"
                                >
                                    <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                                        <div className="flex items-center space-x-2">
                                            <div className="typing-indicator">
                                                <div className="typing-dot"></div>
                                                <div className="typing-dot"></div>
                                                <div className="typing-dot"></div>
                                            </div>
                                            <span className="text-sm text-gray-600">AI is thinking...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input area */}
            <motion.div
                className="p-4 border-t border-white/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
            <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your PDF..."
                className="w-full p-3 pr-12 glass-card rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
                rows="1"
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={isLoading || !sessionId}
            />

                        <motion.button
                            type="submit"
                            disabled={!message.trim() || isLoading || !sessionId}
                            className="absolute right-3 bottom-3 p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Send message (Enter)"
                        >
                            {isLoading ? (
                                <div className="animate-spin">⏳</div>
                            ) : (
                                <div>📤</div>
                            )}
                        </motion.button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div>
                            {message.length}/{MAX_MESSAGE_LENGTH} characters
                        </div>
                        <div>
                            Press Shift+Enter for new line, Enter to send
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ChatInterface;