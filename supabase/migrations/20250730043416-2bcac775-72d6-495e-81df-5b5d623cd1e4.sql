-- Truncate all data from tables (in correct order due to foreign key constraints)
TRUNCATE TABLE suggestions, feedback, reports, users CASCADE;

-- Add category field to feedback table
ALTER TABLE feedback ADD COLUMN category TEXT;

-- Add quiz settings table for admin controls
CREATE TABLE quiz_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default quiz settings
INSERT INTO quiz_settings (is_active) VALUES (FALSE);

-- Add quiz responses table
CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- Store array of selected answers
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on new tables
ALTER TABLE quiz_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for quiz_settings
CREATE POLICY "Anyone can view quiz settings" ON quiz_settings FOR SELECT USING (true);
CREATE POLICY "Service can update quiz settings" ON quiz_settings FOR UPDATE USING (true);

-- RLS policies for quiz_responses  
CREATE POLICY "Anyone can view quiz responses" ON quiz_responses FOR SELECT USING (true);
CREATE POLICY "Users can create quiz responses" ON quiz_responses FOR INSERT WITH CHECK (true);

-- Add to realtime publication
ALTER TABLE quiz_settings REPLICA IDENTITY FULL;
ALTER TABLE quiz_responses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_responses;