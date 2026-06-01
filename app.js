/* ====================================
   NickScan - App Logic
   ==================================== */

// ============ State Management ============
const appState = {
    currentSearch: null,
    results: [],
    isLoading: false,
};

// ============ DOM Elements ============
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const warningBanner = document.getElementById('warningBanner');

// ============ Simulated Database ============
// This is mock data for demonstration purposes
const accountDatabase = {
    '@john_doe': {
        name: 'John Doe',
        handle: '@john_doe',
        bio: 'Software engineer, coffee enthusiast, and tech blogger. Always learning, always growing.',
        avatar: '👨‍💻',
        followers: 2847,
        following: 342,
        posts: 1203,
        joinDate: new Date('2018-03-15'),
        isScam: false,
    },
    '@alice_smith': {
        name: 'Alice Smith',
        handle: '@alice_smith',
        bio: 'Digital marketer | Designer | Content creator. Building something awesome every day.',
        avatar: '👩‍🎨',
        followers: 5234,
        following: 876,
        posts: 3421,
        joinDate: new Date('2019-07-22'),
        isScam: false,
    },
    '@crypto_bro_2020': {
        name: 'Crypto Bro',
        handle: '@crypto_bro_2020',
        bio: 'Get rich quick with our guaranteed investment scheme. DM for details!',
        avatar: '💰',
        followers: 342,
        following: 5000,
        posts: 8932,
        joinDate: new Date('2024-11-10'),
        isScam: true, // This account is flagged as scam
    },
    '@sarah_developer': {
        name: 'Sarah Developer',
        handle: '@sarah_developer',
        bio: 'Full-stack developer | React & Node.js lover | Open source contributor',
        avatar: '👩‍💻',
        followers: 1893,
        following: 457,
        posts: 892,
        joinDate: new Date('2020-05-08'),
        isScam: false,
    },
    '@techguru_official': {
        name: 'Tech Guru',
        handle: '@techguru_official',
        bio: 'Sharing tech tips and productivity hacks. New here, ready to learn!',
        avatar: '🧠',
        followers: 45,
        following: 234,
        posts: 12,
        joinDate: new Date('2025-12-20'),
        isScam: false,
    },
    '555-123-4567': {
        name: 'Phone Lookup',
        handle: '+1-555-123-4567',
        bio: 'Phone number associated with multiple platform accounts.',
        avatar: '📱',
        followers: 0,
        following: 0,
        posts: 0,
        joinDate: new Date('2022-01-01'),
        isScam: false,
    },
    '555-987-6543': {
        name: 'Suspicious Number',
        handle: '+1-555-987-6543',
        bio: 'Phone associated with fraudulent activities.',
        avatar: '⚠️',
        followers: 0,
        following: 0,
        posts: 0,
        joinDate: new Date('2024-09-15'),
        isScam: true,
    },
};

// ============ Utility Functions ============

/**
 * Format date to readable format (e.g., "Joined: Jan 2020")
 */
function formatJoinDate(date) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `Joined: ${month} ${year}`;
}

/**
 * Calculate account age in days
 */
function getAccountAge(joinDate) {
    const now = new Date();
    const diffTime = now - joinDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Check if account is new (less than 30 days old)
 */
function isNewAccount(joinDate) {
    return getAccountAge(joinDate) < 30;
}

/**
 * Normalize search input
 */
function normalizeSearch(input) {
    return input.trim().toLowerCase();
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Get system information
 */
function getSystemInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    let os = 'Unknown';
    if (userAgent.indexOf('Win') > -1) os = 'Windows';
    else if (userAgent.indexOf('Mac') > -1) os = 'macOS';
    else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
    else if (userAgent.indexOf('X11') > -1) os = 'UNIX';
    else if (userAgent.indexOf('Android') > -1) os = 'Android';
    else if (userAgent.indexOf('iPhone') > -1) os = 'iOS';
    
    return os;
}

/**
 * Update time display
 */
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('timeInfo').textContent = `${hours}:${minutes}`;
}

// ============ UI Rendering ============

/**
 * Render a single account card
 */
