// Variables globales para arsenal
let weaponsData = [];
let currentWeaponFilter = 'all';
let favoriteWeapons = JSON.parse(localStorage.getItem('favorite_weapons') || '[]');

// Cargar datos al inicializar
document.addEventListener('DOMContentLoaded', function() {
    loadWeaponsFromXML();
    setupArsenalEventListeners();
});

// Cargar armas desde XML
async function loadWeaponsFromXML() {
    try {
        const response = await fetch('data/weapons.xml');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        parseWeaponsXML(xmlDoc);
        displayWeapons();
    } catch (error) {
        console.error('Error loading weapons XML:', error);
        loadFallbackWeapons();
    }
}

// Parsear XML de armas
function parseWeaponsXML(xmlDoc) {
    const weaponNodes = xmlDoc.getElementsByTagName('weapon');
    weaponsData = [];
    
    for (let i = 0; i < weaponNodes.length; i++) {
        const node = weaponNodes[i];
        const weapon = {
            id: node.getAttribute('id'),
            category: node.getAttribute('category'),
            type: node.getAttribute('type'),
            mastery: parseInt(node.getAttribute('mastery')),
            name: getXMLValue(node, 'name'),
            description: getXMLValue(node, 'description'),
            stats: {},
            acquisition: getXMLValue(node, 'acquisition'),
            releaseDate: getXMLValue(node, 'release_date')
        };
        
        // Parsear estadísticas
        const statsNode = node.getElementsByTagName('stats')[0];
        if (statsNode) {
            const statElements = statsNode.children;
            for (let j = 0; j < statElements.length; j++) {
                const stat = statElements[j];
                weapon.stats[stat.tagName] = parseFloat(stat.textContent);
            }
        }
        
        weaponsData.push(weapon);
    }
}

// Mostrar armas filtradas
function displayWeapons() {
    const container = document.getElementById('weapons-container');
    if (!container) return;
    
    const filteredWeapons = weaponsData.filter(weapon => {
        if (currentWeaponFilter === 'all') return true;
        return weapon.category === currentWeaponFilter;
    });
    
    container.innerHTML = filteredWeapons.map(weapon => `
        <div class="weapon-card" onclick="showWeaponDetails('${weapon.id}')">
            <div class="weapon-header">
                <h3>${weapon.name}</h3>
                <div class="weapon-meta">
                    <span class="weapon-category category-${weapon.category}">${capitalizeFirst(weapon.category)}</span>
                    <span class="weapon-type">${weapon.type.replace('-', ' ')}</span>
                </div>
            </div>
            <p class="weapon-description">${weapon.description}</p>
            <div class="weapon-stats-preview">
                <div class="stat-row">
                    <div class="stat">
                        <span class="stat-label">Daño:</span>
                        <span class="stat-value">${weapon.stats.damage}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Crítico:</span>
                        <span class="stat-value">${weapon.stats.critical_chance}%</span>
                    </div>
                </div>
                <div class="stat-row">
                    <div class="stat">
                        <span class="stat-label">Estado:</span>
                        <span class="stat-value">${weapon.stats.status_chance}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Maestría:</span>
                        <span class="stat-value">MR ${weapon.mastery}</span>
                    </div>
                </div>
            </div>
            <div class="weapon-footer">
                <div class="acquisition">
                    <strong>Obtención:</strong> ${weapon.acquisition}
                </div>
                <button class="btn-favorite ${favoriteWeapons.includes(weapon.id) ? 'favorited' : ''}" 
                        onclick="event.stopPropagation(); toggleFavoriteWeapon('${weapon.id}')">
                    ${favoriteWeapons.includes(weapon.id) ? '★' : '☆'}
                </button>
            </div>
        </div>
    `).join('');
}

// Filtrar armas por categoría
function filterWeapons(category) {
    currentWeaponFilter = category;
    
    // Actualizar botones de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="filterWeapons('${category}')"]`).classList.add('active');
    
    displayWeapons();
}

