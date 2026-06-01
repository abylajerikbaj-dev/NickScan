/* ====================================
   NickScan - Multi-Platform OSINT Search
   ==================================== */

// ============ State Management ============
const appState = {
    currentSearch: null,
    results: {},
    isLoading: false,
};

// ============ Platform Configuration ============
const PLATFORMS = {
    telegram: {
        name: 'Telegram',
        icon: '✈️',
        color: '#0088cc',
        className: 'telegram'
    },
    instagram: {
        name: 'Instagram',
        icon: '📷',
        color: '#fd1d1d',
        className: 'instagram'
    },
    threads: {
        name: 'Threads',
        icon: '🧵',
        color: '#000000',
        className: 'threads'
    },
    x: {
        name: 'X (Twitter)',
        icon: '𝕏',
        color: '#000000',
        className: 'x'
    },
    drugaround: {
        name: 'ДругВокруг',
        icon: '🌍',
        color: '#8B5CF6',
        className: 'drugaround'
    },
    vk: {
        name: 'ВКонтакте',
        icon: '🔷',
        color: '#0077FF',
        className: 'vk'
    }
};

// ============ DOM Elements ============
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const warningBanner = document.getElementById('warningBanner');
const warningText = document.getElementById('warningText');

// ============ Simulated Multi-Platform Database ============
const multiPlatformDatabase = {
    '@john_doe': {
        telegram: {
            found: true,
            username: '@john_doe',
            followers: 2847,
            isActive: true,
            securityStatus: 'verified',
            joinDate: new Date('2018-03-15'),
            isScam: false
        },
        instagram: {
            found: true,
            username: 'john_doe',
            followers: 1543,
            isActive: true,
            securityStatus: 'verified',
            joinDate: new Date('2017-08-22'),
            isScam: false
        },
        threads: {
            found: true,
            username: 'john_doe',
            followers: 892,
            isActive: true,
            securityStatus: 'safe',
            joinDate: new Date('2023-07-08'),
            isScam: false
        },
        x: {
            found: true,
            username: '@john_doe',
            followers: 3421,
            isActive: true,
            securityStatus: 'verified',
            joinDate: new Date('2012-05-15'),
            isScam: false
        },
        drugaround: {
            found: true,
            username: 'john_doe',
            followers: 156,
            isActive: false,
            securityStatus: 'inactive',
            joinDate: new Date('2015-11-03'),
            isScam: false
        },
        vk: {
            found: true,
            username: 'john_doe',
            followers: 2103,
            isActive: true,
            securityStatus: 'safe',
            joinDate: new Date('2008-12-20'),
            isScam: false
        }
    },
    '@alice_smith': {
        telegram: {
            found: true,
            username: '@alice_smith',
            followers: 5234,
            isActive: true,
            securityStatus: 'verified',
            joinDate: new Date('2019-07-22'),
            isScam: false
        },
        instagram: {
            found: true,
            username: 'alice_smith',
            followers: 12543,
            isActive: true,
            securityStatus: 'verified',
            joinDate: new Date('2016-03-10'),
            isScam: false
        },
        threads: {
            found: true,
            username: 'alice_smith',
            followers: 4521,
            isActive: true,
            securityStatus: 'safe',
            joinDate: new Date('2023-08-01'),
            isScam: false
        },
        x: {
            found: true,
            username: '@alice_smith',
            followers: 8934,
            isActive: true,
            securityStatus: 'verified',
            joinDate: new Date('2014-02-28'),
            isScam: false
        },
        drugaround: {
            found: false,
            username: null,
            followers: 0,
            isActive: false,
            securityStatus: 'not_found',
            joinDate: null,
            isScam: false
        },
        vk: {
            found: true,
            username: 'alice_smith',
            followers: 6847,
            isActive: true,
            securityStatus: 'safe',
            joinDate: new Date('2010-09-15'),
            isScam: false
        }
    },
    '@crypto_bro_2020': {
        telegram: {
            found: true,
            username: '@crypto_bro_2020',
            followers: 342,
            isActive: true,
            securityStatus: 'suspicious',
            joinDate: new Date('2024-11-10'),
            isScam: true
        },
        instagram: {
            found: true,
            username: 'crypto_bro_2020',
            followers: 512,
            isActive: true,
            securityStatus: 'suspicious',
            joinDate: new Date('2024-10-15'),
            isScam: true
        },
        threads: {
            found: true,
            username: 'crypto_bro_2020',
            followers: 187,
            isActive: true,
            securityStatus: 'suspicious',
            joinDate: new Date('2024-11-01'),
            isScam: true
        },
        x: {
            found: true,
            username: '@crypto_bro_2020',
            followers: 234,
            isActive: true,
            securityStatus: 'suspicious',
            joinDate: new Date('2024-09-20'),
            isScam: true
        },
        drugaround: {
            found: false,
            username: null,
            followers: 0,
            isActive: false,
            securityStatus: 'not_found',
            joinDate: null,
            isScam: false
        },
        vk: {
            found: true,
            username: 'crypto_bro_2020',
            followers: 298,
            isActive: true,
            securityStatus: 'suspicious',
            joinDate: new Date('2024-10-05'),
            isScam: true
        }
    }
};

