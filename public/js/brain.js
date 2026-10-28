export function validerMessage(texte, limite) {
  const propre = String(texte ?? "").trim();
  if (propre.length === 0) return { ok: false, raison: "vide" };
  if (propre.length > limite) return { ok: false, raison: "trop-long" };
  return { ok: true, texte: propre };
}

export function repondre(texte, regles, assistant) {
  const message = String(texte ?? "");
  for (const regle of regles) {
    if (message === regle.motCle) return regle.reponse;
  }
  return `${assistant} : je n'ai pas compris, essayez un autre mot.`;
}
