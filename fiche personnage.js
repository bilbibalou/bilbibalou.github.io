import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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
const ficheNom = new URLSearchParams(window.location.search).get("nom");

import { getStorage, ref as storageRef, uploadBytes, deleteObject, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

const storage = getStorage(app);

///////////////// Charger les données d'une fiche //////////////////////

async function chargerFicheDepuisFirestore() {
    if (!ficheNom) return;
    
    const ref = doc(db, "fiches", ficheNom);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    
    const data = snap.data();
    
    // 🎯 Champs généraux
    document.querySelector('.name-input').value = data.nom || '';
    document.querySelector('.level-input').value = data.niveau || '';
    document.querySelector('.xp-input').value = data.xp || '';
    document.querySelector('.bio-input').value = data.bio || '';
    document.getElementById('race').value = data.race || '';
    document.getElementById('classe').value = data.classe || '';
    document.getElementById('age').value = data.age || '';
    document.getElementById('zone-histoire').value = data.histoire || '';
    document.getElementById('zone-notes').value = data.notes || '';
    document.getElementById('capacity').value = data.capacities || '';
    
    // 🖼 Image
    if (data.photo) {
        photoPreview.src = data.photo;
        photoPreview.style.display = "block";
        photoText.style.display = "none";
        removePhotoBtn.style.display = 'block';
    }
    
    // 🔋 Jauges
    if (data.jauges) {
        for (const [type, values] of Object.entries(data.jauges)) {
            const gauge = document.querySelector(`.gauge[data-type="${type}"]`);
            if (gauge) {
                gauge.querySelector('.gauge-current').value = values.current || 0;
                gauge.querySelector('.gauge-max').value = values.max || 1;
            }
        }
    }
    
    // 🧠 Compétences
    if (data.competences) {
        document.querySelectorAll('.competence-box').forEach(box => {
            const title = box.querySelector('.competence-title')?.textContent?.trim();
            const val = data.competences[title];
            if (val) {
                box.querySelector('.competence-base').value = val.base || 0;
                box.querySelector('.competence-mod').value = val.mod || 0;
                const total = parseInt(val.base || 0) + parseInt(val.mod || 0);
                box.querySelector('.competence-value').textContent = total;
            }
        });
    }
    
    // 🧳 Inventaire
    if (data.inventaire) {
        const inv = data.inventaire;
    
        // Armure
        document.getElementById('inv-armure-nom').value = inv.armure?.nom || '';
        document.getElementById('inv-armure-type').value = inv.armure?.type || '';
        document.getElementById('inv-armure-protection').value = inv.armure?.protection || '';
        document.getElementById('inv-armure-effet').value = inv.armure?.effet || '';
        document.getElementById('inv-armure-propriete').value = inv.armure?.propriete || '';
    
        // Arme 1
        document.getElementById('inv-arme1-nom').value = inv.arme1?.nom || '';
        document.getElementById('inv-arme1-style').value = inv.arme1?.style || '';
        document.getElementById('inv-arme1-degats').value = inv.arme1?.degats || '';
        document.getElementById('inv-arme1-type').value = inv.arme1?.type || '';
        document.getElementById('inv-arme1-effet').value = inv.arme1?.effet || '';
        document.getElementById('inv-arme1-propriete').value = inv.arme1?.propriete || '';
    
        // Arme 2
        document.getElementById('inv-arme2-nom').value = inv.arme2?.nom || '';
        document.getElementById('inv-arme2-style').value = inv.arme2?.style || '';
        document.getElementById('inv-arme2-degats').value = inv.arme2?.degats || '';
        document.getElementById('inv-arme2-type').value = inv.arme2?.type || '';
        document.getElementById('inv-arme2-effet').value = inv.arme2?.effet || '';
        document.getElementById('inv-arme2-propriete').value = inv.arme2?.propriete || '';
    
        // Or
        document.getElementById('inv-po').value = inv.po || 0;
    }
    
    // ✨ Sorts
    if (data.sorts && Array.isArray(data.sorts)) {
        const spellList = document.getElementById('my-spells-list');
        spellList.innerHTML = ''; // Nettoyage avant ajout
        data.sorts.forEach(spell => {
            const div = document.createElement('div');
            div.className = 'spell-card';
            div.textContent = spell;
            spellList.appendChild(div);
        });
    }
}

if (ficheNom) {
    chargerFicheDepuisFirestore(ficheNom);
}

///////////// Sauvegarder la fiche dans firebase /////////////

async function sauvegarderFicheAuto() {
    if (!ficheNom) return;
    const ref = doc(db, "fiches", ficheNom);
    
    const ficheData = {
        // Champs de base
        nom: document.querySelector('.name-input')?.value || '',
        niveau: document.querySelector('.level-input')?.value || '',
        xp: document.querySelector('.xp-input')?.value || '',
        bio: document.querySelector('.bio-input')?.value || '',
        race: document.getElementById('race')?.value || '',
        classe: document.getElementById('classe')?.value || '',
        age: document.getElementById('age')?.value || '',
        histoire: document.getElementById('zone-histoire')?.value || '',
        notes: document.getElementById('zone-notes')?.value || '',
        capacities: document.getElementById('capacity')?.value || '',
    
        // Jauges
        jauges: {},
        // Compétences
        competences: {},
        // Inventaire
        inventaire: {},
        // Sorts
        sorts: [],
    };
    
    // 🔋 Jauges
    document.querySelectorAll('.gauge').forEach(gauge => {
        const type = gauge.dataset.type;
        const current = gauge.querySelector('.gauge-current')?.value;
        const max = gauge.querySelector('.gauge-max')?.value;
        ficheData.jauges[type] = { current, max };
    });
    
    // 🧠 Compétences
    document.querySelectorAll('.competence-box').forEach(box => {
        const title = box.querySelector('.competence-title')?.textContent?.trim();
        const base = box.querySelector('.competence-base')?.value;
        const mod = box.querySelector('.competence-mod')?.value;
        ficheData.competences[title] = { base, mod };
    });
    
    // 🎒 Inventaire
    const inv = ficheData.inventaire;
    inv.armure = {
        nom: document.getElementById('inv-armure-nom')?.value,
        type: document.getElementById('inv-armure-type')?.value,
        protection: document.getElementById('inv-armure-protection')?.value,
        effet: document.getElementById('inv-armure-effet')?.value,
        propriete: document.getElementById('inv-armure-propriete')?.value,
    };
    
    inv.arme1 = {
        nom: document.getElementById('inv-arme1-nom')?.value,
        style: document.getElementById('inv-arme1-style')?.value,
        degats: document.getElementById('inv-arme1-degats')?.value,
        type: document.getElementById('inv-arme1-type')?.value,
        effet: document.getElementById('inv-arme1-effet')?.value,
        propriete: document.getElementById('inv-arme1-propriete')?.value,
    };
    
    inv.arme2 = {
        nom: document.getElementById('inv-arme2-nom')?.value,
        style: document.getElementById('inv-arme2-style')?.value,
        degats: document.getElementById('inv-arme2-degats')?.value,
        type: document.getElementById('inv-arme2-type')?.value,
        effet: document.getElementById('inv-arme2-effet')?.value,
        propriete: document.getElementById('inv-arme2-propriete')?.value,
    };

    inv.po = document.getElementById('inv-po')?.value || 0;
    
    // ✨ Sorts (enregistre juste les noms ou un objet si tu veux plus tard)
    document.querySelectorAll('#my-spells-list .spell-card').forEach(card => {
        ficheData.sorts.push(card.textContent.trim());
    });
    
    await setDoc(ref, ficheData, { merge: true });
}

function activerSauvegardeAuto() {
    const champs = document.querySelectorAll('input, textarea, select');
    
    champs.forEach(champ => {
        
        champ.addEventListener('input', () => {
            sauvegarderFicheAuto();
        });
    });
}

if (ficheNom) {
    chargerFicheDepuisFirestore().then(() => {
      activerSauvegardeAuto(); // 🔁 activer la sauvegarde automatique
    });
}

function activerSauvegardeAuto() {
    const champs = document.querySelectorAll('input, textarea, select');
    champs.forEach(champ => {
        champ.addEventListener('input', () => {
            sauvegarderFicheAuto();
        });
    });
}

if (ficheNom) {
    chargerFicheDepuisFirestore().then(() => {
        activerSauvegardeAuto();
    });
}


///////////////////// Photo de profil /////////////////////

// Clic sur l'encadré => ouvre la sélection de fichier
photoFrame.addEventListener('click', () => {photoInput.click();});

photoInput.addEventListener('change', async function () {
    const file = this.files[0];
    if (!file || !ficheNom) return;
    
    const path = `photos/${ficheNom}.jpg`; // nom unique lié au personnage
    const imageRef = storageRef(storage, path);
    
    try {
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
    
        photoPreview.src = url;
        photoPreview.style.display = "block";
        photoText.style.display = "none";
        removePhotoBtn.style.display = 'block';
    
      // Met à jour l’URL dans Firestore
        const ref = doc(db, "fiches", ficheNom);
        await setDoc(ref, { photo: url }, { merge: true });
    } catch (error) {
        console.error("Erreur d’upload image :", error);
    }
});

// Supprimer la photo
removePhotoBtn.addEventListener('click', async function () {
    if (!ficheNom) return;
    
    const path = `photos/${ficheNom}.jpg`;
    const imageRef = storageRef(storage, path);
    
    try {
        await deleteObject(imageRef); // 🧹 supprime de Firebase Storage
    } catch (error) {
        console.warn("Image non trouvée sur Firebase (peut-être déjà supprimée)");
    }
    
    // Enlève l’URL dans Firestore
    const ref = doc(db, "fiches", ficheNom);
    await setDoc(ref, { photo: "" }, { merge: true });
    
    // Nettoie l'affichage
    photoPreview.src = '';
    photoPreview.style.display = 'none';
    removePhotoBtn.style.display = 'none';
    photoInput.value = '';
    photoText.style.display = 'block';
});

// ##########################################################################################################

// Onglets
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        
        this.classList.add('active');
        const id = this.getAttribute('data-tab');
        document.getElementById('tab-' + id).classList.add('active');
    });
});

