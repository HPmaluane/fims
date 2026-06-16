-- ============================================================
-- FIMS - Facility Inspection Management System
-- Database Schema (PostgreSQL)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUMS ──────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'ceo', 'supervisor', 'inspector');
CREATE TYPE inspection_status AS ENUM ('pending', 'in_progress', 'submitted', 'reviewed', 'closed');
CREATE TYPE alert_level AS ENUM ('ok', 'warning', 'critical');

-- ─── USERS ──────────────────────────────────────────────────
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        user_role NOT NULL DEFAULT 'inspector',
  avatar      VARCHAR(10),
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── REFRESH TOKENS ─────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(512) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── LOCATIONS ──────────────────────────────────────────────
CREATE TABLE locations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(200) NOT NULL,
  address       VARCHAR(400),
  supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TEMPLATE SECTIONS ──────────────────────────────────────
CREATE TABLE template_sections (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code       VARCHAR(50) NOT NULL UNIQUE,
  name       VARCHAR(200) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT true
);

-- ─── TEMPLATE ITEMS ─────────────────────────────────────────
CREATE TABLE template_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID NOT NULL REFERENCES template_sections(id) ON DELETE CASCADE,
  code        VARCHAR(50) NOT NULL UNIQUE,
  text        TEXT NOT NULL,
  max_score   INTEGER NOT NULL DEFAULT 5,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true
);

-- ─── INSPECTIONS ────────────────────────────────────────────
CREATE TABLE inspections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  inspector_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  supervisor_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  status          inspection_status NOT NULL DEFAULT 'pending',
  score_pct       NUMERIC(5,2),
  alert_level     alert_level NOT NULL DEFAULT 'ok',
  notes           TEXT,
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  submitted_at    TIMESTAMPTZ,
  reviewed_at     TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INSPECTION ITEMS ───────────────────────────────────────
CREATE TABLE inspection_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id     UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  template_item_id  UUID NOT NULL REFERENCES template_items(id) ON DELETE RESTRICT,
  section_id        UUID NOT NULL REFERENCES template_sections(id) ON DELETE RESTRICT,
  score             INTEGER CHECK (score >= 0 AND score <= 5),
  comment           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (inspection_id, template_item_id)
);

-- ─── AUDIT LOGS ─────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name   VARCHAR(120),
  action      VARCHAR(100) NOT NULL,
  detail      TEXT,
  entity_type VARCHAR(50),
  entity_id   UUID,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX idx_inspections_location   ON inspections(location_id);
CREATE INDEX idx_inspections_inspector  ON inspections(inspector_id);
CREATE INDEX idx_inspections_status     ON inspections(status);
CREATE INDEX idx_inspections_date       ON inspections(inspection_date);
CREATE INDEX idx_inspection_items_insp  ON inspection_items(inspection_id);
CREATE INDEX idx_audit_logs_user        ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created     ON audit_logs(created_at DESC);
CREATE INDEX idx_refresh_tokens_user    ON refresh_tokens(user_id);

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated       BEFORE UPDATE ON users           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_locations_updated   BEFORE UPDATE ON locations        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_inspections_updated BEFORE UPDATE ON inspections      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_insp_items_updated  BEFORE UPDATE ON inspection_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
