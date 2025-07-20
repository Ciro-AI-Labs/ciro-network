-- Supabase Waitlist Table Setup
-- Run this in your Supabase SQL Editor

-- Create the waitlist table with enhanced analytics fields
CREATE TABLE IF NOT EXISTS waitlist (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  user_type TEXT NOT NULL,
  compute_type TEXT,
  looking_for TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  
  -- Enhanced Analytics Fields
  -- Geographical Information
  ip_address INET,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- User Behavior Analytics
  time_on_site_seconds INTEGER,
  page_views_count INTEGER DEFAULT 1,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Device and Browser Information
  user_agent TEXT,
  browser TEXT,
  browser_version TEXT,
  operating_system TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  screen_resolution TEXT,
  language TEXT,
  
  -- Session Information
  session_id TEXT,
  first_visit_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  
  -- Form Interaction Analytics
  form_start_time TIMESTAMP WITH TIME ZONE,
  form_completion_time TIMESTAMP WITH TIME ZONE,
  form_fill_duration_seconds INTEGER,
  form_abandoned_count INTEGER DEFAULT 0,
  
  -- Additional Context
  source_page TEXT,
  entry_point TEXT, -- 'homepage', 'pricing', 'docs', 'blog', etc.
  marketing_channel TEXT, -- 'organic', 'paid', 'social', 'email', 'direct'
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_country ON waitlist(country);
CREATE INDEX IF NOT EXISTS idx_waitlist_user_type ON waitlist(user_type);
CREATE INDEX IF NOT EXISTS idx_waitlist_utm_source ON waitlist(utm_source);
CREATE INDEX IF NOT EXISTS idx_waitlist_device_type ON waitlist(device_type);
CREATE INDEX IF NOT EXISTS idx_waitlist_marketing_channel ON waitlist(marketing_channel);

-- Enable Row Level Security (RLS)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert (for signups)
CREATE POLICY "Allow public insert" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows authenticated users to read all entries
-- (You can modify this based on your admin requirements)
CREATE POLICY "Allow authenticated read" ON waitlist
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to update entries
CREATE POLICY "Allow authenticated update" ON waitlist
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enhanced analytics view with new fields
CREATE OR REPLACE VIEW waitlist_analytics AS
SELECT 
  COUNT(*) as total_signups,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
  
  -- User type breakdown
  COUNT(CASE WHEN user_type = 'Developer' THEN 1 END) as developers,
  COUNT(CASE WHEN user_type = 'Artist/Creator' THEN 1 END) as artists,
  COUNT(CASE WHEN user_type = 'Studio/Agency' THEN 1 END) as studios,
  COUNT(CASE WHEN user_type = 'Compute Provider' THEN 1 END) as compute_providers,
  
  -- Geographical breakdown
  COUNT(CASE WHEN country IS NOT NULL THEN 1 END) as with_location,
  COUNT(DISTINCT country) as unique_countries,
  COUNT(DISTINCT city) as unique_cities,
  
  -- Device breakdown
  COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_users,
  COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_users,
  COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) as tablet_users,
  
  -- Marketing channel breakdown
  COUNT(CASE WHEN marketing_channel = 'organic' THEN 1 END) as organic_traffic,
  COUNT(CASE WHEN marketing_channel = 'paid' THEN 1 END) as paid_traffic,
  COUNT(CASE WHEN marketing_channel = 'social' THEN 1 END) as social_traffic,
  COUNT(CASE WHEN marketing_channel = 'email' THEN 1 END) as email_traffic,
  COUNT(CASE WHEN marketing_channel = 'direct' THEN 1 END) as direct_traffic,
  
  -- Engagement metrics
  AVG(time_on_site_seconds) as avg_time_on_site,
  AVG(page_views_count) as avg_page_views,
  AVG(form_fill_duration_seconds) as avg_form_fill_time,
  
  DATE_TRUNC('day', created_at) as signup_date
FROM waitlist
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY signup_date DESC;

-- Create a view for geographical analytics
CREATE OR REPLACE VIEW waitlist_geographical_analytics AS
SELECT 
  country,
  region,
  city,
  COUNT(*) as signup_count,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
  AVG(time_on_site_seconds) as avg_time_on_site,
  AVG(form_fill_duration_seconds) as avg_form_fill_time,
  COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_users,
  COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_users
FROM waitlist
WHERE country IS NOT NULL
GROUP BY country, region, city
ORDER BY signup_count DESC;

-- Create a view for marketing channel performance
CREATE OR REPLACE VIEW waitlist_marketing_analytics AS
SELECT 
  marketing_channel,
  utm_source,
  utm_medium,
  utm_campaign,
  COUNT(*) as signup_count,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
  AVG(time_on_site_seconds) as avg_time_on_site,
  AVG(page_views_count) as avg_page_views,
  AVG(form_fill_duration_seconds) as avg_form_fill_time,
  COUNT(CASE WHEN form_abandoned_count > 0 THEN 1 END) as abandoned_forms
FROM waitlist
WHERE marketing_channel IS NOT NULL
GROUP BY marketing_channel, utm_source, utm_medium, utm_campaign
ORDER BY signup_count DESC; 