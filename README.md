# Back-End de Milesto

Ce projet représente le back-end de l'application **Milesto**, un outil pour définir, suivre et atteindre vos objectifs tout en mesurant vos performances personnelles.

## 🚀 Fonctionnalités Principales

- **Authentification et Autorisation :**

  - Inscription et connexion des utilisateurs.

- **Gestion des Objectifs :**

  - CRUD (Créer, Lire, Mettre à jour, Supprimer) des objectifs.
  - Suivi des progrès et visualisation des statistiques.

- **Planification Journalière :**
  - Gestion des tâches quotidiennes avec priorisation.

## 🛠️ Technologies Utilisées

- **Framework :** Node.js avec Express.js
- **Base de données :** MongoDB
- **Authentification :** JWT (JSON Web Token)
- **Environnement :** TypeScript pour un code robuste et lisible

## 📂 Structure du Projet

```plaintext
src/
├── config/         # Configuration (base de données, variables d'environnement)
├── controllers/    # Logique métier des routes
├── middlewares/    # Middleware pour validation, authentification, etc.
├── models/         # Modèles de données
├── routes/         # Définition des routes
└── main.ts        # Point d'entrée principal
```

## ⚙️ Installation

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/cedric20061/Milesto-Backend
   cd Milesto-Backend
   ```

2. **Installer les dépendances :**

   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement :**  
    Créez un fichier `.env` à la racine du projet et configurez les clés suivantes :

   ```env
      JWT_SECRET=?
      API_NAME='http://localhost:5000'
      HOST_NAME='http://localhost:5173'
      PORT=5000
      MONGO_URI=?
   ```

4. **Lancer le serveur en mode production :**
   ```bash
   npm run build
   npm start
   ```

## 🛡️ Endpoints Disponibles

### **Authentification**

- `POST /auth/register` : Inscription d’un utilisateur.
- `POST /auth/login` : Connexion d’un utilisateur.

### **Objectifs**

- `GET /goals` : Récupérer tous les objectifs.
- `POST /goals` : Créer un nouvel objectif.
- `PUT /goals/:id` : Mettre à jour un objectif.
- `DELETE /goals/:id` : Supprimer un objectif.

### **Planification**

- `GET /tasks` : Récupérer les tâches du jour.
- `POST /tasks` : Ajouter une tâche.

(Consultez la documentation Swagger/Postman pour une liste complète des routes.)
