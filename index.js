// Firebase SDK v10 (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "TON_API_KEY",
    authDomain: "TON_DOMAINE.firebaseapp.com",
    projectId: "TON_PROJECT_ID",
    storageBucket: "TON_BUCKET.appspot.com",
    messagingSenderId: "TON_SENDER_ID",
    appId: "TON_APP_ID"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Récupère les fiches depuis Firestore
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

// Événements
document.getElementById('createBtn').addEventListener('click', () => {
    window.location.href = 'fiche.html';
});

document.getElementById('openBtn').addEventListener('click', () => {
    const nom = document.getElementById('ficheSelect').value;

    if (!nom) {
        alert("Merci de sélectionner une fiche !");
        return;
    }

    window.location.href = `fiche.html?nom=${encodeURIComponent(nom)}`;
});

// Charger les fiches au chargement
chargerFiches();

document.getElementById('testBtn').addEventListener('click', () => {
    window.location.href = 'test.html';
});
