// ==========================================
// assets/js/support.js
// Gestione Viste e Fetch Dinamico da JSON
// ==========================================

// Variabili di stato globali
let supportData = [];
let currentCategory = null;

// Mappa categorie e icone fisse per la UI
const categorySetup = [
    { name: "Dashboard & Organizzazione", icon: "☀️" },
    { name: "Appunti & File", icon: "📚" },
    { name: "Studio & Focus", icon: "🎯" },
    { name: "Statistiche", icon: "📈" },
    { name: "Impostazioni & Profilo", icon: "⚙️" }
];

// Mappatura dinamica per arricchire il tuo JSON con Categorie e Tag
const categoryMap = {
    'oggi': { category: 'Dashboard & Organizzazione', tags: ['oggi', 'dashboard', 'lezioni', 'esami', 'promemoria'] },
    'corsi': { category: 'Appunti & File', tags: ['corsi', 'appunti', 'materie', 'pdf', 'audio'] },
    'editor-avanzato': { category: 'Appunti & File', tags: ['editor', 'appunti', 'blocchi', 'slash', 'undo'] },
    'study': { category: 'Studio & Focus', tags: ['studio', 'focus', 'obiettivi', 'sessione', 'esame'] },
    'calendar': { category: 'Dashboard & Organizzazione', tags: ['agenda', 'calendario', 'lezioni', 'orario'] },
    'career': { category: 'Statistiche', tags: ['carriera', 'voti', 'media', 'libretto', 'laurea', 'cfu'] },
    'account': { category: 'Impostazioni & Profilo', tags: ['account', 'profilo', 'privacy', 'impostazioni', 'supporto'] },
    'customization': { category: 'Impostazioni & Profilo', tags: ['personalizzazione', 'dark mode', 'testo', 'avatar', 'impostazioni'] }
};

