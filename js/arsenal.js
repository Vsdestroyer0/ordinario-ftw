// ===== DATOS DE ARMAS =====
const weaponsData = [
    {
        id: 'braton-prime',
        name: 'Braton Prime',
        category: 'primary',
        type: 'Rifle de Asalto',
        damage: 34,
        fireRate: 8.8,
        accuracy: 28.6,
        description: 'Versión mejorada del rifle Braton clásico'
    },
    {
        id: 'soma-prime',
        name: 'Soma Prime',
        category: 'primary',
        type: 'Rifle de Asalto',
        damage: 12,
        fireRate: 15,
        accuracy: 28.6,
        description: 'Rifle automático con alta cadencia de fuego'
    },
    {
        id: 'lex-prime',
        name: 'Lex Prime',
        category: 'secondary',
        type: 'Pistola',
        damage: 140,
        fireRate: 6.7,
        accuracy: 26.7,
        description: 'Pistola de alto calibre con gran poder de parada'
    },
    {
        id: 'kunai',
        name: 'Kunai',
        category: 'secondary',
        type: 'Arrojadiza',
        damage: 245,
        fireRate: 3.3,
        accuracy: 100,
        description: 'Arma arrojadiza silenciosa y precisa'
    },
    {
        id: 'nikana-prime',
        name: 'Nikana Prime',
        category: 'melee',
        type: 'Nikana',
        damage: 264,
        fireRate: 0.83,
        accuracy: 100,
        description: 'Katana ceremonial con cortes devastadores'
    },
    {
        id: 'war',
        name: 'War',
        category: 'melee',
        type: 'Espada Pesada',
        damage: 350,
        fireRate: 0.67,
        accuracy: 100,
        description: 'Espada de dos manos con poder destructivo'
    }
];

let filteredWeapons = [...weaponsData];
let currentFilter = 'all';

// ===== RENDERIZADO ACCESIBLE DE ARMAS =====
function renderWeapons(weapons) {
    const container = document.getElementById('weapons-container');
    const announcements = document.getElementById('weapon-announcements');
    
    if (!container) return;
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    if (weapons.length === 0) {
        container.innerHTML = `
            <div class="no-results" role="status" aria-live="polite" tabindex="0">
                <h3>No se encontraron armas</h3>
                <p>Intenta seleccionar una categoría diferente</p>
            </div>
        `;
        
        // Anunciar resultado
        if (announcements) {
            announcements.textContent = 'No se encontraron armas en esta categoría';
        }
        return;
    }
    
    // Crear grid de armas
    weapons.forEach((weapon, index) => {
        const weaponCard = document.createElement('article');
        weaponCard.className = 'weapon-card';
        
        // ✅ ATRIBUTOS DE ACCESIBILIDAD
        weaponCard.setAttribute('tabindex', '0');
        weaponCard.setAttribute('role', 'button');
        weaponCard.setAttribute('aria-labelledby', `weapon-${weapon.id}-title`);
        weaponCard.setAttribute('aria-describedby', `weapon-${weapon.id}-desc weapon-${weapon.id}-stats`);
        weaponCard.setAttribute('data-weapon-id', weapon.id);
        weaponCard.setAttribute('data-category', weapon.category);
        
        weaponCard.innerHTML = `
            <div class="weapon-image" role="img" aria-label="Imagen de ${weapon.name}">
                <div class="weapon-placeholder"></div>
            </div>
            <div class="weapon-info">
                <h3 id="weapon-${weapon.id}-title">${weapon.name}</h3>
                <p id="weapon-${weapon.id}-desc">${weapon.description}</p>
                <div id="weapon-${weapon.id}-stats" class="weapon-stats">
                    <div class="stat">
                        <span class="stat-label">Daño:</span>
                        <span class="stat-value" aria-label="${weapon.damage} puntos de daño">${weapon.damage}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Cadencia:</span>
                        <span class="stat-value" aria-label="${weapon.fireRate} disparos por segundo">${weapon.fireRate}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Precisión:</span>
                        <span class="stat-value" aria-label="${weapon.accuracy} por ciento de precisión">${weapon.accuracy}%</span>
                    </div>
                </div>
                <span class="weapon-type">${weapon.type}</span>
            </div>
        `;
        
        // ✅ EVENT LISTENERS PARA TECLADO Y MOUSE
        weaponCard.addEventListener('click', () => openWeaponModal(weapon));
        weaponCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openWeaponModal(weapon);
            }
        });
        
        // ✅ FOCUS MANAGEMENT
        weaponCard.addEventListener('focus', () => {
            weaponCard.style.transform = 'scale(1.02)';
            weaponCard.style.boxShadow = '0 4px 20px rgba(0, 212, 255, 0.3)';
        });
        
        weaponCard.addEventListener('blur', () => {
            weaponCard.style.transform = 'scale(1)';
            weaponCard.style.boxShadow = 'none';
        });
        
        container.appendChild(weaponCard);
    });
    
    // Anunciar resultados
    if (announcements) {
        const categoryName = getCategoryDisplayName(currentFilter);
        announcements.textContent = `Se encontraron ${weapons.length} armas en la categoría ${categoryName}`;
    }
}

