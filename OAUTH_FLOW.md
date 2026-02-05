# OAuth2 Flow Documentation

This document explains the two-stage OAuth2 flow used in the One-Prompt Google Form Creator.

## Overview

The application uses OAuth2 to allow users to create Google Forms in their own accounts. This requires obtaining user consent and securely managing access tokens.

## Flow Diagram

```
┌─────────┐                ┌──────────┐                ┌─────────┐                ┌────────────┐
│  User   │                │ Frontend │                │ Backend │                │   Google   │
└────┬────┘                └────┬─────┘                └────┬────┘                └─────┬──────┘
     │                          │                           │                           │
     │  1. Click "Sign In"      │                           │                           │
     ├─────────────────────────>│                           │                           │
     │                          │                           │                           │
     │                          │  2. GET /api/auth/login   │                           │
     │                          ├──────────────────────────>│                           │
     │                          │                           │                           │
     │                          │  3. Return OAuth URL      │                           │
     │                          │<──────────────────────────┤                           │
     │                          │                           │                           │
     │  4. Redirect to Google   │                           │                           │
     │<─────────────────────────┤                           │                           │
     │                          │                           │                           │
     │  5. Authorize App        │                           │                           │
     ├──────────────────────────┴───────────────────────────┴──────────────────────────>│
     │                                                                                   │
     │  6. Redirect with code                                                           │
     │<──────────────────────────────────────────────────────────────────────────────────┤
     │                          │                           │                           │
     │                          │                           │  7. Exchange code         │
     │                          │                           ├──────────────────────────>│
     │                          │                           │                           │
     │                          │                           │  8. Return tokens         │
     │                          │                           │<──────────────────────────┤
     │                          │                           │                           │
     │                          │                           │  9. Store encrypted       │
     │                          │                           │     tokens in MongoDB     │
     │                          │                           ├─────────┐                 │
     │                          │                           │         │                 │
     │                          │                           │<────────┘                 │
     │                          │                           │                           │
     │                          │  10. Set session cookie   │                           │
     │                          │     & redirect to /       │                           │
     │<─────────────────────────┴───────────────────────────┤                           │
     │                          │                           │                           │
```

## Stage 1: Generate OAuth URL

### Endpoint
`GET /api/auth/login`

### Process

1. **Frontend** calls the endpoint
2. **Backend** generates OAuth URL with:
   - Client ID and Secret
   - Redirect URI: `http://localhost:8000/api/auth/callback`
   - Scopes:
     - `https://www.googleapis.com/auth/forms.body` (create/edit forms)
     - `https://www.googleapis.com/auth/drive.file` (manage created files)
     - `https://www.googleapis.com/auth/userinfo.email` (get user email)
   - State parameter (CSRF protection)
   - `access_type=offline` (to get refresh token)
   - `prompt=consent` (force consent screen)

3. **Frontend** redirects user to the OAuth URL

### Code Reference
[backend/services/auth_service.py](backend/services/auth_service.py) - `get_auth_url()`

## Stage 2: Handle Callback

### Endpoint
`GET /api/auth/callback?code=...&state=...`

### Process

1. **Google** redirects user back with authorization code
2. **Backend** receives the code
3. **Verify state** parameter (CSRF protection)
4. **Exchange code for tokens**:
   - Access token (short-lived, ~1 hour)
   - Refresh token (long-lived, used to get new access tokens)
5. **Get user info** using access token to retrieve email
6. **Encrypt tokens** using Fernet (AES-128) with SECRET_KEY
7. **Store in MongoDB**:
   ```json
   {
     "user_email": "user@example.com",
     "access_token": "encrypted_token",
     "refresh_token": "encrypted_token",
     "token_expiry": "2024-02-04T14:00:00Z",
     "created_at": "2024-02-04T13:00:00Z"
   }
   ```
8. **Create session**:
   ```json
   {
     "session_id": "random_secure_token",
     "user_email": "user@example.com",
     "created_at": "2024-02-04T13:00:00Z",
     "expires_at": "2024-02-05T13:00:00Z"
   }
   ```
