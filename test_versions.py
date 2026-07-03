import os
import requests
from dotenv import load_dotenv

load_dotenv(r"d:\3Monster\admin-dashboard\.env")

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

res = requests.get(f"{url}/rest/v1/app_versions?product_id=eq.NPlace-DB&order=version.desc&limit=1", headers=headers)
print(res.status_code)
print(res.text)
