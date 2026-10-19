import { io, Socket } from 'socket.io-client';
import { supabase } from './supabase';

let socketInstance: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

/**
 * Initializes and retrieves the singleton Socket.io client instance
 */
export const getSocket = async (): Promise<Socket> => {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  // Retrieve current active user session token if available
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || 'guest_user';

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket Web] Connected successfully, socket ID:', socketInstance?.id);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('[Socket Web] Connection error:', error.message);
    });
  } else if (!socketInstance.connected) {
    socketInstance.auth = { token };
    socketInstance.connect();
  }

  return socketInstance;
};

/**
 * Join a real-time conversation room
 */
export const joinConversation = async (conversationId: string) => {
  const socket = await getSocket();
  socket.emit('join_conversation', { conversationId });
};

/**
 * Leave a conversation room
 */
export const leaveConversation = async (conversationId: string) => {
  const socket = await getSocket();
  socket.emit('leave_conversation', { conversationId });
};

/**
 * Send real-time chat message (text, price quote, or media from Supabase storage)
 */
export const sendChatMessage = async (payload: {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'price_quote';
  mediaUrl?: string;
  metadata?: any;
}) => {
  const socket = await getSocket();
  socket.emit('send_message', payload);
};

/**
 * Broadcast typing status to participant
 */
export const sendTypingStatus = async (conversationId: string, isTyping: boolean) => {
  const socket = await getSocket();
  socket.emit('typing', { conversationId, isTyping });
};

/**
 * Disconnect socket cleanly
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
