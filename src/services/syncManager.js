import { supabase, isOnline, withTimeout } from './supabase.js';
import { getLocalProfile } from './authService.js';

const QUEUE_KEY = 'cyber_offline_queue';

const getQueue = () => {
    try {
        const q = localStorage.getItem(QUEUE_KEY);
        return q ? JSON.parse(q) : [];
    } catch (e) {
        return [];
    }
};

const saveQueue = (queue) => {
    try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {}
};

export const enqueueAction = (action, payload) => {
    const queue = getQueue();
    queue.push({
        id: Date.now().toString(),
        action,
        payload,
        timestamp: new Date().toISOString()
    });
    saveQueue(queue);
};

export const saveProgress = async (gameId, score, status = 'completed') => {
    const profile = getLocalProfile();
    if (!profile) return;

    const payload = { game_id: gameId, score, status, user_id: profile.id };

    if (!navigator.onLine || !isOnline() || profile.offlineOnly) {
        enqueueAction('saveProgress', payload);
        return;
    }

    try {
        const { error } = await withTimeout(supabase.from('user_progress').upsert([payload]), 2000);
        if (error) throw error;
    } catch (e) {
        enqueueAction('saveProgress', payload);
    }
};

export const awardBadge = async (badgeId) => {
    const profile = getLocalProfile();
    if (!profile) return;

    const payload = { badge_id: badgeId, user_id: profile.id };

    if (!navigator.onLine || !isOnline() || profile.offlineOnly) {
        enqueueAction('awardBadge', payload);
        return;
    }

    try {
        const { error } = await withTimeout(supabase.from('user_badges').insert([payload]), 2000);
        if (error && error.code !== '23505') throw error; // Ignore duplicate
    } catch (e) {
        enqueueAction('awardBadge', payload);
    }
};

export const syncOfflineData = async () => {
    if (!navigator.onLine || !isOnline()) return;

    const queue = getQueue();
    if (queue.length === 0) return;

    const profile = getLocalProfile();
    if (!profile || profile.offlineOnly) return;

    const remainingQueue = [];

    for (const item of queue) {
        try {
            if (item.action === 'saveProgress') {
                await withTimeout(supabase.from('user_progress').upsert([item.payload]), 2000);
            } else if (item.action === 'awardBadge') {
                await withTimeout(supabase.from('user_badges').insert([item.payload]), 2000);
            }
        } catch (e) {
            if (e?.code !== '23505') remainingQueue.push(item);
        }
    }

    saveQueue(remainingQueue);
};

// Listen for online event
window.addEventListener('online', () => {
    if (isOnline()) syncOfflineData();
});
setInterval(() => {
    if (isOnline()) syncOfflineData();
}, 30000);
