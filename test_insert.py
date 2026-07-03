import os
import requests
from dotenv import load_dotenv

load_dotenv(r"d:\3Monster\admin-dashboard\.env")

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

payload = {
    "hwid": "TEST-HWID-12345",
    "status": "active"
}

res = requests.post(f"{url}/rest/v1/trial_logs", headers=headers, json=payload)
print(res.status_code)
print(res.text)
