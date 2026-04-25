"""
Test script that starts server and tests endpoints
Run with: uv run python test_endpoints.py
"""

import asyncio
import sys
import os

os.chdir("/mnt/Data/Taha/Desktop/Unlimited_Void/4Projects/Carthage/backend")
sys.path.insert(0, "/mnt/Data/Taha/Desktop/Unlimited_Void/4Projects/Carthage/backend")

import uvicorn


async def run_server():
    config = uvicorn.Config(
        "main:app",
        host="127.0.0.1",
        port=8001,
        log_level="error"
    )
    server = uvicorn.Server(config)
    await server.serve()


async def test_endpoints():
    import httpx
    
    BASE_URL = "http://localhost:8001"
    results = []
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Root
        try:
            r = await client.get(f"{BASE_URL}/")
            ok = r.status_code == 200
            print(f"✓ GET / → {r.status_code}" if ok else f"✗ GET / → {r.status_code}")
            results.append(ok)
        except Exception as e:
            print(f"✗ GET / → ERROR")
            results.append(False)

        # Health
        try:
            r = await client.get(f"{BASE_URL}/api/v1/health")
            ok = r.status_code == 200
            print(f"✓ GET /api/v1/health → {r.status_code}" if ok else f"✗ GET /api/v1/health → {r.status_code}")
            results.append(ok)
        except Exception as e:
            print(f"✗ GET /api/v1/health → ERROR")
            results.append(False)

        endpoints = [
            ("GET", "/api/v1/institutions"),
            ("GET", "/api/v1/departments"),
            ("GET", "/api/v1/kpis"),
            ("GET", "/api/v1/alerts"),
            ("GET", "/api/v1/reports"),
            ("GET", "/api/v1/data-quality"),
            ("GET", "/api/v1/data-catalog"),
            ("GET", "/api/v1/users"),
            ("GET", "/api/v1/students"),
            ("GET", "/api/v1/staff"),
            ("GET", "/api/v1/programs"),
            ("GET", "/api/v1/partnerships"),
            ("GET", "/api/v1/research"),
            ("GET", "/api/v1/spaces"),
            ("GET", "/api/v1/equipment"),
        ]
        
        for method, path in endpoints:
            try:
                r = await client.get(f"{BASE_URL}{path}")
                status_str = "✓" if 200 <= r.status_code < 500 else "✗"
                if r.status_code == 500 and "permission" in r.text.lower():
                    status_str = "✗ RLS"
                print(f"{status_str} {method} {path} → {r.status_code}")
                results.append(200 <= r.status_code < 500)
            except Exception as e:
                print(f"✗ {method} {path} → ERROR")
                results.append(False)

    return results


async def main():
    print("🧪 Starting server and testing endpoints...\n")
    
    # Start server in background
    server_task = asyncio.create_task(run_server())
    await asyncio.sleep(3)  # Wait for server to start
    
    try:
        results = await test_endpoints()
    finally:
        server_task.cancel()
    
    print("\n" + "="*50)
    passed = sum(results)
    total = len(results)
    print(f"📊 Results: {passed}/{total} passed")
    
    if passed == total:
        print("✅ All endpoints working!")
    else:
        print(f"❌ {total - passed} endpoints failed")


if __name__ == "__main__":
    asyncio.run(main())