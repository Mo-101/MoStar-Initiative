-- SQL setup script for MoStar Payout API Neon PostgreSQL database

-- Create wallet registry table
CREATE TABLE IF NOT EXISTS wallets (
    wallet TEXT PRIMARY KEY
);

-- Create operations log table
CREATE TABLE IF NOT EXISTS ops_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP,
    action TEXT,
    wallet TEXT,
    amount NUMERIC,
    tx_hash TEXT
);
