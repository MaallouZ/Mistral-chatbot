import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as brain from "../../public/js/brain.js";

const absent = typeof brain.creerMoteur !== "function";

const REGLES = [
  { motCle: "clavier", reponse: "Réponse clavier" },
  { motCle: "pause", reponse: "Réponse pause" },
];

describe("creerMoteur (bonus)", { skip: absent }, () => {
  it("répond comme repondre avec ses règles", () => {
    const moteur = brain.creerMoteur(REGLES, "Zorglub");
    assert.equal(moteur.repondre("une pause ?"), "Réponse pause");
  });

  it("garde sa propre copie des règles", () => {
    const regles = [{ motCle: "clavier", reponse: "Avant" }];
    const moteur = brain.creerMoteur(regles, "Zorglub");
    regles[0].reponse = "Après";
    assert.equal(moteur.repondre("clavier"), "Avant");
  });

  it("refuse autre chose qu'un tableau", () => {
    assert.throws(() => brain.creerMoteur("pas un tableau", "Zorglub"), TypeError);
  });

  it("refuse une règle invalide", () => {
    assert.throws(() => brain.creerMoteur([{ motCle: "", reponse: "x" }], "Zorglub"), TypeError);
    assert.throws(() => brain.creerMoteur([null], "Zorglub"), TypeError);
  });
});
