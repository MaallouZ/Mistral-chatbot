// Chef d'orchestre : relie la page au cerveau (brain.js).

import { validerMessage, repondre, REGLES } from "./brain.js";

const LIMITE = 130;
const ASSISTANT = "Mistral";
const MAX_MESSAGES = 20;
const etat = [];
window.etat = etat;

const formulaire = document.querySelector("#formulaire");
const champ = document.querySelector("#message");
const historique = document.querySelector("#historique");
const statut = document.querySelector("#statut");
const compteur = document.querySelector("#compteur");
const effacer = document.querySelector("#effacer");
const lignes = new WeakMap();


function afficher() {
  const lis = [];

  for (const message of etat) {
    let li = lignes.get(message);

    if (!li) {
      li = document.createElement("li");
      li.className = "msg";
      li.dataset.role = message.role;
      li.textContent = message.text;
      lignes.set(message, li);
    }

    lis.push(li);
  }

  historique.replaceChildren(...lis);
}



formulaire.addEventListener("submit", (event) => {
  event.preventDefault();

  const texte = champ.value;
  const verdict = validerMessage(texte, LIMITE);

  if (!verdict.ok) {
    if (verdict.raison === "vide") {
      statut.textContent = "Message vide : écrivez quelque chose avant d'envoyer.";
    } else {
      statut.textContent = `Message trop long : ${LIMITE} caractères maximum.`;
    }
    champ.focus();
    return;
  }

  etat.push({ role: "user", text: texte.trim() });
  etat.push({ role: "bot", text: repondre(texte, REGLES, ASSISTANT) });

    while (etat.length > MAX_MESSAGES) {
    etat.shift();
  }

  afficher();


  statut.textContent = "";
  champ.value = "";
  mettreAJourCompteur();
  champ.focus();
});

function mettreAJourCompteur() {
  compteur.textContent = `${champ.value.length} / ${LIMITE}`;
}

champ.addEventListener("input", mettreAJourCompteur);

effacer.addEventListener("click", () => {
  etat.length = 0;
  afficher();
  statut.textContent = "Historique effacé.";
  champ.focus();
});
