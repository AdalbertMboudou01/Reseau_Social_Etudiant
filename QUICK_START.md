# Guide de Démarrage Rapide

## 3 Méthodes pour Démarrer l'Application

### 1️⃣ Avec Docker Compose (Tout Conteneurisé) - RECOMMANDÉ

La plus simple pour produire un environnement complet et isolé.

```bash
cd backend
docker-compose up -d
```

**Accès:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Database: localhost:5432

**Arrêter:**
```bash
docker-compose down
```

---

### 2️⃣ Développement Local (Docker pour DB seulement)

Idéal pour le développement avec hot reload et meilleure performance.

```bash
# Démarrer juste la base de données
docker-compose -f docker-compose.dev.yaml up -d

# Dans un terminal, démarrer le backend
cd backend
composer install  # Première fois
php bin/console doctrine:migrations:migrate  # Première fois
symfony local:server:start --port=8000

# Dans un autre terminal, démarrer le frontend
cd frontend
npm install  # Première fois
npm start
```

**Accès:** Même que méthode 1

**Avantages:**
- Hot reload React instantané
- Hot reload Symfony avec watch
- Plus rapide pour le développement

---

### 3️⃣ Entièrement Local (Sans Docker)

Requiert PostgreSQL installé localement.

```bash
# Terminal 1: Backend
cd backend
composer install
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
symfony local:server:start

# Terminal 2: Frontend
cd frontend
npm install
npm start
```

**Configuration:**
- Créez `backend/.env.local`:
  ```
  DATABASE_URL="postgresql://user:password@127.0.0.1:5432/social_network"
  ```

---

## Script de Démarrage Automatique

Pour démarrer facilement en développement local:

```bash
chmod +x start.sh
./start.sh
```

Ce script:
1. Lance PostgreSQL en Docker
2. Configure le backend Symfony
3. Configure le frontend React
4. Démarre les deux serveurs

---

## Initialisation Première Fois

Première exécution du projet:

```bash
chmod +x init.sh
./init.sh
```

Ce script:
- Crée les fichiers `.env.local`
- Installe les dépendances (Composer & npm)
- Génère les clés JWT

---

## Vérification du Statut

### Vérifier le Backend
```bash
curl http://localhost:8000/api/publications
```

### Vérifier les Logs Frontend (Console Browser)
Ouvrez http://localhost:3000 et appuyez sur F12

### Vérifier les Logs Backend
```bash
docker-compose logs -f backend
# Ou sans Docker:
# Les logs s'affichent dans le terminal
```

---

## Variables d'Environnement Importantes

### Backend (.env.local)
```
APP_ENV=dev (dev, test, prod)
DATABASE_URL=postgresql://...
CORS_ALLOW_ORIGIN=^https?://...
JWT_PASSPHRASE=...
```

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:8000/api
```

---

## Commandes Utiles

### Backend (Symfony)

```bash
# Lister les routes
php bin/console debug:router

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Créer une nouvelle migration
php bin/console make:migration

# Régénérer les clés JWT
php bin/console lexik:jwt:generate-keypair

# Console Symfony interactive
php bin/console

# Nettoyer le cache
php bin/console cache:clear
```

### Frontend (React)

```bash
# Démarrer en développement
npm start

# Build pour production
npm run build

# Tests
npm test

# Linter JavaScript
npm run lint
```

### Docker

```bash
# Voir les logs en temps réel
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Exécuter une commande dans un container
docker-compose exec backend php bin/console ...
docker-compose exec frontend npm ...

# Arrêter et supprimer les containers
docker-compose down

# Supprimer les volumes (données)
docker-compose down -v
```

---

## Troubleshooting Rapide

| Problème | Solution |
|----------|----------|
| Port 3000 déjà utilisé | `lsof -i :3000` puis `kill -9 <PID>` |
| Port 8000 déjà utilisé | `lsof -i :8000` puis `kill -9 <PID>` |
| DB connection error | Vérifiez `DATABASE_URL` dans `.env.local` |
| JWT permission denied | `chmod 644 config/jwt/*.pem` |
| npm: permission denied | `npm install -g npm` ou utilisez nvm |
| CORS error | Vérifiez `CORS_ALLOW_ORIGIN` dans `.env` |

---

## Prochaines Étapes

1. **Vérifier les collections Postman/Insomnia** pour tester les endpoints
2. **Consulter INTEGRATION_GUIDE.md** pour les détails API
3. **Lire le README.md** pour la structure du projet

---

**Besoin d'aide?** Consultez INTEGRATION_GUIDE.md ou README.md