document.addEventListener("DOMContentLoaded", () => {
    
    // Nodi DOM
    const viewCategories = document.getElementById('view-categories');
    const viewCategoryArticles = document.getElementById('view-category-articles');
    const viewSearchResults = document.getElementById('view-search-results');
    
    const categoriesGrid = document.getElementById('categories-grid');
    const categoryTitle = document.getElementById('category-title');
    const categoryArticlesList = document.getElementById('category-articles-list');
    
    const searchInput = document.getElementById('support-search-input');
    const searchArticlesList = document.getElementById('search-articles-list');
    const searchTitle = document.getElementById('search-title');
    const noResultsMsg = document.getElementById('no-results-message');
    const btnBack = document.getElementById('btn-back-categories');

    // 1. CARICAMENTO DATI (FETCH DAL JSON)
    async function fetchSupportData() {
        // Controllo per chi apre il file in locale senza server
        if (window.location.protocol === 'file:') {
            categoriesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; background: var(--bg-secondary); padding: 32px; border-radius: 24px; text-align: center;">
                    <h3>⚠️ Avviso CORS</h3>
                    <p style="color: var(--color-text-secondary);">Per caricare il file JSON esterno, devi avviare il progetto tramite un server locale (es. Live Server su VS Code).</p>
                </div>
            `;
            return;
        }

        try {
            const response = await fetch('assets/json/support.json');
            if (!response.ok) throw new Error('Errore nel caricamento del JSON');
            
            const rawData = await response.json();
            
            // Arricchiamo i dati grezzi con le categorie e i tag necessari per la UI
            supportData = rawData.map(item => ({
                ...item,
                category: item.category || categoryMap[item.id]?.category || 'Altro',
                tags: item.tags || categoryMap[item.id]?.tags || []
            }));

            // Inizializza l'interfaccia dopo aver caricato i dati
            initUI();

        } catch (error) {
            console.error("Errore fetch supporto:", error);
            categoriesGrid.innerHTML = `<p>Impossibile caricare le guide di supporto in questo momento.</p>`;
        }
    }

    // 2. INIZIALIZZAZIONE INTERFACCIA
    function initUI() {
        if (categoriesGrid) {
            renderCategoriesGrid();
            showCategoriesView(); // Stato iniziale
        }

        if (btnBack) {
            btnBack.addEventListener('click', () => {
                showCategoriesView();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (query === '') {
                    if (currentCategory) {
                        showCategoryArticlesView(currentCategory);
                    } else {
                        showCategoriesView();
                    }
                } else {
                    showSearchResultsView(query);
                }
            });
        }
    }

    // --- FUNZIONI DI CAMBIO VISTA ---

    function showCategoriesView() {
        viewCategories.style.display = 'block';
        viewCategoryArticles.style.display = 'none';
        viewSearchResults.style.display = 'none';
        currentCategory = null;
    }

    function showCategoryArticlesView(categoryName) {
        currentCategory = categoryName;
        viewCategories.style.display = 'none';
        viewSearchResults.style.display = 'none';
        viewCategoryArticles.style.display = 'block';
        
        categoryTitle.innerText = categoryName;
        
        const articles = supportData.filter(a => a.category === categoryName);
        categoryArticlesList.innerHTML = generateArticlesHTML(articles);
        attachModalListeners(categoryArticlesList);
    }

    function showSearchResultsView(query) {
        viewCategories.style.display = 'none';
        viewCategoryArticles.style.display = 'none';
        viewSearchResults.style.display = 'block';
        
        searchTitle.innerText = `Risultati per "${query}"`;
        
        const results = supportData.filter(article => {
            const inTitle = article.title.toLowerCase().includes(query);
            const inDesc = article.description.toLowerCase().includes(query);
            const inTags = article.tags.some(tag => tag.toLowerCase().includes(query));
            return inTitle || inDesc || inTags;
        });

        if (results.length === 0) {
            searchArticlesList.innerHTML = '';
            noResultsMsg.style.display = 'block';
        } else {
            noResultsMsg.style.display = 'none';
            searchArticlesList.innerHTML = generateArticlesHTML(results);
            attachModalListeners(searchArticlesList);
        }
    }

    // --- GENERAZIONE HTML ---

    function renderCategoriesGrid() {
        categoriesGrid.innerHTML = categorySetup.map(cat => `
            <div class="category-card" style="cursor: pointer;" data-cat="${cat.name}">
                <span class="icon">${cat.icon}</span>
                <h3>${cat.name}</h3>
            </div>
        `).join('');

        categoriesGrid.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => showCategoryArticlesView(card.dataset.cat));
        });
    }

    function generateArticlesHTML(articles) {
        return articles.map(article => `
            <article class="support-article-card reveal active" style="opacity:1; transform:translateY(0);">
                <div class="article-content">
                    <h3 style="margin-top:0;">${article.title}</h3>
                    <p>${article.description}</p>
                    <button class="btn-link" style="background:none; border:none; padding:0; font-size:1.1rem; color:var(--color-accent); cursor:pointer; font-weight:600;" data-support-id="${article.id}">
                        Leggi la guida &rarr;
                    </button>
                </div>
            </article>
        `).join('');
    }

    function attachModalListeners(container) {
        container.querySelectorAll('[data-support-id]').forEach(trigger => {
            trigger.addEventListener('click', () => openSupportArticle(trigger.dataset.supportId));
        });
    }

    // --- LOGICA MODALE DINAMICO ---
    function openSupportArticle(id) {
        const article = supportData.find(a => a.id === id);
        if(!article) return;

        const modal = document.getElementById('dynamic-modal');
        const titleEl = document.getElementById('modal-title');
        const descEl = document.getElementById('modal-desc');
        const bodyContainer = document.getElementById('modal-body');
        const compactTitle = document.getElementById('modal-compact-title');

        if(!modal || !bodyContainer) return;

        bodyContainer.innerHTML = '';
        titleEl.innerText = article.title;
        compactTitle.innerText = article.title;
        descEl.innerText = article.description;

        // Costruisci i blocchi dell'articolo leggendo il JSON
        article.body.forEach(block => {
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
            } else if (block.type === 'photo') {
                const imgWrap = document.createElement('div');
                imgWrap.style.margin = "32px 0";
                imgWrap.innerHTML = `<img src="assets/screenshots/${block.name}.png" alt="${block.alt || ''}" style="width:100%; border-radius:16px; border:1px solid var(--color-border);">`;
                bodyContainer.appendChild(imgWrap);
            }
        });

        // Risorse Esterne (Dal JSON)
        if (article.sources && article.sources.length > 0) {
            const sourcesDiv = document.createElement('div');
            sourcesDiv.className = 'support-sources';
            sourcesDiv.innerHTML = `
                <h3 style="margin-top: 48px; border-top: 1px solid var(--color-border); padding-top: 32px;">Risorse Esterne</h3>
                <ul class="dynamic-list" style="margin-top: 16px;">
                    ${article.sources.map(src => `
                        <li><a href="${src.url}" target="_blank" style="color: var(--color-accent); text-decoration: none; font-weight: 500;">
                            ${src.title} <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="vertical-align: middle; margin-left: 4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a></li>
                    `).join('')}
                </ul>
            `;
            bodyContainer.appendChild(sourcesDiv);
        }

        document.body.style.overflow = 'hidden';
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false'); 
        modal.scrollTo(0, 0); 
    }

    // AVVIO DELLO SCRIPT
    fetchSupportData();
});