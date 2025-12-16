#!/bin/bash

echo "BUILD START"

# Use python3 (will use the runtime version specified in vercel.json)
python3 -m pip install -r requirements.txt

python3 manage.py collectstatic --noinput --clear

# Note: Migrations should be run separately, not during build
# python3 manage.py makemigrations --noinput
# python3 manage.py migrate --noinput

echo "BUILD END"