// ##########################################################################################################

// Géstion des jauges et sauvegarde des données
document.querySelectorAll('.competence-box').forEach(box => {
    const base = box.querySelector('.competence-base');
    const mod = box.querySelector('.competence-mod');
    const value = box.querySelector('.competence-value');
    
    function updateValue() {
        value.textContent = (+base.value || 0) + (+mod.value || 0);
    }
    base.addEventListener('input', updateValue);
    mod.addEventListener('input', updateValue);
    // Initialiser à l'ouverture
    updateValue();
});

function updateGaugeBar(gauge) {
    const current = parseInt(gauge.querySelector('.gauge-current').value) || 0;
    const max = parseInt(gauge.querySelector('.gauge-max').value) || 1;
    const fill = gauge.querySelector('.gauge-fill');
    const percent = Math.round((current / max) * 100);
    fill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

// Initialisation et écouteurs
document.addEventListener('DOMContentLoaded', function() {
    // Rafraîchir les barres à l’affichage initial
    document.querySelectorAll('.gauge').forEach(gauge => updateGaugeBar(gauge));
    
    document.querySelectorAll('.gauge').forEach(gauge => {
    const currentInput = gauge.querySelector('.gauge-current');
    const maxInput = gauge.querySelector('.gauge-max');
    
    // Modifier valeur courante
    currentInput.addEventListener('input', function(){
        // Empêche d’aller au-delà du max ou en-dessous de 0
        let val = parseInt(currentInput.value) || 0;
        let maxVal = parseInt(maxInput.value) || 1;
        if(val < 0) val = 0;
        if(val > maxVal) val = maxVal;
        currentInput.value = val;
        updateGaugeBar(gauge);
    });
    
    // Modifier valeur max
    maxInput.addEventListener('input', function(){
        let maxVal = parseInt(maxInput.value) || 1;
        if(maxVal < 1) maxVal = 1;
        maxInput.value = maxVal;
        // Réajuste current si > max maintenant
        if(parseInt(currentInput.value) > maxVal) currentInput.value = maxVal;
        updateGaugeBar(gauge);
    });
    
    // Boutons flèches
    gauge.querySelector('.gauge-arrow.left').addEventListener('click', function(){
        let val = parseInt(currentInput.value) || 0;
        if(val > 0) {
        currentInput.value = val - 1;
        updateGaugeBar(gauge);
        }
    });
    
    gauge.querySelector('.gauge-arrow.right').addEventListener('click', function(){
        let val = parseInt(currentInput.value) || 0;
        let maxVal = parseInt(maxInput.value) || 1;
        if(val < maxVal) {
        currentInput.value = val + 1;
        updateGaugeBar(gauge);
        }
    });
    });
});

// ##########################################################################################################

// Sauvegarde des données des compétences (caractéristiques)

// ##########################################################################################################

// Sauvegarde des données de la fiche de l'onglet Profil
// Fonction pour charger les valeurs au démarrage


// Sauvegarder la valeur à chaque modification



// ##########################################################################################################

// Zone de texte pour l'histoire

// ##########################################################################################################

// Partie pour l'onget "Skills" : LocalStorage auto-save
// Sauvegarde auto des capacités (tab compétences)

// ----------- Auto-save textarea (inchangé) -----------


// ----------- SYSTÈME DE SORTS -----------
// Elements pour la modale
// --- Sélecteurs de la modale et des boutons ---
const ajouterSortBtn = document.getElementById('addSpellBtn');
const sortModal = document.getElementById('sort-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const sortModalBody = document.getElementById('sort-modal-body');

const MY_SPELLS_KEY = 'mySpellsList';
const SPELLS_FAVS_KEY = 'spells_stars_favs';

const sortsData = {
    "Générale": {
        "Bouclier": [
            {
                "Nom": "Lever de bouclier",
                "Description": "Levez votre bouclier en position défensive pour vous protéger des attaques ennemies.",
                "Effet": "Boost armure +2 / 1t",
                "Degat": null,
                "Cout": 7,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Parade",
                "Description": "Vous vous concentrez sur vos ennemis et leurs mouvements pour adopter la parade parfaite à la prochaine attaque.",
                "Effet": "Bloque",
                "Degat": null,
                "Cout": 13,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Défi",
                "Description": "Lancez un défi à un de vos opposant.",
                "Effet": "Provocation 1t",
                "Degat": null,
                "Cout": 5,
                "Portee": "distance courte"
            },
            {
                "Nom": "Renfort",
                "Description": "Prêtez main forte à un allié en difficulté en le protégeant.",
                "Effet": "Boost un allié armure +1 / 1t",
                "Degat": null,
                "Cout": 5,
                "Portee": "distance courte"
            },
            {
                "Nom": "Ruade",
                "Description": "Chargez une cible pour arriver à son corps à corps et l'attaquer.",
                "Effet": "Charge",
                "Degat": 0,
                "Cout": 7,
                "Portee": "distance moyenne"
            },
            {
                "Nom": "Coup de bouclier",
                "Description": "Frappez d'un coup de bouclier pleine face votre cible pour la repousser d'un pas.",
                "Effet": "Recule",
                "Degat": 1,
                "Cout": 7,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Désequilibre",
                "Description": "Donnez un bon coup de pied à la cible pour faire perdre l'équilibre.",
                "Effet": "Déséquilibre",
                "Degat": 1,
                "Cout": 4,
                "Portee": "corps à corps"
            }
        ],
        "Corps a corps physique": [
            {
                "Nom": "Affûtage",
                "Description": "Affûter le tranchant de l'arme.",
                "Effet": "buff dégât +1 / 3t",
                "Degat": null,
                "Cout": 6,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Balayage",
                "Description": "Coup en cône devant le lanceur.",
                "Effet": "Dégâts AOE cône",
                "Degat": 2,
                "Cout": 11,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Brise épaule",
                "Description": "Un grand coup épaule contre épaule.",
                "Effet": "Dégâts + déséquilibre",
                "Degat": 0,
                "Cout": 8,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Coup de garde",
                "Description": "Un bon coup de garde dans la tête.",
                "Effet": "Dégâts + stun",
                "Degat": 0,
                "Cout": 14,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Coup rapide",
                "Description": "Un coup vif visant à prendre de vitesse l’ennemi.",
                "Effet": "Dégâts",
                "Degat": 2,
                "Cout": 7,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Découpe",
                "Description": "Une attaque précise qui provoque une coupure.",
                "Effet": "dot saignement 2t",
                "Degat": "1 + 1",
                "Cout": 8,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Estocade",
                "Description": "Une percée vers l’avant.",
                "Effet": "Dégâts + dash avant",
                "Degat": 1,
                "Cout": 9,
                "Portee": "distance courte"
            },
            {
                "Nom": "Frappe",
                "Description": "Un coup standard maîtrisé.",
                "Effet": "Dégâts",
                "Degat": 2,
                "Cout": 8,
                "Portee": "corps à corps"
            }
        ],
        "Distance physique": [
            {
                "Nom": "Tir assuré",
                "Description": "D'une main assurée et ferme envoyez votre projectile sur l'ennemi",
                "Effet": "Dégâts",
                "Degat": 3,
                "Cout": 12,
                "Portee": "distance longue"
            },
            {
                "Nom": "Tir barbelé",
                "Description": "Chargez un projectile barbelé pour lacérer votre cible.",
                "Effet": "dot saignement 2t",
                "Degat": "0 + 1",
                "Cout": 10,
                "Portee": "distance moyenne"
            },
            {
                "Nom": "Rapidité elfique",
                "Description": "Grâce à vos entraînements vous pouvez pousser vos muscles pour bénéficier d'une grande rapidité de mouvement.",
                "Effet": "double action 2t",
                "Degat": null,
                "Cout": 9,
                "Portee": "lanceur"
            },
            {
                "Nom": "Fumigène",
                "Description": "Usez d'un petit artifice bien pratique pour aveugler les personnes alentour.",
                "Effet": "AOE aveuglement",
                "Degat": null,
                "Cout": 8,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Saut arrière",
                "Description": "Grâce à un habile saut en arrière vous pouvez prendre de la distance et vous sortir de situations complexes.",
                "Effet": "esquive saut arrière",
                "Degat": null,
                "Cout": 5,
                "Portee": "lanceur"
            },
            {
                "Nom": "Pas léger",
                "Description": "Vos long entraînement vous ont permis d'améliorer votre agilité.",
                "Effet": "buff agilité +3 (passif)",
                "Degat": null,
                "Cout": null,
                "Portee": "lanceur"
            },
            {
                "Nom": "Tir critique",
                "Description": "Effectuez un tir parfait sur les points vitaux de votre cible",
                "Effet": "Coups critique",
                "Degat": 0,
                "Cout": 20,
                "Portee": "distance longue"
            }
        ],
        "Magie": [
            {
                "Nom": "Luménite",
                "Description": "Faites apparaître une petite boule lumineuse qui éclaire faiblement autour de vous.",
                "Effet": "Éclaire la zone",
                "Degat": null,
                "Cout": 2,
                "Portee": "distance courte"
            },
            {
                "Nom": "Soin léger",
                "Description": "Améliorez la régénération des blessures légères de la cible.",
                "Effet": "soigne +2",
                "Degat": null,
                "Cout": 15,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Flambois",
                "Description": "Faites apparaître une petite flamme pour brûler une cible.",
                "Effet": "dégâts",
                "Degat": 3,
                "Cout": 12,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Grimmel",
                "Description": "Envoyez une décharge sur une cible.",
                "Effet": "dégâts",
                "Degat": 2,
                "Cout": 13,
                "Portee": "distance courte"
            },
            {
                "Nom": "Yral Ogla",
                "Description": "Créez un brouillard autour de vous pour réduire la visibilité.",
                "Effet": "enfume la zone",
                "Degat": null,
                "Cout": 10,
                "Portee": "distance moyenne"
            },
            {
                "Nom": "Talbot",
                "Description": "Placez vos mains au-dessus d'un liquide pour le geler, l'effet reste assez faible sur les gros objets.",
                "Effet": "gel un liquide, peu d'effet sur des gros objets",
                "Degat": null,
                "Cout": 8,
                "Portee": "distance courte"
            },
            {
                "Nom": "Difosse konarim",
                "Description": "Connectez votre esprit à celui de votre cible pour lui parler à distance.",
                "Effet": "permet à l'utilisateur de dire quelque chose à sa cible",
                "Degat": null,
                "Cout": 7,
                "Portee": "distance moyenne"
            },
            {
                "Nom": "Vock",
                "Description": "Utilisez la magie pour attirer une cible à vous.",
                "Effet": "attire",
                "Degat": null,
                "Cout": 5,
                "Portee": "distance courte"
            },
            {
                "Nom": "Dabrem sirel valon",
                "Description": "Projetez votre magie pour créer un bouclier protecteur devant vous pour vous protéger de ce qui est physique.",
                "Effet": "buff armure +2 1t",
                "Degat": null,
                "Cout": 13,
                "Portee": "corps à corps"
            },
            {
                "Nom": "Salono dak",
                "Description": "Transférez votre énergie à une cible.",
                "Effet": "mana de la cible +7",
                "Degat": null,
                "Cout": 15,
                "Portee": "distance courte"
            }
        ]
    },
    "Classe": {
        "Avant garde": [
            {
                "Nom": "Position defensive",
                "Description": "Passer en position de garde prêt à bloquer les coups, mais peu pratique pour attaquer. La position dure tant qu'elle n'est pas supprimée.",
                "Effet": "buff def debuff dégats",
                "Degats": { "def": 2, "dmg": -2 },
                "Cout": 2,
                "Portee": "corps à corps",
                "Amelioration": "def +1 / dmg +1"
            },
            {
                "Nom": "Provocation",
                "Description": "Provocation de l'ennemi pour attirer son attention.",
                "Effet": "taunt 3t",
                "Degats": null,
                "Cout": 3,
                "Portee": "distance moyenne",
                "Amelioration": "tours +1 / distance longue"
            },
            {
                "Nom": "Coup de pied",
                "Description": "THIS IS SPARTA !",
                "Effet": "degat + déséquilibre",
                "Degats": 2,
                "Cout": 5,
                "Portee": "corps à corps",
                "Amelioration": "recule / chute"
            },
            {
                "Nom": "Fauchage",
                "Description": "Frappe avec l'arme sur 180°.",
                "Effet": "aoe",
                "Degats": 2,
                "Cout": 8,
                "Portee": "corps à corps",
                "Amelioration": "cout -1 / cout -2"
            },
            {
                "Nom": "Eya",
                "Description": "Inscrivez une rune sur une arme pour l'enflammer et lui permettre d'infliger des dégâts magiques.",
                "Effet": "buff de dégât magique sur l'arme 2t",
                "Degats": 1,
                "Cout": 4,
                "Portee": "corps à corps",
                "Amelioration": "tours +1 / dmg +1"
            },
            {
                "Nom": "Toremsim",
                "Description": "Projetez des petits éclairs sur une cible proche.",
                "Effet": "dégât",
                "Degats": 3,
                "Cout": 9,
                "Portee": "distance courte",
                "Amelioration": "cout -2 / dmg +1"
            }
        ],
        "Ecuyer": [
            {
                "Nom": "Frappe hardie",
                "Description": "Un bon coup direct.",
                "Effet": "degat",
                "Degats": "1d6",
                "Cout": 6,
                "Portee": "corps à corps",
                "Amelioration": "dmg +1 / dmg +1"
            },
            {
                "Nom": "Attaque cyclone",
                "Description": "Une attaque circulaire qui touche tout le monde à 360°",
                "Effet": "aoe en cercle",
                "Degats": 2,
                "Cout": 8,
                "Portee": "corps à corps",
                "Amelioration": "cout -1 / dmg +1"
            },
            {
                "Nom": "Entaille",
                "Description": "Taillade l'ennemi et déclenche des saignements.",
                "Effet": "degat + dot 2 t",
                "Degats": "2 + 1",
                "Cout": 4,
                "Portee": "corps à corps",
                "Amelioration": "tours +1 / dmg +1"
            },
            {
                "Nom": "Revers",
                "Description": "Une attaque qui ne peut pas être bloquée.",
                "Effet": "degat imparrable",
                "Degats": 2,
                "Cout": 4,
                "Portee": "corps à corps",
                "Amelioration": "dmg +1 / inesquivable"
            },
            {
                "Nom": "Ireith sira rim",
                "Description": "Enchantez une arme pour augmenter son tranchant.",
                "Effet": "buff arme tranchante 1t",
                "Degats": "+1d6",
                "Cout": 12,
                "Portee": "corps à corps",
                "Amelioration": "cout -1 / cout -2"
            },
            {
                "Nom": "Lancer",
                "Description": "Lance l'arme sur un ennemi à courte portée.",
                "Effet": "dégât",
                "Degats": null,
                "Cout": 3,
                "Portee": "distance courte",
                "Amelioration": "dmg +2 / distance moyenne"
            }
        ],
        "Apprenti sorcier": [
            {
                "Nom": "Ireith sil",
                "Description": "Envoyez une boule de feu causant une brûlure.",
                "Effet": "dégâts + dot 3t",
                "Degats": "2 + 1",
                "Cout": 9,
                "Portee": "distance moyenne",
                "Amelioration": "dmg +1 / cout -2"
            },
            {
                "Nom": "Bar solem",
                "Description": "Contrôlez la terre pour saisir et immobiliser une cible.",
                "Effet": "dégâts + root 1t",
                "Degats": 2,
                "Cout": 7,
                "Portee": "distance courte",
                "Amelioration": "distance moyenne / déséquilibre"
            },
            {
                "Nom": "Ireith volta",
                "Description": "Envoyez une puissante onde d'énergie pour causer des dégâts et repousser une cible.",
                "Effet": "dégâts + repousse",
                "Degats": 2,
                "Cout": 15,
                "Portee": "distance courte",
                "Amelioration": "cout -4 / déséquilibre"
            },
            {
                "Nom": "Dabrem a fii",
                "Description": "Créez une couche d'air sous pression pour repousser les projectiles physiques.",
                "Effet": "repousse les projectiles physiques",
                "Degats": null,
                "Cout": 5,
                "Portee": "corps à corps",
                "Amelioration": "distance courte / projectiles semi physiques"
            },
            {
                "Nom": "Arli a erem",
                "Description": "Attire un filet d'eau pour s'en servir comme fouet",
                "Effet": "dégâts",
                "Degats": "1d6",
                "Cout": 6,
                "Portee": "distance courte",
                "Amelioration": "cout -1 / pas de désavantage sans eau"
            },
            {
                "Nom": "Uritoris Genven",
                "Description": "Permet une télépathie à double sens entre plusieurs personnes.",
                "Effet": "permet la discussion télépathique entre le lanceur et les cibles",
                "Degats": null,
                "Cout": "1/cible",
                "Portee": "distance moyenne",
                "Amelioration": "distance longue / cout -50 %"
            }
        ],
        "Apprenti soigneur": [
            {
                "Nom": "Ireith luménite",
                "Description": "Puisez dans la lumière prismatique pour frapper l'ennemi d'un rayon lumineux.",
                "Effet": "dégât",
                "Degats": 2,
                "Cout": 4,
                "Portee": "distance courte",
                "Amelioration": "distance moyenne / aveuglement 1t"
            },
            {
                "Nom": "Arous merid",
                "Description": "Utilisez un soin pour les blessures légères.",
                "Effet": "soin",
                "Degats": 3,
                "Cout": 3,
                "Portee": "corps à corps",
                "Amelioration": "distance courte / soin +1"
            },
            {
                "Nom": "Inère",
                "Description": "Utilisez un puissant vent pour repousser la cible.",
                "Effet": "repousse",
                "Degats": null,
                "Cout": 6,
                "Portee": "distance courte",
                "Amelioration": "déséquilibre / distance moyenne"
            },
            {
                "Nom": "Alio",
                "Description": "Frappez directement dans l'esprit de la cible.",
                "Effet": "dégât",
                "Degats": "1d6",
                "Cout": 9,
                "Portee": "distance courte",
                "Amelioration": "cout -1 / distance moyenne"
            },
            {
                "Nom": "Vanos ireith sila",
                "Description": "Concentrez votre pouvoir pour rendre vos mains brûlantes.",
                "Effet": "dégât",
                "Degats": "1d6",
                "Cout": 7,
                "Portee": "corps à corps",
                "Amelioration": "dmg +1 / dot +1 2t"
            },
            {
                "Nom": "Areb arous",
                "Description": "Faites apparaître un cercle de 3 pas autour de vous, soignant toute personne à l'intérieur sur la durée.",
                "Effet": "soin aoe 3 tours",
                "Degats": 1,
                "Cout": 8,
                "Portee": "corps à corps",
                "Amelioration": "taille +50 % / choix des cibles"
            }
        ]
    }
};

// Affiche les sous-catégories "Générale" (sous-groupes)
function showSpellCategorySelection() {
    let categories = [];

    // Toujours la catégorie Générale
    if (sortsData["Générale"]) {
        categories.push({
            label: "Générale",
            key: "Générale"
        });
    }

    // On récupère la classe choisie
    const className = getSelectedClasse(); 
    // Vérifie si la classe existe bien dans les données
    if (className && sortsData["Classe"] && sortsData["Classe"][className]) {
        categories.push({
            label: `Classe : ${className}`,
            key: `Classe|${className}`
        });
    }

    if (categories.length === 0) {
        sortModalBody.innerHTML = `<p style="padding:16px;">Aucune catégorie de sorts trouvée.</p>`;
        return;
    }

    sortModalBody.innerHTML = `
        <h3>Choisis une catégorie :</h3>
        <div class="sort-btn-group">
            ${categories.map(cat =>
                `<button class="sort-type-btn maincat-btn" data-catkey="${cat.key}">
                    ${cat.label}
                </button>`
            ).join('')}
        </div>
    `;

    sortModalBody.querySelectorAll('.maincat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.dataset.catkey;
            if (val.startsWith("Classe|")) {
                const cls = val.split("|")[1];
                showSpellSubGroups("Classe", cls);
            } else {
                // Générale !
                showSpellSubGroups("Générale");
            }
        });
    });
}   

