-- Up
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration INTEGER,
  status VARCHAR(50) DEFAULT 'completed',
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_company_id ON activities(company_id);
CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_activities_activity_date ON activities(activity_date);
CREATE INDEX idx_activities_metadata ON activities USING gin(metadata);

-- Create trigger for updated_at
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Down
DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
DROP INDEX IF EXISTS idx_activities_metadata;
DROP INDEX IF EXISTS idx_activities_activity_date;
DROP INDEX IF EXISTS idx_activities_deal_id;
DROP INDEX IF EXISTS idx_activities_contact_id;
DROP INDEX IF EXISTS idx_activities_company_id;
DROP INDEX IF EXISTS idx_activities_user_id;
DROP INDEX IF EXISTS idx_activities_type;
DROP TABLE IF EXISTS activities;
