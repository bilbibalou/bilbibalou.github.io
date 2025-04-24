document.getElementById('createBtn').addEventListener('click', () => {
    // Redirige vers fiche.html sans nom (nouvelle fiche)
    window.location.href = 'fiche.html';
});

document.getElementById('openBtn').addEventListener('click', () => {
    const nom = document.getElementById('ficheName').value.trim();
    if (nom === "") {
        alert("Merci d'entrer le nom d'une fiche !");
        return;
    }
    
    // Redirige vers fiche.html avec le nom en paramètre GET
    window.location.href = `fiche.html?nom=${encodeURIComponent(nom)}`;
});
