# Pipeline Defender

A GitLab-themed educational arcade shooter game where players defend CI/CD pipelines from software bugs.

![GitLab Pipeline Defender](images/gitlab-tanuki.png)

## 🎮 Game Overview

**Pipeline Defender** is a vertical arcade shooter built with vanilla HTML, CSS, and JavaScript. Take control of the GitLab Tanuki and defend your CI/CD pipeline from descending software bugs. The goal isn't just survival—you must collect all four pipeline power-ups to secure your development workflow!

### 🎯 Objective
Clear all bugs from the pipeline by collecting all 4 power-ups:
- **TEST** - Automated Testing
- **CSM** - Credentials & Secrets Manager
- **SEC** - Security Scanner
- **QUAL** - Quality Check

## 🚀 Quick Start

### Play Online
Simply open `index.html` in your web browser - no installation required!

### Local Development
1. Clone this repository
2. Open `index.html` in your browser, or
3. Serve locally with any HTTP server:
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (if you have serve installed)
   npx serve

   # PHP
   php -S localhost:8000
   ```

## 🎲 How to Play

### Controls
- **Desktop**: Arrow keys (←/→) to move, Spacebar to shoot
- **Mobile**: Touch controls for movement and shooting
- **Navigation**: Tab to navigate menus, Enter to select, ESC to go back

### Game Mechanics

#### Enemy Bugs
- **🔴 Functional Errors**: Red bugs that break your code
- **⚫ Security Bugs**: Black spider-like threats
- **🟡 Quality Bugs**: Yellow bugs marked with "Q"
- **🟣 Embedded Secrets**: Purple bugs with key icons

#### Power-ups
Collecting a power-up eliminates all bugs of that type on screen and prevents them from spawning again:
- **🧪 TEST**: Eliminates Functional Errors (1000 points)
- **🔐 CSM**: Eliminates Embedded Secrets (1000 points)
- **🛡️ SEC**: Eliminates Security Bugs (1000 points)
- **✅ QUAL**: Eliminates Quality Bugs (1000 points)

#### Scoring
- Individual bug elimination: **10 points**
- Power-up collection: **1000 points**
- Complete pipeline defense: **Massive bonus!**

### Win/Lose Conditions
- **🏆 Win**: Collect all 4 power-ups before time expires
- **💥 Lose**: Timer runs out OR any bug reaches the bottom

## 🏗️ Technical Architecture

### Project Structure
```
pipeline-defender/
├── index.html              # Main game file
├── css/
│   ├── style.css          # Core styling
│   ├── screens.css        # Screen-specific styles
│   └── animations.css     # CSS animations
├── js/
│   ├── game.js           # Core game logic
│   ├── display.js        # DOM rendering
│   ├── input.js          # Input handling
│   ├── screens.js        # Screen management
│   └── leaderboard.js    # Score persistence
├── images/               # Game assets
└── README.md
```

### Key Features
- **Framework-free**: Pure HTML/CSS/JavaScript
- **Mobile responsive**: Touch controls and responsive design
- **Local storage**: Persistent leaderboards
- **Modular architecture**: Clean separation of concerns
- **Educational theme**: Learn about CI/CD pipeline security

## 🛠️ Development

### Browser Compatibility
- Chrome/Chromium 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Performance Notes
- Uses DOM rendering (not Canvas) for simplicity
- CSS animations for visual effects
- Local storage for data persistence
- No build tools or dependencies required

## 🎨 Assets & Credits

### Game Assets
All visual assets included in `/images/` directory:
- GitLab Tanuki logo and character sprites
- Bug type illustrations
- Game effects and animations

### Inspiration
Created as an educational tool to teach CI/CD pipeline security concepts through gamification.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Guidelines
- Maintain vanilla JS architecture (no frameworks)
- Test across multiple browsers
- Follow existing code style and structure
- Update documentation for new features

## 🔧 Customization

### Adding New Bug Types
1. Add new bug image to `/images/`
2. Define bug type in `game.js`
3. Add corresponding power-up logic
4. Update UI elements in `index.html`

### Modifying Game Mechanics
- Adjust spawn rates, scoring, and timing in `game.js`
- Customize visual effects in `animations.css`
- Modify screen layouts in `screens.css`

## 📊 Game Statistics

The game tracks:
- Total missions completed
- Successful pipeline defenses
- Individual bug elimination counts
- High scores with pipeline completion indicators

---

**Defend your pipeline, secure your code!** 🚀🔒