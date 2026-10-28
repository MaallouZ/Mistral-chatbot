// Départ J2-02 : les règles de base de Cap Web pour le navigateur.
const navigateur = Object.fromEntries(
  ["window", "document", "localStorage", "console", "fetch", "setTimeout"].map((nom) => [nom, "readonly"])
);

export default [
  {
    files: ["public/**/*.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: navigateur },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-restricted-properties": ["error",
        { property: "innerHTML", message: "innerHTML ouvre la porte aux failles XSS : utilisez textContent." },
        { property: "outerHTML", message: "outerHTML ouvre la porte aux failles XSS : utilisez textContent." }
      ],
      "no-restricted-syntax": ["error",
        { selector: "Literal[value=/^(sk|pk|ghp|AKIA)[-_A-Za-z0-9]{10,}/]", message: "Clé secrète écrite dans le code : mettez-la côté serveur, dans une variable d'environnement." }
      ]
    }

  }
];
