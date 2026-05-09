import { supabase } from './supabase';
import { getLocalProfile } from './authService';

const QUEUE_KEY = 'cyber_offline_queue';

const getQueue = () => {
    const q = localStorage.getItem(QUEUE_KEY);
    return q ? JSON.parse(q) : [];
};

const saveQueue = (queue) => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
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

    if (!navigator.onLine || profile.offlineOnly) {
        enqueueAction('saveProgress', payload);
        return;
    }

    try {
        const { error } = await supabase.from('user_progress').upsert([payload]);
        if (error) throw error;
    } catch (e) {
        enqueueAction('saveProgress', payload);
    }
};

export const awardBadge = async (badgeId) => {
    const profile = getLocalProfile();
    if (!profile) return;

    const payload = { badge_id: badgeId, user_id: profile.id };

    if (!navigator.onLine || profile.offlineOnly) {
        enqueueAction('awardBadge', payload);
        return;
    }

    try {
        const { error } = await supabase.from('user_badges').insert([payload]);
        if (error && error.code !== '23505') throw error; // Ignore duplicate
    } catch (e) {
        enqueueAction('awardBadge', payload);
    }
};

export const syncOfflineData = async () => {
    if (!navigator.onLine) return;

    const queue = getQueue();
    if (queue.length === 0) return;

    const profile = getLocalProfile();
    if (!profile || profile.offlineOnly) return;

    const remainingQueue = [];

    for (const item of queue) {
        try {
            if (item.action === 'saveProgress') {
                await supabase.from('user_progress').upsert([item.payload]);
            } else if (item.action === 'awardBadge') {
                await supabase.from('user_badges').insert([item.payload]);
            }
        } catch (e) {
            if (e.code !== '23505') remainingQueue.push(item);
        }
    }

    saveQueue(remainingQueue);
};

// Listen for online event
window.addEventListener('online', syncOfflineData);
setInterval(syncOfflineData, 30000); // Periodic sync check