function renderAccountCard(account) {
    const joinDate = account.joinDate;
    const isNew = isNewAccount(joinDate);
    const badgeText = formatJoinDate(joinDate);
    
    const card = document.createElement('div');
    card.className = 'account-card';
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-user-info">
                <div class="card-avatar">${account.avatar}</div>
                <div class="card-user-details">
                    <div class="card-username">${account.name}</div>
                    <div class="card-handle">${account.handle}</div>
                </div>
            </div>
            <div class="card-badge ${isNew ? 'new-account' : ''}">
                ${isNew ? '<span class="badge-dot warning"></span>' : '<span class="badge-dot"></span>'}
                <span>${badgeText}</span>
            </div>
        </div>

        <div class="card-content">
            <div class="card-bio">${account.bio}</div>
            <div class="card-stats">
                <div class="stat-item">
                    <div class="stat-value">${formatNumber(account.followers)}</div>
                    <div class="stat-label">Followers</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${formatNumber(account.following)}</div>
                    <div class="stat-label">Following</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${formatNumber(account.posts)}</div>
                    <div class="stat-label">Posts</div>
                </div>
            </div>
        </div>

        <div class="card-actions">
            <button class="action-button">
                <svg viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span class="action-count">7</span>
            </button>
            <button class="action-button">
                <svg viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span class="action-count">5</span>
            </button>
            <button class="action-button">
                <svg viewBox="0 0 24 24">
                    <path d="M17 1l4 4m0 0l-4 4M21 5H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"></path>
                </svg>
            </button>
            <button class="action-button">
                <svg viewBox="0 0 24 24">
                    <path d="M22 2L11 13m11-11L2 22m19-11v6h-6"></path>
                </svg>
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Render all results
 */
function renderResults(accounts) {
    resultsContainer.innerHTML = '';
    
    if (accounts.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <p>No results found. Try a different search.</p>
            </div>
        `;
        return;
    }
    
    accounts.forEach(account => {
        const card = renderAccountCard(account);
        resultsContainer.appendChild(card);
    });
}

/**
 * Show warning banner
 */
function showWarningBanner(show = true) {
    if (show) {
        warningBanner.classList.remove('hidden');
    } else {
        warningBanner.classList.add('hidden');
    }
}

/**
 * Show/hide loading spinner
 */
function setLoading(loading) {
    appState.isLoading = loading;
    if (loading) {
        loadingSpinner.classList.remove('hidden');
        resultsContainer.innerHTML = '';
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

// ============ Search Logic ============

/**
 * Search for an account by username or phone
 */
function searchAccount(query) {
    const normalized = normalizeSearch(query);
    
    if (!normalized) {
        showError('Please enter a search term');
        return;
    }
    
    // Simulate network delay
    setLoading(true);
    
    setTimeout(() => {
        setLoading(false);
        
        // Check if query matches any account
        const account = accountDatabase[normalized] || 
                       accountDatabase[query.toLowerCase()];
        
        if (account) {
            appState.currentSearch = account;
            appState.results = [account];
            
            // Show warning if account is flagged as scam
            showWarningBanner(account.isScam);
            
            renderResults(appState.results);
            searchInput.value = '';
        } else {
            showWarningBanner(false);
            renderResults([]); // Empty results
            showError(`No account found for "${query}". Try searching for @john_doe or @alice_smith`);
        }
    }, 800);
}

/**
 * Handle search input submission
 */
function handleSearch() {
    const query = searchInput.value;
    searchAccount(query);
}

// ============ Event Listeners ============

searchBtn.addEventListener('click', handleSearch);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// ============ Initialize App ============

function initializeApp() {
    // Update system info
    document.getElementById('systemInfo').textContent = getSystemInfo();
    document.getElementById('userInfo').textContent = 'Guest User';
    
    // Update time on load and every minute
    updateTime();
    setInterval(updateTime, 60000);
    
    // Set focus on search input
    searchInput.focus();
}

// ============ On DOM Ready ============

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

/* ====================================
   Features Summary
   ==================================== */

/*
 * ✅ Cyber-Dark Glassmorphism UI
 *    - #090D16 background with gradient
 *    - Translucent glass cards with blur effect
 *    - Ultra-thin cyan neon borders
 *    - Smooth animations and transitions
 *
 * ✅ Threads-Style Layout
 *    - Minimalist and clean design
 *    - High-density information display
 *    - Card-based result layout
 *    - Action buttons tightly packed
 *
 * ✅ User System Info Row
 *    - Displays OS (Windows, macOS, Linux, etc.)
 *    - Shows "Guest User" as placeholder
 *    - Real-time clock display
 *
 * ✅ Search Functionality
 *    - Search by @username (e.g., @john_doe)
 *    - Search by phone number (e.g., 555-123-4567)
 *    - Mock database with sample accounts
 *    - Loading state with spinner
 *    - Error handling
 *
 * ✅ Account Cards
 *    - Avatar, name, and handle
 *    - Bio/description text
 *    - Followers, Following, Posts stats
 *    - 4 action icons (Heart, Bubble, Repost, Share)
 *    - Action counts display
 *
 * ✅ Account Age Badge
 *    - Shows "Joined: [Month] [Year]"
 *    - Red warning indicator for new accounts (< 30 days)
 *    - Positioned in top-right of card
 *    - Soft neon red alarm animation
 *
 * ✅ Anti-Scam Warning Banner
 *    - Displays when flagged account is found
 *    - Prominent neon red styling
 *    - Message: "⚠️ CRITICAL WARNING: This account has 5+ reported scam complaints."
 *    - Smooth slide-in animation
 *    - Auto-hide when no scam account
 *
 * ✅ Responsive Design
 *    - Works on desktop, tablet, and mobile
 *    - Adaptive layout for smaller screens
 *    - Touch-friendly buttons
 *
 * ✅ Demo Accounts
 *    - @john_doe (Established developer)
 *    - @alice_smith (Marketing professional)
 *    - @crypto_bro_2020 (FLAGGED AS SCAM)
 *    - @sarah_developer (Full-stack developer)
 *    - @techguru_official (New account - warning)
 *    - 555-123-4567 (Phone lookup)
 *    - 555-987-6543 (Suspicious phone - SCAM)
 */