function showSpellSubGroups(categoryKey, classKey=null) {
    let subCats;
    if (categoryKey === "Classe" && classKey) {
        subCats = sortsData["Classe"][classKey];
    } else {
        subCats = sortsData[categoryKey];
    }

    // ⚡️ AJOUT! Si c'est un tableau (donc pas un objet à sous-catégories), on affiche direct les sorts en cartes
    if (Array.isArray(subCats)) {
        // Le "nom de la catégorie" dans l'UI sera classKey si Classe, sinon categoryKey
        showSpellsInSubgroup(categoryKey, classKey || categoryKey, classKey);
        return;
    }

    const subgroups = Object.keys(subCats);
    if (subgroups.length === 1) {
        showSpellsInSubgroup(categoryKey, subgroups[0], classKey);
        return;
    }

    sortModalBody.innerHTML = `
        <h3>${classKey ? classKey : categoryKey} — choisis une sous-catégorie :</h3>
        <div class="sort-btn-group">
            ${subgroups.map(sub =>
                `<button class="sort-type-btn subgroup-btn" data-catkey="${categoryKey}" data-classkey="${classKey || ''}" data-subgroup="${sub}">${sub}</button>`
            ).join('')}
        </div>
        <button class="back-btn sort-type-btn" style="margin-top:18px;">⬅ Retour</button>
    `;

    // Event listeners, inchangé
    sortModalBody.querySelectorAll('.subgroup-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showSpellsInSubgroup(
                btn.dataset.catkey, 
                btn.dataset.subgroup, 
                btn.dataset.classkey || null
            );
        });
    });
    sortModalBody.querySelector('.back-btn').addEventListener('click', showSpellCategorySelection);
}