9. **Set HTTP-only cookie** with session ID
10. **Redirect to frontend** (`http://localhost:3000`)

### Code Reference
[backend/services/auth_service.py](backend/services/auth_service.py) - `handle_callback()`

## Token Storage

### Encryption

Tokens are encrypted before storage using Fernet symmetric encryption:

```python
from cryptography.fernet import Fernet
import hashlib
import base64

# Derive encryption key from SECRET_KEY
key = base64.urlsafe_b64encode(hashlib.sha256(SECRET_KEY.encode()).digest())
cipher = Fernet(key)

# Encrypt
encrypted_token = cipher.encrypt(token.encode()).decode()

# Decrypt
token = cipher.decrypt(encrypted_token.encode()).decode()
```

### MongoDB Collections

**oauth_tokens**:
- `user_email`: User's email (unique index)
- `access_token`: Encrypted access token
- `refresh_token`: Encrypted refresh token
- `token_expiry`: When access token expires
- `created_at`: Timestamp

**sessions**:
- `session_id`: Random secure token (unique index)
- `user_email`: User's email
- `created_at`: Timestamp
- `expires_at`: Session expiry (24 hours)

## Token Refresh

When making API calls, the backend checks if the access token is expired:

```python
if token_data["token_expiry"] < datetime.utcnow():
    # Token expired, refresh it
    refresh_token = decrypt_token(token_data["refresh_token"])
    new_token_data = refresh_access_token(refresh_token)
    
    # Update stored token
    store_oauth_token(user_email, new_token_data["access_token"], ...)
```

This happens automatically in the `/api/generate` endpoint.

### Code Reference
[backend/routes/generate.py](backend/routes/generate.py) - Token refresh logic

## Security Considerations

### 1. CSRF Protection
- State parameter is generated and verified
- Prevents cross-site request forgery attacks

### 2. Token Encryption
- All tokens encrypted at rest
- Uses SECRET_KEY from environment
- Fernet provides authenticated encryption

### 3. HTTP-Only Cookies
- Session cookie is HTTP-only
- Cannot be accessed by JavaScript
- Prevents XSS attacks

### 4. Secure Scopes
- Only request necessary scopes
- `forms.body` - create/edit forms
- `drive.file` - only files created by app
- `userinfo.email` - identify user

### 5. Token Expiry
- Access tokens expire after 1 hour
- Sessions expire after 24 hours
- Automatic refresh when needed

## Logout Flow

1. User clicks logout
2. Frontend calls `POST /api/auth/logout`
3. Backend:
   - Deletes OAuth tokens from MongoDB
   - Deletes session from MongoDB
   - Clears session cookie
4. User is logged out

## Testing OAuth Flow

### Manual Test

1. Start backend: `python main.py`
2. Start frontend: `npm run dev`
3. Navigate to `http://localhost:3000`
4. Click "Sign in with Google"
5. Authorize the app
6. Verify redirect back to frontend
7. Check MongoDB for stored tokens and session

### Verify in MongoDB

```bash
mongosh

use google_forms_creator

# Check sessions
db.sessions.find().pretty()

# Check tokens (encrypted)
db.oauth_tokens.find().pretty()
```

## Troubleshooting

### Redirect URI Mismatch

**Error**: "redirect_uri_mismatch"

**Solution**: Ensure Google Cloud Console has exact redirect URI:
```
http://localhost:8000/api/auth/callback
```

### Invalid Grant

**Error**: "invalid_grant"

**Solution**: 
- Refresh token may be revoked
- User needs to re-authenticate
- Check token expiry logic

### Token Decryption Failed

**Error**: "Invalid token"

**Solution**:
- Verify SECRET_KEY hasn't changed
- Check token was encrypted with same key
- May need to re-authenticate users

## References

- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Forms API](https://developers.google.com/forms/api)
- [Cryptography (Fernet)](https://cryptography.io/en/latest/fernet/)