// ===== MODAL DE ARMA ACCESIBLE =====
function openWeaponModal(weapon) {
    // Crear modal dinámico si no existe
    let modal = document.getElementById('weapon-modal');
    if (!modal) {
        modal = document.createElement('aside');
        modal.id = 'weapon-modal';
        modal.className = 'weapon-details';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'weapon-modal-title');
        modal.setAttribute('aria-describedby', 'weapon-modal-description');
        modal.setAttribute('aria-modal', 'true');
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close" 
                        onclick="closeWeaponModal()" 
                        tabindex="0" 
                        role="button" 
                        aria-label="Cerrar ventana de detalles">×</button>
                <div id="weapon-modal-body">
                    <!-- Contenido dinámico -->
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    const modalBody = document.getElementById('weapon-modal-body');
    const announcements = document.getElementById('weapon-announcements');
    
    // Guardar elemento con foco actual
    window.lastFocusedElement = document.activeElement;
    
    modalBody.innerHTML = `
        <div class="modal-weapon-content">
            <h3 id="weapon-modal-title">${weapon.name}</h3>
            <div id="weapon-modal-description">
                <div class="weapon-details-full">
                    <div class="weapon-image-large" role="img" aria-label="Imagen grande de ${weapon.name}">
                        <div class="weapon-placeholder-large"></div>
                    </div>
                    
                    <div class="weapon-stats-detailed" role="region" aria-labelledby="detailed-stats-title">
                        <h4 id="detailed-stats-title">Estadísticas Detalladas</h4>
                        <dl>
                            <dt>Tipo:</dt>
                            <dd>${weapon.type}</dd>
                            <dt>Categoría:</dt>
                            <dd>${getCategoryDisplayName(weapon.category)}</dd>
                            <dt>Daño Base:</dt>
                            <dd><span aria-label="${weapon.damage} puntos de daño base">${weapon.damage}</span></dd>
                            <dt>Cadencia de Fuego:</dt>
                            <dd><span aria-label="${weapon.fireRate} disparos por segundo">${weapon.fireRate}/s</span></dd>
                            <dt>Precisión:</dt>
                            <dd><span aria-label="${weapon.accuracy} por ciento de precisión">${weapon.accuracy}%</span></dd>
                        </dl>
                    </div>
                    
                    <div class="weapon-description-full">
                        <h4>Descripción</h4>
                        <p>${weapon.description}</p>
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
        announcements.textContent = `Se abrió la ventana de detalles de ${weapon.name}`;
    }
    
    // Trap focus dentro del modal
    trapFocusWeapon(modal);
}

// ===== CERRAR MODAL DE ARMA =====
function closeWeaponModal() {
    const modal = document.getElementById('weapon-modal');
    const announcements = document.getElementById('weapon-announcements');
    
    if (!modal) return;
    
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    
    // Restaurar foco al elemento anterior
    if (window.lastFocusedElement) {
        window.lastFocusedElement.focus();
    }
    
    // Anunciar cierre
    if (announcements) {
        announcements.textContent = 'Se cerró la ventana de detalles del arma';
    }
}

// ===== TRAP FOCUS EN MODAL DE ARMA =====
function trapFocusWeapon(element) {
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
            closeWeaponModal();
        }
    });
}

// ===== FILTRADO ACCESIBLE DE ARMAS =====
function filterWeapons(category) {
    currentFilter = category;
    const announcements = document.getElementById('weapon-announcements');
    
    // Actualizar botones activos
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    
    // Activar botón seleccionado
    const activeButton = document.querySelector(`[onclick="filterWeapons('${category}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-pressed', 'true');
    }
    
    // Filtrar armas
    if (category === 'all') {
        filteredWeapons = [...weaponsData];
    } else {
        filteredWeapons = weaponsData.filter(weapon => weapon.category === category);
    }
    
    renderWeapons(filteredWeapons);
    
    // Anunciar filtrado
    if (announcements) {
        const categoryName = getCategoryDisplayName(category);
        announcements.textContent = `Filtro aplicado: ${categoryName}. ${filteredWeapons.length} armas encontradas`;
    }
}

// ===== FUNCIÓN AUXILIAR =====
function getCategoryDisplayName(category) {
    const categoryNames = {
        'all': 'Todas las categorías',
        'primary': 'Armas Primarias',
        'secondary': 'Armas Secundarias',
        'melee': 'Armas Cuerpo a Cuerpo'
    };
    return categoryNames[category] || category;
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Cargar armas si estamos en la página correcta
    if (document.getElementById('weapons-container')) {
        renderWeapons(weaponsData);
    }
    
    // Event listeners para cerrar modal con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('weapon-modal');
            if (modal && modal.style.display === 'block') {
                closeWeaponModal();
            }
        }
    });
});
