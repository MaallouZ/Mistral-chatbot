import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { demarrer } from "../../server/serveur.mjs";

let serveur;

before(async () => {
  serveur = await demarrer({ port: 0 });
});

after(async () => {
  await serveur.fermer();
});

function envoyer(message) {
  return fetch(`${serveur.url}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}

describe("serveur de bout en bout", () => {
  it("sert la page d'accueil", async () => {
    const reponse = await fetch(`${serveur.url}/`);
    assert.equal(reponse.status, 200);
    assert.match(await reponse.text(), /id="historique"/);
  });
  it("répond selon les règles, même au milieu d'une phrase", async () => {
    const reponse = await envoyer("Quand est la pause ?");
    assert.equal(reponse.status, 200);
    const donnees = await reponse.json();
    assert.match(donnees.reply, /pause de 10 minutes/);
  });

  it("répond avec la troisième règle", async () => {
    const donnees = await (await envoyer("statut")).json();
    assert.match(donnees.reply, /opérationnel/);
  });
  it("accepte un message d'exactement 130 caractères", async () => {
    const reponse = await envoyer("a".repeat(130));
    assert.equal(reponse.status, 200);
  });

  it("refuse un message de 131 caractères", async () => {
    const reponse = await envoyer("a".repeat(131));
    assert.equal(reponse.status, 400);
  });

  it("refuse un message fait d'espaces", async () => {
    const reponse = await envoyer("   ");
    assert.equal(reponse.status, 400);
  });

  it("refuse une autre méthode que POST", async () => {
    const reponse = await fetch(`${serveur.url}/api/chat`);
    assert.equal(reponse.status, 405);
  });
});
