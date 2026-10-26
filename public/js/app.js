// Chef d'orchestre : relie la page au cerveau (brain.js).

import { validerMessage, repondre, REGLES } from "./brain.js";

const LIMITE = 130;
const ASSISTANT = "Mistral";

const formulaire = document.querySelector("#formulaire");
const champ = document.querySelector("#message");
const historique = document.querySelector("#historique");
const statut = document.querySelector("#statut");
const compteur = document.querySelector("#compteur");
const effacer = document.querySelector("#effacer");

function ajouterMessage(texte, role) {
  const li = document.createElement("li");
  li.className = "msg";
  li.dataset.role = role;
  li.textContent = texte;
  historique.append(li);
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

  ajouterMessage(texte.trim(), "user");
  ajouterMessage(repondre(texte, REGLES, ASSISTANT), "bot");

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
  historique.replaceChildren();
  statut.textContent = "Historique effacé.";
  champ.focus();
});
