from pathlib import Path
from decouple import config, Csv
import dj_database_url
import os


# =========================
# Paths & core settings
# =========================
BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config(
    'SECRET_KEY',
    default='django-insecure-fallback-key-for-development-only-change-in-production'
)

DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='localhost,127.0.0.1',
    cast=Csv()
)

# =========================
# Installed apps
# =========================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',
]

# =========================
# Middleware
# =========================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'
WSGI_APPLICATION = 'backend.wsgi.application'

# =========================
# Templates
# =========================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'core.context_processors.site_config',  # Site configuration
            ],
        },
    },
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME"),
        "USER": os.environ.get("DB_USER"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        "HOST": os.environ.get("DB_HOST"),
        "PORT": os.environ.get("DB_PORT", "5432"),
        "CONN_MAX_AGE": 60,
        "OPTIONS": {
            "sslmode": "require",
            "connect_timeout": 10,
            "options": "-c statement_timeout=5000",
        },
    }
}


# =========================
# Caching (In-Memory for Development/Small Deployments)
# =========================
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'sonadi-cache',
        'OPTIONS': {
            'MAX_ENTRIES': 1000
        }
    }
}

# =========================
# Static & media files
# =========================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_DIRS = (
    [BASE_DIR / 'assets'] if (BASE_DIR / 'assets').exists() else []
)

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =========================
# Email (Gmail SMTP)
# =========================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)

EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# Admin email to receive form submissions
ADMIN_EMAIL = config('ADMIN_EMAIL', default=EMAIL_HOST_USER)

# =========================
# Razorpay
# =========================
RAZORPAY_KEY_ID = config('RAZORPAY_KEY_ID', default='')
RAZORPAY_KEY_SECRET = config('RAZORPAY_KEY_SECRET', default='')

# =========================
# Organization Contact Information
# =========================
ORG_NAME = config('ORG_NAME', default='Sonadi Charitable Trust')
ORG_PHONE = config('ORG_PHONE', default='')
ORG_EMAIL = config('ORG_EMAIL', default='')
ORG_WHATSAPP = config('ORG_WHATSAPP', default='')

# Address
ORG_ADDRESS_LINE1 = config('ORG_ADDRESS_LINE1', default='')
ORG_ADDRESS_LINE2 = config('ORG_ADDRESS_LINE2', default='')
ORG_PINCODE = config('ORG_PINCODE', default='')

# Google Maps
ORG_GOOGLE_MAPS_URL = config('ORG_GOOGLE_MAPS_URL', default='')
ORG_GOOGLE_MAPS_EMBED = config('ORG_GOOGLE_MAPS_EMBED', default='')

# =========================
# Social Media Links
# =========================
SOCIAL_FACEBOOK = config('SOCIAL_FACEBOOK', default='')
SOCIAL_INSTAGRAM = config('SOCIAL_INSTAGRAM', default='')

# =========================
# Bank Account Details
# =========================
BANK_NAME = config('BANK_NAME', default='')
BANK_BRANCH = config('BANK_BRANCH', default='')
BANK_ADDRESS = config('BANK_ADDRESS', default='')
BANK_ACCOUNT_HOLDER = config('BANK_ACCOUNT_HOLDER', default='')
BANK_ACCOUNT_NUMBER = config('BANK_ACCOUNT_NUMBER', default='')
BANK_IFSC_CODE = config('BANK_IFSC_CODE', default='')
BANK_CBS_CODE = config('BANK_CBS_CODE', default='')

# =========================
# Ambulance Service
# =========================
AMBULANCE_PHONE = config('AMBULANCE_PHONE', default='')

# =========================
# CSRF
# =========================
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='https://localhost',
    cast=Csv()
)

# =========================
# SECURITY — AUTO SWITCH (FIXES YOUR SSL BUG)
# =========================
IS_PRODUCTION = not DEBUG

if IS_PRODUCTION:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
else:
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SECURE_HSTS_SECONDS = 0
    SECURE_HSTS_INCLUDE_SUBDOMAINS = False
    SECURE_HSTS_PRELOAD = False
