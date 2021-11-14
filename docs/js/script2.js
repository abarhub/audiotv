var serveur = 'http://raspberrypi:5000/'
//var serveur='/'


// variable speech recognition
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var colors = ['aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow'];
var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.continuous = false;
//recognition.lang = 'en-US';
recognition.lang = 'fr-FR';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

var diagnostic = document.querySelector('.diagnostic');
var message = document.querySelector('.message');
var status = document.querySelector('.status');

// variables syntese vocale
var synth = window.speechSynthesis;

var inputForm = document.querySelector('form');
var inputTxt = document.querySelector('.txt');
var voiceSelect = document.querySelector('select');

var pitch = document.querySelector('#pitch');
var pitchValue = document.querySelector('.pitch-value');
var rate = document.querySelector('#rate');
var rateValue = document.querySelector('.rate-value');

var voices = [];


// méthodes

document.body.onclick = function () {
    recognition.start();
    console.log('Ready to receive a color command.');
}

function contient(texte, message) {
    if (message && texte) {
        console.info('texte',texte,'message', message);
        var message2 = message.normalize("NFD").replace(/\p{Diacritic}/gu, "");
        var texte2 = texte.normalize("NFD").replace(/\p{Diacritic}/gu, "");
        return texte2.toLowerCase().indexOf(message2.toLowerCase()) >= 0;
    } else {
        return false;
    }
}

function traitementMessage(message) {
    if (message) {
        if (contient(message, 'démarrage')) {
            TVOn();
        } else if (contient(message, 'arrêt')||contient(message, 'stop')) {
            TVOff();
        } else if (contient(message, 'bonjour')) {
            speak('Bonjour humain. Enchanté de faire votre connaissance')
        }
    }
}

recognition.onresult = function (event) {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at the last position.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object
    var color = event.results[0][0].transcript;
    diagnostic.textContent = 'Result received: ' + color + '.';
    //bg.style.backgroundColor = color;
    console.log('Confidence: ' + event.results[0][0].confidence);
    traitementMessage(color);
}

recognition.onspeechend = function () {
    recognition.stop();
}

recognition.onnomatch = function (event) {
    diagnostic.textContent = "I didn't recognise that color.";
}

recognition.onerror = function (event) {
    diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
}

// methodes synthese vocale

function populateVoiceList() {
    voices = synth.getVoices().sort(function (a, b) {
        const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
        if (aname < bname) return -1;
        else if (aname == bname) return 0;
        else return +1;
    });
    var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
    voiceSelect.innerHTML = '';
    for (i = 0; i < voices.length; i++) {
        var option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

        if (voices[i].default) {
            option.textContent += ' -- DEFAULT';
        }

        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        voiceSelect.appendChild(option);
    }
    voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak(texte) {
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (texte !== '') {
        var utterThis = new SpeechSynthesisUtterance(texte);
        utterThis.onend = function (event) {
            console.log('SpeechSynthesisUtterance.onend');
        }
        utterThis.onerror = function (event) {
            console.error('SpeechSynthesisUtterance.onerror');
        }
        var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
        for (i = 0; i < voices.length; i++) {
            if (voices[i].name === selectedOption) {
                utterThis.voice = voices[i];
                break;
            }
        }
        utterThis.pitch = pitch.value;
        utterThis.rate = rate.value;
        synth.speak(utterThis);
    }
}


// methode utilisé par l'ihm


pitch.onchange = function () {
    pitchValue.textContent = pitch.value;
}

rate.onchange = function () {
    rateValue.textContent = rate.value;
}


function erreur(message) {
    console.error('erreur', message);
    diagnostic.textContent = message;
}

function messageinfo(message2) {
    console.info(message2);
    message.textContent = message2;
}

function messageStatus(message) {
    console.info('status',message);
    status.textContent = message;
}

function TVOn() {

    speak('Démarrage tele');

    fetch(serveur + "tv?action=on")
        .then(response => messageinfo(response))
        .catch(error => erreur("Erreur : " + error));
}

function TVOff() {

    speak('Arrêt tele')

    fetch(serveur + "tv?action=off")
        .then(response => messageinfo(response))
        .catch(error => erreur("Erreur : " + error));
}

function TVStatus() {
    fetch(serveur + "tv?action=status")
        .then(response => {
            let message = 'Erreur';
            if (response.status === 201) {
                message = 'TV démarré';
            } else if (response.status === 202) {
                message = 'TV arrété';
            } else if (response.status === 203) {
                message = 'Erreur pour récupérer l\'état de la TV';
            }
            messageStatus(message);
        })
        .catch(error => erreur("Erreur : " + error));
}

