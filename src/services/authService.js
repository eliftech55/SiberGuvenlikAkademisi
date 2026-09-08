import { db } from './firebase.js';
import { 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    orderBy, 
    limit, 
    arrayUnion, 
    increment 
} from 'firebase/firestore';

const PROFILE_KEY = 'cyber_academy_profile';
const ACCOUNTS_KEY = 'caq_local_accounts';

// Helper for safe timeout on network queries
export const withTimeout = (promise, ms = 1500) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms))
    ]);
};

export const getLocalProfile = () => {
    try {
        const data = localStorage.getItem(PROFILE_KEY);
        const profile = data ? JSON.parse(data) : null;
        if (profile) {
            profile.badges = profile.badges || [];
            profile.completedGames = profile.completedGames || [];
            profile.xp = profile.xp || 0;
            profile.level = profile.level || 1;
            profile.metaData = profile.metaData || { color: 'blue', type: 'standard' };
        }
        return profile;
    } catch (e) {
        console.error('Error reading local profile:', e);
        return null;
    }
};

export const getAllLocalAccounts = () => {
    try {
        const data = localStorage.getItem(ACCOUNTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

export const saveLocalProfile = (profile) => {
    if (!profile) return;
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        
        // Save to persistent accounts list for multi-account switching
        const accounts = getAllLocalAccounts();
        const existingIdx = accounts.findIndex(a => a.codename?.toLowerCase() === profile.codename?.toLowerCase());
        if (existingIdx !== -1) {
            accounts[existingIdx] = profile;
        } else {
            accounts.push(profile);
        }
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
        console.error('Error saving local profile:', e);
    }
};

export const logout = () => {
    try {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem('caq_user_profile');
        localStorage.removeItem('caq_session');
    } catch (e) {
        console.error('Logout error:', e);
    }
};

/**
 * Creates a new student profile in Firebase Firestore and LocalStorage
 */
export const createProfile = async (codename, avatarType = 'fish', metaData = {}) => {
    const cleanName = codename.trim();
    const docId = cleanName.toLowerCase();

    const newProfile = {
        id: docId,
        codename: cleanName,
        avatar_type: avatarType,
        metaData: {
            color: metaData.color || 'blue',
            type: metaData.type || 'standard'
        },
        xp: 0,
        level: 1,
        badges: [],
        completedGames: [],
        created_at: new Date().toISOString()
    };

    // 1. Save locally first for instant UI response (0ms)
    saveLocalProfile(newProfile);

    // 2. Save to Firestore (persists offline via IndexedDB & syncs to cloud)
    try {
        setDoc(doc(db, 'profiles', docId), newProfile).catch(err => {
            console.warn('[Firestore] Background write error (persisted locally):', err?.message);
        });
    } catch (e) {
        console.warn('[Firestore] Write initiated offline:', e?.message);
    }

    return newProfile;
};

export const checkCodenameUnique = async (codename) => {
    const cleanName = codename.trim();
    const docId = cleanName.toLowerCase();
    
    // Check locally saved accounts
    const localAccounts = getAllLocalAccounts();
    const existsLocally = localAccounts.some(a => a.codename?.toLowerCase() === docId);
    if (existsLocally) {
        return false;
    }

    // Check Firebase Firestore
    try {
        const snap = await withTimeout(getDoc(doc(db, 'profiles', docId)), 1500);
        return !snap.exists();
    } catch (e) {
        console.log('[Firestore] Codename check offline or timed out, allowing name.');
        return true;
    }
};

export const awardBadge = async (badgeId) => {
    const profile = getLocalProfile();
    if (!profile) return;

    if (!profile.badges.includes(badgeId)) {
        profile.badges.push(badgeId);
        profile.xp += 100;
        saveLocalProfile(profile);
        console.log(`[Rozet] Başarıyla kaydedildi: ${badgeId}`);

        // Update Firestore
        try {
            const docId = profile.codename.toLowerCase();
            updateDoc(doc(db, 'profiles', docId), {
                badges: arrayUnion(badgeId),
                xp: increment(100)
            }).catch(err => console.warn('[Firestore] Rozet senkronizasyonu:', err?.message));
        } catch (err) {}
    }
};

export const completeGame = async (gameId, score) => {
    const profile = getLocalProfile();
    if (!profile) return;

    profile.xp = (profile.xp || 0) + score;
    if (!profile.completedGames.includes(gameId)) {
        profile.completedGames.push(gameId);
    }
    saveLocalProfile(profile);
    console.log(`[Oyun Tamamlandı] ${gameId} | Yeni XP: ${profile.xp}`);

    // Update Firestore
    try {
        const docId = profile.codename.toLowerCase();
        updateDoc(doc(db, 'profiles', docId), {
            completedGames: arrayUnion(gameId),
            xp: increment(score)
        }).catch(err => console.warn('[Firestore] İlerleme senkronizasyonu:', err?.message));
    } catch (err) {}
};

export const loginWithCodename = async (codename) => {
    const cleanName = codename.trim();
    const docId = cleanName.toLowerCase();

    // 1. Fast check in local storage accounts
    const localAccounts = getAllLocalAccounts();
    const localMatch = localAccounts.find(a => a.codename?.toLowerCase() === docId);
    if (localMatch) {
        saveLocalProfile(localMatch);
        console.log('[Auth] Yerel hesap yüklendi:', localMatch.codename);
        return localMatch;
    }

    // 2. Query Firebase Firestore
    try {
        const snap = await withTimeout(getDoc(doc(db, 'profiles', docId)), 2000);
        if (snap.exists()) {
            const data = snap.data();
            saveLocalProfile(data);
            console.log('[Firestore] Uzak profil başarıyla yüklendi:', data.codename);
            return data;
        }
    } catch (err) {
        console.warn('[Firestore] Giriş hatası veya zaman aşımı:', err?.message);
    }

    return null;
};

// Default Academy Champions for leaderboard
const DEFAULT_ACADEMY_LEADERS = [
    { codename: 'DenizMuhafızı', xp: 1450, level: 5 },
    { codename: 'SiberKalkan', xp: 1200, level: 4 },
    { codename: 'OkyanusCasusu', xp: 950, level: 3 },
    { codename: 'DerinAğ', xp: 800, level: 3 },
    { codename: 'SiberMercan', xp: 650, level: 2 },
    { codename: 'BalıkDedektif', xp: 500, level: 2 },
    { codename: 'KriptoYunus', xp: 350, level: 1 }
];

export const getLeaderboard = async () => {
    // 1. Query Firestore for top 10 profiles by XP
    try {
        const q = query(collection(db, 'profiles'), orderBy('xp', 'desc'), limit(10));
        const snap = await withTimeout(getDocs(q), 1800);
        if (!snap.empty) {
            const remoteLeaders = snap.docs.map(d => d.data());
            if (remoteLeaders.length >= 5) {
                return remoteLeaders;
            }
            // If few remote profiles, merge with default champions
            const merged = new Map();
            DEFAULT_ACADEMY_LEADERS.forEach(l => merged.set(l.codename.toLowerCase(), l));
            remoteLeaders.forEach(r => merged.set(r.codename.toLowerCase(), r));
            return Array.from(merged.values()).sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 10);
        }
    } catch (e) {
        console.log('[Leaderboard] Firestore okuma zaman aşımı, yerel lider tablosuna dönüldü.');
    }

    // 2. Fallback: Build local & simulated leaderboard instantly
    const localAccounts = getAllLocalAccounts();
    const current = getLocalProfile();

    const mergedMap = new Map();
    DEFAULT_ACADEMY_LEADERS.forEach(l => mergedMap.set(l.codename.toLowerCase(), { ...l }));
    localAccounts.forEach(a => {
        if (a && a.codename) {
            mergedMap.set(a.codename.toLowerCase(), { codename: a.codename, xp: a.xp || 0, level: a.level || 1 });
        }
    });
    if (current && current.codename) {
        mergedMap.set(current.codename.toLowerCase(), { codename: current.codename, xp: current.xp || 0, level: current.level || 1 });
    }

    return Array.from(mergedMap.values()).sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 10);
};

export const updateMetaData = (metaData) => {
    const profile = getLocalProfile();
    if (!profile) return;
    profile.metaData = { ...profile.metaData, ...metaData };
    saveLocalProfile(profile);
    localStorage.setItem('caq_fish_pref', JSON.stringify(profile.metaData));

    try {
        const docId = profile.codename.toLowerCase();
        updateDoc(doc(db, 'profiles', docId), {
            metaData: profile.metaData
        }).catch(console.warn);
    } catch (e) {}
};
