// assets/js/components.js

async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Impossibile caricare ${filePath}`);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        
        // Se c'è logica specifica per la navbar (es. active state), puoi aggiungerla qui
    } catch (error) {
        console.error("Errore nel caricamento del componente:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Carica la Nav e il Footer nei rispettivi div
    if(document.getElementById('nav-placeholder')) {
        loadComponent('nav-placeholder', '/components/nav.html');
    }
    if(document.getElementById('footer-placeholder')) {
        loadComponent('footer-placeholder', '/components/footer.html');
    }
});