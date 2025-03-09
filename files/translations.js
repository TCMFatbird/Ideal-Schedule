const translations = {
    en: {
        title: "Create, edit and swap your schedule!",
        subtitle: "Made by Julian .B",
        description: "Get tired of your boring schedule? Too many classes? Too little classes? Not enough lunch? No free time? 2-hour classes? 3 classes in a row in the same damn room?",
        benefit: "Well, you're in luck! With Ideal Schedule, you can create, edit and swap your schedule to your liking! You can even share your schedule with your friends!",
        mon: "Monday",
        tue: "Tuesday",
        wed: "Wednesday",
        thu: "Thursday",
        fri: "Friday",
        save: "Save Table",
        load: "Load Table",
        clear: "Clear Table",
        export: "Export as PNG",
        ex1: "Example 1",
        feedback: "Send Feedback",
        h1: "Click on a cell to add a class or edit an existing one. Hold and drag it to move it across the table.",
        h2: "Click on the \"Save\" button to save your schedule as a JSON file. You can also click on the \"Load\" button to load a previously saved schedule.",
        h3: "Click on the \"Clear\" button to clear your schedule.",
        h4: "Click on the \"Export as PNG\" button to export your schedule as a PNG image.",
        thx: "thanks to github and codepen! (and you for using my tool) :D",
    },
    fr: {
        title: "Créez, modifiez et échangez votre emploi du temps!",
        subtitle: "Réalisé par Julian .B",
        description: "Marre de votre emploi du temps ennuyeux ? Trop de cours ? Pas assez de cours ? Pas assez de pause déjeuner ? Pas de temps libre ? Des cours de 2 heures ? 3 cours d'affilée dans la même salle ?",
        benefit: "Bonne nouvelle ! Avec Ideal Schedule, vous pouvez créer, modifier et échanger votre emploi du temps à votre guise ! Vous pouvez même le partager avec vos amis !",
        mon: "Lundi",
        tue: "Mardi",
        wed: "Mercredi",
        thu: "Jeudi",
        fri: "Vendredi",
        save: "Sauvegarder le tableau",
        load: "Charger le tableau",
        clear: "Effacer le tableau",
        export: "Exporter en PNG",
        ex1: "Exemple 1",
        feedback: "Envoyer un retour",
        h1: "Cliquez sur une cellule pour ajouter une classe ou modifier une classe existante. Maintenez et faites glisser pour la déplacer dans le tableau.",
        h2: "Cliquez sur le bouton \"Enregistrer\" pour sauvegarder votre emploi du temps en tant que fichier JSON. Vous pouvez aussi cliquer sur le bouton \"Charger\" pour charger un emploi du temps précédemment enregistré.",
        h3: "Cliquez sur le bouton \"Effacer\" pour effacer votre emploi du temps.",
        h4: "Cliquez sur le bouton \"Exporter en PNG\" pour exporter votre emploi du temps en image PNG.",
        thx: "merci à github et codepen! (et à vous pour utiliser mon outil) :D",
    }
};

// Helper function to get a random character
function getRandomChar() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return chars[Math.floor(Math.random() * chars.length)];
}

// Helper function to get absolute Y position of an element
function getElementY(element) {
    let y = 0;
    while (element) {
        y += element.offsetTop;
        element = element.offsetParent;
    }
    return y;
}

// Wrap text nodes in spans with random characters
function wrapTextNodes(element) {
    if (element.nodeType === Node.TEXT_NODE && element.textContent.trim().length > 0) {
        const text = element.textContent;
        const parent = element.parentNode;
        const spanContainer = document.createDocumentFragment();
        
        for (let char of text) {
            const span = document.createElement('span');
            span.className = 'char-span';
            span.textContent = getRandomChar();
            span.dataset.target = char;
            spanContainer.appendChild(span);
        }
        
        parent.replaceChild(spanContainer, element);
    } else {
        const children = Array.from(element.childNodes);
        for (let child of children) {
            wrapTextNodes(child);
        }
    }
}

