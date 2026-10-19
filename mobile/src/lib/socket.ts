import { io, Socket } from 'socket.io-client';
import { supabase } from './supabase';

let mobileSocketInstance: Socket | null = null;

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

/**
 * Initializes and retrieves the singleton mobile Socket.io client instance
 */
export const getMobileSocket = async (): Promise<Socket> => {
  if (mobileSocketInstance && mobileSocketInstance.connected) {
    return mobileSocketInstance;
  }

  // Retrieve current active user session token if available
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || 'guest_mobile_user';

  if (!mobileSocketInstance) {
    mobileSocketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    mobileSocketInstance.on('connect', () => {
      console.log('[Socket Mobile] Connected successfully, ID:', mobileSocketInstance?.id);
    });

    mobileSocketInstance.on('connect_error', (error) => {
      console.warn('[Socket Mobile] Connection error:', error.message);
    });
  } else if (!mobileSocketInstance.connected) {
    mobileSocketInstance.auth = { token };
    mobileSocketInstance.connect();
  }

  return mobileSocketInstance;
};

/**
 * Join conversation room
 */
export const joinMobileConversation = async (conversationId: string) => {
  const socket = await getMobileSocket();
  socket.emit('join_conversation', { conversationId });
};

/**
 * Send real-time chat message from mobile
 */
export const sendMobileChatMessage = async (payload: {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'price_quote';
  mediaUrl?: string;
  metadata?: any;
}) => {
  const socket = await getMobileSocket();
  socket.emit('send_message', payload);
};

/**
 * Broadcast typing status from mobile
 */
export const sendMobileTypingStatus = async (conversationId: string, isTyping: boolean) => {
  const socket = await getMobileSocket();
  socket.emit('typing', { conversationId, isTyping });
};

/**
 * Disconnect socket
 */
export const disconnectMobileSocket = () => {
  if (mobileSocketInstance) {
    mobileSocketInstance.disconnect();
    mobileSocketInstance = null;
  }
};
