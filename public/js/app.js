import { validerMessage, creerMoteur, REGLES } from "./brain.js";
import { afficher } from "./view.js";

const LIMITE = 130;
const ASSISTANT = "Mistral";
const moteur = creerMoteur(REGLES, ASSISTANT);
const MAX_MESSAGES = 20;
const etat = [];
window.etat = etat;

const formulaire = document.querySelector("#formulaire");
const champ = document.querySelector("#message");
const historique = document.querySelector("#historique");
const statut = document.querySelector("#statut");
const compteur = document.querySelector("#compteur");
const effacer = document.querySelector("#effacer");

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
  etat.push({ role: "bot", text: moteur.repondre(texte) });

    while (etat.length > MAX_MESSAGES) {
    etat.shift();
  }

  afficher(historique, etat);


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
  afficher(historique, etat);
  statut.textContent = "Historique effacé.";
  champ.focus();
});
