#!/bin/bash

# Couleurs pour la sortie
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Démarrage de l'application Social Network ===${NC}"
echo ""

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker n'est pas installé. Veuillez installer Docker."
    exit 1
fi

# Démarrer la base de données
echo -e "${BLUE}1. Démarrage de la base de données PostgreSQL...${NC}"
cd "$(dirname "$0")"
docker-compose -f docker-compose.dev.yaml up -d database

# Attendre que PostgreSQL soit prêt
echo "Attente du démarrage de PostgreSQL..."
sleep 10

# Backend
echo ""
echo -e "${BLUE}2. Démarrage du Backend (Symfony)...${NC}"
cd backend

# Créer .env.local s'il n'existe pas
if [ ! -f .env.local ]; then
    echo "Création de .env.local..."
    cat > .env.local << EOF
APP_ENV=dev
DATABASE_URL="postgresql://app:!ChangeMe!@127.0.0.1:5432/app?serverVersion=16&charset=utf8"
CORS_ALLOW_ORIGIN='^https?://(localhost|127\\.0\\.0\\.1)(:[0-9]+)?$'
EOF
fi

# Installer les dépendances si nécessaire
if [ ! -d vendor ]; then
    echo "Installation des dépendances PHP..."
    composer install
fi

# Créer la base de données et exécuter les migrations
echo "Configuration de la base de données..."
php bin/console doctrine:database:create --if-not-exists
php bin/console doctrine:migrations:migrate --no-interaction

# Générer les clés JWT s'il n'existent pas
if [ ! -f config/jwt/private.pem ]; then
    echo "Génération des clés JWT..."
    php bin/console lexik:jwt:generate-keypair --skip-if-exists
fi

# Démarrer le serveur Symfony en arrière-plan
echo "Démarrage du serveur Symfony..."
symfony local:server:start --no-tls --allow-all-ips --port=8000 &
BACKEND_PID=$!
cd ..

# Frontend
echo ""
echo -e "${BLUE}3. Démarrage du Frontend (React)...${NC}"
cd frontend

# Créer .env.local s'il n'existe pas
if [ ! -f .env.local ]; then
    echo "Création de .env.local..."
    cat > .env.local << EOF
REACT_APP_API_URL=http://localhost:8000/api
EOF
fi

# Installer les dépendances si nécessaire
if [ ! -d node_modules ]; then
    echo "Installation des dépendances Node.js..."
    npm install
fi

# Démarrer le serveur React en arrière-plan
echo "Démarrage du serveur React..."
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✓ Application démarrée avec succès!${NC}"
echo ""
echo "=== Points d'accès ==="
echo -e "Frontend:  ${BLUE}http://localhost:3000${NC}"
echo -e "Backend:   ${BLUE}http://localhost:8000/api${NC}"
echo -e "DB:        ${BLUE}localhost:5432${NC}"
echo ""
echo "=== Pour arrêter l'application ==="
echo "Appuyez sur Ctrl+C pour arrêter les serveurs"
echo ""

# Attendre l'arrêt
wait
