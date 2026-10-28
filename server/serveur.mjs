// Serveur statique officiel du squelette étudiant.

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { creerFournisseur, lireRouteDepuisFiche } from "./fournisseur.mjs";
import { execFileSync } from "node:child_process";
import { validerMessage, creerMoteur, REGLES } from "../public/js/brain.js";

const TYPES_MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};
const LIMITE = 130;
const ASSISTANT = "Mistral";
const moteur = creerMoteur(REGLES, ASSISTANT);

function repondreJson(res, code, objet) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(objet));
}

function lireCorps(req) {
  return new Promise((resolve) => {
    const morceaux = [];
    req.on("data", (morceau) => morceaux.push(morceau));
    req.on("end", () => resolve(Buffer.concat(morceaux).toString("utf8")));
    req.on("error", () => resolve(""));
  });
}

// api : une fonction async (req, res) qui rend true quand elle a traité la requête (le fournisseur simulé).
export function demarrer({ port = 0, racine, api = null } = {}) {
  const dossierServeur = path.dirname(fileURLToPath(import.meta.url));
  const base = racine
    ? path.resolve(racine)
    : path.resolve(dossierServeur, "..");
  const dossierPublic = fs.existsSync(path.join(base, "public"))
    ? path.join(base, "public")
    : base;

  const serveur = http.createServer(async (req, res) => {
    if (api && (await api(req, res))) return;
    const urlObj = new URL(req.url ?? "/", "http://127.0.0.1");
    if (urlObj.pathname === "/api/health") {
      return repondreJson(res, 200, { status: "ok" });
    }
    if (urlObj.pathname === "/api/chat") {
      if (req.method !== "POST") {
        return repondreJson(res, 405, { erreur: "Méthode POST attendue" });
      }

      const corps = await lireCorps(req);
      let message;
      try {
        message = JSON.parse(corps).message;
      } catch {
        return repondreJson(res, 400, { erreur: "Le corps doit être du JSON" });
      }

      if (typeof message !== "string") {
        return repondreJson(res, 400, {
          erreur: "Le message doit être un texte",
        });
      }

      const verdict = validerMessage(message, LIMITE);
      if (!verdict.ok) {
        return repondreJson(res, 400, { erreur: verdict.raison });
      }

      return repondreJson(res, 200, { reply: moteur.repondre(message) });
    }

    if (urlObj.pathname === "/version.json") {
      try {
        const sha = execFileSync("git", ["rev-parse", "HEAD"], {
          cwd: base,
          encoding: "utf8",
        }).trim();
        return repondreJson(res, 200, { sha });
      } catch {
        return repondreJson(res, 500, { erreur: "Version introuvable" });
      }
    }

    const cheminDemande =
      urlObj.pathname === "/" ? "/index.html" : urlObj.pathname;
    const relatif = cheminDemande.replace(/^\/+/, "");
    const cible = path.resolve(dossierPublic, relatif);
    const relVerif = path.relative(dossierPublic, cible);

    if (relVerif.startsWith("..") || path.isAbsolute(relVerif)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Accès interdit");
      return;
    }

    if (!fs.existsSync(cible) || !fs.statSync(cible).isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Introuvable");
      return;
    }

    const ext = path.extname(cible).toLowerCase();
    const mime = TYPES_MIME[ext] ?? "application/octet-stream";
    const contenu = fs.readFileSync(cible);
    res.writeHead(200, { "Content-Type": mime });
    res.end(contenu);
  });

  return new Promise((resolve, reject) => {
    serveur.once("error", reject);
    serveur.listen(port, "127.0.0.1", () => {
      const adresse = serveur.address();
      const portReel =
        typeof adresse === "object" && adresse ? adresse.port : port;
      const url = `http://127.0.0.1:${portReel}`;
      const fermer = () =>
        new Promise((res) => {
          serveur.closeAllConnections?.();
          serveur.close(() => res());
        });
      resolve({ url, port: portReel, fermer });
    });
  });
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT ?? 3000);
  const racine = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const fournisseur = creerFournisseur({
    routeSuggestions: lireRouteDepuisFiche(racine),
    scenario: {
      chat: process.env.CAPWEB_SCENARIO ?? "normal",
      suggestions: process.env.CAPWEB_SCENARIO === "500" ? "500" : "normal",
    },
  });
  const { url } = await demarrer({ port, racine, api: fournisseur.gerer });
  console.log(`Serveur Cap Web démarré sur ${url}`);
}
