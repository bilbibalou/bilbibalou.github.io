import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA4WU_ZrpfrGUm0jECl5TKeD196CC7bMwo",
    authDomain: "fiches-jdr.firebaseapp.com",
    projectId: "fiches-jdr",
    storageBucket: "fiches-jdr.firebasestorage.app",
    messagingSenderId: "983380454481",
    appId: "1:983380454481:web:f86d83528cf90bbc0f1c70"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Récupère les fiches existantes
async function chargerFiches() {
    const ficheSelect = document.getElementById('ficheSelect');
    const fichesSnapshot = await getDocs(collection(db, "fiches"));

    fichesSnapshot.forEach(doc => {
        const nom = doc.id;
        const option = document.createElement('option');
        option.value = nom;
        option.textContent = nom;
        ficheSelect.appendChild(option);
    });
}

// ✔️ Créer une fiche
document.getElementById('createBtn').addEventListener('click', async () => {
    const nom = prompt("Nom du personnage ?");
    if (!nom) return;

    // Crée une fiche vide dans Firestore
    await setDoc(doc(db, "fiches", nom), {
        classe: '',
        race: '',
        age: '',
        histoire: '',
        notes: '',
        capacity: '',
        photo: '',
        jauges: {},
        competences: {},
        inventaire: {}
    });

    window.location.href = `fiche.html?nom=${encodeURIComponent(nom)}`;
});

// ✔️ Ouvrir une fiche existante
document.getElementById('openBtn').addEventListener('click', () => {
    const nom = document.getElementById('ficheSelect').value;
    if (!nom) return alert("Merci de sélectionner une fiche !");
    window.location.href = `fiche.html?nom=${encodeURIComponent(nom)}`;
});

// ✔️ Page test
document.getElementById('testBtn').addEventListener('click', () => {
    window.location.href = 'test.html';
});

chargerFiches();
