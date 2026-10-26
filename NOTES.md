# Notes — Jour 1

## 1. Pourquoi brain.js ne doit-il jamais toucher à document ?

`brain.js` doit uniquement gérer la logique du chatbot, donc traiter un message et générer une réponse. En le séparant du DOM, on peut tester sans passer par l'interface et réutiliser le code.

## 2. Quand j'appuie sur Entrée, quel est le chemin de mon message, du champ jusqu'à la réponse affichée ?

D'abord l'event `submit` du formulaire, intercepté par JS avec `preventDefault()` pour éviter le rechargement. Le script récupère le champs saisi, l'envoie à `brain.js` et récupère la réponse pour l'ajouter dans le DOM.

## 3. Quel test vous a le plus aidé aujourd'hui, et pourquoi ?

Le test de la fonction qui génère les réponses m'a le plus aidé pour vérifier que le chatbot réagit correctement aux messages sans passer par l'interface.