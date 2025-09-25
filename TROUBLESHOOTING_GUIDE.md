# Comprehensive Troubleshooting Guide

## 🚨 SSL Protocol Error Fix

### Problem
React app tries to call `https://localhost:8000` but Django only supports HTTP, causing `net::ERR_SSL_PROTOCOL_ERROR`.

### Solution Implemented
1. **Centralized Axios Configuration**: All API calls now use a single configured instance
2. **Environment Variables**: API URL is configurable via `.env` file
3. **HTTP Enforcement**: Explicitly configured to use HTTP in development
4. **Enhanced Error Handling**: Better error messages for SSL and connection issues

### Verification Steps
```bash
# 1. Check environment variables
cat frontend/.env

# 2. Test API connectivity
curl http://localhost:8000/api/health/

# 3. Run frontend diagnostics (in browser console)
apiDebugger.runDiagnostics()
```

## 🔧 Backend Configuration Checklist

### Django Settings Verification

#### 1. CORS Configuration
```python
# In settings.py - ensure these are set correctly:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # React dev server
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Only in development
```

#### 2. Security Settings for Development
```python
# Disable HTTPS enforcement in development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False if DEBUG else True
CSRF_COOKIE_SECURE = False if DEBUG else True
SECURE_HSTS_SECONDS = 0 if DEBUG else 31536000
```

#### 3. URL Routing Check
```python
# Verify URL patterns in facility_management/urls.py
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),  # Health check endpoint
    path('api/auth/', include('accounts.urls')),
    path('api/facilities/', include('facilities.urls')),
    path('api/permissions/', include('permissions.urls')),
]
```

### Common Backend Issues & Solutions

#### Issue 1: CORS Errors
**Symptoms**: `Access-Control-Allow-Origin` errors in browser console
**Solution**: 
```bash
# Install django-cors-headers if not installed
pip install django-cors-headers

# Verify it's in INSTALLED_APPS and MIDDLEWARE
```

#### Issue 2: Authentication Errors
**Symptoms**: 401 Unauthorized, token refresh failures
**Solution**:
```python
# Check JWT settings in settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

#### Issue 3: Database Connection Issues
**Symptoms**: `OperationalError`, database connection refused
**Solution**:
```bash
# Check database status
python manage.py dbshell

# Run migrations if needed
python manage.py migrate

# Create superuser if needed
python manage.py createsuperuser
```

## 🧹 Project Cleanup Recommendations

### Files to Remove
```bash
# Remove Python cache files
find . -name "__pycache__" -type d -exec rm -rf {} +
find . -name "*.pyc" -delete

# Remove Node.js cache
rm -rf frontend/node_modules/.cache
rm -rf frontend/dist

# Remove IDE files (if not needed)
rm -rf .vscode
rm -rf .idea
```

### Files to Keep
- All source code files (`.py`, `.tsx`, `.ts`)
- Configuration files (`.env`, `settings.py`, `package.json`)
- Documentation files (`.md`)
- Migration files (`migrations/*.py`)

### Workspace Hygiene Best Practices
1. **Use .gitignore**: Exclude cache files, build artifacts, and sensitive data
2. **Environment Files**: Keep `.env.example` but exclude actual `.env` files
3. **Regular Cleanup**: Run cleanup commands weekly
4. **Dependency Management**: Regularly update and audit dependencies

## 🔍 Debugging Django REST APIs

### 1. Enable Debug Logging
```python
# Add to settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

### 2. Test API Endpoints Manually
```bash
# Test health endpoint
curl -X GET http://localhost:8000/api/health/

# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@facility.com","password":"SecureAdmin123!"}'

# Test with authentication
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Common Django Issues

#### Middleware Order
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]
```

#### URL Patterns
```python
# Ensure API URLs are properly namespaced
urlpatterns = [
    path('api/auth/', include('accounts.urls')),  # Not just 'auth/'
    path('api/facilities/', include('facilities.urls')),
]
```

## 🚀 Development Startup Checklist

### Backend Startup
```bash
cd backend

# 1. Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows

# 2. Install/update dependencies
pip install -r requirements.txt

# 3. Run migrations
python manage.py migrate

# 4. Create admin user (if needed)
python manage.py create_sample_users

# 5. Start development server
python manage.py runserver 0.0.0.0:8000
```

### Frontend Startup
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Check environment variables
cat .env

# 3. Start development server
npm run dev

# 4. Open browser and check console for API status
```

## 🔧 Advanced Debugging

### Browser Console Commands
```javascript
// Check API configuration
apiDebugger.runDiagnostics()

// Test specific endpoint
apiDebugger.testEndpoint('/api/health/')

// Monitor API calls
const stopMonitoring = apiDebugger.startApiMonitoring()
// ... make some API calls ...
stopMonitoring()

// Check authentication state
console.log('Auth state:', {
  isAuthenticated: localStorage.getItem('access_token') !== null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  tokens: {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token')
  }
})
```

### Django Shell Debugging
```python
# Start Django shell
python manage.py shell

# Test user authentication
from accounts.models import User
from django.contrib.auth import authenticate

user = authenticate(username='admin', password='SecureAdmin123!')
print(f"Authentication result: {user}")

# Check CORS settings
from django.conf import settings
print(f"CORS_ALLOWED_ORIGINS: {settings.CORS_ALLOWED_ORIGINS}")
print(f"DEBUG: {settings.DEBUG}")
```

## 📋 Quick Fix Commands

### Reset Everything
```bash
# Backend reset
cd backend
python manage.py flush --noinput
python manage.py migrate
python manage.py create_sample_users

# Frontend reset
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Test Connection
```bash
# Test backend is running
curl http://localhost:8000/api/health/

# Test CORS
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8000/api/auth/login/
```

## 🎯 Success Indicators

### ✅ Everything Working When:
1. **API Status**: Green indicator in bottom-right corner
2. **Console**: No CORS or SSL errors
3. **Network Tab**: All requests show 200/201 status codes
4. **Authentication**: Login works without errors
5. **Data Loading**: Facilities, users, and other data load properly

### ❌ Still Having Issues If:
1. **Red API Status**: Backend not reachable
2. **CORS Errors**: Middleware or settings misconfigured
3. **401 Errors**: Authentication/token issues
4. **SSL Errors**: Still trying to use HTTPS somewhere

This comprehensive setup ensures your React frontend properly communicates with your Django backend using HTTP, with robust error handling and debugging capabilities.