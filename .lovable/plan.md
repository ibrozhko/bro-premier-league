

# Bro Premier League (BPL) — FC 26 League Website

## Design System
- **Background:** Dark navy `#0d1b3e`, cards slightly lighter `#132248`
- **Accents:** Electric blue `#3b7de8`, Gold `#f0b429` for highlights
- **Text:** White primary, muted blue-gray for secondary
- **Fonts:** Bebas Neue (headings), Inter (body)
- **Style:** Clean, modern sports design inspired by Premier League official site, lion crown motif

## Data Layer
- Central `leagueData.ts` file containing all 9 players, 18 matchdays (72 matches), standings, and scores as typed constants — easy to edit manually
- Double round-robin schedule auto-generated for 9 players (4 matches + 1 bye per matchday), season Apr 17 – Jun 15, 2026
- Placeholder scores for first few matchdays, rest marked as upcoming

## Pages

### Home
- Hero section with "Bro Premier League" title + lion crown icon, tagline
- Countdown timer to next unplayed match
- Latest results strip (horizontal scroll of recent scores)
- Top 3 standings mini-table

### Standings
- Full league table: position, player name, club name + logo colors, P/W/D/L/GF/GA/GD/Pts
- Last 5 form shown as colored W/D/L dots (green/gray/red)
- Sorted by points, then GD, then GF

### Fixtures & Results
- 18 matchday cards, each showing its 4 matches
- Match card: home player vs away player, score or "vs", date, matchday number
- Filter/select by matchday number
- Opening match (Fri Apr 17) highlighted with gold border
- Bye player noted per matchday

### Players
- Grid of 9 player cards with: name, club, platform badge (PS5/Xbox/PC), stats (matches, goals scored, goals conceded, points)
- Club-colored accent on each card

### Top Scorers
- Leaderboard table: rank, player name, club, total goals scored
- Gold/silver/bronze styling for top 3

## Navigation
- Sticky top navbar with BPL logo, page links, mobile hamburger menu
- Fully responsive layout (mobile-first)

