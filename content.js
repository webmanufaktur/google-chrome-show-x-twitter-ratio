// X Ratio Calculator Content Script

class XRatioCalculator {
  constructor() {
    this.processedPosts = new Set();
    this.observePosts();
  }

  // Calculate ratios based on metrics
  calculateRatios(metrics) {
    const { views, likes, retweets, comments } = metrics;
    if (!views) return null;

    return {
      likes: ((likes / views) * 100).toFixed(1),
      retweets: ((retweets / views) * 100).toFixed(1),
      comments: ((comments / views) * 100).toFixed(1)
    };
  }

  // Extract metrics from post element
  extractMetrics(postElement) {
    try {
      // Updated selectors based on X's current DOM structure
      const viewsText = postElement.querySelector('[data-testid="app-text-transition-container"]')?.textContent || '0';
      const likesText = postElement.querySelector('[data-testid="like"]')?.getAttribute('aria-label')?.match(/(\d+)/)?.[1] || '0';
      const retweetsText = postElement.querySelector('[data-testid="retweet"]')?.getAttribute('aria-label')?.match(/(\d+)/)?.[1] || '0';
      const commentsText = postElement.querySelector('[data-testid="reply"]')?.getAttribute('aria-label')?.match(/(\d+)/)?.[1] || '0';

      const metrics = {
        views: this.extractNumber(viewsText),
        likes: this.extractNumber(likesText),
        retweets: this.extractNumber(retweetsText),
        comments: this.extractNumber(commentsText)
      };

      console.log('Extracted metrics:', metrics); // Debug log
      return metrics;
    } catch (error) {
      console.error('Error extracting metrics:', error);
      return null;
    }
  }

  // Helper to extract numbers from text content
  extractNumber(element) {
    if (!element) return 0;
    const text = element.toString().trim();
    // Handle K (thousands) and M (millions)
    if (text.includes('K')) {
      return parseFloat(text.replace('K', '')) * 1000;
    } else if (text.includes('M')) {
      return parseFloat(text.replace('M', '')) * 1000000;
    }
    return parseInt(text.replace(/,/g, '')) || 0;
  }

  // Create and inject ratio button
  injectRatioButton(postElement, ratios) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'x-ratio-button';
    buttonContainer.innerHTML = '📊';
    buttonContainer.title = 'View engagement ratios';

    buttonContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showRatioPopup(buttonContainer, ratios);
    });

    // Insert after the post metrics
    const metricsContainer = postElement.querySelector('[role="group"]');
    if (metricsContainer) {
      metricsContainer.appendChild(buttonContainer);
    }
  }

  // Show popup with ratio details
  showRatioPopup(button, ratios) {
    const popup = document.createElement('div');
    popup.className = 'x-ratio-popup';
    popup.innerHTML = `
      <div class="x-ratio-content">
        <h3>Engagement Ratios</h3>
        <p>Likes: ${ratios.likes}%</p>
        <p>Retweets: ${ratios.retweets}%</p>
        <p>Comments: ${ratios.comments}%</p>
      </div>
    `;

    // Position popup near the button
    const rect = button.getBoundingClientRect();
    popup.style.top = `${rect.bottom + window.scrollY}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;

    document.body.appendChild(popup);

    // Close popup when clicking outside
    const closePopup = (e) => {
      if (!popup.contains(e.target) && e.target !== button) {
        popup.remove();
        document.removeEventListener('click', closePopup);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closePopup);
    }, 0);
  }

  // Process a single post
  processPost(postElement) {
    if (this.processedPosts.has(postElement)) return;
    
    const metrics = this.extractMetrics(postElement);
    if (!metrics) return;

    const ratios = this.calculateRatios(metrics);
    if (!ratios) return;

    this.injectRatioButton(postElement, ratios);
    this.processedPosts.add(postElement);
  }

  // Observe DOM for new posts
  observePosts() {
    console.log('Starting post observation'); // Debug log
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const posts = document.querySelectorAll('[data-testid="tweet"]');
        console.log('Found posts:', posts.length); // Debug log
        posts.forEach(post => this.processPost(post));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize the calculator when the page loads
window.addEventListener('load', () => {
  new XRatioCalculator();
});
