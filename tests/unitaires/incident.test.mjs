import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { repondre } from "../../public/js/brain.js";

const REGLES = [
  { motCle: "clavier", reponse: "Réponse clavier" },
  { motCle: "pause", reponse: "Réponse pause" },
  { motCle: "statut", reponse: "Réponse statut" },
];

describe("non-régression de l'incident « perf »", () => {
  it("trouve le mot-clé dans une phrase complète", () => {
    assert.equal(repondre("j'ai besoin d'une pause svp", REGLES, "Zorglub"), "Réponse pause");
  });

  it("trouve le mot-clé suivi d'un point d'interrogation", () => {
    assert.equal(repondre("statut ?", REGLES, "Zorglub"), "Réponse statut");
  });
});
