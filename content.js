// X Ratio Calculator Content Script

class XRatioCalculator {
  constructor() {
    this.processedPosts = new Set();
    this.observePosts();
  }

  // Calculate ratios based on metrics
  calculateRatios(metrics) {
    const { views, likes, retweets, comments, bookmarks } = metrics;
    if (!views) return null;

    // Calculate ratio as percentage: (metric / views) * 100
    return {
      views,
      likes: {
        count: likes,
        ratio: ((likes / views) * 100).toFixed(1)
      },
      retweets: {
        count: retweets,
        ratio: ((retweets / views) * 100).toFixed(1)
      },
      comments: {
        count: comments,
        ratio: ((comments / views) * 100).toFixed(1)
      },
      bookmarks: {
        count: bookmarks,
        ratio: ((bookmarks / views) * 100).toFixed(1)
      }
    };
  }

  // Helper to extract numbers from text content
  extractNumber(text) {
    if (!text) return 0;
    
    // Convert text to string and clean it
    const cleanText = text.toString().trim();
    
    // Handle "Mio." format (e.g., "4,3 Mio.")
    if (cleanText.includes('Mio')) {
      // Extract the number part before "Mio", preserving comma
      const match = cleanText.match(/([\d,]+)\s*Mio/);
      if (match) {
        const numberPart = match[1];
        console.log('Mio format found:', { original: cleanText, numberPart });
        // Replace comma with dot for decimal point
        const number = parseFloat(numberPart.replace(',', '.'));
        const result = Math.round(number * 1000000);
        console.log('Converted to:', result);
        return result;
      }
      return 0;
    }
    
    // For regular numbers, remove dots and commas
    const regularNumber = cleanText.replace(/[.,]/g, '');
    
    // Extract just the numbers
    const numberMatch = regularNumber.match(/\d+/);
    if (!numberMatch) return 0;
    
    // Convert to number
    return parseInt(numberMatch[0], 10);
  }

  // Extract metrics from post element
  extractMetrics(postElement) {
    try {
      // Get raw text values
      const viewsText = postElement.querySelector('[data-testid="app-text-transition-container"]')?.textContent || '0';
      const likesText = postElement.querySelector('[data-testid="like"]')?.getAttribute('aria-label')?.match(/(\d+)/)?.[1] || '0';
      const retweetsText = postElement.querySelector('[data-testid="retweet"]')?.getAttribute('aria-label')?.match(/(\d+)/)?.[1] || '0';
      const commentsText = postElement.querySelector('[data-testid="reply"]')?.getAttribute('aria-label')?.match(/(\d+)/)?.[1] || '0';
      const bookmarksText = postElement.querySelector('[data-testid="bookmark"]')?.getAttribute('aria-label')?.match(/(\d+)/)?.[1] || '0';

      // Extract clean numbers
      const metrics = {
        views: this.extractNumber(viewsText),
        likes: this.extractNumber(likesText),
        retweets: this.extractNumber(retweetsText),
        comments: this.extractNumber(commentsText),
        bookmarks: this.extractNumber(bookmarksText)
      };

      console.log('Raw metrics:', { viewsText, likesText, retweetsText, commentsText, bookmarksText });
      console.log('Cleaned metrics:', metrics);
      return metrics;
    } catch (error) {
      console.error('Error extracting metrics:', error);
      return null;
    }
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
    
    // Create table HTML
    const tableHTML = `
      <h3 class="x-ratio-title">Engagement Ratios</h3>
      <table class="x-ratio-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Percent</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="x-ratio-type">Total Views</td>
            <td>${ratios.views.toLocaleString()}</td>
            <td>100%</td>
          </tr>
          <tr>
            <td class="x-ratio-type">Likes</td>
            <td>${ratios.likes.count.toLocaleString()}</td>
            <td>${ratios.likes.ratio}%</td>
          </tr>
          <tr>
            <td class="x-ratio-type">Retweets</td>
            <td>${ratios.retweets.count.toLocaleString()}</td>
            <td>${ratios.retweets.ratio}%</td>
          </tr>
          <tr>
            <td class="x-ratio-type">Comments</td>
            <td>${ratios.comments.count.toLocaleString()}</td>
            <td>${ratios.comments.ratio}%</td>
          </tr>
          <tr>
            <td class="x-ratio-type">Bookmarks</td>
            <td>${ratios.bookmarks.count.toLocaleString()}</td>
            <td>${ratios.bookmarks.ratio}%</td>
          </tr>
        </tbody>
      </table>
    `;
    
    popup.innerHTML = tableHTML;

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
