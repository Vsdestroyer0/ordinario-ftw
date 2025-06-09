// Variables globales
let warframesData = [];
let currentSearchTerm = '';

// Cargar datos XML al inicio
document.addEventListener('DOMContentLoaded', function() {
    loadWarframesFromXML();
    setupEventListeners();
});

// Función para cargar datos desde XML
async function loadWarframesFromXML() {
    try {
        const response = await fetch('data/warframes.xml');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        parseWarframesXML(xmlDoc);
        displayWarframes();
        displayWarframeStatsTable();
    } catch (error) {
        console.error('Error loading XML:', error);
        loadFallbackWarframes();
    }
}

// Parsear XML y convertir a objetos JavaScript
function parseWarframesXML(xmlDoc) {
    const warframeNodes = xmlDoc.getElementsByTagName('warframe');
    warframesData = [];
    
    for (let i = 0; i < warframeNodes.length; i++) {
        const node = warframeNodes[i];
        const warframe = {
            id: node.getAttribute('id'),
            type: node.getAttribute('type'),
            mastery: parseInt(node.getAttribute('mastery')),
            name: getXMLValue(node, 'name'),
            description: getXMLValue(node, 'description'),
            stats: {
                health: parseInt(getXMLValue(node, 'stats health')),
                shield: parseInt(getXMLValue(node, 'stats shield')),
                armor: parseInt(getXMLValue(node, 'stats armor')),
                energy: parseInt(getXMLValue(node, 'stats energy')),
                speed: parseFloat(getXMLValue(node, 'stats speed'))
            },
            abilities: [],
            acquisition: getXMLValue(node, 'acquisition'),
            releaseDate: getXMLValue(node, 'release_date')
        };
        
        // Parsear habilidades
        const abilities = node.getElementsByTagName('ability');
        for (let j = 0; j < abilities.length; j++) {
            const ability = abilities[j];
            warframe.abilities.push({
                name: ability.getAttribute('name'),
                energy: parseInt(ability.getAttribute('energy')),
                description: ability.getAttribute('description')
            });
        }
        
        warframesData.push(warframe);
    }
}

// FUNCIÓN DE BÚSQUEDA - SOLO POR NOMBRE
function searchWarframes() {
    const searchInput = document.getElementById('search-warframe');
    currentSearchTerm = searchInput.value.toLowerCase().trim();
    displayWarframes();
}

// FUNCIÓN PARA LIMPIAR FILTROS
function resetFilters() {
    currentSearchTerm = '';
    document.getElementById('search-warframe').value = '';
    displayWarframes();
}

