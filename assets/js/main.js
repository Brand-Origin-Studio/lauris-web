// ==========================================
// assets/js/main.js
// ==========================================

// --- 1. INTERSECTION OBSERVER (Animazioni allo scroll) ---
document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

// --- 2. MODAL ENGINE E SCROLL LOGIC ---
const modal = document.getElementById('dynamic-modal');
const closeBtn = document.getElementById('modal-close-btn');
const btnReaderMode = document.getElementById('btn-reader-mode');
const compactTitle = document.getElementById('modal-compact-title');
let focusedElementBeforeModal;

if (btnReaderMode && modal && compactTitle) {
    // Toggle Modalità Lettura
    btnReaderMode.addEventListener('click', () => {
        modal.classList.toggle('reader-mode-active');
        btnReaderMode.classList.toggle('active');
    });

    // Effetto scroll per il titolo compatto nel modale
    modal.addEventListener('scroll', () => {
        const mainTitle = document.getElementById('modal-title');
        if (mainTitle) {
            const rect = mainTitle.getBoundingClientRect();
            if (rect.bottom < 60) {
                compactTitle.classList.add('visible');
                mainTitle.style.opacity = '0'; 
            } else {
                compactTitle.classList.remove('visible');
                mainTitle.style.opacity = '1';
            }
        }
    });
}

// Funzione per aprire il modale e caricare i JSON
async function openModal(fileName) {
    if (!modal) return;
    
    focusedElementBeforeModal = document.activeElement; 
    document.body.style.overflow = 'hidden';
    modal.classList.add('active');
    
    // A11Y FIX: Rivela il modale agli screen reader
    modal.setAttribute('aria-hidden', 'false'); 
    
    modal.scrollTo(0, 0); 
    compactTitle.classList.remove('visible'); 
    
    // Resetta la modalità lettura ogni volta che si apre un nuovo documento
    modal.classList.remove('reader-mode-active');
    btnReaderMode.classList.remove('active');
    
    closeBtn.focus(); 

    const titleEl = document.getElementById('modal-title');
    const descEl = document.getElementById('modal-desc');
    const bodyContainer = document.getElementById('modal-body');

    titleEl.innerText = 'Caricamento...';
    titleEl.style.opacity = '1';
    compactTitle.innerText = '';
    descEl.innerText = '';
    bodyContainer.innerHTML = `<div class="spinner-container"><div class="spinner"></div></div>`;

    // Avviso nel modale se si usa file:/// (così sei protetto anche sui JSON)
    if (window.location.protocol === 'file:') {
        titleEl.innerText = 'Avviso Sviluppatore (CORS)';
        descEl.innerText = 'I file esterni non possono essere caricati in locale facendo doppio click.';
        bodyContainer.innerHTML = `
            <div style="background: var(--bg-secondary); padding: 32px; border-radius: 16px;">
                <h3 style="margin-top: 0; color: var(--color-accent);">Usa un server locale:</h3>
                <ul class="dynamic-list">
                    <li>VS Code: Estensione <em>"Live Server"</em></li>
                    <li>Terminale Mac: <code>python3 -m http.server</code></li>
                </ul>
            </div>
        `;
        return;
    }

    try {
        // PERCORSO AGGIORNATO ALLA NUOVA STRUTTURA CARTELLE (assets/json/)
        const response = await fetch(`assets/json/${fileName}.json`);
        if (!response.ok) throw new Error(`HTTP: ${response.status}`);
        const data = await response.json();

        titleEl.innerText = data.title || '';
        compactTitle.innerText = data.title || ''; 
        descEl.innerText = data.description || '';
        bodyContainer.innerHTML = ''; 

        if (data.body && Array.isArray(data.body)) {
            data.body.forEach(block => {
                if (fileName === 'faq' && block.type === 'paragraph') {
                    const details = document.createElement('details');
                    if(block === data.body[0]) details.setAttribute('open', true);
                    details.innerHTML = `<summary>${block.title}</summary><div class="details-content"><p>${block.text}</p></div>`;
                    bodyContainer.appendChild(details);
                } else {
                    if (block.type === 'paragraph') {
                        if (block.title) {
                            const h3 = document.createElement('h3');
                            h3.innerText = block.title;
                            bodyContainer.appendChild(h3);
                        }
                        const p = document.createElement('p');
                        p.innerText = block.text;
                        bodyContainer.appendChild(p);
                    } else if (block.type === 'cit') {
                        const div = document.createElement('div');
                        div.className = 'dynamic-quote';
                        div.innerHTML = `<p>"${block.text}"</p>`;
                        if (block.person) div.innerHTML += `<span>- ${block.person}</span>`;
                        bodyContainer.appendChild(div);
                    } else if (block.type === 'list') {
                        const ul = document.createElement('ul');
                        ul.className = 'dynamic-list';
                        if (block.items) {
                            block.items.forEach(item => {
                                const li = document.createElement('li');
                                li.innerHTML = `<strong>${item.title}</strong> ${item.description}`;
                                ul.appendChild(li);
                            });
                        }
                        bodyContainer.appendChild(ul);
                    }
                }
            });
        }
    } catch (error) {
        titleEl.innerText = 'Ops!';
        descEl.innerText = 'Impossibile caricare il contenuto.';
        bodyContainer.innerHTML = '<p>Verifica la tua connessione o il nome del file.</p>';
        console.error("Errore caricamento JSON:", error);
    }
}

function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    
    // A11Y FIX: Nasconde nuovamente il modale agli screen reader
    modal.setAttribute('aria-hidden', 'true'); 
    
    document.body.style.overflow = '';
    if (focusedElementBeforeModal) focusedElementBeforeModal.focus(); 
}

// Inizializza Listeners (assicurati che il DOM sia pronto prima di agganciarli)
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('[data-modal]').forEach(trigger => {
        trigger.addEventListener('click', () => openModal(trigger.dataset.modal));
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(trigger.dataset.modal);
            }
        });
    });
    
    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', (e) => { 
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal(); 
        }
    });
});