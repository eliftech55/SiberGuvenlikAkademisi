import { supabase } from './supabase';

const PROFILE_KEY = 'cyber_academy_profile';

export const getLocalProfile = () => {
    const data = localStorage.getItem(PROFILE_KEY);
    const profile = data ? JSON.parse(data) : null;
    if (profile) {
        profile.badges = profile.badges || [];
        profile.completedGames = profile.completedGames || [];
        profile.xp = profile.xp || 0;
    }
    return profile;
};

export const saveLocalProfile = (profile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

/**
 * Creates a new student profile
 * @param {string} codename 
 * @param {string} avatarType 'male' | 'female'
 */
export const createProfile = async (codename, avatarType, metaData = {}) => {
    // Generate a temporary ID if offline or not logged in
    const tempId = crypto.randomUUID();
    const newProfile = {
        id: tempId,
        codename,
        avatar_type: avatarType,
        metaData,
        xp: 0,
        level: 1,
        offlineOnly: true
    };

    // Save locally first so user can at least play offline
    saveLocalProfile(newProfile);

    // Try to sync with Supabase if online
    try {
        const { data: { user }, error: authError } = await supabase.auth.signInAnonymously();
        
        if (authError) {
            console.error('Supabase Anonymous Sign-in Error:', authError.message, authError);
        }

        if (user && !authError) {

            // Note: We use 'male' as a fallback for avatar_type to avoid DB constraint errors
            // if the remote DB hasn't been updated to support 'fish'.
            const dbAvatarType = (avatarType === 'male' || avatarType === 'female') ? avatarType : 'male';
            
            const { data, error } = await supabase.from('profiles').insert([{
                id: user.id,
                codename,
                avatar_type: dbAvatarType
            }]).select().single();

            if (!error && data) {
                // If sync successful, update local profile with synced ID
                const syncedProfile = { 
                    ...newProfile, 
                    id: data.id, 
                    offlineOnly: false 
                };
                saveLocalProfile(syncedProfile);
                return syncedProfile;
            } else {
                console.warn('Supabase insert failed:', error);
            }
        }
    } catch (err) {
        console.warn('Supabase sync failed, staying in offline mode', err);
    }

    // Always return at least the local profile so the UI doesn't hang
    return newProfile;
};

export const checkCodenameUnique = async (codename) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('codename')
            .eq('codename', codename)
            .maybeSingle();
        
        return !data;
    } catch (e) {
        return true; // Assume true if offline
    }
};

export const awardBadge = async (badgeId) => {
    const profile = getLocalProfile();
    if (!profile) return;
    if (!profile.badges.includes(badgeId)) {
        profile.badges.push(badgeId);
        profile.xp += 100;
        saveLocalProfile(profile);
        try {
            // Direkt profil.id kullanarak rozeti kaydet
            await supabase.from('user_badges').insert([{ user_id: profile.id, badge_id: badgeId }]);
            await supabase.from('profiles').update({ xp: profile.xp }).eq('id', profile.id);
            console.log(`✅ Rozet kaydedildi: ${badgeId}`);
        } catch (err) { console.warn('Supabase badge sync failed', err); }
    }
};

export const completeGame = async (gameId, score) => {
    const profile = getLocalProfile();
    if (!profile) return;
    
    console.log(`--- Kayıt Başlatıldı: ${gameId} | Puan: ${score} ---`);
    
    profile.xp += score;
    
    if (!profile.completedGames.includes(gameId)) {
        profile.completedGames.push(gameId);
    }
    
    saveLocalProfile(profile);

    try {
        // 1. İlerlemeyi Kaydet (Artık direkt profil.id kullanıyoruz)
        await supabase.from('user_progress').upsert([{
            user_id: profile.id,
            game_id: gameId,
            score: score,
            status: 'completed',
            completed_at: new Date().toISOString()
        }]);
        
        // 2. Toplam XP'yi Güncelle
        const { error } = await supabase.from('profiles').update({ xp: profile.xp }).eq('id', profile.id);
        
        if (!error) {
            console.log("✅ Puan veri tabanına başarıyla işlendi!");
        } else {
            console.error("❌ Veri tabanı güncelleme hatası:", error);
        }
    } catch (err) { 
        console.warn('⚠️ Senkronizasyon hatası (Çevrimdışı olabilir):', err); 
    }
};

export const loginWithCodename = async (codename) => {
    console.log('--- Login Attempt: ' + codename + ' ---');
    try {
        // Ensure we have a session (even anonymous) so RLS allows the query
        await supabase.auth.signInAnonymously();
        
        // 1. Fetch basic profile
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .ilike('codename', codename)
            .maybeSingle();

        if (pError) {
            console.error('Profile fetch error:', pError);
            return null;
        }

        if (!profile) {
            console.warn('Profile not found in DB for codename:', codename);
            return null;
        }

        console.log('Found profile record:', profile);

        // 2. Fetch badges separately
        const { data: badges } = await supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', profile.id);

        // 3. Fetch progress separately
        const { data: progress } = await supabase
            .from('user_progress')
            .select('game_id, score')
            .eq('user_id', profile.id);

        const formattedProfile = {
            id: profile.id,
            codename: profile.codename,
            avatar_type: profile.avatar_type,
            xp: profile.xp || 0,
            level: profile.level || 1,
            badges: badges?.map(b => b.badge_id) || [],
            completedGames: progress?.map(p => p.game_id) || [],
            metaData: JSON.parse(localStorage.getItem('caq_fish_pref')) || profile.metaData || { color: 'blue', type: 'standard' }
        };

        console.log('Final formatted profile:', formattedProfile);
        saveLocalProfile(formattedProfile);
        return formattedProfile;

    } catch (err) {
        console.error('Login exception:', err);
        return null;
    }
};

export const getLeaderboard = async () => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('codename, xp, level')
            .order('xp', { ascending: false })
            .limit(10);
        return data || [];
    } catch (err) {
        return [];
    }
};

export const updateMetaData = (metaData) => {
    const profile = getLocalProfile();
    if (!profile) return;
    profile.metaData = { ...profile.metaData, ...metaData };
    saveLocalProfile(profile);
    
    // Save to a persistent key that survives logout
    localStorage.setItem('caq_fish_pref', JSON.stringify(profile.metaData));
};
