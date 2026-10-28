import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validerMessage } from "../../public/js/brain.js";

describe("non-régression : espaces retirés des deux côtés", () => {
  it("accepte 130 caractères suivis d'espaces", () => {
    const texte = "a".repeat(130) + "   ";
    assert.equal(validerMessage(texte, 130).ok, true);
  });
});
