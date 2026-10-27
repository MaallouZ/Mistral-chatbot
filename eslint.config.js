// Départ J2-02 : les règles de base de Cap Web pour le navigateur.
const navigateur = Object.fromEntries(
  ["window", "document", "localStorage", "console", "fetch", "setTimeout"].map((nom) => [nom, "readonly"])
);

export default [
  {
    files: ["public/**/*.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: navigateur },
    rules: { "no-unused-vars": "error", "no-undef": "error", eqeqeq: "error", "no-var": "error", "prefer-const": "error" }
  }
];