// Mostrar Warframes con filtro de búsqueda aplicado
function displayWarframes() {
    const container = document.getElementById('warframes-container');
    if (!container) return;
    
    // Filtrar solo por nombre
    const filteredWarframes = warframesData.filter(warframe => {
        if (currentSearchTerm === '') return true;
        return warframe.name.toLowerCase().includes(currentSearchTerm);
    });
    
    // Mostrar mensaje si no hay resultados
    if (filteredWarframes.length === 0 && currentSearchTerm !== '') {
        container.innerHTML = `
            <div class="no-results">
                <h3>No se encontró ningún Warframe</h3>
                <p>No hay Warframes que coincidan con "<strong>${currentSearchTerm}</strong>"</p>
                <button onclick="resetFilters()" class="btn-reset">Limpiar Búsqueda</button>
            </div>
        `;
        updateResultsCounter(0);
        return;
    }
    
    // Mostrar Warframes filtrados
    container.innerHTML = filteredWarframes.map(warframe => `
        <div class="warframe-card" onclick="showWarframeDetails('${warframe.id}')">
            <h3>${highlightSearchTerm(warframe.name, currentSearchTerm)}</h3>
            <span class="type type-${warframe.type}">${capitalizeFirst(warframe.type)}</span>
            <p>${warframe.description}</p>
            <div class="stats-preview">
                <div class="stat">
                    <span>Salud:</span>
                    <span>${warframe.stats.health}</span>
                </div>
                <div class="stat">
                    <span>Escudo:</span>
                    <span>${warframe.stats.shield}</span>
                </div>
                <div class="stat">
                    <span>Maestría:</span>
                    <span>MR ${warframe.mastery}</span>
                </div>
            </div>
            <div class="abilities">
                <h4>Habilidades:</h4>
                <ul>
                    ${warframe.abilities.map(ability => `<li>${ability.name}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');
    
    // Actualizar contador de resultados
    updateResultsCounter(filteredWarframes.length);
}

// Resaltar término de búsqueda en el nombre
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Actualizar contador de resultados
function updateResultsCounter(count) {
    let counterElement = document.getElementById('results-counter');
    if (!counterElement) {
        // Crear contador si no existe
        counterElement = document.createElement('div');
        counterElement.id = 'results-counter';
        counterElement.className = 'results-counter';
        
        const filtersSection = document.querySelector('.filters');
        filtersSection.appendChild(counterElement);
    }
    
    if (currentSearchTerm === '') {
        counterElement.innerHTML = `<p>Mostrando todos los <strong>${warframesData.length}</strong> Warframes</p>`;
    } else {
        counterElement.innerHTML = `<p>Encontrados <strong>${count}</strong> de <strong>${warframesData.length}</strong> Warframes</p>`;
    }
}

// Mostrar detalles de Warframe
function showWarframeDetails(warframeId) {
    const warframe = warframesData.find(w => w.id === warframeId);
    if (!warframe) return;
    
    const modal = document.getElementById('warframe-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="warframe-details">
            <div class="warframe-header-detail">
                <h2>${warframe.name}</h2>
                <span class="type-badge type-${warframe.type}">${capitalizeFirst(warframe.type)}</span>
            </div>
            
            <p class="warframe-description-detail">${warframe.description}</p>
            
            <div class="warframe-info-grid">
                <div class="info-section">
                    <h3>Estadísticas Base</h3>
                    <div class="stats-detailed">
                        <div class="stat-item">
                            <span class="stat-name">Salud:</span>
                            <span class="stat-value">${warframe.stats.health}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-name">Escudo:</span>
                            <span class="stat-value">${warframe.stats.shield}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-name">Armadura:</span>
                            <span class="stat-value">${warframe.stats.armor}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-name">Energía:</span>
                            <span class="stat-value">${warframe.stats.energy}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-name">Velocidad:</span>
                            <span class="stat-value">${warframe.stats.speed}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-name">Maestría:</span>
                            <span class="stat-value">MR ${warframe.mastery}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Habilidades</h3>
                    <div class="abilities-detailed">
                        ${warframe.abilities.map((ability, index) => `
                            <div class="ability-item">
                                <div class="ability-header">
                                    <span class="ability-number">${index + 1}</span>
                                    <span class="ability-name">${ability.name}</span>
                                    <span class="ability-energy">${ability.energy} Energía</span>
                                </div>
                                <p class="ability-description">${ability.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="warframe-meta">
                <div class="meta-item">
                    <strong>Obtención:</strong> ${warframe.acquisition}
                </div>
                <div class="meta-item">
                    <strong>Fecha de Lanzamiento:</strong> ${formatDate(warframe.releaseDate)}
                </div>
            </div>
            
            <div class="warframe-actions">
                <button onclick="addToFavorites('${warframe.id}')" class="btn-favorite-large">
                    Agregar a Favoritos
                </button>
                <button onclick="closeModal()" class="btn-close-large">
                    Cerrar
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('warframe-modal');
    modal.style.display = 'none';
}

// Resto de funciones auxiliares...
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES');
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

function addToFavorites(warframeId) {
    let favorites = JSON.parse(localStorage.getItem('warframe_favorites') || '[]');
    const warframe = warframesData.find(w => w.id === warframeId);
    
    if (!favorites.includes(warframeId)) {
        favorites.push(warframeId);
        localStorage.setItem('warframe_favorites', JSON.stringify(favorites));
        showNotification(`${warframe.name} agregado a favoritos!`);
    } else {
        favorites = favorites.filter(id => id !== warframeId);
        localStorage.setItem('warframe_favorites', JSON.stringify(favorites));
        showNotification(`${warframe.name} removido de favoritos`);
    }
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

// Tabla de estadísticas (manteniendo la funcionalidad existente)
function displayWarframeStatsTable() {
    const container = document.getElementById('warframe-stats-table');
    if (!container) return;
    
    let tableHTML = `
        <div class="stats-table-container">
            <h2>Tabla Comparativa de Estadísticas</h2>
            <div class="table-responsive">
                <table id="warframes-table" class="stats-table">
                    <thead>
                        <tr>
                            <th>Warframe</th>
                            <th>Tipo</th>
                            <th>Maestría</th>
                            <th>Salud</th>
                            <th>Escudo</th>
                            <th>Armadura</th>
                            <th>Energía</th>
                            <th>Velocidad</th>
                            <th>Obtención</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    warframesData.forEach(warframe => {
        tableHTML += `
            <tr onclick="showWarframeDetails('${warframe.id}')" style="cursor: pointer;">
                <td class="warframe-name">
                    <strong>${warframe.name}</strong>
                </td>
                <td>
                    <span class="type-badge type-${warframe.type}">${capitalizeFirst(warframe.type)}</span>
                </td>
                <td class="mastery-level">MR ${warframe.mastery}</td>
                <td class="stat-health">${warframe.stats.health}</td>
                <td class="stat-shield">${warframe.stats.shield}</td>
                <td class="stat-armor">${warframe.stats.armor}</td>
                <td class="stat-energy">${warframe.stats.energy}</td>
                <td class="stat-speed">${warframe.stats.speed}</td>
                <td class="acquisition">${warframe.acquisition}</td>
            </tr>
        `;
    });
    
    tableHTML += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

function loadFallbackWarframes() {
    warframesData = [
        {
            id: 'excalibur',
            name: 'Excalibur',
            type: 'assault',
            mastery: 0,
            description: 'El Warframe equilibrado perfecto para principiantes',
            stats: { health: 300, shield: 300, armor: 225, energy: 150, speed: 1.0 },
            abilities: [
                { name: 'Slash Dash', energy: 25, description: 'Dash hacia adelante cortando enemigos' }
            ],
            acquisition: 'Inicial',
            releaseDate: '2013-03-25'
        }
    ];
    
    displayWarframes();
    displayWarframeStatsTable();
}

function setupEventListeners() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    const modal = document.getElementById('warframe-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Funciones para los botones del index
function showWelcomeMessage() {
    showNotification('¡Bienvenido Tenno! Prepárate para defender el Sistema Solar.');
}

function showMissionInfo() {
    showNotification('Las misiones cooperativas te permiten unirte con hasta 3 jugadores para completar objetivos juntos.');
}

function navigateToWarframes() {
    window.location.href = 'warframes.html';
}

function navigateToArsenal() {
    window.location.href = 'arsenal.html';
}

// Función mejorada de notificación (si no existe ya)
function showNotification(message, duration = 3000) {
    // Remover notificación existente si hay una
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Ocultar automáticamente después del tiempo especificado
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification && notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, duration);
}

// Funciones adicionales para el index si las necesitas
function showGameModes() {
    const gameModes = [
        "🎯 Exterminio - Elimina todos los enemigos",
        "📦 Captura - Captura el objetivo y extrae",
        "🛡️ Defensa - Protege el objetivo por ondas",
        "🏃‍♂️ Supervivencia - Sobrevive el mayor tiempo posible",
        "🔍 Espionaje - Infiltra y roba datos secretos",
        "⚡ Sabotaje - Destruye objetivos enemigos"
    ];
    
    const modesList = gameModes.join('\n');
    showNotification(`Modos de Juego Disponibles:\n\n${modesList}`, 5000);
}

function showWarframeInfo() {
    showNotification('Los Warframes son exoesqueletos bio-mecánicos controlados por los Tenno. Cada uno tiene habilidades únicas para diferentes estilos de combate.', 4000);
}

function showWeaponInfo() {
    showNotification('Tu arsenal incluye armas primarias, secundarias y de combate cuerpo a cuerpo. Personalízalas con mods para maximizar su efectividad.', 4000);
}

// Función para mostrar consejos aleatorios
function showRandomTip() {
    const tips = [
        "💡 Usa el parkour para moverte rápidamente por los mapas",
        "⚔️ Combina diferentes tipos de daño elemental para mayor efectividad",
        "🎯 Los ataques críticos pueden cambiar el rumbo de una batalla",
        "🛡️ Algunos enemigos son inmunes a ciertos tipos de daño",
        "⚡ Gestiona tu energía sabiamente para usar habilidades en momentos clave",
        "🔄 Modifica tus armas según el tipo de misión",
        "👥 El trabajo en equipo es clave en misiones difíciles",
        "📈 Sube el nivel de maestría para acceder a mejores armas"
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    showNotification(randomTip, 4000);
}

// Función para mostrar estadísticas del juego
function showGameStats() {
    const stats = `
    🌌 Sistema Solar: 18+ planetas explorables
    ⚔️ Warframes: 50+ guerreros únicos
    🔫 Armas: 500+ opciones de combate
    👥 Jugadores: Millones de Tenno activos
    🆓 Modelo: Free-to-play
    `;
    
    showNotification(`Estadísticas de Warframe:\n${stats}`, 5000);
}
