// ========================
// DONNÉES DU QUIZ
// ========================

const questions = [
    { // Question 1
        groups: [
            ["Briller", "Scintiller", "Luire"],
            ["Feuille", "Lame", "Épine"],
            ["Soleil", "Vent", "Pluie"],
            ["Chercher", "Protéger", "Servir"],
            ["Rêver", "Découvrir", "Danser"]
        ]
    },
    { // Question 2
        groups: [
            ["Faire", "Améliorer"],
            ["Clarté", "Ombre"],
            ["Sucré", "Salé"],
            ["Chaud", "Froid"],
            ["Sang", "Os"],
            ["Rugueux", "Lisse"]
        ]
    },
    { // Question 3
        groups: [
            ["Diriger", "Sauver", "Échapper"],
            ["Jouer", "Roder", "Se pomponner"],
            ["Penser", "Ressentir", "Sentir"],
            ["Pierre", "Bois", "Terre"],
            ["Au-dessus", "En dessous", "Autour"]
        ]
    },
    { // Question 4
        groups: [
            ["Toujours", "Parfois"],
            ["Qui", "Pourquoi"],
            ["Liberté", "Sécurité"],
            ["Ensemble", "Seul"],
            ["Perdre", "Trouver"],
            ["Parler", "Silencieux"]
        ]
    },
    { // Question 5
        groups: [
            ["Espoir", "Confiance", "Amour"],
            ["Noir", "Blanc", "Gris"],
            ["Mental", "Cœur", "Âme"],
            ["Réconforter", "Conseiller", "Impressionner"],
            ["Observer", "Écouter", "Toucher"]
        ]
    },
    { // Question 6 (Rare + Mythique uniquement)
        groups: [
            ["Anguleux", "Arrondi"],
            ["Hauteur", "Profondeur"],
            ["Endormi", "Éveillé"],
            ["Givre", "Rosée"],
            ["Ondulation", "Vague"],
            ["Chasser", "Créer"]
        ]
    },
    { // Question 7 (Mythique uniquement)
        groups: [
            ["Mythe", "Légende"],
            ["Sérénité", "Gloire"],
            ["Éternel", "Impossible"],
            ["Enchanter", "Ensorceler"],
            ["Charme", "Malédiction"]
        ]
    }
];

