# Contributing to Pipeline Defender

Thank you for your interest in contributing to Pipeline Defender! This document provides guidelines for contributing to this educational game project.

## 🎯 Project Goals

Pipeline Defender is designed to:
- Teach CI/CD pipeline security concepts through gamification
- Remain accessible with vanilla HTML/CSS/JavaScript (no frameworks)
- Provide an engaging educational experience about software development security

## 🛠️ Development Setup

1. Fork the repository
2. Clone your fork locally
3. Open `index.html` in your browser or serve it locally:
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```

## 📝 Contribution Guidelines

### Code Style
- **No frameworks**: Keep the codebase framework-free (vanilla JS only)
- **Modular architecture**: Maintain the existing separation between game logic, display, input, and screens
- **Browser compatibility**: Test in Chrome, Firefox, Safari, and Edge
- **Mobile responsive**: Ensure changes work on both desktop and mobile devices

### File Structure
Please maintain the existing file organization:
```
/
├── index.html              # Main HTML structure
├── css/                   # Stylesheets
├── js/                    # JavaScript modules
├── images/                # Game assets
└── docs/                  # Documentation
```

### Types of Contributions

#### 🎮 Game Features
- New bug types or power-ups
- Enhanced visual effects
- Improved game mechanics
- Sound effects (optional)

#### 🎨 Visual Improvements
- Better animations
- Responsive design enhancements
- Accessibility improvements
- UI/UX polish

#### 📚 Educational Content
- Better explanations of CI/CD concepts
- Additional learning resources
- Improved tutorial or instructions

#### 🐛 Bug Fixes
- Performance optimizations
- Cross-browser compatibility fixes
- Mobile responsiveness issues

### Pull Request Process

1. **Create an Issue**: For significant changes, create an issue first to discuss the approach
2. **Branch**: Create a feature branch from `main`
3. **Develop**: Make your changes while following the code style guidelines
4. **Test**: Test your changes across multiple browsers and devices
5. **Documentation**: Update README.md if you're adding new features
6. **Commit**: Write clear, descriptive commit messages
7. **Pull Request**: Submit a PR with a clear description of changes

### Commit Message Format
Use clear, descriptive commit messages:
```
Add new security bug variant with enhanced animations

- Implement red security bug with spider-like movement pattern
- Add corresponding power-up collection logic
- Update game balance for new bug type
```

## 🧪 Testing

Since this is a browser-based game without automated tests:

### Manual Testing Checklist
- [ ] Game loads without errors in console
- [ ] All screens navigate correctly
- [ ] Touch controls work on mobile devices
- [ ] Game mechanics function as expected
- [ ] Leaderboard persists scores correctly
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

### Performance Testing
- [ ] Game maintains smooth 60fps gameplay
- [ ] Memory usage remains stable during extended play
- [ ] Mobile devices don't experience performance issues

## 🎨 Asset Guidelines

### Images
- Use PNG format for sprites
- Maintain consistent pixel density
- Keep file sizes reasonable (<100KB per image)
- Ensure images are appropriate for educational/professional contexts

### Naming Conventions
- Use kebab-case for file names: `security-bug.png`
- Be descriptive: `functional-error-explosion.png`

## 📖 Documentation

When adding features:
- Update the main README.md
- Add comments to complex code sections
- Update the CLAUDE.md file if changing architecture
- Include examples in documentation

## 🚫 What Not to Contribute

- Framework dependencies (React, Vue, Angular, etc.)
- Build tools or compilation steps
- Server-side components
- Violent or inappropriate content
- Copyrighted assets without proper licensing

## 🤔 Questions?

- Create an issue for questions about the codebase
- Check existing issues and pull requests first
- Be respectful and constructive in all interactions

## 📄 License

By contributing to Pipeline Defender, you agree that your contributions will be licensed under the MIT License.

---

**Happy coding and thanks for helping make CI/CD security education more engaging!** 🚀🔒