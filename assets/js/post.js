// post.js - Individual Post Page Logic

let currentPost = null;
let allPosts = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadPost();
});

// Load post data
async function loadPost() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        
        if (!slug) {
            displayError('Invalid article URL');
            return;
        }
        
        const response = await fetch('/data/posts.json');
        if (!response.ok) throw new Error('Failed to load posts');
        
        const data = await response.json();
        allPosts = data.posts || [];
        
        // Find the post by slug
        currentPost = allPosts.find(post => post.slug === slug);
        
        if (!currentPost) {
            displayError('Article not found');
            return;
        }
        
        renderPost();
        updateMetaTags();
        loadRelatedPosts();
        
    } catch (error) {
        console.error('Error loading post:', error);
        displayError('Unable to load article');
    }
}

// Render post content
function renderPost() {
    const postArticle = document.getElementById('post-article');
    if (!postArticle) return;
    
    const formattedDate = formatDate(currentPost.publishDate);
    
    postArticle.innerHTML = `
        <span class="post-category">${escapeHtml(currentPost.category.toUpperCase())}</span>
        
        <h1 class="post-title">${escapeHtml(currentPost.title)}</h1>
        
        <div class="post-meta">
            <span class="post-author">By ${escapeHtml(currentPost.sourceName)} Editors</span>
            <span>•</span>
            <span class="post-time">Published ${formattedDate}</span>
        </div>
        
        <div class="post-image"></div>
        
        <div class="post-summary">
            ${escapeHtml(currentPost.summary)}
        </div>
        
        <div class="post-content">
            ${escapeHtml(currentPost.summary).split('\n').map(para => `<p>${para}</p>`).join('')}
        </div>
        
        <div class="post-source-box">
            <div class="post-source-label">Source</div>
            <a href="${escapeHtml(currentPost.sourceUrl)}" 
               class="post-source-link" 
               target="_blank" 
               rel="noopener noreferrer">
                ${escapeHtml(currentPost.sourceName)}
            </a>
        </div>
    `;
}

// Update meta tags for SEO
function updateMetaTags() {
    if (!currentPost) return;
    
    const title = `${currentPost.title} | Celevera`;
    const description = currentPost.summary.substring(0, 160);
    const url = `https://celevera.com/post.html?slug=${currentPost.slug}`;
    
    // Update title
    document.title = title;
    document.getElementById('page-title').textContent = title;
    
    // Update description
    const metaDescription = document.getElementById('page-description');
    if (metaDescription) metaDescription.setAttribute('content', description);
    
    // Update Open Graph tags
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
    
    // Update canonical URL
    const canonical = document.getElementById('canonical-url');
    if (canonical) canonical.setAttribute('href', url);
}

// Load related posts
function loadRelatedPosts() {
    if (!currentPost) return;
    
    const relatedGrid = document.getElementById('related-grid');
    if (!relatedGrid) return;
    
    // Get posts from same category, excluding current post
    let related = allPosts.filter(post => 
        post.category === currentPost.category && 
        post.slug !== currentPost.slug
    );
    
    // If not enough posts in same category, add more recent posts
    if (related.length < 3) {
        const additional = allPosts.filter(post => 
            post.slug !== currentPost.slug && 
            !related.includes(post)
        );
        related = [...related, ...additional];
    }
    
    // Sort by date and take top 3
    related.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    related = related.slice(0, 3);
    
    if (related.length === 0) {
        document.getElementById('related-section').style.display = 'none';
        return;
    }
    
    relatedGrid.innerHTML = '';
    related.forEach(post => {
        const card = createRelatedCard(post);
        relatedGrid.appendChild(card);
    });
}

// Create related post card
function createRelatedCard(post) {
    const card = document.createElement('article');
    card.className = 'card';
    card.onclick = () => window.location.href = `/post.html?slug=${post.slug}`;
    
    const formattedDate = formatDate(post.publishDate);
    
    card.innerHTML = `
        <div class="card-image"></div>
        <div class="card-content">
            <span class="card-tag">${escapeHtml(post.category.toUpperCase())}</span>
            <div class="card-meta">
                <span class="card-source">${escapeHtml(post.sourceName)}</span>
                <span>•</span>
                <span class="card-time">${formattedDate}</span>
            </div>
            <h3 class="card-title">${escapeHtml(post.title)}</h3>
            <p class="card-summary">${escapeHtml(post.summary.substring(0, 120))}...</p>
        </div>
    `;
    
    return card;
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

// Display error message
function displayError(message) {
    const postArticle = document.getElementById('post-article');
    if (postArticle) {
        postArticle.innerHTML = `
            <div class="loading">
                <h2>${message}</h2>
                <p><a href="/" style="color: #ff6b35; text-decoration: underline;">Return to Homepage</a></p>
            </div>
        `;
    }
}

// Social sharing functions
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(currentPost ? currentPost.title : 'Check this out!');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}
