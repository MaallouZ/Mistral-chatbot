# Postmortem : l'assistant ne répondait plus (28 octobre 2026)

## Résumé

Un commit « perf » arrivé sur `main` a cassé l'assistant Mistral. La page et le serveur ne démarraient plus, et la recherche de mots-clés ne marchait plus que si le message était exactement le mot-clé. L'incident a duré environ six minutes. Il a été réparé par un `git revert`, sans réécrire l'historique.

## Chronologie

- 13:58 : le commit `87592e2` « perf: accélère la recherche des mots-clés » est poussé sur `main`.
- 14:00 : en voulant pousser un autre commit, la synchronisation automatique de l'éditeur récupère ce commit, le fusionne avec le travail local et pousse le tout. Le commit « perf » part en production.
- 14:02 : l'incident est détecté en relisant l'historique : `brain.js` a été presque entièrement réécrit.
- 14:04 : `git revert 87592e2` est poussé (commit `f5d16f2`). L'assistant répond de nouveau selon ses règles.

## Cause

Le commit « perf » a modifié `public/js/brain.js` de deux façons :

- il a remplacé `includes` par `===` dans `repondre` : « une pause ? » ne déclenchait plus la règle « pause », seul le message « pause » tout seul marchait ;
- il a supprimé les exports `REGLES` et `creerMoteur`, alors que `app.js` et `serveur.mjs` les importent : la page et le serveur plantaient au démarrage.

Le changement a pu arriver en production parce que rien ne l'a vérifié avant : pas de revue de code, pas encore de chaîne d'intégration continue sur `main`, et une synchronisation qui fusionne et pousse sans montrer ce qui arrive.

## Résolution

Le commit fautif a été annulé avec `git revert`, qui crée un nouveau commit inverse. L'historique garde le commit fautif et son annulation : on peut toujours comprendre ce qui s'est passé. Il n'y a eu ni `git reset` ni `push --force`. Après le revert, les tests unitaires sont verts et l'assistant répond de nouveau « Mistral : une pause de 10 minutes... » à « une pause ? ».

## Leçons

- La chaîne d'intégration continue (lint, tests unitaires, tests de bout en bout) tourne maintenant à chaque push et à chaque pull request. Elle aurait signalé ce commit en rouge.
- Un test de non-régression (`tests/unitaires/incident.test.mjs`) vérifie qu'un mot-clé est trouvé au milieu d'une phrase. Il est rouge sur la version fautive.
- Les changements sur `main` devraient passer par une pull request relue, même quand ils se présentent comme une simple optimisation.
- Quand un push est refusé, il faut lire ce que `git pull` récupère avant de fusionner, au lieu de synchroniser à l'aveugle.