const patronusList = [
    {
        name: "Abraxan",
        rarity: "mythical",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            ["Légende", "Gloire", "Impossible", "Ensorceler", "Malédiction"]
        ]
    },
    {
        name: "Aigle",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Albatross",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Autour des palombes",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Balbuzard",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Barzoï",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Basset Hound",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Beagle",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Belette",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Biche",
        rarity: "rare",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Blaireau",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Buffle",
        rarity: "rare",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Busard des marais",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Buse",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Cerf",
        rarity: "rare",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Chat blanc",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Chat Bleu russe",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Chat calico",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Chat écaille de tortue",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Chat Manx",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Chat Nebelung",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Chat noir",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Chat Ocicat",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Chat Ragdoll",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Chat roux",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Chat sauvage",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Chat Sibérien",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Chat Sphynx",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Chat Tonkinois",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Chauve-souris",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Chevêche",
        rarity: "rare",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Chèvre",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Chien croisé",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Chien de Saint-Hubert",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Chouette brune",
        rarity: "rare",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Chow-chow",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Cobra royal",
        rarity: "rare",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Colibri",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Corbeau",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Couleuvre",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Cygne blanc",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Cygne noir",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Dauphin",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Dragon",
        rarity: "mythical",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            ["Légende", "Gloire", "Impossible", "Ensorceler", "Malédiction"]
        ]
    },
    {
        name: "Écureuil gris",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Écureuil roux",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Éléphant",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Engoulevent",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Épervier",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Éruptif",
        rarity: "mythical",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            ["Légende", "Gloire", "Impossible", "Ensorceler", "Malédiction"]
        ]
    },
    {
        name: "Étalon alezan",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Étalon bai",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Étalon blanc",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Étalon gris pommelé",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Étalon isabelle",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Étalon noir",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Étalon pie",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Faisan",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Faucon",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Fox-terrier",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Grand corbeau",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Grand-duc",
        rarity: "rare",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Grand-duc gris",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Gronian",
        rarity: "mythical",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            ["Mythe", "Sérénité", "Éternel", "Enchanter", "Charme"]
        ]
    },
    {
        name: "Guépard",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Harfang des neiges",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Hérisson",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Hermine",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Héron",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Hippogriffe",
        rarity: "mythical",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            ["Légende", "Gloire", "Impossible", "Ensorceler", "Malédiction"]
        ]
    },
    {
        name: "Hirondelle",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Husky",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Hyène",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Impala",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Jument alezan",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Jument bai",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Jument blanc",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Jument gris pommelé",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Jument isabelle",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Jument noir",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Jument pie",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Lapin sauvage",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Léopard",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Léoparde",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Lévrier d'Ibiza",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Lévrier écossais",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Lévrier gris",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Lévrier irlandais",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Libellule",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Licorne",
        rarity: "mythical",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            ["Mythe", "Sérénité", "Éternel", "Enchanter", "Charme"]
        ]
    },
    {
        name: "Lièvre brun",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Lièvre variable",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Lion",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Lionne",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Loup",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Loutre",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Lynx",
        rarity: "rare",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Mamba noir",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Martin-pêcheur",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Martinet",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Martre des pins",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Mastiff",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Merle",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Moineau",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Mouche",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Mulot",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Musaraigne",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Occamy",
        rarity: "mythical",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            ["Mythe", "Sérénité", "Éternel", "Enchanter", "Charme"]
        ]
    },
    {
        name: "Orang-outan",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Orque",
        rarity: "rare",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Oryctérope",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Oryx",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Ours brun",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Ours noir",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Ours polaire",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Paon",
        rarity: "rare",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Petit-duc",
        rarity: "rare",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Phoque",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Pie",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Putois",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Python",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Rat",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Renard",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Requin",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Rhinocéros",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            []
        ]
    },
    {
        name: "Rottweiler",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Rougegorge",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Runespoor",
        rarity: "mythical",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            ["Légende", "Gloire", "Impossible", "Ensorceler", "Malédiction"]
        ]
    },
    {
        name: "Saint-Bernard",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "Salamandre de feu",
        rarity: "mythical",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            ["Mythe", "Sérénité", "Éternel", "Enchanter", "Charme"]
        ]
    },
    {
        name: "Sanglier",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
        {
        name: "Saumon",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Serpent à sonnette",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Singe capucin",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Sombral",
        rarity: "mythical",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            ["Anguleux", "Profondeur", "Éveillé", "Givre", "Ondulation", "Chasser"],
            ["Mythe", "Sérénité", "Éternel", "Enchanter", "Charme"]
        ]
    },
    {
        name: "Souris des champs",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Taupe",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Espoir", "Noir", "Mental", "Conseiller", "Écouter"],
            [],
            []
        ]
    },
    {
        name: "Terre-Neuve",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Tigre",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Tigresse",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Vautour",
        rarity: "rare",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            ["Arrondi", "Hauteur", "Endormi", "Rosée", "Vague", "Créer"],
            []
        ]
    },
    {
        name: "Vipère",
        rarity: "common",
        answers: [
            ["Briller", "Épine", "Pluie", "Chercher", "Découvrir"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Diriger", "Roder", "Penser", "Pierre", "En dessous"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Confiance", "Gris", "Âme", "Impressionner", "Toucher"],
            [],
            []
        ]
    },
    {
        name: "Vison",
        rarity: "common",
        answers: [
            ["Luire", "Lame", "Vent", "Servir", "Danser"],
            ["Faire", "Clarté", "Sucré", "Chaud", "Os", "Lisse"],
            ["Échapper", "Se pomponner", "Sentir", "Terre", "Autour"],
            ["Toujours", "Qui", "Sécurité", "Ensemble", "Trouver", "Parler"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    },
    {
        name: "West Highland Terrier",
        rarity: "common",
        answers: [
            ["Scintiller", "Feuille", "Soleil", "Protéger", "Rêver"],
            ["Améliorer", "Ombre", "Salé", "Froid", "Sang", "Rugueux"],
            ["Sauver", "Jouer", "Ressentir", "Bois", "Au-dessus"],
            ["Parfois", "Pourquoi", "Liberté", "Seul", "Perdre", "Silencieux"],
            ["Amour", "Blanc", "Cœur", "Réconforter", "Observer"],
            [],
            []
        ]
    }
];

// ========================
// VARIABLES GLOBALES
// ========================

let currentQuestion = 0;
let collectedTraits = [];
let selectedIds = [];
let questionTimer = null;
let timeoutCount = 0; // Compteur de timeouts
let isLocked = false; // Verrouillage définitif
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let selectedWords = [];
let selectedGroupIndices = [];

// ========================
// ÉLÉMENTS DOM
// ========================

const screenIntro = document.getElementById('screen-intro');
const screenQuestion = document.getElementById('screen-question');
const screenLoading = document.getElementById('screen-loading');
const screenResult = document.getElementById('screen-result');
const choicesContainer = document.getElementById('choices');
const questionCounter = document.getElementById('question-counter');
const patronusEmoji = document.getElementById('patronus-emoji');
const patronusName = document.getElementById('patronus-name');
const patronusDescription = document.getElementById('patronus-description');
const firefliesContainer = document.getElementById('fireflies');
const swipeArea = document.getElementById('swipe-area');

function createFireflies() {
    const firefliesContainer = document.querySelector('.fireflies');

    const TOTAL = 100; // Nombre totale de luciole
    const BASE_COLOR = {r: 72, g: 244, b: 214}; // couleur de luciole #48F4D6

    function spawnFirefly() {
        const firefly = document.createElement('div');
        firefly.classList.add('firefly');

        // ================================
        // APPARITION : moitié basse (50% - 100%)
        // ================================
        const startX = Math.random() * 100;
        const startY = 55 + Math.random() * 45; // Entre 55% et 100%
        firefly.style.left = startX + '%';
        firefly.style.top = startY + '%';

        // ================================
        // TRAJECTOIRE VERS LE HAUT
        // Dérive horizontale aléatoire + montée
        // ================================
        // Montée : entre 30% et 70% de la hauteur écran
        const riseDistance = 30 + Math.random() * 40;

        // Dérive horizontale : zigzag aléatoire
        const driftX1 = (Math.random() * 2 - 1) * 80;   // -80px à +80px
        const driftX2 = (Math.random() * 2 - 1) * 120;  // -120px à +120px
        const driftX3 = (Math.random() * 2 - 1) * 60;   // -60px à +60px

        // Points intermédiaires de montée (pas linéaire)
        const riseStep1 = riseDistance * 0.3 + Math.random() * riseDistance * 0.1;
        const riseStep2 = riseDistance * 0.6 + Math.random() * riseDistance * 0.1;

        firefly.style.setProperty('--rise-total', riseDistance + 'vh');
        firefly.style.setProperty('--drift-x1', driftX1 + 'px');
        firefly.style.setProperty('--drift-x2', driftX2 + 'px');
        firefly.style.setProperty('--drift-x3', driftX3 + 'px');
        firefly.style.setProperty('--rise-step1', riseStep1 + 'vh');
        firefly.style.setProperty('--rise-step2', riseStep2 + 'vh');

        // ================================
        // TAILLE & LUMINOSITÉ
        // ================================
        const coreSize = 0.3 + Math.random() * 0.7;
        firefly.style.setProperty('--core-size', coreSize + 'px');

        const colorShift = Math.random() * 40 - 20;
        const r = Math.min(255, Math.max(0, BASE_COLOR.r + colorShift));
        const g = Math.min(255, Math.max(0, BASE_COLOR.g + colorShift));
        const b = Math.min(255, Math.max(0, BASE_COLOR.b - colorShift * 0.5));
        firefly.style.setProperty('--color-r', Math.round(r));
        firefly.style.setProperty('--color-g', Math.round(g));
        firefly.style.setProperty('--color-b', Math.round(b));

        firefly.style.setProperty('--glow-sm', (coreSize * 3) + 'px');
        firefly.style.setProperty('--glow-sm-spread', (coreSize * 1.5) + 'px');
        firefly.style.setProperty('--glow-md', (coreSize * 8) + 'px');
        firefly.style.setProperty('--glow-md-spread', (coreSize * 3) + 'px');
        firefly.style.setProperty('--glow-lg', (coreSize * 20) + 'px');
        firefly.style.setProperty('--glow-lg-spread', (coreSize * 10) + 'px');
        firefly.style.setProperty('--halo-size', (coreSize * 35) + 'px');
        firefly.style.setProperty('--halo-opacity', 0.03 + Math.random() * 0.07);

        const maxOpacity = 0.4 + Math.random() * 0.5;
        firefly.style.setProperty('--max-opacity', maxOpacity);

        // ================================
        // VITESSE : aléatoire entre 8s et 30s
        // Lent = majestueux, rapide = énergique
        // ================================
        const duration = 25 + Math.random() * 35;
        firefly.style.animationDuration = duration + 's';

        // Délai initial échelonné
        const delay = Math.random() * 10;
        firefly.style.animationDelay = delay + 's';

        firefliesContainer.appendChild(firefly);

        // ================================
        // RECYCLAGE : quand l'animation finit,
        // on supprime et on en recrée une nouvelle
        // ================================
        setTimeout(() => {
            firefly.remove();
            spawnFirefly(); // Nouvelle luciole depuis le bas
        }, (duration + delay) * 1000);
    }

    // Lancer toutes les lucioles
    for (let i = 0; i < TOTAL; i++) {
        spawnFirefly();
    }
}

// ================================
// TRAÎNÉE DE PARTICULES (CURSOR TRAIL)
// ================================
const trailCanvas = document.createElement('canvas');
trailCanvas.id = 'cursorTrail';
trailCanvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
`;
document.body.appendChild(trailCanvas);

const ctx = trailCanvas.getContext('2d');
let trailParticles = [];
let mouse = { x: -100, y: -100 };
let lastMouse = { x: -100, y: -100 };
let isMoving = false;
let moveTimeout;

function resizeCanvas() {
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Constantes anti-lag
const MAX_TRAIL_PARTICLES = 5000;
let lastTrailTime = 0;
const TRAIL_THROTTLE = 16; // ms (~60fps max)

// Suivi souris
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    isMoving = true;
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => { isMoving = false; }, 100);

    // Throttle : limite les appels
    const now = performance.now();
    if (now - lastTrailTime < TRAIL_THROTTLE) return;
    lastTrailTime = now;

    // Créer des particules de traînée
    spawnTrailParticles(e.clientX, e.clientY);

    
});

// ========================
// TRAÎNÉE DE BAGUETTE (WAND TRAIL)
// ========================

function createTrailDot(x, y) {
    const dot = document.createElement('div');
    dot.classList.add('wand-trail');
    dot.style.left = (x - 4) + 'px';
    dot.style.top = (y - 4) + 'px';
    document.body.appendChild(dot);

    setTimeout(() => {
        dot.remove();
    }, 800);
}

// ================================
// PARTICULES DE TRAÎNÉE
// ================================

function spawnTrailParticles(x, y) {

    if (trailParticles.length > MAX_TRAIL_PARTICLES) return;

    const dx = x - lastMouse.x;
    const dy = y - lastMouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1) return;

    const steps = Math.max(1, Math.floor(dist / 5)); // Taux d'interpolation reduir pour plus d'apparitions

    for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const ix = lastMouse.x + dx * t;
        const iy = lastMouse.y + dy * t;

        const count = Math.max(5, Math.min(Math.floor(dist / steps / 1), 15)); // Nombre de particules, min diviseur max

        for (let i = 0; i < count; i++) {
            // Angle aléatoire pour s'écarter dans toutes les directions
            const angle = Math.random() * Math.PI * 2;
            // Vitesse d'éjection (s'écarte vite au départ)
            const speed = 3 + Math.random() * 4;

            trailParticles.push({
                x: ix + (Math.random() - 0.5) * 40, // Concentration du trail autour de la souris 
                y: iy + (Math.random() - 0.5) * 40, // Concentration du trail autour de la souris
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.01 + Math.random() * 0.25,  // Durée de vie (plus grand = meurt plus vite)
                size: Math.random() * 1 + 0.4, // La taille des particules du trail
                opacity: Math.random() * 0.8 + 0.2,
                hue: 165 + Math.random() * 20,
                saturation: 70 + Math.random() * 20,
                lightness: 60 + Math.random() * 20,

                // Phase : "expand" → s'écarte, puis "return" → revient
                phase: "expand",
                expandTime: 0,
                expandDuration: 3 + Math.random() * 5  // Frames avant de revenir
            });
        }
    }

    lastMouse.x = x;
    lastMouse.y = y;
}


// ================================
// ANIMATION DE LA TRAÎNÉE
// ================================
function animateTrail() {
    ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];

        p.expandTime++;

        if (p.phase === "expand") {
            // Phase 1 : s'écarter — ralentir progressivement
            p.vx *= 0.9;
            p.vy *= 0.9;

            // Quand le temps est écoulé, passer en phase retour
            if (p.expandTime >= p.expandDuration) {
                p.phase = "return";
            }

        } else {
            // Phase 2 : revenir vers la position actuelle de la souris
            const dxMouse = lastMouse.x - p.x;
            const dyMouse = lastMouse.y - p.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distMouse > 1) {
                // Attraction vers la souris (de plus en plus forte)
                const attraction = 0.5 + (1 - p.life) * 0.60;
                p.vx += (dxMouse / distMouse) * attraction;
                p.vy += (dyMouse / distMouse) * attraction;
            }

            // Friction pour lisser le mouvement
            p.vx *= 0.95;
            p.vy *= 0.95;

            // Disparaître plus vite en phase retour quand proche de la souris
            if (distMouse < 20) {
                p.decay *= 1.5;
            }
        }

        // Appliquer le mouvement
        p.x += p.vx;
        p.y += p.vy;

        // Réduire la vie
        p.life -= p.decay;

        // Supprimer si mort
        if (p.life <= 0) {
            trailParticles.splice(i, 1);
            continue;
        }
        
        // ---- Dessin ----
        const alpha = p.life * p.opacity;
        const progress = Math.pow(1 - p.life, 2);  // blanchissement Exposant 1 linéaire, 2 doux, 3 80%, 5 tardif
        
        const hue = 225;                                    // Bleu fixe
        const saturation = 80 * (1 - progress);             // 80% → 0% (désature vers blanc)
        const lightness = 60 + progress * 40;               // 60% → 100% (éclaircit vers blanc)
        
        // Petit halo doux
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * 0.6})`);
        gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Point central net
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${Math.min(lightness + 15, 100)}%, ${alpha})`;
        ctx.fill();
    }

    requestAnimationFrame(animateTrail);
}

animateTrail();


// ================================
// RÉPULSION DES LUCIOLES
// ================================
function initFireflyRepulsion() {
    const REPEL_RADIUS = 200;
    const REPEL_STRENGTH = 140;

    let mouseX = -9999;
    let mouseY = -9999;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouseX = -9999;
        mouseY = -9999;
    });

    function animateRepulsion() {
        const fireflies = document.querySelectorAll('.firefly');

        fireflies.forEach(f => {
            const rect = f.getBoundingClientRect();
            const fx = rect.left + rect.width / 2;
            const fy = rect.top + rect.height / 2;

            const dx = fx - mouseX;
            const dy = fy - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < REPEL_RADIUS && dist > 0) {
                const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
                const angle = Math.atan2(dy, dx);

                const targetX = Math.cos(angle) * force;
                const targetY = Math.sin(angle) * force;

                f.style.setProperty('--repel-x', targetX + 'px');
                f.style.setProperty('--repel-y', targetY + 'px');
            } else {
                const currentX = parseFloat(f.style.getPropertyValue('--repel-x')) || 0;
                const currentY = parseFloat(f.style.getPropertyValue('--repel-y')) || 0;

                f.style.setProperty('--repel-x', (currentX * 0.93) + 'px');
                f.style.setProperty('--repel-y', (currentY * 0.93) + 'px');
            }
        });

        requestAnimationFrame(animateRepulsion);
    }

    animateRepulsion();
}

// APPELER après createFireflies()
initFireflyRepulsion();

// ========================
// SWIPE / DRAG POUR COMMENCER
// ========================

swipeArea.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
});

swipeArea.addEventListener('mousemove', (e) => {
    if (isDragging) {
        createTrailDot(e.clientX, e.clientY);
    }
});

swipeArea.addEventListener('mouseup', (e) => {
    if (isDragging) {
        isDragging = false;
        const dist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
        if (dist > 50) {
            startQuiz();
        }
    }
});

// Touch support
swipeArea.addEventListener('touchstart', (e) => {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
});

swipeArea.addEventListener('touchmove', (e) => {
    if (isDragging) {
        createTrailDot(e.touches[0].clientX, e.touches[0].clientY);
    }
});

swipeArea.addEventListener('touchend', (e) => {
    if (isDragging) {
        isDragging = false;
        const touch = e.changedTouches[0];
        const dist = Math.hypot(touch.clientX - dragStartX, touch.clientY - dragStartY);
        if (dist > 50) {
            startQuiz();
        }
    }
});

// ========================
// NAVIGATION
// ========================

function showScreen(screenToShow) {
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        currentScreen.classList.add('fade-out');
        setTimeout(() => {
            currentScreen.classList.remove('active', 'fade-out');
            screenToShow.classList.add('active', 'fade-in');
            setTimeout(() => {
                screenToShow.classList.remove('fade-in');
            }, 800);
        }, 500);
    } else {
        screenToShow.classList.add('active', 'fade-in');
    }
}

function startQuiz() {
    showScreen(screenQuestion);
    setTimeout(showQuestion, 600);
}

// ========================
// RESET DU QUIZ (sans reset le timeoutCount)
// ========================
function resetQuiz() {
    currentQuestion = 0;
    collectedTraits = [];
    selectedIds = [];
    selectedWords = [];
    selectedGroupIndices = [];
    showQuestion();
}

// ========================
// TIMER DE 5 SECONDES
// ========================
function startQuestionTimer() {
    clearQuestionTimer();
    questionTimer = setTimeout(() => {
        if (timeoutCount === 0) {
            timeoutCount = 1;
            showConcentrationWarning();
        } else {
            showLockedScreen();
        }
    }, 60000);
}

function clearQuestionTimer() {
    clearTimeout(questionTimer);
}

function handleTimeout() {
    timeoutCount++;

    if (timeoutCount === 1) {
        // Premier timeout : message + reset
        showConcentrationWarning();
    } else if (timeoutCount >= 2) {
        // Deuxième timeout : blocage définitif
        showLockedScreen();
    }
}

// ========================
// ÉCRAN "NE PERDS PAS TA CONCENTRATION"
// ========================
function showConcentrationWarning() {
    clearQuestionTimer();
    isLocked = true; // Empêcher les clics pendant le message

    // Créer l'overlay du message
    const overlay = document.createElement('div');
    overlay.id = 'concentration-overlay';
    overlay.innerHTML = `
        <div class="concentration-message">
            <p>Ne perds pas ta concentration !</p>
        </div>
    `;
    document.body.appendChild(overlay);

    // Après 5 secondes, on reset et on recommence
    setTimeout(() => {
        overlay.remove();
        isLocked = false;
        resetQuiz();
    }, 2500);
}

// ========================
// ÉCRAN DE BLOCAGE DÉFINITIF
// ========================
function showLockedScreen() {
    clearQuestionTimer();
    isLocked = true;

    // Masquer l'écran de quiz
    const quizScreen = document.getElementById('screen-quiz');
    if (quizScreen) quizScreen.classList.remove('active');

    // Créer l'écran de blocage
    const overlay = document.createElement('div');
    overlay.id = 'locked-overlay';
    overlay.innerHTML = `
        <div class="locked-message">
            <p>Dommage, tu n'es peut-être pas encore prêt pour lancer ce sortilège.</p>
        </div>
    `;
    document.body.appendChild(overlay);

    // Sauvegarder le blocage en localStorage pour persister
    localStorage.setItem('patronus_locked', 'true');
}


// ========================
// AFFICHER UNE QUESTION
// ========================

function showQuestion() {
    if (isLocked) return;
    // Vérifier si on dépasse la question 5
    // Questions 6-7 ne s'affichent que si le chemin mène à un rare/mythique
    if (currentQuestion >= 5) {
        const maxQuestions = getMaxQuestions();
        if (currentQuestion >= maxQuestions) {
            showLoadingScreen();
            return;
        }
    }

    if (currentQuestion >= questions.length) {
        showLoadingScreen();
        return;
    }

    const question = questions[currentQuestion];

    // Choisir UN groupe aléatoire
    const randomIndex = Math.floor(Math.random() * question.groups.length);
    const group = question.groups[randomIndex];
    selectedGroupIndices.push(randomIndex);

    questionCounter.textContent = '';
    choicesContainer.innerHTML = '';

    // Afficher chaque mot du groupe
    group.forEach((word, index) => {
        const btn = document.createElement('button');
        btn.classList.add('choice-btn', 'appearing');
        btn.textContent = word;

        btn.addEventListener('click', () => {
            selectWord(btn, word);
        });

        choicesContainer.appendChild(btn);

        setTimeout(() => {
            btn.classList.add('visible');
        }, 300 + index * 200);
    });

    startQuestionTimer(); 
}

// ========================
// DÉTERMINER COMBIEN DE QUESTIONS
// ========================

function getMaxQuestions() {
    // Après la question 5, vérifier si des candidats
    // rare/mythique sont encore possibles
    let candidates = patronusList;

    selectedWords.forEach((word, questionIndex) => {
        candidates = candidates.filter(patronus => {
            const acceptedWords = patronus.answers[questionIndex];
            if (acceptedWords.length === 0) return false;
            return acceptedWords.includes(word);
        });
    });

    // Vérifier la rareté max parmi les candidats
    const hasMyth = candidates.some(p => p.rarity === "mythical");
    const hasRare = candidates.some(p => p.rarity === "rare");

    if (hasMyth) return 7;
    if (hasRare) return 6;
    return 5;
}

// ========================
// SÉLECTIONNER UN MOT
// ========================

function selectWord(selectedBtn, word) {
    if (isLocked) return;
    clearQuestionTimer();

    selectedBtn.classList.add('selected');
    selectedWords.push(word);

    console.log("Mots choisis:", selectedWords);

    currentQuestion++;
    showQuestion();
}


// ========================
// ÉCRAN DE CHARGEMENT
// ========================

function showLoadingScreen() {
    showScreen(screenLoading);
    setTimeout(() => {
        revealPatronus();
    }, 3500);
}

// ========================
// TROUVER LE PATRONUS
// ========================

function findPatronus() {
    console.log("Mots choisis:", selectedWords);

    // Filtrer les patronus compatibles avec chaque réponse
    let candidates = patronusList;

    selectedWords.forEach((word, questionIndex) => {
        candidates = candidates.filter(patronus => {
            const acceptedWords = patronus.answers[questionIndex];
            // Si la liste est vide, ce patronus n'a pas cette question
            if (acceptedWords.length === 0) return false;
            return acceptedWords.includes(word);
        });
    });

    console.log("Candidats restants:", candidates.map(p => p.name));

    if (candidates.length > 0) {
        // Si plusieurs candidats, en choisir un au hasard
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Fallback : patronus aléatoire commun
    const commonPatronus = patronusList.filter(p => p.rarity === "common");
    return commonPatronus[Math.floor(Math.random() * commonPatronus.length)];
}

// ========================
// RÉVÉLER LE PATRONUS
// ========================

function revealPatronus() {
    const patronus = findPatronus();
    
    patronusName.textContent = patronus.name.toUpperCase();
    patronusDescription.textContent = patronus.description;
    
    const video = document.getElementById('patronus-video');
    video.src = `ressources/patronus/${patronus.name.toLowerCase()}.mp4`;
    video.loop = false;
    video.play();
    
    video.addEventListener('ended', () => {
        video.currentTime = video.duration;
        video.pause();
    }, { once: true });
    
    showScreen(screenResult);
}

// ========================
// AU CHARGEMENT - Vérifier si bloqué
// ========================
function initQuiz() {
    // Vérifier si le joueur est bloqué
    if (localStorage.getItem('patronus_locked') === 'true') {
        showLockedScreen();
        return;
    }

    timeoutCount = 0;
    isLocked = false;
    currentQuestion = 0;
    collectedTraits = [];
    selectedIds = [];

    showQuestion();
}

// ========================
// RESTART COMPLET (si tu veux un bouton admin pour débloquer)
// ========================
function fullRestart() {
    localStorage.removeItem('patronus_locked');
    timeoutCount = 0;
    isLocked = false;
    resetQuiz();
}

// ========================
// INIT
// ========================

createFireflies();
initFireflyRepulsion();