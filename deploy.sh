#!/bin/bash
set -e

cd /root/trackSchool

echo "Pulling latest code..."
git pull origin main

echo "Backend: installing dependencies and restarting pm2 app..."
cd backend
npm install
pm2 restart homeschool-backend

echo "Frontend: building React app..."
cd ../client
npm install
npm run build
sudo rm -rf /var/www/homeschool/client/*
sudo cp -r build/* /var/www/homeschool/client/
sudo chown -R www-data:www-data /var/www/homeschool/client
sudo chmod -R 755 /var/www/homeschool/client

echo "Restarting nginx (frontend build now live)..."
sudo systemctl reload nginx

echo "Flask diploma: update and restart..."
cd ../backend
# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install flask pillow

pm2 restart diploma-flask || pm2 start "venv/bin/gunicorn -w 2 -b 127.0.0.1:5001 diploma_server:app" --name diploma-flask

echo "DONE: Deploy finished at $(date)"