// Mostrar detalles de arma
function showWeaponDetails(weaponId) {
    const weapon = weaponsData.find(w => w.id === weaponId);
    if (!weapon) return;
    
    const modal = document.createElement('div');
    modal.className = 'weapon-details-modal';
    modal.innerHTML = `
        <div class="weapon-details-content">
            <div class="weapon-details-header">
                <h2>${weapon.name}</h2>
                <button class="close-details" onclick="closeWeaponDetails()">&times;</button>
            </div>
            <div class="weapon-details-body">
                <div class="weapon-info">
                    <p class="weapon-description">${weapon.description}</p>
                    <div class="weapon-meta-info">
                        <div class="meta-item">
                            <strong>Categoría:</strong> ${capitalizeFirst(weapon.category)}
                        </div>
                        <div class="meta-item">
                            <strong>Tipo:</strong> ${weapon.type.replace('-', ' ')}
                        </div>
                        <div class="meta-item">
                            <strong>Maestría Requerida:</strong> MR ${weapon.mastery}
                        </div>
                        <div class="meta-item">
                            <strong>Obtención:</strong> ${weapon.acquisition}
                        </div>
                        <div class="meta-item">
                            <strong>Lanzamiento:</strong> ${formatDate(weapon.releaseDate)}
                        </div>
                    </div>
                </div>
                <div class="weapon-detailed-stats">
                    <h3>Estadísticas Detalladas</h3>
                    <div class="stats-grid">
                        ${Object.entries(weapon.stats).map(([stat, value]) => `
                            <div class="detailed-stat">
                                <span class="stat-name">${formatStatName(stat)}:</span>
                                <span class="stat-value">${formatStatValue(stat, value)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="weapon-actions">
                    <button onclick="toggleFavoriteWeapon('${weapon.id}')" 
                            class="btn-favorite-large ${favoriteWeapons.includes(weapon.id) ? 'favorited' : ''}">
                        ${favoriteWeapons.includes(weapon.id) ? 'Remover de Favoritos' : 'Agregar a Favoritos'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Cerrar detalles de arma
function closeWeaponDetails() {
    const modal = document.querySelector('.weapon-details-modal');
    if (modal) {
        modal.remove();
    }
}

// Toggle favorito de arma
function toggleFavoriteWeapon(weaponId) {
    const index = favoriteWeapons.indexOf(weaponId);
    const weapon = weaponsData.find(w => w.id === weaponId);
    
    if (index === -1) {
        favoriteWeapons.push(weaponId);
        showNotification(`${weapon.name} agregado a favoritos!`);
    } else {
        favoriteWeapons.splice(index, 1);
        showNotification(`${weapon.name} removido de favoritos`);
    }
    
    localStorage.setItem('favorite_weapons', JSON.stringify(favoriteWeapons));
    displayWeapons(); // Actualizar vista
    
    // Actualizar botón en modal si está abierto
    const favoriteBtn = document.querySelector('.btn-favorite-large');
    if (favoriteBtn) {
        const isFavorited = favoriteWeapons.includes(weaponId);
        favoriteBtn.textContent = isFavorited ? 'Remover de Favoritos' : 'Agregar a Favoritos';
        favoriteBtn.className = `btn-favorite-large ${isFavorited ? 'favorited' : ''}`;
    }
}

// Event listeners
function setupArsenalEventListeners() {
    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// Funciones auxiliares
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES');
}

function formatStatName(stat) {
    const names = {
        'damage': 'Daño',
        'critical_chance': 'Prob. Crítica',
        'critical_multiplier': 'Mult. Crítico',
        'status_chance': 'Prob. Estado',
        'fire_rate': 'Cadencia',
        'attack_speed': 'Vel. Ataque',
        'accuracy': 'Precisión',
        'magazine': 'Cargador',
        'reload_time': 'Recarga',
        'range': 'Alcance',
        'slide_attack': 'Ataque Deslizante',
        'heavy_attack': 'Ataque Pesado'
    };
    return names[stat] || stat;
}

function formatStatValue(stat, value) {
    if (stat.includes('chance')) {
        return value + '%';
    } else if (stat === 'critical_multiplier') {
        return value + 'x';
    } else if (stat.includes('time')) {
        return value + 's';
    } else if (stat.includes('rate') || stat.includes('speed')) {
        return value + '/s';
    }
    return value.toString();
}

function getXMLValue(node, path) {
    const parts = path.split(' ');
    let current = node;
    
    for (const part of parts) {
        const elements = current.getElementsByTagName(part);
        if (elements.length > 0) {
            current = elements[0];
        } else {
            return '';
        }
    }
    
    return current.textContent || current.innerText || '';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function loadFallbackWeapons() {
    weaponsData = [
        {
            id: 'braton-prime',
            name: 'Braton Prime',
            category: 'primary',
            type: 'assault-rifle',
            mastery: 8,
            description: 'Versión mejorada del rifle de asalto clásico',
            stats: { damage: 34, critical_chance: 18, critical_multiplier: 2.4, status_chance: 24 },
            acquisition: 'Prime Vault/Trading'
        }
    ];
    
    displayWeapons();
}
