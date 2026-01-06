# 🚀 START HERE - OPPA Quick Start Guide

Welcome to OPPA development! This guide will get you up and running quickly.

---

## 📋 What You Need to Know

### **OPPA's Purpose:**
Help the PinoySeoul team by:
1. Answering questions about company processes
2. Reporting on recent activity and events
3. Providing quick access to information

### **How It Works:**
```
User asks question
    ↓
OPPA decides: Casual response? Knowledge? Activity?
    ↓
Loads relevant context (docs or logs)
    ↓
Gemini AI generates natural answer
    ↓
Responds in Google Chat
```

---

## 🏗️ Project Structure

```
pinoyseoul-ai/
├── Code.gs                    # Main entry, routing, persona
├── GeminiService.gs           # AI + document retrieval
├── MemoryService.gs          # Message log system
├── CasualResponseHandler.gs  # Canned responses
├── T Tell MeMoreHandler.gs      # External redirects
├── DontKnowHandler.gs        # Fallbacks
├── SmartFallbackHandler.gs   # Context suggestions
├── SheetService.gs           # Google Sheets API
├── LoggingService.gs         # Logging utilities
└── appsscript.json           # Configuration
```

---

## 🔧 Development Workflow

### **1. Local Development:**
```
1. Open Google Apps Script editor
2. Make changes to .gs files
3. Click "Deploy" > "Test deployment"
4. Test in Google Chat
5. Check logs in Executions panel
```

### **2. Key Functions to Know:**

| Function | File | Purpose |
|----------|------|---------|
| `onMessage()` | Code.gs | Main webhook handler |
| `handleWithGemini()` | GeminiService.gs | AI processing |
| `detectContextNeeds()` | GeminiService.gs | Routing logic |
| `getRecentMessages()` | MemoryService.gs | Load logs |
| `searchSOPs()` | GeminiService.gs | Load documents |

### **3. Making Changes:**

Want to change how OPPA responds? Edit `Code.gs` line 22 (OPPA_PERSONA)

Want to add a casual response? Edit `CasualResponseHandler.gs`

Want to adjust document loadinglogic? Edit `GeminiService.gs`

---

## 📝 Common Tasks

### **Add a New Casual Response:**
1. Open `CasualResponseHandler.gs`
2. Find the relevant category (greetings, jokes, etc.)
3. Add your pattern and response
4. Test!

### **Adjust Doc Loading:**
1. Open `GeminiService.gs`
2. Find `searchSOPs()` function
3. Modify `MAX_MATCHED_DOCS` (currently 2)
4. Test token usage in logs

### **Change Time Range Default:**
1. Open `MemoryService.gs`
2. Find `detectTimeRange()` function
3. Modify default return value (currently 7 days)
4. Test with vague questions

---

## 🐛 Debugging

### **Check Logs:**
```
Apps Script Editor
→ Executions
→ Click on execution
→ View logs
```

### **What to Look For:**
- `[INFO] onMessage: User question received` - Message received
- `[INFO] handleWithGemini: Context detection complete` - Routing decision
- `[INFO] callGemini: Calling Gemini API` - AI call
- `promptLength: XXXX` - Token usage

### **Common Issues:**

| Problem | Check | Fix |
|---------|-------|-----|
| No response | Execution logs | Check for errors |
| Wrong context | detectContextNeeds() | Adjust keywords |
| Too many tokens | promptLength in logs | Reduce docs loaded |
| Slow response | Execution time | Optimize queries |

---

## 🧪Testing

### **Test Questions:**

**Knowledge (should load docs):**
- "What is our mission?"
- "How do I publish content?"
- "Tell me about Pinoy Seoul Radio"

**Activity (should load logs):**
- "What happened yesterday?"
- "Show me recent updates"
- "Any blog posts this week?"

**Casual (instant response):**
- "Hello"
- "Tell me a joke"
- "Thank you"

### **Monitor:**
1. Response accuracy
2. Token usage (<30K ideal)
3. Response time (<5s ideal)
4. Context routing (logs/docs/both)

---

## 📚 Key Concepts

### **Entity Detection:**
Words like "radio", "website", "company" trigger doc loading even if user says "latest"

### **Smart Defaults:**
Vague "recent" = 7 days (not all 90!) to save tokens

### **Hybrid Scoring:**
BM25 keyword matching + semantic intent = best doc selection

### **Context Routing:**
Activity keywords → logs only
Knowledge keywords → docs only
Both → load both (rare)

---

## 🎯 Best Practices

1. **Always log important decisions** - Use `logInfo()`
2. **Keep functions small** - Single responsibility
3. **Test token usage** - Check logs after changes
4. **Preserve backwards compatibility** - Don't break existing features
5. **Comment complex logic** - Future you will thank you

---

## 🔗 Useful Links

- [Apps Script Documentation](https://developers.google.com/apps-script)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google Chat API](https://developers.google.com/chat)

---

## 💡 Tips

- **Use Ctrl+F** to find functions quickly
- **Check execution logs** for every change
- **Test with real questions** from the team
- **Monitor token usage** to avoid overload
- **Read existing code** before changing

---

## 🆘 Need Help?

1. Check `README.md` for architecture overview
2. Read `SMART_DOCUMENT_SELECTION.md` for retrieval details
3. Look at execution logs for errors
4. Ask the team in Google Chat

---

**Happy coding! 🚀**
