#!/bin/bash
# Start script for Render deployment
# This ensures the correct Python path and starts Gunicorn

cd "$(dirname "$0")"
exec gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
