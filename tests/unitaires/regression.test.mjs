import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validerMessage } from "../../public/js/brain.js";

describe("non-régression : espaces retirés des deux côtés", () => {
  it("accepte 130 caractères suivis d'espaces", () => {
    const texte = "a".repeat(130) + "   ";
    assert.equal(validerMessage(texte, 130).ok, true);
  });
  
  it("renvoie le message sans les espaces de la fin", () => {
    assert.deepEqual(validerMessage("abc   ", 130), { ok: true, texte: "abc" });
  });

});
