from pathlib import Path
import os


BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY: read from environment in production, fall back to current key for local dev
SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-p6065abpan9kaiy0l6qdna^_!&8@ck3ya13(2&btm+1*c7nsj&",
)

# DEBUG should be False in production; controlled via env
DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() == "true"

# ✅ Host configuration (for deployment, override via DJANGO_ALLOWED_HOSTS)
DEFAULT_ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    ".ngrok-free.dev",
    ".ngrok-free.app",
]
ALLOWED_HOSTS = os.environ.get(
    "DJANGO_ALLOWED_HOSTS", ",".join(DEFAULT_ALLOWED_HOSTS)
).split(",")


# CSRF trusted origins (override via DJANGO_CSRF_TRUSTED_ORIGINS in production)
DEFAULT_CSRF_TRUSTED = [
    "https://*.ngrok-free.app",
    "https://*.ngrok-free.dev",
]
CSRF_TRUSTED_ORIGINS = os.environ.get(
    "DJANGO_CSRF_TRUSTED_ORIGINS", ",".join(DEFAULT_CSRF_TRUSTED)
).split(",")

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',
    'corsheaders', 
]

MIDDLEWARE = [
    'core.middleware.RequestThroughputMiddleware',
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'maritime_db',
        'USER': 'root',
        'PASSWORD': 'Swetha1*',   
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
AUTH_USER_MODEL = 'core.User'

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ]
}


from corsheaders.defaults import default_headers  # noqa: E402

# In development we can allow all, in production we rely on CORS_ALLOWED_ORIGINS
CORS_ALLOW_ALL_ORIGINS = DEBUG

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# For production, set DJANGO_CORS_ALLOWED_ORIGINS to a comma-separated list of
# frontend origins (e.g. https://your-vercel-app.vercel.app)
CORS_ALLOWED_ORIGINS = os.environ.get(
    "DJANGO_CORS_ALLOWED_ORIGINS", ",".join(DEFAULT_CORS_ORIGINS)
).split(",")

CORS_ALLOW_HEADERS = list(default_headers) + [
    "ngrok-skip-browser-warning",
]