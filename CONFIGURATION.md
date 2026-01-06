# 🔧 Configuration Guide

This file explains all configuration options for OPPA.

---

## 📝 Script Properties

Set these in **Apps Script Editor** → **Project Settings** → **Script Properties**:

### Required Properties:

| Property | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini AI API key | `AIzaSyXXXXXXXXXXXXXXXXXXXX` |
| `SERVICE_ACCOUNT_KEY` | Service account JSON (entire object) | `{"type": "service_account", ...}` |

### Optional Properties:

| Property | Description | Default |
|----------|-------------|---------|
| `CORPUS_ID` | Gemini File Search corpus ID (if using) | N/A |

---

## 🗂️ Code.gs Configuration

### Sheet & Drive IDs

```javascript
// Google Sheet with message logs
const SHEET_ID = 'YOUR_SHEET_ID_HERE';

// Google Drive folder with SOPs/documents
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE';
```

**How to find IDs:**
- **Sheet ID**: From URL: `docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit`
- **Folder ID**: From URL: `drive.google.com/drive/folders/[THIS_IS_THE_ID]`

### AI Model

```javascript
// Gemini model to use
const GEMINI_MODEL = 'gemini-2.0-flash-exp';
```

**Available models:**
- `gemini-2.0-flash-exp` - Latest experimental (recommended)
- `gemini-1.5-flash` - Stable, fast
- `gemini-1.5-pro` - More capable, slower

### OPPA Persona

Customize OPPA's personality and knowledge in `OPPA_PERSONA` (line 22):

```javascript
const OPPA_PERSONA = 'You are OPPA for YourCompany...';
```

**Tips:**
- Include company context
- Define tone (professional, casual, etc.)
- Add specific knowledge domains
- Set response style preferences

---

## ⚙️ GeminiService.gs Configuration

### Document Loading

```javascript
// Maximum documents to load per query
var MAX_MATCHED_DOCS = 2;

// Maximum context size (characters)
const MAX_CONTEXT_SIZE = 100000;
```

**Tuning:**
- **More docs** = Better coverage, more tokens
- **Fewer docs** = Faster, cheaper, but might miss context
- **Sweet spot**: 2-3 docs

### Partial Document Loading

```javascript
//  Load only first N characters per document
var content = readDocumentPartial(file, accessToken, 3000);
```

**Adjust:** Change `3000` to load more/less per doc

---

## 📅 MemoryService.gs Configuration

### Time Range Defaults

```javascript
function detectTimeRange(question) {
  // ...
  return 7; // Default days for vague questions
}
```

**Options:**
- `7` - Last week (recommended for efficiency)
- `14` - Last 2 weeks
- `30` - Last month
- `90` - Full history (use only if needed)

### Maximum History

```javascript
daysBack = daysBack || 90; // Maximum 90 days
```

**Increase** only if you need longer history (more tokens!)

---

## 🎭 CasualResponseHandler.gs Configuration

### Add Custom Responses

```javascript
var responseMap = [
  {
    patterns: ['your-trigger-word'],
    responses: [
      'Your response here',
      'Alternate response'
    ]
  }
];
```

**Example - Add company-specific greeting:**
```javascript
{
  patterns: ['company-name'],
  responses: [
    'Welcome to CompanyName! How can I help?'
  ]
}
```

---

## 🔍 Smart Document Selection Configuration

### Entity Keywords

Edit `extractKeywords()` in GeminiService.gs:

```javascript
// Add your company-specific entities
if (lower.includes('yourproduct')) {
  return ['yourproduct'];
}
```

### BM25 Scoring Weights

Edit `scoreBM25()`:

```javascript
// Exact title match
score += 10;  // Change this weight

// Keyword in filename  
score += 5;   // Change this weight

// Keyword in description
score += 2;   // Change this weight
```

---

## 📊 Logging Configuration

### Log Levels

In `LoggingService.gs`:

```javascript
var LOG_LEVEL = 'INFO'; // Options: 'DEBUG', 'INFO', 'WARN', 'ERROR'
```

**Levels:**
- `DEBUG` - Everything (verbose)
- `INFO` - Normal operations
- `WARN` - Warnings only
- `ERROR` - Errors only

---

## 🚀 Advanced Configuration

### Custom Context Detection

Add industry-specific keywords in `detectContextNeeds()`:

```javascript
var knowledgeKeywords = [
  'how to', 'what is',
  'your-domain-term',  // Add here
  'another-term'       // And here
];
```

### Custom Event Types

Edit `detectEventTypes()` in MemoryService.gs:

```javascript
{
  name: 'YourEventType',
  emoji: '🎯',
  keywords: ['keyword1', 'keyword2'],
  sources: ['source-system'],
  users: []
}
```

---

## 💡 Tips

1. **Start with defaults** - They're optimized for most use cases
2. **Monitor token usage** - Check logs after config changes
3. **Test incrementally** - Change one setting at a time
4. **Document custom changes** - Comment your modifications

---

## 🆘 Troubleshooting

**High token usage?**
→ Reduce `MAX_MATCHED_DOCS` or partial load size

**Incomplete answers?**
→ Increase `MAX_MATCHED_DOCS` or load size

**Slow responses?**
→ Reduce `daysBack` default or doc count

**Missing context?**
→ Add keywords to context detection

---

**Need help?** Check [START_HERE.md](START_HERE.md) or open an Issue!
