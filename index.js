// index.js sans Firebase — stockage local dans le navigateur

// Récupération de toutes les fiches depuis localStorage
function getAllFiches() {
  const fiches = localStorage.getItem("fiches");
  return fiches ? JSON.parse(fiches) : {};
}

// Sauvegarde d'un dictionnaire de fiches dans localStorage
function saveAllFiches(fiches) {
  localStorage.setItem("fiches", JSON.stringify(fiches));
}

// Création d'une nouvelle fiche
function creerNouvelleFiche() {
  const nom = prompt("Nom de la nouvelle fiche :");
  if (!nom) return;

  let fiches = getAllFiches();

  if (fiches[nom]) {
    alert("Une fiche avec ce nom existe déjà !");
    return;
  }

  fiches[nom] = {
    nom: nom,
    classe: "",
    race: "",
    age: "",
    niveau: 1,
    xp: 0,
    bio: "",
    histoire: "",
    notes: "",
    capacities: [],
    photo: "",
    jauges: {},
    competences: {},
    inventaire: [],
    sorts: []
  };

  saveAllFiches(fiches);

  // Redirection vers fiche_personnage.html
  window.location.href = `fiche_personnage.html?nom=${encodeURIComponent(nom)}`;
}

// Charger les fiches dans le select
function chargerFiches() {
  const ficheSelect = document.getElementById("ficheSelect");
  ficheSelect.innerHTML = "";

  const fiches = getAllFiches();
  Object.keys(fiches).forEach((nom) => {
    const option = document.createElement("option");
    option.value = nom;
    option.textContent = nom;
    ficheSelect.appendChild(option);
  });
}

// Ouvrir une fiche depuis la liste
function ouvrirFiche() {
  const ficheSelect = document.getElementById("ficheSelect");
  const nom = ficheSelect.value;
  if (!nom) {
    alert("Sélectionnez une fiche !");
    return;
  }
  window.location.href = `fiche_personnage.html?nom=${encodeURIComponent(nom)}`;
}

// Supprimer une fiche
function supprimerFiche() {
  const ficheSelect = document.getElementById("ficheSelect");
  const nom = ficheSelect.value;
  if (!nom) {
    alert("Sélectionnez une fiche !");
    return;
  }

  if (!confirm(`Supprimer la fiche "${nom}" ?`)) return;

  let fiches = getAllFiches();
  delete fiches[nom];
  saveAllFiches(fiches);

  chargerFiches();
}

// Brancher les boutons
document.getElementById("createBtn").addEventListener("click", creerNouvelleFiche);
document.getElementById("openBtn").addEventListener("click", ouvrirFiche);
document.getElementById("deleteBtn").addEventListener("click", supprimerFiche);

// Chargement initial
chargerFiches();