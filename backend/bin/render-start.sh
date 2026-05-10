#!/bin/bash
set -e

echo "==> Running migrations..."
bundle exec rails db:migrate

echo "==> Running seeds..."
bundle exec rails db:seed

echo "==> Starting server..."
bundle exec rails server -b 0.0.0.0 -p ${PORT:-3000}