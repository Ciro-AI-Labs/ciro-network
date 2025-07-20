-- Partnership Inquiries and Compute Provider Applications
-- Additional tables to complement the existing waitlist functionality

-- Create partnership inquiries table
CREATE TABLE IF NOT EXISTS partnership_inquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  title TEXT,
  partnership_type TEXT NOT NULL CHECK (partnership_type IN ('strategic', 'technology', 'research', 'enterprise', 'investment', 'other')),
  organization_size TEXT CHECK (organization_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  project_description TEXT NOT NULL,
  expected_compute_needs TEXT,
  timeline TEXT,
  budget_range TEXT,
  technical_requirements TEXT,
  compliance_requirements TEXT,
  
  -- Contact and logistics
  phone TEXT,
  preferred_contact_method TEXT DEFAULT 'email',
  meeting_preference TEXT CHECK (meeting_preference IN ('virtual', 'in-person', 'either')),
  timezone TEXT,
  
  -- Analytics similar to waitlist
  ip_address INET,
  country TEXT,
  region TEXT,
  city TEXT,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'in-discussion', 'approved', 'rejected')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to TEXT,
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contact_at TIMESTAMP WITH TIME ZONE
);

-- Create compute provider applications table
CREATE TABLE IF NOT EXISTS compute_provider_applications (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  title TEXT,
  
  -- Technical capabilities
  compute_type TEXT[] NOT NULL, -- Array of compute types: ['gpu', 'cpu', 'tpu', 'quantum', 'edge']
  hardware_specs JSONB, -- Detailed hardware specifications
  total_capacity TEXT NOT NULL, -- e.g., "100 H100 GPUs", "50 CPU nodes"
  available_capacity TEXT,
  location TEXT NOT NULL,
  data_center_tier TEXT CHECK (data_center_tier IN ('tier-1', 'tier-2', 'tier-3', 'tier-4')),
  
  -- Network and infrastructure
  network_bandwidth TEXT,
  uptime_sla DECIMAL(5,3), -- e.g., 99.95
  security_certifications TEXT[], -- e.g., ['SOC2', 'ISO27001', 'FedRAMP']
  compliance_standards TEXT[], -- e.g., ['GDPR', 'HIPAA', 'PCI-DSS']
  
  -- Business information
  years_in_operation INTEGER,
  previous_clients TEXT,
  pricing_model TEXT CHECK (pricing_model IN ('hourly', 'monthly', 'yearly', 'spot', 'reserved', 'custom')),
  pricing_range TEXT,
  minimum_commitment TEXT,
  
  -- Technical integration
  api_capabilities TEXT[],
  container_support BOOLEAN DEFAULT false,
  kubernetes_support BOOLEAN DEFAULT false,
  docker_support BOOLEAN DEFAULT false,
  custom_image_support BOOLEAN DEFAULT false,
  
  -- Monitoring and management
  monitoring_tools TEXT[],
  management_interface TEXT,
  support_level TEXT CHECK (support_level IN ('basic', 'business', 'enterprise', '24x7')),
  
  -- Financial and legal
  insurance_coverage TEXT,
  liability_limits TEXT,
  contract_flexibility TEXT,
  payment_terms TEXT,
  
  -- Analytics
  ip_address INET,
  country TEXT,
  region TEXT,
  city TEXT,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Application status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under-review', 'technical-evaluation', 'approved', 'rejected', 'waitlisted')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to TEXT,
  internal_notes TEXT,
  technical_review_notes TEXT,
  onboarding_status TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contact_at TIMESTAMP WITH TIME ZONE,
  technical_review_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_partnership_inquiries_email ON partnership_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_partnership_inquiries_status ON partnership_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_partnership_inquiries_created_at ON partnership_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partnership_inquiries_partnership_type ON partnership_inquiries(partnership_type);
CREATE INDEX IF NOT EXISTS idx_partnership_inquiries_priority ON partnership_inquiries(priority);

CREATE INDEX IF NOT EXISTS idx_compute_provider_applications_email ON compute_provider_applications(email);
CREATE INDEX IF NOT EXISTS idx_compute_provider_applications_status ON compute_provider_applications(status);
CREATE INDEX IF NOT EXISTS idx_compute_provider_applications_created_at ON compute_provider_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compute_provider_applications_compute_type ON compute_provider_applications USING GIN(compute_type);
CREATE INDEX IF NOT EXISTS idx_compute_provider_applications_location ON compute_provider_applications(location);
CREATE INDEX IF NOT EXISTS idx_compute_provider_applications_priority ON compute_provider_applications(priority);

-- Enable Row Level Security
ALTER TABLE partnership_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE compute_provider_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for partnership inquiries
CREATE POLICY "Allow public insert partnership_inquiries" ON partnership_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read partnership_inquiries" ON partnership_inquiries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update partnership_inquiries" ON partnership_inquiries
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for compute provider applications
CREATE POLICY "Allow public insert compute_provider_applications" ON compute_provider_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read compute_provider_applications" ON compute_provider_applications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update compute_provider_applications" ON compute_provider_applications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_partnership_inquiries_updated_at
  BEFORE UPDATE ON partnership_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compute_provider_applications_updated_at
  BEFORE UPDATE ON compute_provider_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Analytics views
CREATE OR REPLACE VIEW partnership_inquiries_analytics AS
SELECT 
  COUNT(*) as total_inquiries,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed_count,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
  
  -- Partnership type breakdown
  COUNT(CASE WHEN partnership_type = 'strategic' THEN 1 END) as strategic_partnerships,
  COUNT(CASE WHEN partnership_type = 'technology' THEN 1 END) as technology_partnerships,
  COUNT(CASE WHEN partnership_type = 'research' THEN 1 END) as research_partnerships,
  COUNT(CASE WHEN partnership_type = 'enterprise' THEN 1 END) as enterprise_partnerships,
  COUNT(CASE WHEN partnership_type = 'investment' THEN 1 END) as investment_partnerships,
  
  -- Organization size breakdown
  COUNT(CASE WHEN organization_size = 'startup' THEN 1 END) as startup_inquiries,
  COUNT(CASE WHEN organization_size = 'enterprise' THEN 1 END) as enterprise_inquiries,
  
  DATE_TRUNC('day', created_at) as inquiry_date
FROM partnership_inquiries
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY inquiry_date DESC;

CREATE OR REPLACE VIEW compute_provider_analytics AS
SELECT 
  COUNT(*) as total_applications,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
  
  -- Compute type distribution (unnest array for counting)
  COUNT(CASE WHEN 'gpu' = ANY(compute_type) THEN 1 END) as gpu_providers,
  COUNT(CASE WHEN 'cpu' = ANY(compute_type) THEN 1 END) as cpu_providers,
  COUNT(CASE WHEN 'tpu' = ANY(compute_type) THEN 1 END) as tpu_providers,
  COUNT(CASE WHEN 'quantum' = ANY(compute_type) THEN 1 END) as quantum_providers,
  COUNT(CASE WHEN 'edge' = ANY(compute_type) THEN 1 END) as edge_providers,
  
  -- Geographic distribution
  COUNT(DISTINCT country) as unique_countries,
  
  -- Data center tier distribution
  COUNT(CASE WHEN data_center_tier = 'tier-1' THEN 1 END) as tier1_providers,
  COUNT(CASE WHEN data_center_tier = 'tier-2' THEN 1 END) as tier2_providers,
  COUNT(CASE WHEN data_center_tier = 'tier-3' THEN 1 END) as tier3_providers,
  
  DATE_TRUNC('day', created_at) as application_date
FROM compute_provider_applications
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY application_date DESC; 