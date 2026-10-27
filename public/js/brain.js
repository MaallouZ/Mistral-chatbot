// Logique métier du chatbot (à compléter à partir de J1-03).

export const REGLES = [
  {motCle: "clavier" , reponse: "Mistral : utilisez Tab puis Entrée pour envoyer votre message sans souris."},
  {motCle: "pause" , reponse: "Mistral : une pause de 10 minutes est prévue au milieu de chaque demi-journée."},
  {motCle: "statut" , reponse: "Mistral est opérationnel et prêt à répondre."},

];

/**
 * Vérifie qu'un message peut être envoyé.
 * @param {string} texte - Le message tapé par l'utilisateur.
 * @param {number} limite - Le nombre maximal de caractères.
 * @returns {{ ok: boolean, raison?: string }} ok à true, sinon la raison ("vide" ou "trop-long").
 */

export function validerMessage(texte, limite) {
  const propre = (texte ?? "").trim();

  if (propre.length === 0) {
      return {
        ok: false,
        raison: "vide"
      };
  }
  if (propre.length > limite) {
    return {
      ok: false,
      raison: "trop-long"
    };
  }

  return { ok: true };
}

/**
 * Trouve la réponse de la première règle dont le mot-clé est dans le message.
 * @param {string} texte - Le message de l'utilisateur.
 * @param {{ motCle: string, reponse: string }[]} regles - Les règles, dans l'ordre.
 * @param {string} assistant - Le nom de l'assistant, pour la réponse par défaut.
 * @returns {string} La réponse du chatbot.
 */

export function repondre(texte, regles, assistant) {
  for (const regle of regles) {
    if (normaliser(texte).includes(normaliser(regle.motCle))) {
      return regle.reponse;
    }
  }

  return `${assistant} : je n'ai pas compris. Essayez « clavier », « pause » ou « statut ».`;
}

function normaliser(texte) {
  return (texte ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Fabrique un moteur de réponses qui garde sa propre copie des règles.
 * @param {{ motCle: string, reponse: string }[]} regles - Les règles du moteur.
 * @param {string} assistant - Le nom de l'assistant.
 * @returns {{ repondre: (texte: string) => string }} Le moteur.
 * @throws {TypeError} Si une règle est invalide, par exemple regles[1].
 */

export function creerMoteur(regles, assistant) {
  if (!Array.isArray(regles)) {
    throw new TypeError("regles doit être un tableau");
  }

  const copie = regles.map((regle, i) => {
    if (typeof regle?.motCle !== "string" || regle.motCle.trim() === "" || typeof regle?.reponse !== "string") {
      throw new TypeError(`regles[${i}] est invalide : il faut { motCle, reponse } avec deux textes`);
    }
    return { motCle: regle.motCle, reponse: regle.reponse };
  });

  return {
    repondre(texte) {
      return repondre(texte, copie, assistant);
    },
  };
}
