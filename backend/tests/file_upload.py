import requests

url = 'http://127.0.0.1:8000/upload'
file = {'file': open('data/101.pdf', 'rb')}
resp = requests.post(url=url, files=file) 
print(resp.json())