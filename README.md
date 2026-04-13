# Lumière — Movie Tracker (Plain HTML/CSS/JS)

No build tools. No npm. No frameworks. Just open `index.html` in any browser.

## How to run

1. Extract the folder
2. Double-click `index.html` — done

**Or** open it from the command line:
```
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

## Pages

| File | Page |
|---|---|
| `index.html` | Home — preview of all 3 sections |
| `recommendations.html` | Full recommendations list |
| `watchlist.html` | Your watchlist (mark watched or remove) |
| `history.html` | Movies you've already watched |

## What the buttons do

- **✓ (checkmark)** on a card — marks that movie as watched; it disappears from recommendations/watchlist and moves to History
- **✕ (cross)** on a card — removes the movie from your watchlist (only shown on Watchlist pages)

Changes are saved in the browser's `localStorage` so they persist when you refresh.

## Adding or editing movies

Open `data.js` and edit any of the three arrays at the top:

- `DEFAULT_RECOMMENDATIONS`
- `DEFAULT_HISTORY`
- `DEFAULT_WATCHLIST`

Each movie entry looks like this:

```js
{
  id: 1,
  title: "Inception",
  year: 2010,
  genre: "Sci-Fi",
  rating: 8.8,
  poster: "https://image.tmdb.org/t/p/w500/...",
  description: "A short sentence about the film.",
}
```

**Note:** If you edit `data.js`, clear localStorage first so it picks up your changes.
To clear: open the browser console (`F12`) and run `localStorage.clear()`, then refresh.

## File overview

```
index.html             — Home page
recommendations.html   — Discover page
watchlist.html         — Watchlist page
history.html           — History page
style.css              — All styles
data.js                — All movie data (edit this!)
app.js                 — State management and rendering logic
```
