# Social Network - Application Web Complète

Une application de réseau social construite avec **Symfony** (Backend) et **React** (Frontend), offrant des fonctionnalités de publications, commentaires, groupes et cours.

## 🚀 Démarrage Rapide

### Avec Docker Compose (Recommandé)

```bash
# Initialiser le projet
chmod +x init.sh
./init.sh

# Démarrer l'application
cd backend
docker-compose up -d

# Exécuter les migrations (première fois)
docker-compose exec backend bin/console doctrine:migrations:migrate
```

L'application sera accessible à:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Base de données**: localhost:5432

### Sans Docker (Développement Local)

#### Backend (Symfony)

```bash
cd backend
composer install
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
symfony local:server:start --port=8000
```

#### Frontend (React)

```bash
cd frontend
npm install
npm start
```

Accessible à: http://localhost:3000

## 📁 Structure du Projet

```
social_network/
├── backend/           # API Symfony
│   ├── src/
│   │   ├── Controller/  # Contrôleurs API
│   │   ├── Entity/      # Modèles de données
│   │   └── Repository/  # Accès aux données
│   ├── config/          # Configuration
│   ├── migrations/      # Migrations de base de données
│   └── Dockerfile       # Image Docker du backend
│
├── frontend/        # Application React
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── pages/       # Pages
│   │   ├── services/    # Services API
│   │   └── context/     # Contexte React
│   └── Dockerfile       # Image Docker du frontend
│
├── docker-compose.yaml  # Configuration Docker
└── INTEGRATION_GUIDE.md # Guide d'intégration détaillé
```

## 🔑 Fonctionnalités Principales

### Authentification
- Inscription et connexion
- Tokens JWT
- Gestion de profil

### Publications & Engagement
- Créer/modifier/supprimer des publications
- Commentaires sur les publications
- Système de likes

### Groupes
- Créer et rejoindre des groupes
- Gestion des membres

### Cours
- Créer des cours
- Publier/dépublier des cours
- Gestion pédagogique

### Administration
- Gestion des utilisateurs
- Activation/désactivation d'comptes

## 🛠️ Technologies Utilisées

### Backend
- **PHP 8.3** avec **Symfony 7**
- **PostgreSQL** pour la base de données
- **JWT (Lexik)** pour l'authentification
- **Doctrine ORM** pour l'accès aux données
- **CORS** pour les requêtes cross-origin

### Frontend
- **React 19**
- **React Router** pour la navigation
- **Axios** pour les appels API
- **Lucide Icons** pour les icônes

### Infrastructure
- **Docker & Docker Compose** pour la containerisation
- **PostgreSQL 16** comme base de données

## 📚 Documentation

Consultez [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) pour:
- Configuration détaillée
- Points d'entrée API complets
- Authentification et CORS
- Dépannage
- Déploiement en production

## 🔒 Sécurité

- Les secrets (clés JWT, passwords) ne sont pas versionnés
- Authentification par JWT pour toutes les routes protégées
- CORS correctement configuré
- Validation des entrées utilisateur

## 📝 Variables d'Environnement

### Backend (.env)
```
APP_ENV=dev
DATABASE_URL=postgresql://...
CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$
JWT_SECRET_KEY=...
JWT_PUBLIC_KEY=...
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
```

## 🐛 Dépannage

### Le frontend ne se connecte pas au backend
1. Vérifiez que le backend est running: `curl http://localhost:8000/api/publications`
2. Vérifiez que `REACT_APP_API_URL` est correct dans le fichier `.env`
3. Vérifiez CORS dans `backend/config/packages/nelmio_cors.yaml`

### Erreurs de base de données
1. Vérifiez que PostgreSQL est en court d'exécution
2. Exécutez les migrations: `php bin/console doctrine:migrations:migrate`
3. Vérifiez `DATABASE_URL` dans `.env`

### Problèmes de clés JWT
```bash
php bin/console lexik:jwt:generate-keypair
```

## 📞 Support

Pour toute question ou problème, consultez:
- [Documentation Symfony](https://symfony.com/doc)
- [Documentation React](https://react.dev)
- [Guide d'intégration](INTEGRATION_GUIDE.md)

## 📄 Licence

Propriétaire - Tous droits réservés

---

**Dernière mise à jour**: 23 Mars 2026

## 👥 Installation sur un nouveau poste (collaborateur)

Pour qu'un collègue puisse tester l'application sur son PC :

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd social_network
   ```

2. **Initialiser le projet** (à faire sur chaque machine)
   ```bash
   chmod +x init.sh
   ./init.sh
   ```
   - Cela crée les fichiers `.env.local` nécessaires, installe les dépendances PHP/Node.js et génère les clés JWT si besoin.

3. **Démarrer l’application avec Docker**
   ```bash
   cd backend
   docker compose up -d --build
   ```
   (attendre que tout soit « Up »)

4. **Accéder à l’application**
   - Frontend : http://localhost:3000
   - Backend API : http://localhost:8000/api

5. **(Optionnel) Appliquer les migrations**
   ```bash
   docker compose exec backend bin/console doctrine:migrations:migrate --no-interaction
   ```

6. **Arrêter l’application**
   ```bash
   docker compose down -v
   ```

**Prérequis** :
- Docker et Docker Compose à jour (voir README ou demander la procédure si besoin)
- Ports 3000, 8000, 5434 libres

**Astuce** : tout est documenté dans les fichiers README.md et INTEGRATION_GUIDE.md du projet.
