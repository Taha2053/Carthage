import os
import httpx
from dotenv import load_dotenv

def test_connection():
    load_dotenv()

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        print("[FAIL] Missing SUPABASE_URL or SUPABASE_KEY in .env")
        return

    print(f"Connecting to REST API at: {supabase_url}")
    
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
    }
    
    # ✅ FIXED: use the correct table name
    endpoint = f"{supabase_url}/rest/v1/dim_institution?select=*"
    
    try:
        response = httpx.get(endpoint, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print("[SUCCESS] Connection successful!")
            print(f"Rows fetched: {len(data)}")
            print(f"Sample data: {data[:2]}")  # first 2 rows
        else:
            print(f"[FAIL] Failed to query. Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"[FAIL] Exception occurred: {e}")

if __name__ == "__main__":
    test_connection()