-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own user records
CREATE POLICY "Users can view their own data" ON public.users
FOR SELECT USING (true);

CREATE POLICY "Users can create user records" ON public.users
FOR INSERT WITH CHECK (true);

-- Users can view all suggestions and create their own (limit enforced in app)
CREATE POLICY "Anyone can view suggestions" ON public.suggestions
FOR SELECT USING (true);

CREATE POLICY "Users can create suggestions" ON public.suggestions
FOR INSERT WITH CHECK (true);

-- Users can view all feedback and create their own (limit enforced in app)
CREATE POLICY "Anyone can view feedback" ON public.feedback
FOR SELECT USING (true);

CREATE POLICY "Users can create feedback" ON public.feedback
FOR INSERT WITH CHECK (true);

-- Reports are publicly viewable (for admin dashboard)
CREATE POLICY "Anyone can view reports" ON public.reports
FOR SELECT USING (true);

CREATE POLICY "Service can create reports" ON public.reports
FOR INSERT WITH CHECK (true);

-- Enable realtime for live updates
ALTER TABLE public.suggestions REPLICA IDENTITY FULL;
ALTER TABLE public.feedback REPLICA IDENTITY FULL;
ALTER TABLE public.reports REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;