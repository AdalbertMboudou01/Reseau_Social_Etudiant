# Guide d'intégration Frontend-Backend

## Architecture

- **Backend**: Symfony (PHP) sur le port 8000
- **Frontend**: React sur le port 3000
- **Base de données**: PostgreSQL sur le port 5432
- **Communication**: API REST JSON avec authentification JWT

## Configuration avec Docker Compose

### Démarrer l'application complète

```bash
cd backend
docker-compose up -d
```

Cela va:
1. Créer la base de données PostgreSQL
2. Installer les dépendances PHP
3. Lancer le serveur Symfony (port 8000)
4. Installer les dépendances Node.js
5. Lancer le serveur React (port 3000)

### Initialiser la base de données

```bash
# Exécuter les migrations
docker-compose exec backend bin/console doctrine:migrations:migrate

# Ou création de la base de données
docker-compose exec backend bin/console doctrine:database:create
docker-compose exec backend bin/console doctrine:schema:create
```

## Configuration sans Docker

### Backend

```bash
cd backend

# Installer les dépendances
composer install

# Configurer l'environnement (.env.local)
# Assurez-vous que DATABASE_URL pointe vers votre PostgreSQL local

# Créer la base de données
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# Lancer le serveur
symfony local:server:start --port=8000
```

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Créer .env.local si nécessaire
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env.local

# Lancer en développement
npm start
```

## Points d'entree API

L'API backend expose les routes suivantes (toutes préfixées par `/api`):

### Authentification
- `POST /login` - Connexion
- `POST /register` - Inscription
- `GET /profile` - Récupérer profile utilisateur
- `PUT /profile` - Mettre à jour profile

### Publications
- `GET /publications` - Lister toutes les publications
- `GET /publications/{id}` - Détails d'une publication
- `POST /publications` - Créer une publication (authentifié)
- `PUT /publications/{id}` - Modifier une publication
- `DELETE /publications/{id}` - Supprimer une publication
- `POST /publications/{id}/like` - Liker une publication

### Commentaires
- `GET /publications/{pubId}/commentaires` - Lister les commentaires
- `POST /publications/{pubId}/commentaires` - Créer un commentaire
- `DELETE /publications/{pubId}/commentaires/{id}` - Supprimer un commentaire

### Groupes
- `GET /groupes` - Lister tous les groupes
- `GET /groupes/{id}` - Détails d'un groupe
- `POST /groupes` - Créer un groupe (authentifié)
- `POST /groupes/{id}/join` - Rejoindre un groupe
- `POST /groupes/{id}/leave` - Quitter un groupe
- `DELETE /groupes/{id}` - Supprimer un groupe

### Cours
- `GET /cours` - Lister tous les cours
- `GET /cours/{id}` - Détails d'un cours
- `POST /cours` - Créer un cours
- `PUT /cours/{id}` - Modifier un cours
- `PATCH /cours/{id}/publish` - Publier un cours
- `DELETE /cours/{id}` - Supprimer un cours

### Admin
- `GET /admin/users` - Lister tous les utilisateurs
- `PATCH /admin/users/{id}/activate` - Activer un utilisateur
- `PATCH /admin/users/{id}/deactivate` - Désactiver un utilisateur
- `DELETE /admin/users/{id}` - Supprimer un utilisateur

## Authentification

Le frontend utilise des **tokens JWT** pour l'authentification:

1. Lors de la connexion, le backend retourne un token
2. Le token est sauvegardé dans `localStorage` sous la clé `token`
3. À chaque requête, le token est envoyé dans l'en-tête `Authorization: Bearer <token>`
4. Si le token expire (401), l'utilisateur est redirigé vers `/login`

## CORS

Le backend permet les requêtes CORS depuis:
- `localhost` (en développement)
- `127.0.0.1` (en développement)
- `frontend` (dans Docker)

Les en-têtes autorisés:
- `Content-Type`
- `Authorization`

## Dépannage

### Le frontend ne peut pas se connecter au backend

1. Vérifiez que le backend est running: `http://localhost:8000/api/publications`
2. Vérifiez `REACT_APP_API_URL` dans `.env` du frontend
3. Vérifiez que CORS est configuré dans `backend/config/packages/nelmio_cors.yaml`

### Erreur de base de données

1. Assurez-vous que PostgreSQL est running
2. Vérifiez `DATABASE_URL` dans `.env` du backend
3. Exécutez les migrations: `php bin/console doctrine:migrations:migrate`

### JWT désactivé ou invalide

1. Vérifiez que les fichiers JWT existent:
   - `backend/config/jwt/private.pem`
   - `backend/config/jwt/public.pem`
2. Générez les clés si nécessaire:
   ```bash
   php bin/console lexik:jwt:generate-keypair
   ```

## Déploiement

**Pour la production:**

1. Mettez à jour les variables d'environnement dans `.env.prod.local`
2. Changez `APP_ENV=prod`
3. Générez les assets du frontend: `npm run build`
4. Configurez un serveur web (nginx) pour servir le fronted et proxifier l'API
5. Utilisez HTTPS et vérifiez CORS pour votre domaine

## Ressources

- [Symfony Documentation](https://symfony.com/doc)
- [React Documentation](https://react.dev)
- [Lexik JWT Bundle](https://github.com/lexik/LexikJWTAuthenticationBundle)
- [Nelmio CORS Bundle](https://github.com/nelmio/NelmioCorsBundle)