// Affiche les sorts d'une sous-catégorie de Générale
function showSpellsInSubgroup(categoryKey, subgroup, classKey=null) {
    let spells;
    // Cas: affichage direct des sorts d'une classe (pas de sous-catégories)
    if (categoryKey === "Classe" && classKey && Array.isArray(sortsData["Classe"][classKey])) {
        spells = sortsData["Classe"][classKey];
        subgroup = classKey; // Affiche le nom de la classe dans le H3
    } else if (categoryKey === "Classe" && classKey) {
        spells = sortsData["Classe"][classKey][subgroup];
    } else {
        spells = sortsData[categoryKey][subgroup];
    }
    
    // Si pas de sorts trouvés, on affiche un message
    if (!spells) {
        sortModalBody.innerHTML = `<p style="padding:16px;">Aucun sort trouvé dans cette catégorie.</p>`;
        return;
    }
    
    // On affiche les sorts en cartes
    sortModalBody.innerHTML = `
        <button class="sort-type-btn back-btn" style="margin-bottom:18px;">⬅ Retour</button>
        <h3>${subgroup}</h3>
        <div class="spells-cards-list">
            ${spells.map((spell, idx) =>
                `<div class="spell-card">
                    <div>
                        <strong>${spell.Nom}</strong>
                        <div class="spell-desc">${spell.Description}</div>
                        <div class="spell-info">
                            <div><span>Effet:</span> ${spell.Effet ?? spell.Effects ?? ''}</div>
                            <div><span>Dégât:</span> ${spell.Degat ?? spell.Degats ?? '-'}</div>
                            <div><span>Coût:</span> ${spell.Cout ?? '-'}</div>
                            <div><span>Portée:</span> ${spell.Portee ?? ''}</div>
                            ${spell.Amelioration ? `<div><span>Amélioration:</span> ${spell.Amelioration}</div>` : ''}
                        </div>
                    </div>
                    <button class="add-spell-plus-btn"
                        data-catkey="${categoryKey}" 
                        data-classkey="${classKey || ''}"
                        data-subgroup="${subgroup}" 
                        data-idx="${idx}">+</button>
                </div>`
            ).join('')}
        </div>
    `;

    // Binding du bouton retour : TOUJOURS après le innerHTML
    sortModalBody.querySelector('.back-btn').addEventListener('click', () => {
        // Si on est dans une classe : il faut lui passer la classe pour revenir à l'écran de choix de sous-catégorie de cette classe (ou à la classe directe si pas de sous-catégories)
        if (categoryKey === "Classe" && classKey) {
            showSpellCategorySelection("Classe", classKey);
        } else {
            showSpellSubGroups(categoryKey);
        }
    });

    // Ajout des listeners sur les boutons "+"
    sortModalBody.querySelectorAll('.add-spell-plus-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            let spellsList;
            // Classe sans sous-catégorie : on est dans un tableau
            if (btn.dataset.catkey === "Classe" && btn.dataset.classkey && Array.isArray(sortsData["Classe"][btn.dataset.classkey])) {
                spellsList = sortsData["Classe"][btn.dataset.classkey];
            } 
            // Classe avec sous-catégorie
            else if (btn.dataset.catkey === "Classe" && btn.dataset.classkey) {
                spellsList = sortsData["Classe"][btn.dataset.classkey][btn.dataset.subgroup];
            } 
            // Catégorie générale
            else {
                spellsList = sortsData[btn.dataset.catkey][btn.dataset.subgroup];
            }
            const idx = parseInt(btn.dataset.idx, 10);
            addSpellToMyList(spellsList[idx]);
        });
    });
}