// Prepare element for scan effect
function prepareForScan(element, targetText, isHTML) {
    if (isHTML) {
        element.innerHTML = targetText;
    } else {
        element.textContent = targetText;
    }
    wrapTextNodes(element);
}

// Trigger corruption effect on a span
function corruptSpan(span) {
    const targetChar = span.dataset.target;
    const interval = 30; // ms between character changes
    const steps = 3;     // number of random characters to show
    let count = 0;
    
    const timer = setInterval(() => {
        span.textContent = getRandomChar();
        count++;
        if (count >= steps) {
            clearInterval(timer);
            span.textContent = targetChar;
        }
    }, interval);
}

function setLanguage(lang) {
    const scanLine = document.getElementById("scan-line");
    
    // Define all elements to translate with corrected selectors
    const elementsToTranslate = [
        { element: document.querySelector("h1"), key: "title", isHTML: false },
        { element: document.querySelector("p:nth-of-type(1)"), key: "subtitle", isHTML: true },
        { element: document.querySelector("p:nth-of-type(2)"), key: "description", isHTML: false },
        { element: document.querySelector("p:nth-of-type(3)"), key: "benefit", isHTML: false },
        { element: document.getElementById("mon"), key: "mon", isHTML: false },
        { element: document.getElementById("tue"), key: "tue", isHTML: false },
        { element: document.getElementById("wed"), key: "wed", isHTML: false },
        { element: document.getElementById("thu"), key: "thu", isHTML: false },
        { element: document.getElementById("fri"), key: "fri", isHTML: false },
        { element: document.getElementById("saveButton"), key: "save", isHTML: false },
        { element: document.getElementById("loadButton"), key: "load", isHTML: false },
        { element: document.getElementById("clearButton"), key: "clear", isHTML: false },
        { element: document.getElementById("exportButton"), key: "export", isHTML: false },
        { element: document.querySelector("p:nth-of-type(4)"), key: "h1", isHTML: false },
        { element: document.querySelector("p:nth-of-type(5)"), key: "h2", isHTML: false },
        { element: document.querySelector("p:nth-of-type(6)"), key: "h3", isHTML: false },
        { element: document.querySelector("p:nth-of-type(7)"), key: "h4", isHTML: false },
        { element: document.getElementById("exampleButton"), key: "ex1", isHTML: false },
        { element: document.getElementById("feedbackButton"), key: "feedback", isHTML: false },
        { element: document.getElementById("thanks"), key: "thx", isHTML: false },
    ];

    // Prepare all elements with target text and spans
    elementsToTranslate.forEach(({ element, key, isHTML }) => {
        if (element) {  // Add null check
            const targetText = translations[lang][key];
            prepareForScan(element, targetText, isHTML);
        }
    });

    // Start the scan-line animation and corruption effects
    scanLine.style.transform = "scaleY(1)";
    scanLine.style.position = "fixed";  // Make it fixed to cover the whole page
    scanLine.style.width = "100vw";     // Full viewport width
    
    setTimeout(() => {
        scanLine.style.transition = "top 1.2s linear";
        scanLine.style.top = "100vh";   // Use viewport height to reach bottom of page
        
        const pageHeight = document.documentElement.scrollHeight;  // Full page height including scroll
        const charSpans = document.querySelectorAll('.char-span');
        
        // Schedule corruption effect for each character
        charSpans.forEach(span => {
            const y = getElementY(span);
            const t = (y / pageHeight) * 1200; // Time in ms when scan-line reaches span
            setTimeout(() => corruptSpan(span), t);
        });
        
        // Reset scan-line after animation
        setTimeout(() => {
            scanLine.style.transition = "none";
            scanLine.style.top = "0";
            scanLine.style.transform = "scaleY(0)";
        }, 1200);
    }, 100);
}