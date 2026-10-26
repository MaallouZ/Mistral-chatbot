// Logique métier du chatbot (à compléter à partir de J1-03).

export const REGLES = [
  {motCle: "clavier" , reponse: "Mistral : utilisez Tab puis Entrée pour envoyer votre message sans souris."},
  {motCle: "pause" , reponse: "Mistral : une pause de 10 minutes est prévue au milieu de chaque demi-journée."},
  {motCle: "statut" , reponse: "Mistral est opérationnel et prêt à répondre."},

];

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
