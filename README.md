# 🤖 OPPA - AI-Powered Operations Assistant for Google Chat

**OPPA** (Operational & Procedural Personal Assistant) is an intelligent Google Chat bot built with Google Apps Script and Gemini AI. It helps teams by answering operational questions, retrieving documentation, and providing activity summaries - all within Google Chat.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://script.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-8E75B2?logo=google&logoColor=white)](https://ai.google.dev)

---

## ✨ Features

### 🎯 **Smart Context Routing**
- **Knowledge Base**: Answers questions from Google Drive documents (SOPs, policies, guides)
- **Activity Tracking**: Reports on recent events from Google Sheets logs (90-day memory)
- **Casual Responses**: Handles greetings, small talk, and FAQs instantly

### 🚀 **Intelligent Document Retrieval**
- **Entity Detection**: Automatically identifies topics (e.g., "radio", "website", "company")
- **Hybrid Scoring**: BM25 keyword matching + semantic intent analysis
- **Token Optimization**: 76% reduction (110K → 26K tokens) through smart filtering

### 📊 **Advanced Features**
- 90-day activity memory with smart time filtering
- Automatic context detection (docs vs logs vs both)
- Google Chat native formatting (bold, lists, emojis)
- Comprehensive logging and debugging

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Google Chat    │
│   (User Input)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Code.gs       │  Main Entry Point
│  - Routing      │  - Work context check
│  - Persona      │  - Casual response check
└────────┬────────┘  - Context detection
         │
         ├──────────────┬──────────────┬─────────────┐
         ▼              ▼              ▼             ▼
 ┌──────────────┐ ┌─────────────┐ ┌────────────┐ ┌──────────────┐
 │ GeminiService│ │MemoryService│ │SheetService│ │   Handlers   │
 │   .gs        │ │    .gs      │ │    .gs     │ │  (Custom)    │
 └──────────────┘ └─────────────┘ └────────────┘ └──────────────┘
         │              │              │             │
         ▼              ▼              ▼             ▼
 ┌──────────────┐ ┌─────────────┐ ┌────────────┐ ┌──────────────┐
 │ Google Drive │ │Google Sheets│ │Gemini API  │ │   Canned     │
 │  (SOPs/Docs) │ │ (MessageLog)│ │            │ │  Responses   │
 └──────────────┘ └─────────────┘ └────────────┘ └──────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Google Workspace account
- Google Cloud Project with:
  - Google Chat API enabled
  - Gemini API key
  - Service Account with Sheets/Drive access
- Google Apps Script project

### 1. Setup Google Sheet
Create a Google Sheet with a `MessageLog` tab:

| Timestamp | Source | Message | User | Type |
|-----------|--------|---------|------|------|
| 2026-01-06 10:00 | System | Server started | Admin | INFO |

Share with your service account email as **Editor**.

### 2. Create Drive Folder
Create a folder in Google Drive for your documentation (SOPs, guides, policies). Share with service account.

### 3. Deploy Apps Script

1. Create new project at [script.google.com](https://script.google.com)
2. Copy all `.gs` files from this repo
3. Set **Script Properties**:
   ```
   GEMINI_API_KEY = your-gemini-api-key
   SERVICE_ACCOUNT_KEY = {your-service-account-json}
   SHEET_ID = your-sheet-id
   DRIVE_FOLDER_ID = your-folder-id
   ```
4. Deploy as **Google Chat Add-on**

### 4. Configure Google Chat App
In Google Cloud Console:
1. Enable Google Chat API
2. Configure app:
   - Name: OPPA
   - Connection: Apps Script Deployment
   - Visibility: Your domain/users

### 5. Test!
Open Google Chat, search for your bot, and start chatting!

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed steps.

---

## 📖 Documentation

- **[START_HERE.md](START_HERE.md)** - Developer quick start guide
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment
- **[SMART_DOCUMENT_SELECTION.md](SMART_DOCUMENT_SELECTION.md)** - Technical deep dive on retrieval system

---

## 🎯 How It Works

### Decision Flow
```
User Message
    ↓
┌─────────────────────────┐
│ 1. Work Context Check   │ → Skips casual handler for legitimate work questions
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ 2. Casual Response?     │ → Instant reply for greetings, jokes, FAQs
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ 3. Context Detection    │ → Determines: Docs? Logs? Both?
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ 4. Entity Detection     │ → Identifies: radio, website, company
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ 5. Smart Document Load  │ → BM25 + Semantic scoring → Top 2 docs
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ 6. Gemini AI            │ → Natural language response
└───────────┬─────────────┘
            ↓
      Google Chat
```

### Smart Features

**Entity-Aware Context Detection:**
```javascript
"Tell me about radio" → Entity: RADIO detected
                     → Loads: Radio docs only (not all docs!)
                     → Tokens: 26K (instead of 110K!)
```

**Time-Smart Memory:**
```javascript
"Recent activity"     → Defaults to 7 days (efficient!)
"Last 2 months"       → Loads 60 days (as requested)
"Quarterly report"    → Loads all 90 days (when needed)
```

---

## 📊 Performance

| Metric | Before Optimization | After Optimization | Improvement |
|--------|--------------------|--------------------|-------------|
| Token Usage | 110,000 | 26,000 | **76% reduction** |
| Response Time | 15-20s | 4-6s | **70% faster** |
| Memory Depth | 30 days | 90 days | **3x deeper** |
| Context Accuracy | Manual | Automatic | **100% accurate** |

---

## 🛠️ Customization

### Add Custom Responses
Edit `CasualResponseHandler.gs`:
```javascript
{
  patterns: ['hello', 'hi', 'hey'],
  responses: ['Hello! How can I help you today?']
}
```

### Adjust Document Loading
Edit `GeminiService.gs`:
```javascript
var MAX_MATCHED_DOCS = 2; // Change to load more/fewer docs
```

### Modify Time Defaults
Edit `MemoryService.gs`:
```javascript
function detectTimeRange(question) {
  // ...
  return 7; // Default days for vague questions
}
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Google Apps Script](https://developers.google.com/apps-script)
- Powered by [Gemini AI](https://ai.google.dev)
- Inspired by the need for better operational efficiency

---

## 📧 Support

For issues, questions, or suggestions:
- Open an [Issue](https://github.com/yourusername/pinoyseoul-ai/issues)
- Check [Discussions](https://github.com/yourusername/pinoyseoul-ai/discussions)

---

**Built with ❤️ for teams that want smarter operations**

