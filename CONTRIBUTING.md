# 🤝 Contributing to OPPA

Thank you for your interest in contributing! OPPA is built to help teams improve operational efficiency, and we welcome improvements from the community.

---

## 🚀 How to Contribute

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/pinoyseoul-ai.git
cd pinoyseoul-ai
```

### 2. Create a Branch
```bash
git checkout -b feature/your-awesome-feature
```

### 3. Make Your Changes
- Keep functions focused and well-documented
- Follow existing code style (Google Apps Script conventions)
- Add comments for complex logic
- Update documentation if needed

###4. Test Thoroughly
- Test in Apps Script editor
- Check execution logs
- Verify token usage
- Test with various question types

### 5. Commit & Push
```bash
git add .
git commit -m "Add: your awesome feature"
git push origin feature/your-awesome-feature
```

### 6. Open Pull Request
- Describe what your changes do
- Include testing notes
- Reference any related issues

---

## 📝 Code Guidelines

### Style
- Use `var` (Apps Script compatibility)
- Use clear, descriptive variable names
- Add `logInfo()` for important decisions
- Keep functions under 100 lines when possible

### Example:
```javascript
/**
 * Good function - clear purpose, well-documented
 */
function extractKeywords(question) {
  if (!question) return [];
  
  var lower = question.toLowerCase();
  var keywords = [];
  
  // Entity detection first (priority)
  if (lower.includes('radio')) {
    logInfo('extractKeywords', 'Entity detected: RADIO');
    return ['radio'];
  }
  
  // ... rest of logic
  return keywords;
}
```

---

## 🎯 What to Contribute

### High Priority
- [ ] Performance improvements
- [ ] Better error handling
- [ ] Additional language support
- [ ] More comprehensive tests

### Welcome Additions
- [ ] New casual response types
- [ ] Enhanced document scoring algorithms
- [ ] Better time parsing
- [ ] UI/UX improvements in Google Chat

### Documentation
- [ ] More examples
- [ ] Video tutorials
- [ ] Troubleshooting guides
- [ ] Use case studies

---

## 🐛 Bug Reports

Found a bug? Please open an Issue with:

1. **Description**: What's wrong?
2. **Steps to reproduce**: How did it happen?
3. **Expected behavior**: What should happen?
4. **Actual behavior**: What actually happened?
5. **Logs**: Execution logs if available
6. **Version**: Which version of OPPA?

---

## 💡 Feature Requests

Have an idea? Open an Issue with:

1. **Use case**: Why is this needed?
2. **Proposed solution**: How might it work?
3. **Alternatives**: Other approaches you considered?

---

## 📋 Development Setup

1. **Google Apps Script Editor**: [script.google.com](https://script.google.com)
2. **Gemini API Key**: [ai.google.dev](https://ai.google.dev)
3. **Google Cloud Project**: For Chat API and Service Account

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for details.

---

## ✅ Pull Request Checklist

Before submitting:

- [ ] Code follows project style
- [ ] Comments added for complex logic
- [ ] Tested in Apps Script
- [ ] Documentation updated
- [ ] No API keys or secrets in code
- [ ] Commit messages are clear

---

## 🙏 Thank You!

Every contribution helps make OPPA better for teams everywhere!

Questions? Open an Issue or start a Discussion.

**Built with ❤️ by the community**
