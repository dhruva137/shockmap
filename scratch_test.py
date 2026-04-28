import urllib.request
try:
    with urllib.request.urlopen('http://127.0.0.1:8000/api/v1/energy/status') as response:
        print(response.read().decode('utf-8'))
except Exception as e:
    print(e)
