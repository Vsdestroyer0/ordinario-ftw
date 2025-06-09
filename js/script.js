// ===== DATOS DE WARFRAMES =====
const warframesData = [
    {
        id: 'excalibur',
        name: 'Excalibur',
        type: 'assault',
        description: 'El Warframe equilibrado perfecto para principiantes',
        abilities: ['Slash Dash', 'Radial Blind', 'Radial Javelin', 'Exalted Blade'],
        stats: { health: 300, shield: 225, armor: 225, energy: 150 }
    },
    {
        id: 'mag',
        name: 'Mag',
        type: 'support',
        description: 'Maestra de la manipulación magnética',
        abilities: ['Pull', 'Magnetize', 'Polarize', 'Crush'],
        stats: { health: 225, shield: 300, armor: 65, energy: 188 }
    },
    {
        id: 'volt',
        name: 'Volt',
        type: 'assault',
        description: 'Domina el poder de la electricidad',
        abilities: ['Shock', 'Speed', 'Electric Shield', 'Discharge'],
        stats: { health: 225, shield: 300, armor: 50, energy: 200 }
    },
    {
        id: 'loki',
        name: 'Loki',
        type: 'stealth',
        description: 'El maestro del engaño y la invisibilidad',
        abilities: ['Decoy', 'Invisibility', 'Switch Teleport', 'Radial Disarm'],
        stats: { health: 225, shield: 225, armor: 65, energy: 188 }
    },
    {
        id: 'rhino',
        name: 'Rhino',
        type: 'tank',
        description: 'Tanque imparable con gran resistencia',
        abilities: ['Rhino Charge', 'Iron Skin', 'Roar', 'Rhino Stomp'],
        stats: { health: 525, shield: 150, armor: 190, energy: 150 }
    }
];

let filteredWarframes = [...warframesData];

// ===== FUNCIONES DE RENDERIZADO ACCESIBLES =====
function renderWarframes(warframes) {
    const container = document.getElementById('warframes-container');
    const announcements = document.getElementById('filter-announcements');
    
    if (!container) return;
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    if (warframes.length === 0) {
        container.innerHTML = `
            <div class="no-results" role="status" aria-live="polite" tabindex="0">
                <h3>No se encontraron Warframes</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        `;
        
        // Anunciar resultado
        if (announcements) {
            announcements.textContent = 'No se encontraron Warframes con los filtros aplicados';
        }
        return;
    }
    
    // Crear grid de warframes
    warframes.forEach((warframe, index) => {
        const warframeCard = document.createElement('article');
        warframeCard.className = 'warframe-card';
        
        // ✅ ATRIBUTOS DE ACCESIBILIDAD
        warframeCard.setAttribute('tabindex', '0');
        warframeCard.setAttribute('role', 'button');
        warframeCard.setAttribute('aria-labelledby', `warframe-${warframe.id}-title`);
        warframeCard.setAttribute('aria-describedby', `warframe-${warframe.id}-desc warframe-${warframe.id}-type`);
        warframeCard.setAttribute('data-warframe-id', warframe.id);
        
        warframeCard.innerHTML = `
            <div class="warframe-image" role="img" aria-label="Imagen de ${warframe.name}">
                <div class="warframe-placeholder"></div>
            </div>
            <div class="warframe-info">
                <h3 id="warframe-${warframe.id}-title">${warframe.name}</h3>
                <p id="warframe-${warframe.id}-desc">${warframe.description}</p>
                <span id="warframe-${warframe.id}-type" class="warframe-type ${warframe.type}">
                    ${getTypeDisplayName(warframe.type)}
                </span>
            </div>
        `;
        
        // ✅ EVENT LISTENERS PARA TECLADO Y MOUSE
        warframeCard.addEventListener('click', () => openWarframeModal(warframe));
        warframeCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openWarframeModal(warframe);
            }
        });
        
        // ✅ FOCUS MANAGEMENT
        warframeCard.addEventListener('focus', () => {
            warframeCard.style.transform = 'scale(1.02)';
        });
        
        warframeCard.addEventListener('blur', () => {
            warframeCard.style.transform = 'scale(1)';
        });
        
        container.appendChild(warframeCard);
    });
    
    // Anunciar resultados
    if (announcements) {
        announcements.textContent = `Se encontraron ${warframes.length} Warframes`;
    }
}

