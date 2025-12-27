// newspost.js - Private JSON Generator Logic

document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    setupCharCounters();
    setupCopyButton();
});

// Initialize form
function initializeForm() {
    const form = document.getElementById('news-form');
    const publishDateInput = document.getElementById('publish-date');
    const publishTimeInput = document.getElementById('publish-time');
    
    // Set today's date and current time as default
    const now = new Date();
    publishDateInput.value = now.toISOString().split('T')[0];
    publishTimeInput.value = now.toTimeString().slice(0, 5);
    
    form.addEventListener('submit', handleSubmit);
}

// Setup character counters
function setupCharCounters() {
    const titleInput = document.getElementById('title');
    const summaryInput = document.getElementById('summary');
    const titleCount = document.getElementById('title-count');
    const summaryCount = document.getElementById('summary-count');
    
    titleInput.addEventListener('input', () => {
        titleCount.textContent = `${titleInput.value.length} characters`;
    });
    
    summaryInput.addEventListener('input', () => {
        summaryCount.textContent = `${summaryInput.value.length} characters`;
    });
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const summary = document.getElementById('summary').value.trim();
    const category = document.getElementById('category').value;
    const sourceName = document.getElementById('source-name').value.trim();
    const sourceUrl = document.getElementById('source-url').value.trim();
    const publishDate = document.getElementById('publish-date').value;
    const publishTime = document.getElementById('publish-time').value;
    
    // Combine date and time into ISO format
    const publishDateTime = `${publishDate}T${publishTime}:00`;
    
    // Generate slug from title
    const slug = generateSlug(title);
    
    // Generate unique ID (timestamp-based)
    const id = `post_${Date.now()}`;
    
    // Create post object
    const postObject = {
        id: id,
        slug: slug,
        title: title,
        summary: summary,
        category: category,
        publishDate: publishDateTime,
        sourceName: sourceName,
        sourceUrl: sourceUrl
    };
    
    // Convert to JSON
    const jsonOutput = JSON.stringify(postObject, null, 2);
    
    // Display output
    displayJSON(jsonOutput);
}

// Generate URL-friendly slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}

// Display generated JSON
function displayJSON(json) {
    const outputContainer = document.getElementById('output-container');
    const jsonOutput = document.getElementById('json-output');
    
    jsonOutput.textContent = json;
    outputContainer.style.display = 'block';
    
    // Scroll to output
    outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Setup copy button
function setupCopyButton() {
    const copyBtn = document.getElementById('btn-copy');
    
    copyBtn.addEventListener('click', () => {
        const jsonOutput = document.getElementById('json-output');
        const jsonText = jsonOutput.textContent;
        
        // Copy to clipboard
        navigator.clipboard.writeText(jsonText).then(() => {
            // Visual feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Copied!';
            copyBtn.style.background = '#27ae60';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
            }, 2000);
        }).catch(err => {
            alert('Failed to copy. Please select and copy manually.');
            console.error('Copy failed:', err);
        });
    });
}

// Prevent accidental form reset
window.addEventListener('beforeunload', (e) => {
    const form = document.getElementById('news-form');
    const outputContainer = document.getElementById('output-container');
    
    // Only warn if form has data but JSON hasn't been generated
    if (form.title.value && outputContainer.style.display === 'none') {
        e.preventDefault();
        e.returnValue = '';
    }
});