// Affichage de la liste de spells (mySpellsList) dans l'onglet principal
function renderMySpellsList() {
    const container = document.getElementById('my-spells-list');
    
    // Si pas de sorts, on affiche un message
    if (!list.length) {
        container.innerHTML = `<div class="myspell-empty">Aucun sort ajouté pour le moment.</div>`;
        return;
    }
    const starsState = getSpellStars();
    
    // On affiche les sorts en cartes
    container.innerHTML = list.map(spell => {
        let starsBlock = '';
        
        // Si le sort a une amélioration, on affiche les étoiles
        if (spell.Amelioration) {
            const [star1, star2] = starsState[spell.Nom] || [false, false];
            starsBlock = `
                <div class="stars-block" style="position:absolute;top:7px;right:12px;">
                    <span 
                        class="star" 
                        data-spell="${spell.Nom}" 
                        data-idx="0" 
                        style="font-size: 40px; color: ${star1 ? '#FFD700' : '#444'}; cursor:pointer;">
                        ★
                    </span>
                    <span 
                        class="star" 
                        data-spell="${spell.Nom}" 
                        data-idx="1" 
                        style="font-size: 40px; color: ${star2 ? '#FFD700' : '#444'}; cursor:pointer;">
                        ★
                    </span>
                </div>`;
        }
        return `
        <div class="my-spell-card" style="position:relative;">
            ${starsBlock}
            <strong>${spell.Nom}</strong> — <span>${spell.Description}</span>
            <div class="spell-info">
                <span>Effet:</span> ${spell.Effet ?? spell.Effects ?? ''} —
                <span>Dégât:</span> ${spell.Degat ?? spell.Degats ?? '-'} —
                <span>Coût:</span> ${spell.Cout ?? '-'} —
                <span>Portée:</span> ${spell.Portee ?? ''} —     
                ${spell.Amelioration ? `<span>Amélioration:</span> ${spell.Amelioration}` : ''}
            </div>
        </div>
    `}).join('');
        
    // Attach listeners :
    container.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function(e) {
            const spellName = this.dataset.spell;
            const idx = parseInt(this.dataset.idx);
            const stars = getSpellStars();
            // Init if not yet
            if (!stars[spellName]) stars[spellName] = [false, false];
            stars[spellName][idx] = !stars[spellName][idx]; // toggle
            setSpellStars(stars);
            renderMySpellsList(); // refresh
        });
    });
}

