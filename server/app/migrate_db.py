#!/usr/bin/env python3
"""
Standalone migration script to update database schema
Run this if you need to manually apply migrations
"""

from migrations import run_migrations

if __name__ == "__main__":
    print("Running database migrations...")
    run_migrations()
    print("Migrations completed!")