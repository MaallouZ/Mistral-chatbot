# Mistral, un assistant de discussion accessible

## Objectif

Mistral est un petit chatbot qui tourne dans le navigateur. On lui écrit un message (130 caractères au plus) et il répond selon des règles simples, par mot-clé : « clavier », « pause » ou « statut ». Si le service de réponses tombe en panne, la page répond quand même, en local, et le signale. L'historique est gardé dans le navigateur. La page est utilisable au clavier et avec un lecteur d'écran.

## Installer

Il faut Node.js 22 ou plus récent. Après avoir récupéré le dépôt, placez-vous dans son dossier et installez les dépendances :

```bash
npm install
```

## Lancer

```bash
npm start
```

Ouvrez ensuite http://127.0.0.1:3000 dans le navigateur. Arrêtez le serveur avec Ctrl + C.

## Tester

```bash
npm test
npm run e2e
npm run lint
```

- `npm test` lance les tests unitaires de la logique (`tests/unitaires/`).
- `npm run e2e` démarre le vrai serveur et lui envoie de vraies requêtes (`tests/e2e/`).
- `npm run lint` vérifie le code de la page avec ESLint.

## Modules

- `public/index.html` : la structure de la page (historique, formulaire, statut, suggestions).
- `public/css/style.css` : l'apparence, avec un thème clair et un thème sombre.
- `public/js/brain.js` : la logique pure, sans DOM. `validerMessage` vérifie un message, `repondre` choisit la réponse selon les règles.
- `public/js/view.js` : l'affichage de l'historique à partir de l'état.
- `public/js/app.js` : relie le tout. Il gère les événements, l'appel au service, la sauvegarde dans le navigateur et la réponse locale en cas de panne.
- `server/serveur.mjs` : le serveur Node qui sert la page et l'API.

## API

- `POST /api/chat` : reçoit `{ "message": "..." }` et répond `{ "reply": "..." }`. Il répond 400 si le message est vide ou trop long, et 405 pour une autre méthode que POST.
- `GET /api/health` : répond `{ "status": "ok" }` quand le serveur fonctionne.
- `GET /version.json` : répond `{ "sha": "..." }`, l'identifiant du commit en service.
- `GET /api/debuts` : la liste des suggestions affichées sous l'historique.

La description complète est dans `openapi.json`.
