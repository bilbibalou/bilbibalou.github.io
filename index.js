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

// Exporter une fiche au format JSON
function exporterFiche() {
  const ficheSelect = document.getElementById("ficheSelect");
  const nom = ficheSelect.value;
  if (!nom) {
    alert("Sélectionnez une fiche à exporter !");
    return;
  }

  // Récupère les données locales de cette fiche (tout ce qui a été sauvegardé avec le préfixe)
  const allKeys = Object.keys(localStorage);
  const prefix = `fiche_${nom}_`;
  let data = {};

  allKeys.forEach(key => {
    if (key.startsWith(prefix)) {
      data[key] = localStorage.getItem(key);
    }
  });

  if (Object.keys(data).length === 0) {
    alert("Aucune donnée trouvée pour cette fiche !");
    return;
  }

  // Création du fichier JSON
  const blob = new Blob([JSON.stringify({nom, data}, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nom}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Importer une fiche depuis un JSON
function importerFiche(file) {
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);
      const nom = imported.nom;
      const data = imported.data;

      if (!nom || !data) {
        alert("Fichier invalide !");
        return;
      }

      // Sauvegarde des métadonnées dans la liste des fiches
      let fiches = getAllFiches();
      if (!fiches[nom]) {
        fiches[nom] = {nom: nom};
        saveAllFiches(fiches);
      }

      // Stocke toutes les données dans localStorage
      Object.keys(data).forEach(key => {
        localStorage.setItem(key, data[key]);
      });

      chargerFiches();
      alert(`Fiche "${nom}" importée avec succès !`);
    } catch (e) {
      alert("Erreur lors de l'import : " + e.message);
    }
  };
  reader.readAsText(file);
}

// Boutons exporter/importer
document.getElementById("exportBtn").addEventListener("click", exporterFiche);
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});
document.getElementById("importFile").addEventListener("change", function() {
  if (this.files.length > 0) {
    importerFiche(this.files[0]);
    this.value = ""; // reset pour permettre de réimporter le même fichier
  }
});
