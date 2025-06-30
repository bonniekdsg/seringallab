document.addEventListener('DOMContentLoaded', () => {
    // Inicializar AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        once: false
    });

    // Menu Responsivo
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const overlay = document.createElement('div');
    overlay.classList.add('menu-overlay');
    document.body.appendChild(overlay);

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        overlay.classList.remove('active');
    });

    // Smooth Scroll
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    if (navMenu.classList.contains('active')) {
                        menuToggle.click();
                    }
                }
            } else {
                if (navMenu.classList.contains('active')) {
                    menuToggle.click();
                }
            }
        });
    });

    // Caixa de Pesquisa
    const searchBtn = document.querySelector('.search-btn');
    const searchBox = document.querySelector('.search-box');
    const searchContainer = document.querySelector('.search-container');

    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) {
            setTimeout(() => searchBox.focus(), 100);
            searchBtn.style.color = '#012e2c';
            if (window.innerWidth <= 480) {
                document.addEventListener('click', closeSearchOnClickOutside);
            }
        } else {
            searchBtn.style.color = '';
            document.removeEventListener('click', closeSearchOnClickOutside);
        }
    });

    function closeSearchOnClickOutside(event) {
        if (!searchContainer.contains(event.target)) {
            searchBox.classList.remove('active');
            searchBtn.style.color = '';
            document.removeEventListener('click', closeSearchOnClickOutside);
        }
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 480 && searchBox.classList.contains('active')) {
            document.removeEventListener('click', closeSearchOnClickOutside);
        } else if (window.innerWidth <= 480 && searchBox.classList.contains('active')) {
            document.addEventListener('click', closeSearchOnClickOutside);
        }
    });

    // Função de Pesquisa Melhorada
    searchBox.addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.flip-card');
        cards.forEach(card => {
            const title = card.querySelector('h2').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.classList.add('visible');
                card.style.display = 'block';
            } else {
                card.classList.remove('visible');
                card.style.display = 'none';
            }
        });
    });

    // Lazy Loading para Imagens
    const cardFronts = document.querySelectorAll('.flip-card-front');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const bgImage = img.style.backgroundImage;
                    if (bgImage.includes('data:image')) {
                        const dataSrc = img.getAttribute('data-bg');
                        img.style.backgroundImage = `url(${dataSrc})`;
                    }
                    observer.unobserve(img);
                }
            });
        });

        cardFronts.forEach(front => {
            const originalBg = front.style.backgroundImage;
            front.setAttribute('data-bg', originalBg.replace(/url\(['"]?(.*?)['"]?\)/i, '$1'));
            front.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23cccccc\'/%3E%3C/svg%3E")';
            imageObserver.observe(front);
        });
    }

    // Animação dos Flip Cards
    const flipCards = document.querySelectorAll('.flip-card');
    setTimeout(() => {
        flipCards.forEach(card => card.classList.add('visible'));
    }, 300);

    // --- NOVO: Lógica combinada para Touch e Hover Fix para título H2 ---
    let titleShowTimeout = null;
    const cardTransitionDuration = 500; // ms, conforme CSS .flip-card-back

    flipCards.forEach(card => {
        const title = card.querySelector('.flip-card-back h2');

        // --- Lógica Hover ---
        card.addEventListener('mouseenter', () => {
            // Limpa timeout se o mouse re-entrar antes do título reaparecer
            if (titleShowTimeout) {
                clearTimeout(titleShowTimeout);
                titleShowTimeout = null;
            }
            // --- JS esconde o título AGORA ---
            if (title) {
                title.style.display = 'none';
            }
        });

        card.addEventListener('mouseleave', () => {
            // Só reexibe se o título existir e o card NÃO estiver com foco de toque
            if (title && !card.classList.contains('touch-focus')) {
                // Atrasar a reexibição do título
                titleShowTimeout = setTimeout(() => {
                    title.style.display = ''; // Restaura display padrão
                    titleShowTimeout = null;
                }, cardTransitionDuration);
            }
        });

        // --- Lógica Touch (apenas se houver título a ser gerenciado) ---
        if ('ontouchstart' in window && title) {
            card.addEventListener('touchstart', function(e) {
                e.preventDefault(); // Previne zoom/scroll e clique fantasma

                const isFocused = this.classList.contains('touch-focus');

                // Remove foco e restaura título (com delay) de QUALQUER outro card focado
                flipCards.forEach(otherCard => {
                    if (otherCard !== this && otherCard.classList.contains('touch-focus')) {
                        otherCard.classList.remove('touch-focus');
                        const otherTitle = otherCard.querySelector('.flip-card-back h2');
                        if (otherTitle) {
                            // Atrasar reexibição do título do outro card
                            setTimeout(() => {
                                otherTitle.style.display = '';
                            }, cardTransitionDuration);
                        }
                    }
                });

                // Lida com este card
                if (isFocused) {
                    // Se já estava focado, remove o foco
                    this.classList.remove('touch-focus');
                    // Atrasar reexibição do título deste card
                     titleShowTimeout = setTimeout(() => {
                         title.style.display = '';
                         titleShowTimeout = null;
                     }, cardTransitionDuration);
                } else {
                    // Se não estava focado, adiciona foco
                    // Limpa timeout de mouseleave, se houver
                     if (titleShowTimeout) {
                        clearTimeout(titleShowTimeout);
                        titleShowTimeout = null;
                     }
                    this.classList.add('touch-focus');
                    // --- JS esconde o título AGORA ---
                    title.style.display = 'none';
                }
            });
        }
    });
    // --- FIM: Lógica combinada ---

    /*
    // Experiência Touch para Flip Cards (Antiga - Comentar ou Remover)
    if ('ontouchstart' in window) {
        flipCards.forEach(card => {
            card.addEventListener('touchstart', function() {
                flipCards.forEach(c => {
                    if (c !== card) c.classList.remove('touch-focus');
                });
                this.classList.toggle('touch-focus');
            });
        });
    }
    */

    // Botão Voltar ao Topo
    const backToTopBtn = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('visible', window.pageYOffset > 300);
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Toggle de Tema
    const themeToggle = document.querySelector('.theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeIcon.classList.remove('fa-moon', 'fa-sun');
        themeIcon.classList.add(theme === 'dark' ? 'fa-sun' : 'fa-moon');
    }

    // Consentimento de Cookies
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    const cookieAccepted = localStorage.getItem('cookieAccepted');

    if (!cookieAccepted) {
        cookieConsent.classList.add('visible');
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookieAccepted', 'true');
        cookieConsent.classList.remove('visible');
        setTimeout(() => cookieConsent.style.display = 'none', 500); // Remove após transição
    });

    // Chatbot Logic - REMOVER TODO ESTE BLOCO
    /*
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const n8nWebhookUrl = '...';
    let chatbotSessionId = null;
    function getChatbotSessionId() { ... }
    chatbotIcon.addEventListener('click', () => { ... });
    chatbotClose.addEventListener('click', () => { ... });
    function addMessage(text, sender) { ... }
    async function sendMessageToN8n(messageText) { ... }
    chatbotSend.addEventListener('click', () => { ... });
    chatbotInput.addEventListener('keypress', (e) => { ... });
    */

    // ... (código do carrossel comentado) ...

}); // Fim do DOMContentLoaded