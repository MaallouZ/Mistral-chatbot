import { validerMessage, creerMoteur, REGLES } from "./brain.js";
import { afficher } from "./view.js";

const LIMITE = 130;
const ASSISTANT = "Mistral";
const moteur = creerMoteur(REGLES, ASSISTANT);
const MAX_MESSAGES = 20;
const CLE = "capweb.mistral.v1";
const ROUTE_SUGGESTIONS = "/api/debuts";
const ROUTE_CHAT = "/api/chat";
const DELAI_MAX_MS = 3000;
const reponsesLocales = new WeakSet();
const etat = [];
window.etat = etat;

const formulaire = document.querySelector("#formulaire");
const champ = document.querySelector("#message");
const historique = document.querySelector("#historique");
const statut = document.querySelector("#statut");
const compteur = document.querySelector("#compteur");
const effacer = document.querySelector("#effacer");
const zoneSuggestions = document.querySelector("#suggestions");
const envoyer = document.querySelector("#envoyer");
const mode = document.querySelector("#mode");

formulaire.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (envoyer.disabled) {
    return;
  }

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

  const message = texte.trim();
  statut.textContent = "";
  etat.push({ role: "user", text: message });
  enregistrer();
  champ.value = "";
  mettreAJourCompteur();
  champ.focus();

  envoyer.disabled = true;
  try {
    const reponse = await demanderReponse(message);
    etat.push({ role: "bot", text: reponse });
    mode.textContent= "";
    } catch (erreur) {
    if (erreur.name === "AbortError") {
      statut.textContent = "Le service a mis plus de 3 secondes : demande abandonnée.";
    } else {
      statut.textContent = "Le service ne répond pas.";
    }
    mode.textContent = "réponse locale";
    const reponseLocale = { role: "bot", text: moteur.repondre(message) };
    reponsesLocales.add(reponseLocale);
    etat.push(reponseLocale);

  } finally {
    envoyer.disabled = false;
  }

  enregistrer();
});


function mettreAJourCompteur() {
  compteur.textContent = `${champ.value.length} / ${LIMITE}`;
}

function enregistrer() {
  while (etat.length > MAX_MESSAGES) {
    etat.shift();
  }
  sauvegarder();
  afficher(historique, etat, reponsesLocales);
}

async function demanderReponse(message) {
  const controleur = new window.AbortController();
  const minuteur = window.setTimeout(() => controleur.abort(), DELAI_MAX_MS);

  try {
    const reponse = await fetch(ROUTE_CHAT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: controleur.signal,
    });

    if (!reponse.ok) {
      throw new Error(`Le service a répondu ${reponse.status}`);
    }

    const donnees = await reponse.json();
    if (typeof donnees?.reply !== "string") {
      throw new Error("Réponse du service inattendue");
    }
    return donnees.reply;
  } finally {
    window.clearTimeout(minuteur);
  }
}


function creerBoutonSuggestion(texte) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.textContent = texte;
  bouton.addEventListener("click", () => {
    champ.value = texte;
    mettreAJourCompteur();
    champ.focus();
  });
  return bouton;
}

async function chargerSuggestions() {
  zoneSuggestions.setAttribute("aria-busy", "true");
  zoneSuggestions.textContent = "Chargement des suggestions…";

  try {
    const reponse = await fetch(ROUTE_SUGGESTIONS);
    if (!reponse.ok) {
      throw new Error(`Le serveur a répondu ${reponse.status}`);
    }

    const donnees = await reponse.json();
    if (!Array.isArray(donnees?.suggestions)) {
      throw new Error("Format de réponse inattendu");
    }

    if (donnees.suggestions.length === 0) {
      zoneSuggestions.textContent = "Aucune suggestion";
      return;
    }

    zoneSuggestions.replaceChildren();
    for (const texte of donnees.suggestions) {
      zoneSuggestions.append(creerBoutonSuggestion(texte));
    }
    } catch {
    zoneSuggestions.textContent = "Une erreur empêche de charger les suggestions.";
    const reessayer = document.createElement("button");
    reessayer.type = "button";
    reessayer.textContent = "Réessayer";
    reessayer.addEventListener("click", chargerSuggestions);
    zoneSuggestions.append(reessayer);
  } finally {
    zoneSuggestions.removeAttribute("aria-busy");
  }
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
  afficher(historique, etat, reponsesLocales);
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
  afficher(historique, etat, reponsesLocales);
});


etat.push(...charger());
afficher(historique, etat, reponsesLocales);
chargerSuggestions();
