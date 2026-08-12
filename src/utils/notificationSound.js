/**
 * Utility for handling application sounds.
 * Plays notification sounds for different events.
 * Respects user preferences from localStorage.
 */

class NotificationSoundSystem {
    constructor() {
        this.lastPlayedAt = 0;
        this.throttleMs = 1000; // Prevent spamming sounds
        
        // Define paths to audio files
        this.sounds = {
            notification: '/sounds/notification.mp3',
            success: '/sounds/success.mp3',
            error: '/sounds/error.wav',
            warning: '/sounds/warning.mp3',
            message: '/sounds/message.wav',
            order: '/sounds/error.wav',
        };

        this.audioInstances = {};

        if (typeof window !== 'undefined') {
            // Pre-create Audio instances to avoid loading lag and browser blockages
            Object.keys(this.sounds).forEach(key => {
                try {
                    const audio = new Audio(this.sounds[key]);
                    audio.preload = 'auto';
                    this.audioInstances[key] = audio;
                } catch (e) {
                    console.warn(`Failed to preload audio for ${key}:`, e);
                }
            });
        }
    }

    /**
     * Retrieves current settings from localStorage
     */
    getSettings() {
        if (typeof window === 'undefined') return { enabled: true, volume: 50 };
        
        try {
            const stored = localStorage.getItem('notificationSettings');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error parsing notification settings', error);
        }
        
        // Default settings
        return {
            enabled: true,
            volume: 50,
            desktopEnabled: true,
            orderNotifications: true,
            offerNotifications: true,
            promoNotifications: true
        };
    }

    /**
     * Play a specific sound if settings allow it
     */
    playSound(type) {
        if (typeof window === 'undefined') return;

        const settings = this.getSettings();
        if (!settings.enabled) return;

        // Throttle check immediately to prevent concurrent calls
        const now = Date.now();
        if (now - this.lastPlayedAt < this.throttleMs) {
            return; // Skip playing to avoid overlapping spam
        }
        
        // Update immediately so parallel calls are blocked
        this.lastPlayedAt = now;

        try {
            const audio = this.audioInstances[type];
            if (!audio) return;

            audio.volume = settings.volume / 100;
            audio.currentTime = 0;
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Ignore abort errors caused by rapid page navigation etc.
                    if (error.name !== 'AbortError') {
                        console.warn(`Could not play ${type} sound:`, error.message);
                    }
                });
            }
        } catch (error) {
            console.warn(`Could not play ${type} sound:`, error.message);
        }
    }

    playNotification() { this.playSound('notification'); }
    playSuccess() { this.playSound('success'); }
    playError() { this.playSound('error'); }
    playWarning() { this.playSound('warning'); }
    playOrder() { this.playSound('order'); }
    playMessage() { this.playSound('message'); }
}

// Singleton instance
const notificationSound = new NotificationSoundSystem();

export const playNotification = () => notificationSound.playNotification();
export const playSuccess = () => notificationSound.playSuccess();
export const playError = () => notificationSound.playError();
export const playWarning = () => notificationSound.playWarning();
export const playOrder = () => notificationSound.playOrder();
export const playMessage = () => notificationSound.playMessage();

export default notificationSound;
