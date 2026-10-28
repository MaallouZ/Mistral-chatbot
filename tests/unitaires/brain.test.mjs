// Tests unitaires du cerveau : le comportement demandé en J1-03.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validerMessage, repondre } from "../../public/js/brain.js";

const REGLES = [
  { motCle: "clavier", reponse: "Réponse clavier" },
  { motCle: "pause", reponse: "Réponse pause" },
  { motCle: "statut", reponse: "Réponse statut" },
];

describe("validerMessage", () => {
  it("accepte un message normal", () => {
    assert.equal(validerMessage("bonjour", 130).ok, true);
  });

  it("refuse un message absent (undefined)", () => {
    assert.equal(validerMessage(undefined, 130).ok, false);
  });

  it("refuse un message vide", () => {
    const resultat = validerMessage("", 130);
    assert.equal(resultat.ok, false);
    assert.equal(resultat.raison, "vide");
  });

  it("refuse un message fait seulement d'espaces", () => {
    const resultat = validerMessage("     ", 130);
    assert.equal(resultat.ok, false);
    assert.equal(resultat.raison, "vide");
  });

  it("accepte un message d'exactement la limite", () => {
    assert.equal(validerMessage("a".repeat(130), 130).ok, true);
  });

  it("refuse un message d'un caractère de trop", () => {
    const resultat = validerMessage("a".repeat(131), 130);
    assert.equal(resultat.ok, false);
    assert.equal(resultat.raison, "trop-long");
  });

  it("ne compte pas les espaces au début et à la fin", () => {
    assert.equal(validerMessage("   " + "a".repeat(130) + "   ", 130).ok, true);
  });

  it("utilise la limite reçue en paramètre", () => {
    assert.equal(validerMessage("abcde", 5).ok, true);
    assert.equal(validerMessage("abcdef", 5).raison, "trop-long");
  });
});

describe("repondre", () => {
  it("donne la réponse de la première règle", () => {
    assert.equal(repondre("clavier", REGLES, "Mistral"), "Réponse clavier");
  });
  
  it("donne la réponse par défaut sans message (undefined)", () => {
    assert.ok(repondre(undefined, REGLES, "Zorglub").includes("Zorglub"));
  });

  it("donne la réponse de la deuxième règle", () => {
    assert.equal(repondre("pause", REGLES, "Mistral"), "Réponse pause");
  });

  it("donne la réponse de la troisième règle", () => {
    assert.equal(repondre("statut", REGLES, "Mistral"), "Réponse statut");
  });

  it("trouve un mot-clé au milieu d'une phrase", () => {
    assert.equal(repondre("je voudrais faire une pause maintenant", REGLES, "Mistral"), "Réponse pause");
  });

  it("choisit la première règle de la liste quand plusieurs correspondent", () => {
    assert.equal(repondre("statut puis clavier", REGLES, "Mistral"), "Réponse clavier");
  });

  it("répond avec le nom de l'assistant quand aucune règle ne correspond", () => {
    const reponse = repondre("bonjour tout le monde", REGLES, "Zorglub");
    assert.ok(reponse.includes("Zorglub"));
  });
});
