-- Create shitsumon_contents table
CREATE TABLE shitsumon_contents (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  type TEXT,
  creatorId TEXT,
  creatorName TEXT,
  isPublic BOOLEAN,
  coverImageUrl TEXT,
  scoringAttributes JSONB,
  questions JSONB,
  results JSONB,
  gimmicks JSONB,
  themeColorMode TEXT,
  customColor TEXT,
  aiPromptRaw TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create shitsumon_user_profiles table
CREATE TABLE shitsumon_user_profiles (
  user_id TEXT PRIMARY KEY,
  play_history JSONB
);

-- Create shitsumon_play_logs table
CREATE TABLE shitsumon_play_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT,
  creator_x_handle TEXT,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT,
  data JSONB
);

-- Enable RLS (Row Level Security) but allow anonymous access for MVP
ALTER TABLE shitsumon_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shitsumon_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shitsumon_play_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access to all public contents
CREATE POLICY "Allow public read access for contents" ON shitsumon_contents
  FOR SELECT USING (true);

-- Allow all insert/update for now to allow anonymous and authenticated usage
CREATE POLICY "Allow all inserts for contents" ON shitsumon_contents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates for contents" ON shitsumon_contents FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes for contents" ON shitsumon_contents FOR DELETE USING (true);

CREATE POLICY "Allow all access to user_profiles" ON shitsumon_user_profiles FOR ALL USING (true);
CREATE POLICY "Allow all access to play_logs" ON shitsumon_play_logs FOR ALL USING (true);
