import { validerMessage, creerMoteur, REGLES } from "./brain.js";
import { afficher } from "./view.js";

const LIMITE = 130;
const ASSISTANT = "Mistral";
const moteur = creerMoteur(REGLES, ASSISTANT);
const MAX_MESSAGES = 20;
const CLE = "capweb.mistral.v1";
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

  statut.textContent = "";
  sauvegarder();
  afficher(historique, etat);

  champ.value = "";
  mettreAJourCompteur();
  champ.focus();
});

function mettreAJourCompteur() {
  compteur.textContent = `${champ.value.length} / ${LIMITE}`;
}

function sauvegarder() {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    statut.textContent = "Conversation non sauvegardée.";
  }
}


function charger() {
  try {
    const donnees = JSON.parse(localStorage.getItem(CLE));
    if (Array.isArray(donnees)) {
        return donnees
        .map((element) => (typeof element === "string" ? { role: "user", text: element } : element))
        .filter((message) => typeof message?.text === "string" && (message.role === "user" || message.role === "bot"));

    }
  } catch {
    // Pas du JSON valide : on repart d'un historique vide.
  }
  return [];
}


champ.addEventListener("input", mettreAJourCompteur);

effacer.addEventListener("click", () => {
  etat.length = 0;
  afficher(historique, etat);
  statut.textContent = "Historique effacé.";
  sauvegarder();
  champ.focus();
});

window.addEventListener("storage", (event) => {
  if (event.key !== CLE && event.key !== null) {
    return;
  }
  etat.length = 0;
  etat.push(...charger());
  afficher(historique, etat);
});


etat.push(...charger());
afficher(historique, etat);
