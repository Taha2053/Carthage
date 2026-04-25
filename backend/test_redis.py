import os
import asyncio
from dotenv import load_dotenv
import redis.asyncio as aioredis

async def test_redis_connection():
    load_dotenv()
    
    redis_url = os.environ.get("REDIS_URL")
    
    if not redis_url:
        print("[FAIL] Missing REDIS_URL in .env")
        return
        
    print(f"Connecting to Redis at: {redis_url.split('@')[-1] if '@' in redis_url else 'localhost'}")
    
    try:
        # Initialize connection
        r = aioredis.from_url(redis_url, decode_responses=True)
        
        # Test connection with a PING
        pong = await r.ping()
        
        if pong:
            print("[SUCCESS] Successfully connected to Redis! (Received PONG)")
            
            # Test a quick read/write
            await r.set("ucar:test_key", "Hello from backend!")
            val = await r.get("ucar:test_key")
            print(f"Test cache write/read: {val}")
            
            # Clean up
            await r.delete("ucar:test_key")
        else:
            print("[FAIL] Connected, but did not receive PONG.")
            
        await r.close()
            
    except Exception as e:
        print(f"[FAIL] Exception occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_redis_connection())
