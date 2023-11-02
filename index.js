var tank = 0; //correspond a data-score1
var dpsp = 0; //correspond a data-score2
var dpsm = 0; //correspond a data-score3
var heal = 0; //correspond a data-score4
var classe = "";

var humain = 0; //correspond a data-score5
var homme_lezard = 0; //correspond a data-score6
var nain = 0; //correspond a data-score7
var orc = 0; //correspond a data-score8
var elf = 0; //correspond a data-score9
var elf_montagne = 0; //correspond a data-score10
var race = "";

var age_input = document.getElementById("age_input");
var age = 0;
var nom = "";

var questionActuel = null;
var listRaces = document.querySelectorAll("div[id^='race_']");
var compteur = 0;

function checkNom() {
    var nom_input = document.getElementById("nom_input").value;
    if (nom_input == "") {
        return false;
    } else {
        document.getElementById("nom").classList.add("hidden");
        document.getElementById("age").classList.remove("hidden");
        return true;
    }
}

function checkAge() {
    var age_input = document.getElementById("age_input").value;
    if (age_input == "") {
        return false;
    } else if (parseInt(age_input) <= 0) {
        return false;
    } else {
        document.getElementById("age").classList.add("hidden");
        document.getElementById("transition1").classList.remove("hidden");

        setTimeout(function() {
            document.getElementById('transition1').classList.add('hidden');
            document.getElementById('transition2').classList.remove('hidden');
        }, 5000);

        setTimeout(function() {
            document.getElementById('transition2').classList.add('hidden');
            document.body.style.backgroundImage = "none";
            Q1();
        }, 10000);
        return true;
    }
}

function Q1() {
    let divList = document.querySelectorAll("div[id^='1_']");
    let selectQuestion = Math.floor(Math.random() * 3);
    let randomDiv = divList[selectQuestion];
    randomDiv.classList.remove("hidden");
    questionActuel = randomDiv;
}

function toQ2() {
    let divList = document.querySelectorAll("div[id^='2_']");
    let selectQuestion = Math.floor(Math.random() * 3);
    let randomDiv = divList[selectQuestion];
    randomDiv.classList.remove("hidden");
    questionActuel.classList.add("hidden");
    questionActuel = randomDiv;
}

function toQ3() {
    let divList = document.querySelectorAll("div[id^='3_']");
    let selectQuestion = Math.floor(Math.random() * 3);
    let randomDiv = divList[selectQuestion];
    randomDiv.classList.remove("hidden");
    questionActuel.classList.add("hidden");
    questionActuel = randomDiv;
}

function toQ4() {
    let divList = document.querySelectorAll("div[id^='4_']");
    let selectQuestion = Math.floor(Math.random() * 3);
    let randomDiv = divList[selectQuestion];
    randomDiv.classList.remove("hidden");
    questionActuel.classList.add("hidden");
    questionActuel = randomDiv;
}

function toQ5() {
    let divList = document.querySelectorAll("div[id^='5_']");
    let selectQuestion = Math.floor(Math.random() * 3);
    let randomDiv = divList[selectQuestion];
    randomDiv.classList.remove("hidden");
    questionActuel.classList.add("hidden");
    questionActuel = randomDiv;
}

function toQ6() {
    let divList = document.querySelectorAll("div[id^='6_']");
    let selectQuestion = Math.floor(Math.random() * 3);
    let randomDiv = divList[selectQuestion];
    randomDiv.classList.remove("hidden");
    questionActuel.classList.add("hidden");
    questionActuel = randomDiv;
}

function toNextEnv() {
    if (questionActuel != null) {
        questionActuel.classList.add("hidden");
        questionActuel = null;
    }
    
    if (compteur == 0) {
        listRaces[compteur].classList.remove("hidden");
        compteur +=1;
    } else {
        listRaces[compteur -1].classList.add("hidden");
        listRaces[compteur].classList.remove("hidden");
        compteur += 1;
    }
}

// + attribution de classe et race
function tores() {
    listRaces[compteur -1].classList.add("hidden");
    document.getElementById("resultat").classList.remove("hidden");
    document.body.style.backgroundImage = "url('./ressources/fond\ resultat.jpg')";

    let max = Math.max(tank, dpsp, dpsm, heal);
    let maxr = Math.max(humain,homme_lezard,nain,orc,elf,elf_montagne);

    if ( max == tank) {
        if(max == 414) {
            classe = "Gardien"
        } else if (max > 260) {
            classe = "Avant garde"
        } else {
            classe = "Avant garde"
        }
    } else if (max == dpsp) {
        if(max == 414) {
            classe = "Bourreau"
        } else if (max > 260) {
            classe = "Ecuyer"
        } else {
            classe = "Ecuyer"
        }
    } else if (max == dpsm) {
        if(max == 414) {
            classe = "Ombre"
        } else if (max > 260) {
            classe = "Apprentis sorcier"
        } else {
            classe = "Apprentis sorcier"
        }
    } else {
        if(max == 414) {
            classe = "salvateur"
        } else if (max > 260) {
            classe = "Apprenti soigneur"
        } else {
            classe = "Apprenti soigneur"
        }
    }
    $('#userClasse').text(classe);

    if (maxr == humain) {
        race = "humain"
    } else if (maxr == homme_lezard) {
        race = "homme lézard"
    } else if (maxr == nain) {
        race = "nain"
    } else if (maxr == orc) {
        race = "orc"
    } else if (maxr == elf) {
        race = "elfe"
    } else {
        race = "elfe des montagnes"
    }
    $('#userRace').text(race);

    age = parseInt(age_input.value);
    $('#userAge').text(age);

    nom = document.getElementById("nom_input").value;
    $('#userName').text(nom);
}

//attribution des points
$(document).ready(function() {
    $('.choice').click(function() {
        tank += parseInt($(this).attr('data-score1'));
        dpsp += parseInt($(this).attr('data-score2'));
        dpsm += parseInt($(this).attr('data-score3'));
        heal += parseInt($(this).attr('data-score4'));
        humain += parseInt($(this).attr('data-score5'));
        homme_lezard += parseInt($(this).attr('data-score6'));
        nain += parseInt($(this).attr('data-score7'));
        orc += parseInt($(this).attr('data-score8'));
        elf += parseInt($(this).attr('data-score9'));
        elf_montagne += parseInt($(this).attr('data-score10'));
    });
});

