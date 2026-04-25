import httpx
import time

BASE_URL = "http://127.0.0.1:8000"

ENDPOINTS = [
    "/",
    "/api/v1/institutions",
    "/api/v1/departments",
    "/api/v1/students",
    "/api/v1/programs",
    "/api/v1/staff",
    "/api/v1/partnerships",
    "/api/v1/research",
    "/api/v1/spaces",
    "/api/v1/equipment",
    "/api/v1/alerts",
    "/api/v1/reports",
    "/api/v1/users",
    "/api/v1/data-catalog",
    "/api/v1/data-quality/scores",
    "/api/v1/data-quality/anomalies",
    "/api/v1/kpis",
    "/api/v1/kpis/success-rate",
    "/api/v1/kpis/dropout-rate",
    "/api/v1/kpis/attendance-rate",
    "/api/v1/kpis/budget-execution",
    "/api/v1/kpis/employability",
    "/api/v1/kpis/hr-summary",
    "/api/v1/kpis/network-comparison",
]

def test_endpoints():
    print(f"Testing endpoints on {BASE_URL}...\n")
    
    passed = 0
    failed = 0
    
    with httpx.Client(timeout=10.0) as client:
        for endpoint in ENDPOINTS:
            url = f"{BASE_URL}{endpoint}"
            
            try:
                start_time = time.time()
                response = client.get(url)
                duration = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    data = response.json()
                    item_count = len(data) if isinstance(data, list) else 1
                    status = f"[PASS] ({response.status_code})"
                    print(f"{status:<15} | {duration:6.0f}ms | Items: {item_count:<4} | {endpoint}")
                    passed += 1
                else:
                    status = f"[FAIL] ({response.status_code})"
                    print(f"{status:<15} | {duration:6.0f}ms | {endpoint}")
                    print(f"    Error: {response.text[:200]}")
                    failed += 1
                    
            except Exception as e:
                status = "[ERROR]"
                print(f"{status:<15} | {endpoint}")
                print(f"    Exception: {str(e)}")
                failed += 1
                
    print("\n" + "="*50)
    print(f"RESULTS: {passed} Passed, {failed} Failed")
    if failed == 0:
        print("[SUCCESS] ALL ENDPOINTS ARE WORKING PERFECTLY!")
    else:
        print("[WARNING] SOME ENDPOINTS NEED ATTENTION.")

if __name__ == "__main__":
    test_endpoints()