// --- Événements d'ouverture/fermeture modale ---
ajouterSortBtn.addEventListener('click', () => {
    sortModal.classList.add('active');
    showSpellCategorySelection();
});

closeModalBtn.addEventListener('click', () => {
    sortModal.classList.remove('active');
});

// --- Affiche la liste au chargement (persistant)
window.addEventListener('DOMContentLoaded', renderMySpellsList);


// ##########################################################################################################

// Partie pour l'onget "Inventaire" : LocalStorage auto-save

const INV_STORAGE_KEY = 'mon_fiche_inventaire';

const invFields = [
    // [id dans le html, par exemple: 'inv-armure-nom']
    'inv-armure-nom','inv-armure-type','inv-armure-protection','inv-armure-effet','inv-armure-propriete',
    'inv-arme1-nom','inv-arme1-style','inv-arme1-degats','inv-arme1-type','inv-arme1-effet','inv-arme1-propriete',
    'inv-arme2-nom','inv-arme2-style','inv-arme2-degats','inv-arme2-type','inv-arme2-effet','inv-arme2-propriete',
    'inv-po'
];

// Restaure l'inventaire à l'ouverture


document.querySelectorAll('textarea.inv-input, textarea.inv-input-effet').forEach(function(textarea) {
    textarea.style.overflow = 'hidden'; // Retire la barre de scroll
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
});

// ##########################################################################################################

// Partie pour l'onglet "Notes" : LocalStorage auto-save

// Sauvegarder et restaurer automatiquement la note
const notesTextarea = document.getElementById('zone-notes');

// Sauvegarde en temps réel