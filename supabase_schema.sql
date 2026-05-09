-- Cyber Academy Quest - Supabase Schema
-- Database Host: aws-1-ap-northeast-1.pooler.supabase.com
-- Database User: postgres.otmyzalfbfgodtsegiey

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    codename TEXT UNIQUE NOT NULL,
    avatar_type TEXT CHECK (avatar_type IN ('male', 'female')),
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT
);

-- 3. User Badges Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id TEXT REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, badge_id)
);

-- 4. User Progress Table
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'started', -- 'started', 'completed'
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, game_id)
);

-- 5. Row Level Security (RLS) Policies

-- Profiles: Users can only read/update their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow public insert for profile creation" ON public.profiles FOR INSERT WITH CHECK (true);

-- Badges: Everyone can read
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view badges" ON public.badges FOR SELECT USING (true);

-- User Badges: Users can only see/insert their own
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn their own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Progress: Users can only see/upsert their own
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

-- Insert Initial Badges
INSERT INTO public.badges (id, name, description) VALUES
('email_expert', 'Email Expert', 'Completed the Secure Email Simulator'),
('privacy_pro', 'Privacy Pro', 'Completed the Social Privacy Configurator'),
('url_inspector', 'URL Inspector', 'Completed the Fake URL Surf Game'),
('phishing_hunter', 'Phishing Hunter', 'Completed the Phishing Inspection Puzzle'),
('password_warden', 'Password Warden', 'Completed the Password Fortress Defense'),
('social_engineer', 'Social Engineer', 'Completed the Social Engineering Dialogue Game'),
('firewall_guardian', 'Firewall Guardian', 'Completed the Malware Firewall Defense')
ON CONFLICT (id) DO NOTHING;
