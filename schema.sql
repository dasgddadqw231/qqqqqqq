-- NAUD Social-Flow Enterprise Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for Platform Types
CREATE TYPE platform_type AS ENUM ('instagram', 'threads', 'youtube');
-- Enum for Job Types
CREATE TYPE job_type AS ENUM ('watch_reels', 'story_share', 'auto_reply', 'threads_dwell', 'threads_repost', 'youtube_watch', 'youtube_comment');
-- Enum for Job Status
CREATE TYPE job_status AS ENUM ('pending', 'running', 'success', 'failed');
-- Enum for Account Proxy Health
CREATE TYPE proxy_status AS ENUM ('active', 'failing', 'dead');

-- Proxies Table: Stores proxy information for AdsPower
CREATE TABLE proxies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip VARCHAR(45) NOT NULL,
    port INTEGER NOT NULL,
    username VARCHAR(255),
    password VARCHAR(255),
    status proxy_status DEFAULT 'active',
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts Table: Master table for all social media accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform platform_type NOT NULL,
    username VARCHAR(255) NOT NULL,
    adspower_id VARCHAR(100), -- The ID of the generic profile in AdsPower
    proxy_id UUID REFERENCES proxies(id) ON DELETE SET NULL,
    persona_context TEXT, -- Information about the account's persona/behavior to pass to Gemini
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs Table: Defines the work queue for the Behavior Engine
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    type job_type NOT NULL,
    status job_status DEFAULT 'pending',
    target_url TEXT, -- E.g., The URL of the YouTube video or Instagram Reel
    action_parameters JSONB, -- Additional data (e.g., watch duration ranges, reply context)
    ai_generated_content TEXT, -- Results from Gemini if applicable
    scheduled_timer TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Index for faster polling by the Behavior Engine
CREATE INDEX idx_jobs_status_scheduled ON jobs (status, scheduled_timer);
