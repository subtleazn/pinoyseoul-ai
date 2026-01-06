# 📋 Changelog

All notable changes to OPPA will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [3.0.0] - 2026-01-06 🎉

### Added
- **Phase 2: Hybrid Document Scoring** - BM25 + semantic intent ranking
- **Entity-Aware Context Detection** - Automatically identifies radio/website/company topics
- **90-Day Memory** with smart defaults (defaults to 7 days for efficiency)
- **Time-Smart Filtering** - Parses "last week", "last 2 months", "quarterly"
- **Smart Fallback Handler** - Context-aware suggestions when OPPA doesn't know
- **Comprehensive Logging** - Structured logging throughout

### Changed
- **Document Selection**:  Reduced from naive keyword matching to scored ranking
- **Token Usage**: 76% reduction (110K → 26K tokens) through optimization
- **Response Time**: 70% faster (15-20s → 4-6s)
- **Context Routing**: Automatic instead of manual
- **Default Time Range**: 30 days → 7 days for vague questions

### Fixed
- Entity detection preventing over-loading of documents
- Vague time queries loading too much history
- Citation formatting (removed for cleaner responses)
- Work context misrouting to casual handler
- Duplicate function bug in extractKeywords

### Performance
- **Tokens**: 110,000 → 26,000 (76% reduction)
- **Speed**: 15-20s → 4-6s (70% faster)
- **Memory**: 30 days → 90 days (3x deeper)
- **Accuracy**: Manual → 100% automatic routing

---

## [2.0.0] - 2025-12-15

### Added
- **Section-Level Document Loading** - Load only relevant sections, not entire docs
- **Smart Context Routing** - Automatic detection of docs vs logs vs both
- **Activity vs Knowledge Separation** - Different handling for different question types
- **Stopwords Implementation** - Company-specific stopwords to prevent over-matching

### Changed
- Document loading from full docs to targeted sections
- Persona rules updated for better specificity
- Response formatting improved

### Fixed
- Generic company overview responses
- Token bloat from loading unnecessary content
- Missing context for specific questions

---

## [1.0.0] - 2025-11-01

### Added
- Initial release
- Basic Gemini AI integration
- MessageLog Sheet tracking
- Casual response handler
- SOP document retrieval from Google Drive
- Google Chat webhook integration

### Core Features
- Answer operational questions
- Search company documentation
- Report on recent activity
- Casual conversation handling

---

## Upcoming / Planned

### [Future]
- [ ] Multi-turn conversation support (follow-up context)
- [ ] Proactive notifications for unusual activity
- [ ] Analytics dashboard
- [ ] Voice message support
- [ ] Multi-language support
- [ ] Advanced caching strategies
- [ ] Custom integrations (Slack, Teams, Discord)

---

## Version Naming

- **Major (X.0.0)**: Breaking changes or significant new features
- **Minor (x.X.0)**: New features, backwards compatible
- **Patch (x.x.X)**: Bug fixes, minor improvements

---

**For detailed commit history, see [GitHub Releases](https://github.com/yourusername/pinoyseoul-ai/releases)**
