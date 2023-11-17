# Generate a random API key
import secrets

api_key = secrets.token_urlsafe(32)
print(api_key)