// ============ Utility Functions ============

/**
 * Format date to readable format (e.g., "Jan 2020")
 */
function formatJoinDate(date) {
    if (!date) return 'N/A';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Normalize search input
 */
function normalizeSearch(input) {
    return input.trim().toLowerCase();
}

/**
 * Get system information
 */
function getSystemInfo() {
    const userAgent = navigator.userAgent;
    
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

/**
 * Get security status display
 */
function getSecurityStatusDisplay(status) {
    const statusMap = {
        'verified': { label: 'Verified', icon: '✓' },
        'safe': { label: 'Safe', icon: '✓' },
        'suspicious': { label: 'Suspicious', icon: '⚠' },
        'inactive': { label: 'Inactive', icon: '◯' },
        'not_found': { label: 'Not Found', icon: '✗' }
    };
    return statusMap[status] || { label: 'Unknown', icon: '?' };
}

// ============ UI Rendering ============

/**
 * Render a single platform card
 */
function renderPlatformCard(platformKey, data) {
    const platform = PLATFORMS[platformKey];
    const card = document.createElement('div');
    card.className = `platform-card ${platform.className}`;
    
    if (!data.found) {
        card.innerHTML = `
            <div class="card-header">
                <div class="card-user-info">
                    <div class="card-avatar">${platform.icon}</div>
                    <div class="card-user-details">
                        <div class="card-username">${platform.name}</div>
                        <div class="card-handle">Not Found</div>
                    </div>
                </div>
                <div class="card-platform-badge">
                    <span class="platform-icon">${platform.icon}</span>
                    <span>${platform.name}</span>
                </div>
            </div>
            <div class="card-content">
                <div class="card-status inactive">
                    <span class="status-dot"></span>
                    <span>No account found on this platform</span>
                </div>
            </div>
        `;
    } else {
        const statusDisplay = getSecurityStatusDisplay(data.securityStatus);
        const isScamClass = data.isScam ? 'warning' : '';
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-user-info">
                    <div class="card-avatar">${platform.icon}</div>
                    <div class="card-user-details">
                        <div class="card-username">${platform.name}</div>
                        <div class="card-handle">${data.username || 'N/A'}</div>
                    </div>
                </div>
                <div class="card-platform-badge">
                    <span class="platform-icon">${platform.icon}</span>
                    <span>${platform.name}</span>
                </div>
            </div>
            <div class="card-content">
                <div class="card-status ${!data.isActive ? 'inactive' : ''}">
                    <span class="status-dot"></span>
                    <span>${data.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="card-stats">
                    <div class="stat-item">
                        <div class="stat-value">${formatNumber(data.followers)}</div>
                        <div class="stat-label">Followers</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${formatJoinDate(data.joinDate)}</div>
                        <div class="stat-label">Joined</div>
                    </div>
                </div>
                <div class="security-badge ${isScamClass}">
                    <span class="badge-icon"></span>
                    <span>${statusDisplay.label}</span>
                </div>
            </div>
        `;
    }
    
    return card;
}

/**
 * Render all platform results
 */
function renderMultiPlatformResults(username, platformResults) {
    resultsContainer.innerHTML = '';
    
    // Create a grid of platform cards
    Object.keys(PLATFORMS).forEach(platformKey => {
        const data = platformResults[platformKey];
        const card = renderPlatformCard(platformKey, data);
        resultsContainer.appendChild(card);
    });
}

/**
 * Show warning banner with custom message
 */
function showWarningBanner(show = true, message = null) {
    if (show) {
        if (message) {
            warningText.textContent = message;
        }
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
 * Search for account across all platforms
 */
function searchMultiPlatform(query) {
    const normalized = normalizeSearch(query);
    
    if (!normalized) {
        showError('Please enter a username to search');
        return;
    }
    
    // Simulate network delay
    setLoading(true);
    
    setTimeout(() => {
        setLoading(false);
        
        // Look up the username in the database
        const userKey = Object.keys(multiPlatformDatabase).find(key => 
            key.toLowerCase() === normalized || key.toLowerCase().includes(normalized)
        );
        
        if (userKey) {
            const platformResults = multiPlatformDatabase[userKey];
            appState.currentSearch = userKey;
            appState.results = platformResults;
            
            // Check if any platform flagged as scam
            const hasScam = Object.values(platformResults).some(data => data.isScam);
            if (hasScam) {
                showWarningBanner(true, 
                    '⚠️ CRITICAL WARNING: This account has been reported on multiple platforms with suspicious activity.');
            } else {
                showWarningBanner(false);
            }
            
            renderMultiPlatformResults(userKey, platformResults);
            searchInput.value = '';
        } else {
            showWarningBanner(false);
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>No accounts found for "${query}". Try @john_doe or @alice_smith</p>
                </div>
            `;
            showError(`No results found for "${query}" across any platform.`);
        }
    }, 1200);
}

/**
 * Handle search input submission
 */
function handleSearch() {
    const query = searchInput.value;
    searchMultiPlatform(query);
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
 * ✅ Multi-Platform OSINT Search
 *    - Searches 6 platforms simultaneously:
 *      • Telegram
 *      • Instagram
 *      • Threads
 *      • X (Twitter)
 *      • ДругВокруг
 *      • ВКонтакте
 *
 * ✅ Platform-Specific Branding
 *    - Each platform has its own color scheme
 *    - Custom icons for visual identification
 *    - Dedicated card layout per platform
 *    - Platform badges with brand colors
 *
 * ✅ Beautiful Grid Layout
 *    - Responsive multi-card grid
 *    - Cards display platform info, followers, join date
 *    - Platform-specific neon colors
 *    - Glassmorphism design with cyan borders
 *    - Hover effects with platform color glow
 *
 * ✅ Account Status Information
 *    - Shows if account is active/inactive
 *    - Displays follower count per platform
 *    - Join date for account age verification
 *    - Security status badge (Verified, Safe, Suspicious)
 *    - "Not Found" status for platforms without account
 *
 * ✅ Anti-Scam Warning Banner
 *    - Prominent warning when scam accounts detected
 *    - Shows on multiple platform flags
 *    - Neon red styling with pulsing animation
 *    - Custom warning message
 *
 * ✅ Cyber-Dark Glassmorphism Aesthetic
 *    - #090D16 background gradient
 *    - Translucent glass cards with blur effect
 *    - Cyan neon borders throughout
 *    - Platform-specific neon accent colors
 *    - Ultra-modern design with smooth transitions
 *
 * ✅ Mock Database with Multi-Platform Data
 *    - @john_doe: Active across all platforms
 *    - @alice_smith: Active on most platforms
 *    - @crypto_bro_2020: Flagged as suspicious/scam
 *    - Each platform has unique follow counts
 *    - Realistic join dates per platform
 *
 * ✅ Responsive Design
 *    - Mobile, tablet, and desktop optimized
 *    - Grid adapts to screen size
 *    - Touch-friendly interface
 *
 * ✅ Real-Time Features
 *    - System info display
 *    - Live clock in header
 *    - Loading spinner during search
 *    - Error handling and validation
 */