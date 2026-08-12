import { io } from 'socket.io-client';

const SERVER_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7410';

let socket = null;

export const initSocket = (token) => {
    if (!token) return null;
    // Already connected — reuse
    if (socket?.connected) return socket;
    // Already initialised but disconnected — reconnect
    if (socket) {
        socket.connect();
        return socket;
    }

    try {
        socket = io(SERVER_URL, {
            auth: { token },
            // Start with websocket; fall back to polling only if needed
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 30000,
            // Retry indefinitely — auth errors are handled via 'connect_error' below
            reconnectionAttempts: Infinity,
            timeout: 10000,
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected');
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });

        socket.on('connect_error', (err) => {
            if (process.env.NODE_ENV === 'development') {
                console.warn('[Socket] Connection error (notifications unavailable):', err.message);
            }
            // Stop retrying on auth failures — the token is bad, retrying won't help
            if (err.message === 'Authentication required' || err.message === 'Invalid token' || err.message === 'User not found') {
                disconnectSocket();
            }
        });
    } catch (err) {
        console.warn('[Socket] Failed to initialise:', err.message);
        socket = null;
    }

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
