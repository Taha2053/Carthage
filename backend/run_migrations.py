"""
Run SQL migrations against Supabase.
Usage: uv run python run_migrations.py
"""
import asyncio
import os
import sys
from pathlib import Path

import asyncpg
from dotenv import load_dotenv

load_dotenv()


async def run():
    # Get DB URL — convert from SQLAlchemy format to raw asyncpg format
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        print("ERROR: DATABASE_URL not set in .env")
        sys.exit(1)

    # Strip the sqlalchemy prefix if present
    raw_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

    print(f"Connecting to: {raw_url[:40]}...")

    try:
        conn = await asyncpg.connect(raw_url)
    except Exception as e:
        print(f"ERROR: Could not connect to database: {e}")
        sys.exit(1)

    # Find and run migration files in order
    migrations_dir = Path(__file__).parent / "migrations"
    if not migrations_dir.exists():
        print("ERROR: migrations/ directory not found")
        sys.exit(1)

    sql_files = sorted(migrations_dir.glob("*.sql"))
    if not sql_files:
        print("No migration files found.")
        sys.exit(0)

    for sql_file in sql_files:
        print(f"\nRunning: {sql_file.name}")
        print("-" * 50)

        sql = sql_file.read_text(encoding="utf-8")
        try:
            await conn.execute(sql)
            print(f"OK: {sql_file.name}")
        except Exception as e:
            print(f"ERROR in {sql_file.name}: {e}")

    await conn.close()
    print("\nDone! All migrations executed.")


if __name__ == "__main__":
    asyncio.run(run())