// ===== MODAL ACCESIBLE =====
function openWarframeModal(warframe) {
    const modal = document.getElementById('warframe-modal');
    const modalBody = document.getElementById('modal-body');
    const announcements = document.getElementById('filter-announcements');
    
    if (!modal || !modalBody) return;
    
    // Guardar elemento con foco actual
    window.lastFocusedElement = document.activeElement;
    
    modalBody.innerHTML = `
        <div class="modal-warframe-content">
            <h3 id="modal-title">${warframe.name}</h3>
            <div id="modal-description">
                <div class="warframe-details">
                    <div class="warframe-image-large" role="img" aria-label="Imagen grande de ${warframe.name}">
                        <div class="warframe-placeholder-large"></div>
                    </div>
                    
                    <div class="warframe-stats" role="region" aria-labelledby="stats-title">
                        <h4 id="stats-title">Estadísticas</h4>
                        <ul role="list">
                            <li>Salud: <span aria-label="${warframe.stats.health} puntos de salud">${warframe.stats.health}</span></li>
                            <li>Escudo: <span aria-label="${warframe.stats.shield} puntos de escudo">${warframe.stats.shield}</span></li>
                            <li>Armadura: <span aria-label="${warframe.stats.armor} puntos de armadura">${warframe.stats.armor}</span></li>
                            <li>Energía: <span aria-label="${warframe.stats.energy} puntos de energía">${warframe.stats.energy}</span></li>
                        </ul>
                    </div>
                    
                    <div class="warframe-abilities" role="region" aria-labelledby="abilities-title">
                        <h4 id="abilities-title">Habilidades</h4>
                        <ul role="list">
                            ${warframe.abilities.map((ability, index) => 
                                `<li><strong>Habilidad ${index + 1}:</strong> ${ability}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    
                    <div class="warframe-description">
                        <h4>Descripción</h4>
                        <p>${warframe.description}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Mostrar modal
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    
    // Enfocar el botón cerrar
    const closeButton = modal.querySelector('.close');
    if (closeButton) {
        closeButton.focus();
    }
    
    // Anunciar apertura del modal
    if (announcements) {
        announcements.textContent = `Se abrió la ventana de detalles de ${warframe.name}`;
    }
    
    // Trap focus dentro del modal
    trapFocus(modal);
}

// ===== CERRAR MODAL ACCESIBLE =====
function closeModal() {
    const modal = document.getElementById('warframe-modal');
    const announcements = document.getElementById('filter-announcements');
    
    if (!modal) return;
    
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    
    // Restaurar foco al elemento anterior
    if (window.lastFocusedElement) {
        window.lastFocusedElement.focus();
    }
    
    // Anunciar cierre
    if (announcements) {
        announcements.textContent = 'Se cerró la ventana de detalles';
    }
}

// ===== TRAP FOCUS EN MODAL =====
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
        
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// ===== FUNCIONES DE FILTRADO ACCESIBLES =====
function filterWarframes() {
    const typeFilter = document.getElementById('warframe-type');
    const searchInput = document.getElementById('search-warframe');
    const announcements = document.getElementById('filter-announcements');
    
    if (!typeFilter || !searchInput) return;
    
    const selectedType = typeFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    
    filteredWarframes = warframesData.filter(warframe => {
        const matchesType = selectedType === 'all' || warframe.type === selectedType;
        const matchesSearch = warframe.name.toLowerCase().includes(searchTerm) ||
                             warframe.description.toLowerCase().includes(searchTerm);
        
        return matchesType && matchesSearch;
    });
    
    renderWarframes(filteredWarframes);
    
    // Anunciar filtrado
    if (announcements) {
        announcements.textContent = `Filtros aplicados. ${filteredWarframes.length} Warframes encontrados`;
    }
}

function searchWarframes() {
    filterWarframes();
}

function resetFilters() {
    const typeFilter = document.getElementById('warframe-type');
    const searchInput = document.getElementById('search-warframe');
    const announcements = document.getElementById('filter-announcements');
    
    if (typeFilter) typeFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    
    filteredWarframes = [...warframesData];
    renderWarframes(filteredWarframes);
    
    // Anunciar reset
    if (announcements) {
        announcements.textContent = 'Filtros eliminados. Mostrando todos los Warframes';
    }
}

// ===== FUNCIÓN AUXILIAR =====
function getTypeDisplayName(type) {
    const typeNames = {
        'assault': 'Asalto',
        'support': 'Soporte',
        'stealth': 'Sigilo',
        'tank': 'Tanque'
    };
    return typeNames[type] || type;
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Cargar warframes si estamos en la página correcta
    if (document.getElementById('warframes-container')) {
        renderWarframes(warframesData);
    }
    
    // Event listeners para cerrar modal con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('warframe-modal');
            if (modal && modal.style.display === 'block') {
                closeModal();
            }
        }
    });
});

// ===== FUNCIONES PARA INDEX.HTML =====
function showWelcomeMessage() {
    const announcements = document.getElementById('live-announcements');
    if (announcements) {
        announcements.textContent = '¡Bienvenido Tenno! Tu misión comienza ahora.';
    }
    alert('¡Bienvenido al universo Warframe, Tenno!');
}

function navigateToWarframes() {
    window.location.href = 'warframes.html';
}

function navigateToArsenal() {
    window.location.href = 'arsenal.html';
}

function showMissionInfo() {
    const announcements = document.getElementById('live-announcements');
    if (announcements) {
        announcements.textContent = 'Información de misiones cooperativas mostrada.';
    }
    alert('Las misiones cooperativas te permiten jugar con hasta 3 amigos. ¡La cooperación es clave para la victoria!');
}
