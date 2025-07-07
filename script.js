// script.js
const searchForm = document.getElementById('searchForm');
const usernameInput = document.getElementById('username');
const suggestionsDiv = document.getElementById('suggestions');
const suggestionList = document.getElementById('suggestionList');
const profileDiv = document.getElementById('profile');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Fetch user profile
async function fetchUser(username) {
    profileDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');
    suggestionsDiv.classList.add('hidden');

    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) {
            throw new Error('User not found');
        }
        const user = await response.json();

        // Update UI with user data
        document.getElementById('avatar').src = user.avatar_url;
        document.getElementById('name').textContent = user.name || 'No name provided';
        document.getElementById('usernameDisplay').textContent = `@${user.login}`;
        document.getElementById('bio').textContent = user.bio || 'No bio available';
        document.getElementById('repos').textContent = user.public_repos;
        document.getElementById('followers').textContent = user.followers;
        document.getElementById('following').textContent = user.following;
        document.getElementById('location').textContent = user.location || 'Not specified';
        document.getElementById('profileLink').href = user.html_url;

        profileDiv.classList.remove('hidden');
        loadingDiv.classList.add('hidden');
    } catch (error) {
        errorDiv.textContent = error.message === 'User not found' ? 'User not found' : 'An error occurred. Please try again.';
        errorDiv.classList.remove('hidden');
        loadingDiv.classList.add('hidden');
    }
}

// Fetch username suggestions
const fetchSuggestions = debounce(async (query) => {
    if (!query) {
        suggestionsDiv.classList.add('hidden');
        suggestionList.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Error fetching suggestions');
        }
        const data = await response.json();
        const users = data.items.slice(0, 5); // Limit to 5 suggestions

        suggestionList.innerHTML = '';
        if (users.length > 0) {
            users.forEach(user => {
                const li = document.createElement('li');
                li.className = 'p-3 hover:bg-purple-50 cursor-pointer flex items-center gap-3 animate-fadeIn';
                li.innerHTML = `
                    <img src="${user.avatar_url}" class="w-8 h-8 rounded-full" alt="${user.login}">
                    <span>${user.login}</span>
                `;
                li.addEventListener('click', () => {
                    usernameInput.value = user.login;
                    suggestionsDiv.classList.add('hidden');
                    fetchUser(user.login);
                });
                suggestionList.appendChild(li);
            });
            suggestionsDiv.classList.remove('hidden');
        } else {
            suggestionsDiv.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        suggestionsDiv.classList.add('hidden');
    }
}, 300);

// Form submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (username) {
        fetchUser(username);
    }
});

// Input event for suggestions
usernameInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    fetchSuggestions(query);
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!usernameInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
        suggestionsDiv.classList.add('hidden');
    }
});
