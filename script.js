const tabsBody = document.querySelectorAll('.tab-body-single');
const tabsHead = document.querySelectorAll('.tab-head-single');
const searchForm = document.querySelector('.app-header-search');
const searchList = document.getElementById('search-list');
let activeTab = 1, allData;

// Initialize the app
const init = () => {
    tabsBody[activeTab - 1].classList.add('show-tab');
    tabsHead[activeTab - 1].classList.add('active-tab');
};

// Switch between tabs
const switchTab = (tabId) => {
    tabsBody.forEach(tab => tab.classList.remove('show-tab'));
    tabsHead.forEach(tab => tab.classList.remove('active-tab'));
    activeTab = tabId;
    tabsBody[activeTab - 1].classList.add('show-tab');
    tabsHead[activeTab - 1].classList.add('active-tab');
};

// Fetch heroes from API with improved error handling
const fetchHeroes = async (searchText) => {
    try {
        if (searchText.length < 2) {
            searchList.innerHTML = `
                <div class='search-message'>
                    <i class='fas fa-info-circle'></i>
                    Please enter at least 2 characters
                </div>
            `;
            searchList.style.display = "block";
            return;
        }
        
        searchList.innerHTML = `
            <div class='search-message'>
                <i class='fas fa-spinner fa-spin'></i>
                Searching for DC heroes...
            </div>
        `;
        searchList.style.display = "block";
        
        const response = await fetch(`https://www.superheroapi.com/api.php/727054372039115/search/${searchText}`);
        allData = await response.json();
        
        if (allData.response === 'success') {
            const dcHeroes = allData.results.filter(hero => 
                hero.biography.publisher.includes('DC Comics'));
            
            if (dcHeroes.length === 0) {
                searchList.innerHTML = `
                    <div class='search-message'>
                        <i class='fas fa-exclamation-circle'></i>
                        No DC character found for "${searchText}". Try "Batman", "Superman", or "Wonder Woman".
                    </div>
                `;
                searchList.style.display = "block";
            } else {
                showResults(dcHeroes);
            }
        } else {
            searchList.innerHTML = `
                <div class='search-message'>
                    <i class='fas fa-exclamation-circle'></i>
                    Character not found in the database
                </div>
            `;
            searchList.style.display = "block";
        }
    } catch (error) {
        console.error(error);
        searchList.innerHTML = `
            <div class='search-message'>
                <i class='fas fa-exclamation-triangle'></i>
                Error connecting to the API. Please try again later.
            </div>
        `;
        searchList.style.display = "block";
    }
};

// Display search results
const showResults = (heroes) => {
    searchList.innerHTML = "";
    searchList.style.display = "block";
    
    heroes.forEach(hero => {
        const heroItem = document.createElement('div');
        heroItem.className = 'search-list-item';
        const imgUrl = hero.image.url.startsWith('httpss') ? 
                      'https' + hero.image.url.substring(6) : hero.image.url;
        
        heroItem.innerHTML = `
            <img src="${imgUrl || 'https://via.placeholder.com/40x40/1A1A2E/FFFFFF?text=DC'}" alt="${hero.name}">
            <p data-id="${hero.id}">${hero.name}</p>
        `;
        searchList.appendChild(heroItem);
    });
};

// Display hero details
const showHeroDetails = (hero) => {
    const fixUrl = url => url.startsWith('httpss') ? 'https' + url.substring(6) : url;
    const imgUrl = fixUrl(hero.image.url);
    
    // Update image and add hero name underneath
    document.querySelector('.app-body-content-thumbnail').innerHTML = `
        <img src="${imgUrl || 'https://via.placeholder.com/400x600/1A1A2E/FFFFFF?text=DC+Hero'}" alt="${hero.name}">
        <div class="hero-name-display">${hero.name}</div>
    `;

    document.querySelector('.name').textContent = hero.name;
    
    // Helper function to display list items
    const createList = (items) => items.map(item => `
        <li>
            <div>
                <i class="fas fa-${item.icon}"></i>
                <span>${item.label}</span>
            </div>
            <span>${item.value || 'Unknown'}</span>
        </li>
    `).join('');

    // Powerstats
    document.querySelector('.powerstats').innerHTML = createList([
        { icon: 'brain', label: 'intelligence', value: hero.powerstats.intelligence },
        { icon: 'dumbbell', label: 'strength', value: hero.powerstats.strength },
        { icon: 'running', label: 'speed', value: hero.powerstats.speed },
        { icon: 'shield-alt', label: 'durability', value: hero.powerstats.durability },
        { icon: 'bolt', label: 'power', value: hero.powerstats.power },
        { icon: 'hand-fist', label: 'combat', value: hero.powerstats.combat }
    ]);

    // Biography
    document.querySelector('.biography').innerHTML = createList([
        { icon: 'id-card', label: 'full name', value: hero.biography['full-name'] },
        { icon: 'mask', label: 'alter egos', 
          value: hero.biography['alter-egos'] !== 'No alter egos found.' ? hero.biography['alter-egos'] : 'None' },
        { icon: 'tags', label: 'aliases', 
          value: Array.isArray(hero.biography.aliases) ? hero.biography.aliases.join(', ') : hero.biography.aliases },
        { icon: 'map-marker', label: 'place of birth', value: hero.biography['place-of-birth'] },
        { icon: 'calendar', label: 'first appearance', value: hero.biography['first-appearance'] },
        { icon: 'building', label: 'publisher', value: hero.biography.publisher }
    ]);

    // Appearance
    document.querySelector('.appearance').innerHTML = createList([
        { icon: 'venus-mars', label: 'gender', value: hero.appearance.gender },
        { icon: 'dna', label: 'race', value: hero.appearance.race },
        { icon: 'ruler-vertical', label: 'height', 
          value: Array.isArray(hero.appearance.height) ? hero.appearance.height.join(' / ') : hero.appearance.height },
        { icon: 'weight-hanging', label: 'weight', 
          value: Array.isArray(hero.appearance.weight) ? hero.appearance.weight.join(' / ') : hero.appearance.weight },
        { icon: 'eye', label: 'eye color', value: hero.appearance['eye-color'] },
        { icon: 'cut', label: 'hair color', value: hero.appearance['hair-color'] }
    ]);

    // Connections
    document.querySelector('.connections').innerHTML = createList([
        { icon: 'users', label: 'group affiliation', value: hero.connections['group-affiliation'] },
        { icon: 'family', label: 'relatives', 
          value: hero.connections.relatives ? hero.connections.relatives.replace(/\n/g, ', ') : 'None' }
    ]);
};

// Event Listeners
window.addEventListener('DOMContentLoaded', init);

tabsHead.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.id));
});

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    fetchHeroes(searchForm.search.value.trim());
});

searchForm.search.addEventListener('keyup', () => {
    const searchText = searchForm.search.value.trim();
    if (searchText.length > 1) {
        fetchHeroes(searchText);
    } else {
        searchList.innerHTML = "";
        searchList.style.display = "none";
    }
});

searchList.addEventListener('click', (e) => {
    const heroId = e.target.dataset.id;
    if (!heroId) return;
    
    const hero = allData.results.find(h => h.id === heroId);
    if (hero) {
        showHeroDetails(hero);
        searchList.innerHTML = "";
        searchList.style.display = "none";
    }
});