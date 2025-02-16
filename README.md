# X Ratio Calculator

A browser extension that calculates engagement ratios for X (formerly Twitter) posts based on views, likes, retweets, and comments.

## Features

- Automatically detects and processes X posts
- Calculates engagement ratios based on view count
- Displays a non-intrusive ratio button on each post
- Shows detailed ratio statistics in a popup
- Memory-efficient (only processes visible posts)

## Installation

### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this directory

### Firefox

Firefox support coming soon.

## Usage

1. Navigate to X (twitter.com or x.com)
2. Look for the 📊 icon on posts
3. Click the icon to view engagement ratios

## Development

To modify the extension:

1. Clone this repository
2. Make your changes
3. Reload the extension in Chrome

## Metrics Calculation

The extension calculates the following ratios based on view count:

- Likes ratio = (likes / views) \* 100
- Retweets ratio = (retweets / views) \* 100
- Comments ratio = (comments / views) \* 100

## License

(c) Copyright 2025 - Alexander Abelt, aapr.de
