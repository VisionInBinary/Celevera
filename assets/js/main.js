// main.js - Homepage and Category Page Logic

const POSTS_PER_PAGE = 12;
let currentPage = 1;
let allPosts = [];
let filteredPosts = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    highlightActiveNav();
});

// Get category image path
function getCategoryImage(category) {
    const categoryMap = {
        'gossip': '/assets/images/gossip.jpg',
        'movies': '/assets/images/movies.jpg',
        'movies2': '/assets/images/movies2.jpg',
        'movies3': '/assets/images/movies3.jpg',
        'fashion': '/assets/images/fashion.jpg',
        'fashion2': '/assets/images/fashion2.jpg',
        'relationships': '/assets/images/relationships.jpg',
        'relationships2': '/assets/images/relationships2.jpg',
        'controversy': '/assets/images/controversy.jpg',
        'social-media': '/assets/images/social-media.jpg'
    };
    
    return categoryMap[category.toLowerCase()] || '/assets/images/default.jpg';
}

// Load posts from JSON
async function loadPosts() {
    try {
        const response = await fetch('/data/posts.json');
        if (!response.ok) throw new Error('Failed to load posts');
        
        const data = await response.json();
        allPosts = data.posts || [];
        
        // Sort by date (newest first)
        allPosts.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        
        // Check if we're on category page
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('cat');
        
        if (category) {
            loadCategoryPage(category);
        } else {
            loadHomepage();
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        displayError();
    }
}

// Load homepage
function loadHomepage() {
    filteredPosts = allPosts;
    renderPosts();
}

// Load category page
function loadCategoryPage(category) {
    // Update meta tags
    updateCategoryMeta(category);
    
    // Filter posts by category
    filteredPosts = allPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
    
    if (filteredPosts.length === 0) {
        displayNoResults(category);
    } else {
        renderPosts();
    }
}

// Render posts
function renderPosts() {
    const newsGrid = document.getElementById('news-grid');
    const loadMoreWrap = document.getElementById('load-more-wrap');
    const loadMoreBtn = document.getElementById('load-more');
    
    if (!newsGrid) return;
    
    const startIndex = 0;
    const endIndex = currentPage * POSTS_PER_PAGE;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);
    
    if (postsToShow.length === 0) {
        newsGrid.innerHTML = '<div class="loading">No articles found</div>';
        return;
    }
    
    newsGrid.innerHTML = '';
    
    postsToShow.forEach(post => {
        const card = createNewsCard(post);
        newsGrid.appendChild(card);
    });
    
    // Show/hide load more button
    if (loadMoreWrap && loadMoreBtn) {
        if (endIndex < filteredPosts.length) {
            loadMoreWrap.style.display = 'block';
            loadMoreBtn.onclick = loadMorePosts;
        } else {
            loadMoreWrap.style.display = 'none';
        }
    }
}

// Create news card
function createNewsCard(post) {
    const card = document.createElement('article');
    card.className = 'card';
    card.onclick = () => window.location.href = `/post.html?slug=${post.slug}`;
    
    const formattedDate = formatDate(post.publishDate);
    const imageUrl = getCategoryImage(post.category);
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${escapeHtml(post.category)} news" class="card-image" loading="lazy" onerror="this.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; this.src='';">
        <div class="card-content">
            <span class="card-tag">${escapeHtml(post.category.toUpperCase())}</span>
            <div class="card-meta">
                <span class="card-source">${escapeHtml(post.sourceName)}</span>
                <span>•</span>
                <span class="card-time">${formattedDate}</span>
            </div>
            <h2 class="card-title">${escapeHtml(post.title)}</h2>
            <p class="card-summary">${escapeHtml(truncateText(post.summary, 120))}</p>
        </div>
    `;
    
    return card;
}

// Load more posts
function loadMorePosts() {
    currentPage++;
    renderPosts();
    
    // Smooth scroll to new content
    window.scrollTo({
        top: document.getElementById('news-grid').offsetHeight - 200,
        behavior: 'smooth'
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Truncate text with ellipsis
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// Display error
function displayError() {
    const newsGrid = document.getElementById('news-grid');
    if (newsGrid) {
        newsGrid.innerHTML = `
            <div class="loading">
                Unable to load articles. Please try again later.
            </div>
        `;
    }
}

// Display no results
function displayNoResults(category) {
    const newsGrid = document.getElementById('news-grid');
    if (newsGrid) {
        newsGrid.innerHTML = `
            <div class="loading">
                No articles found in ${category} category yet.
            </div>
        `;
    }
}

// Update category meta tags
function updateCategoryMeta(category) {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
    const title = `${categoryName} - Bollywood News | Celevera`;
    const description = `Latest Bollywood ${categoryName.toLowerCase()} news, celebrity updates, and entertainment gossip on Celevera.`;
    const url = `https://celevera.com/category.html?cat=${category}`;
    
    document.title = title;
    
    const metaDescription = document.getElementById('page-description');
    if (metaDescription) metaDescription.setAttribute('content', description);
    
    // Update OG tags
    const ogTitle = document.getElementById('og-title');
    const ogDescription = document.getElementById('og-description');
    const ogUrl = document.getElementById('og-url');
    
    if (ogTitle) ogTitle.setAttribute('content', title);
    if (ogDescription) ogDescription.setAttribute('content', description);
    if (ogUrl) ogUrl.setAttribute('content', url);
    
    // Update Twitter tags
    const twitterTitle = document.getElementById('twitter-title');
    const twitterDescription = document.getElementById('twitter-description');
    const twitterUrl = document.getElementById('twitter-url');
    
    if (twitterTitle) twitterTitle.setAttribute('content', title);
    if (twitterDescription) twitterDescription.setAttribute('content', description);
    if (twitterUrl) twitterUrl.setAttribute('content', url);
    
    // Update canonical
    const canonical = document.getElementById('canonical-url');
    if (canonical) canonical.setAttribute('href', url);
}

// Highlight active nav link
function highlightActiveNav() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat');
    
    document.querySelectorAll('.pill').forEach(link => {
        link.classList.remove('active');
        
        if (!category && link.getAttribute('href') === '/') {
            link.classList.add('active');
        } else if (category && link.getAttribute('href').includes(`cat=${category}`)) {
            link.classList.add('active');
        }
    });
}
