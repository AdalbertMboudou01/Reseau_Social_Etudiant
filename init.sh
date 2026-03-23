# Script pour initialiser le projet

#!/bin/bash

echo "=== Initialisation de l'application Social Network ==="
echo ""

# Créer .env.local pour le backend
if [ ! -f backend/.env.local ]; then
    echo "Création de backend/.env.local..."
    cat > backend/.env.local << EOF
# Configuration locale pour le développement
APP_ENV=dev
DATABASE_URL="postgresql://app:!ChangeMe!@127.0.0.1:5432/app?serverVersion=16&charset=utf8"
CORS_ALLOW_ORIGIN='^https?://(localhost|127\\.0\\.0\\.1)(:[0-9]+)?$'
EOF
fi

# Créer .env.local pour le frontend
if [ ! -f frontend/.env.local ]; then
    echo "Création de frontend/.env.local..."
    cat > frontend/.env.local << EOF
REACT_APP_API_URL=http://localhost:8000/api
EOF
fi

# Installer les dépendances PHP
if [ -d backend ]; then
    echo ""
    echo "Installation des dépendances PHP..."
    cd backend
    composer install
    cd ..
fi

# Installer les dépendances Node.js
if [ -d frontend ]; then
    echo ""
    echo "Installation des dépendances Node.js..."
    cd frontend
    npm install
    cd ..
fi

# Générer les clés JWT si nécessaire
if [ ! -f backend/config/jwt/private.pem ]; then
    echo ""
    echo "Génération des clés JWT..."
    cd backend
    php bin/console lexik:jwt:generate-keypair
    cd ..
fi

echo ""
echo "=== Initialisation complète ==="
echo ""
echo "Vous pouvez maintenant démarrer l'application avec:"
echo "  cd backend"
echo "  docker-compose up -d"
echo ""
echo "Ou sans Docker:"
echo "  Backend:  cd backend && symfony local:server:start"
echo "  Frontend: cd frontend && npm start"
