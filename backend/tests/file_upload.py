import requests

url = 'http://127.0.0.1:8080/upload?email=user@example.com'
file = {'file': open('101.pdf', 'rb')}
resp = requests.post(url=url, files=file) 
print(resp.json())