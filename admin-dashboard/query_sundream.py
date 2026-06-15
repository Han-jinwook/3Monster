import urllib.request
import json

url = "https://suwinftalfgybvrnzruz.supabase.co/rest/v1/users?email=eq.sundream7878@gmail.com"
headers = {
    'apikey': 'sb_publishable_jUwQ1BWvG6F2H9GyELUoFw_mUOHbgWD',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1d2luZnRhbGZneWJ2cm56cnV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjMwNDc5MSwiZXhwIjoyMDkxODgwNzkxfQ.ia2me-61DP850haxs97elWReiCuSGcf773xegIaaF64'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        print(f"Users found: {len(data)}")
        for u in data:
            print(f"Email: {u['email']}, Role: {u['role']}, UID: {u['uid']}")
except Exception as e:
    print('Error:', e)
