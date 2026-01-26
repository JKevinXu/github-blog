---
layout: post
title: "NBA Game Simulator - Design Document"
date: 2026-01-26
tags: [design, gaming, nba, javascript]
---

# NBA Game Simulator Design Document

## Overview

An interactive single-page NBA game simulator integrated into the Jekyll blog. Users select two NBA teams, run a simulation based on real team statistics, and view realistic game results including quarter scores, final score, and MVP highlights.

## Goals

- Provide an engaging, fun NBA game simulation experience
- Use real team statistics for realistic outcomes
- Integrate seamlessly with the existing blog design
- Work entirely client-side with no backend required

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │Team Selection│  │Simulate Btn │  │   Game Results      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Simulation Engine                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Team Stats  │──│Monte Carlo  │──│  Quarter Scoring    │ │
│  │             │  │  Algorithm  │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │balldontlie  │  │ localStorage│  │  Static JSON        │ │
│  │    API      │  │   Cache     │  │    Fallback         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Strategy

### Primary: balldontlie API

The [balldontlie API](https://www.balldontlie.io/) provides free NBA statistics:

**Free Tier Includes:**
- All 30 NBA teams
- Current season games and stats
- Player data and season averages

**Limitations:**
- Free tier: current season only
- Rate limits apply
- Historical data requires paid tier

### Caching Strategy

```javascript
// Cache structure
{
  "teams": [...],
  "lastUpdated": "2026-01-26T10:00:00Z",
  "expiresAt": "2026-01-27T10:00:00Z"  // 24-hour TTL
}
```

- Store fetched data in localStorage
- 24-hour cache expiration
- Reduces API calls and improves performance

### Fallback: Static JSON

Include `_data/nba-teams.json` with all 30 teams:

```json
{
  "teams": [
    {
      "id": 1,
      "name": "Hawks",
      "city": "Atlanta",
      "abbreviation": "ATL",
      "conference": "East",
      "division": "Southeast",
      "primaryColor": "#E03A3E",
      "secondaryColor": "#C1D32F",
      "stats": {
        "ppg": 118.2,
        "oppg": 120.5,
        "pace": 101.2,
        "winPct": 0.415
      }
    }
    // ... 29 more teams
  ]
}
```

## Simulation Algorithm

### Possession-Based Model

The simulation uses a possession-based approach that mirrors real NBA gameplay:

```javascript
function simulateGame(homeTeam, awayTeam) {
    // 1. Calculate expected possessions
    const avgPace = (homeTeam.pace + awayTeam.pace) / 2;
    const possessionsPerQuarter = avgPace / 4;
    
    // 2. Calculate scoring efficiency
    // Offensive rating vs opponent's defensive rating
    const homeOffEff = homeTeam.ppg / 100;
    const awayDefEff = awayTeam.oppg / 100;
    const homeExpectedPPP = (homeOffEff + (100 - awayDefEff)) / 2;
    
    // 3. Simulate each quarter
    for (let q = 1; q <= 4; q++) {
        quarterScore = simulateQuarter(possessionsPerQuarter, homeExpectedPPP);
    }
    
    // 4. Handle overtime if tied
    while (homeScore === awayScore) {
        simulateOvertime();
    }
    
    return gameResult;
}
```

### Key Factors

| Factor | Impact | Implementation |
|--------|--------|----------------|
| Offensive Rating (PPG) | Determines scoring probability | Higher PPG = more points per possession |
| Defensive Rating (OPPG) | Reduces opponent scoring | Lower OPPG = better defense |
| Pace | Number of possessions | Fast pace = more scoring opportunities |
| Home Court Advantage | +3-4 points for home team | Applied as bonus to home scoring |
| Win Percentage | Momentum/clutch factor | Affects close-game outcomes |
| Quarter Variance | Realistic scoring fluctuation | Random variance per quarter |

### Randomness and Realism

```javascript
// Add controlled randomness for realistic variance
function addVariance(expectedScore, variance = 0.15) {
    const factor = 1 + (Math.random() - 0.5) * variance;
    return Math.round(expectedScore * factor);
}
```

## File Structure

```
github-blog/
├── nba-simulator.md              # Main simulator page
├── assets/
│   └── js/
│       └── nba-simulator.js      # Simulation engine + API
└── _data/
    └── nba-teams.json            # Static fallback data (30 teams)
```

## User Interface Design

### Team Selection

```
┌────────────────────────────────────────────────────────┐
│                  NBA GAME SIMULATOR                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│   HOME TEAM              vs           AWAY TEAM        │
│  ┌──────────────┐              ┌──────────────┐       │
│  │ [Lakers  ▼] │              │ [Celtics ▼] │       │
│  └──────────────┘              └──────────────┘       │
│                                                        │
│  PPG: 115.5                    PPG: 120.8             │
│  DEF: 113.8                    DEF: 109.2             │
│  WIN: 53.7%                    WIN: 73.2%             │
│                                                        │
│              [ SIMULATE GAME ]                         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Game Results Display

```
┌────────────────────────────────────────────────────────┐
│                    FINAL SCORE                         │
│                                                        │
│     LAKERS          108 - 115          CELTICS        │
│                                                        │
├────────────────────────────────────────────────────────┤
│  QUARTER BREAKDOWN                                     │
│  ┌────────┬─────┬─────┬─────┬─────┬───────┐          │
│  │        │ Q1  │ Q2  │ Q3  │ Q4  │ FINAL │          │
│  ├────────┼─────┼─────┼─────┼─────┼───────┤          │
│  │ LAL    │ 28  │ 25  │ 30  │ 25  │  108  │          │
│  │ BOS    │ 32  │ 28  │ 27  │ 28  │  115  │          │
│  └────────┴─────┴─────┴─────┴─────┴───────┘          │
│                                                        │
│  GAME HIGHLIGHTS                                       │
│  • Celtics controlled the game from the 1st quarter   │
│  • High-scoring affair with 223 total points          │
│  • Home court advantage wasn't enough for Lakers      │
│                                                        │
│              [ PLAY AGAIN ]                            │
└────────────────────────────────────────────────────────┘
```

### Styling Approach

Following the existing Hacker News-inspired blog theme:

```css
/* Primary accent color */
.nba-simulator { --accent: #ff6600; }

/* Team cards with team colors */
.team-card {
    border-left: 4px solid var(--team-color);
    background: white;
    padding: 15px;
}

/* Score display */
.final-score {
    font-size: 48px;
    font-weight: bold;
    text-align: center;
}

/* Responsive design */
@media (max-width: 600px) {
    .team-selection { flex-direction: column; }
}
```

## Technical Considerations

### API Rate Limits

| Scenario | Strategy |
|----------|----------|
| First load | Fetch from API, cache for 24h |
| Cached data available | Use cache, skip API |
| API fails | Fall back to static JSON |
| Rate limited | Fall back to static JSON |

### Browser Compatibility

- **Required**: ES6+ support (const, let, arrow functions, async/await)
- **APIs Used**: Fetch API, localStorage
- **Supported**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+

### Performance

- No external dependencies (vanilla JS)
- Lazy load team data on page load
- Simulation runs client-side (~10ms)
- Minimal DOM updates

## Future Enhancements

### Phase 2 Features

1. **Player-level simulation** - Include individual player stats
2. **Playoff series mode** - Best-of-7 simulation
3. **Historical matchups** - Compare teams across seasons
4. **Share results** - Generate shareable game summaries

### Phase 3 Features

1. **Season simulation** - Full 82-game season
2. **Draft mode** - Create custom teams
3. **Leaderboard** - Track prediction accuracy
4. **Real-time odds** - Compare to betting lines

## Implementation Checklist

- [ ] Create `_data/nba-teams.json` with all 30 teams
- [ ] Create `assets/js/nba-simulator.js` with simulation engine
- [ ] Create `nba-simulator.md` main page with UI
- [ ] Add navigation link in `_layouts/default.html`
- [ ] Add responsive CSS styles
- [ ] Test on mobile devices
- [ ] Add error handling for API failures

## Appendix: Team Data Schema

```typescript
interface Team {
  id: number;
  name: string;           // "Lakers"
  city: string;           // "Los Angeles"
  abbreviation: string;   // "LAL"
  conference: "East" | "West";
  division: string;
  primaryColor: string;   // "#552583"
  secondaryColor: string; // "#FDB927"
  stats: {
    ppg: number;          // Points per game
    oppg: number;         // Opponent points per game
    pace: number;         // Possessions per game
    winPct: number;       // Win percentage (0-1)
  };
}

interface GameResult {
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  quarters: {
    home: number[];       // [28, 25, 30, 25]
    away: number[];       // [32, 28, 27, 28]
  };
  overtime: boolean;
  highlights: string[];
}
```
