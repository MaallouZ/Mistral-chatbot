const lignes = new WeakMap();

export function afficher(historique, etat, locales = new WeakSet()) {
  const lis = [];

  for (const message of etat) {
    let li = lignes.get(message);

    if (!li) {
      li = document.createElement("li");
      li.className = "msg";
      li.dataset.role = message.role;
      li.textContent = message.text;
      if (locales.has(message)) {
        li.dataset.source = "local";
      }
      lignes.set(message, li);
    }

    lis.push(li);
  }

  historique.replaceChildren(...lis);
}