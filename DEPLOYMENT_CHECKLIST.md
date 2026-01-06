# ✅ OPPA Deployment Checklist

## Pre-Deployment (Do this first)

- [ ] **Google Sheet created** at: `https://docs.google.com/spreadsheets/d/1lyVAhQb4g-w42pJmvcKH9sNnVne_iUeeR9_IIm7LrGw/edit`
- [ ] **"MessageLog" tab** created with headers: `Timestamp | Source | Message | Space | Type`
- [ ] **Sheet shared** with `pinoyseoul-ai@pinoyseoul-ai.iam.gserviceaccount.com` as Editor
- [ ] **Test data added** to MessageLog (at least 3-5 sample rows)

---

## Apps Script Setup

- [ ] **New Apps Script project** created at [script.google.com](https://script.google.com)
- [ ] **Project named**: `OPPA Bot`
- [ ] **Files uploaded**:
  - [ ] Code.gs
  - [ ] GeminiService.gs
  - [ ] MemoryService.gs
  - [ ] SheetService.gs
  - [ ] LoggingService.gs
  - [ ] CasualResponseHandler.gs
  - [ ] TellMeMoreHandler.gs
  - [ ] DontKnowHandler.gs
  - [ ] SmartFallbackHandler.gs
  - [ ] appsscript.json
- [ ] **OAuth2 Library added**: `1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF`

---

## Script Properties (Critical!)

Go to **Project Settings** → **Script Properties** and add:

- [ ] **GEMINI_API_KEY**: `AIzaSyAhTB0EmB2qpx5yVQGw3x0RogrssUyXmyw`
- [ ] **SERVICE_ACCOUNT_KEY**: (Paste the entire JSON - see README.md)

---

## Testing (Before Deployment)

Run these test functions in Apps Script:

- [ ] **testServiceAccountAccess** → Should show "✅ Service account access working!"
- [ ] **testGeminiDirectly** → Should show "Hello, the Gemini API is working!"
- [ ] **testGetRecentMessages** → Should show your test messages from Sheet

If any fail, STOP and fix before deploying.

---

## Deployment

- [ ] **Deploy** → New deployment → Add-on
- [ ] **Copy Deployment ID**
- [ ] **Save** and close

---

## Google Chat API Configuration

Go to [Google Cloud Console](https://console.cloud.google.com):

- [ ] **Project**: `pinoyseoul-ai` selected
- [ ] **Google Chat API** enabled
- [ ] **Configuration** opened

### App Settings

- [ ] **App name**: `OPPA`
- [ ] **Avatar URL**: `https://raw.githubusercontent.com/pinoyseoul/psmedia/5786209dde30d4d5eb83fe9634283237aabcd714/oppa.png`
- [ ] **Description**: `Operations Protocol & Planning Assistant`

### Functionality

- [ ] ☑️ **Receive 1:1 messages**
- [ ] ☑️ **Join spaces and group conversations**

### Connection

- [ ] **App URL**: Apps Script project
- [ ] **Deployment ID**: (Paste ID from deployment step)

### Visibility

- [ ] **Make available to**: Specific people/groups → Add `pinoyseoul.com` domain

- [ ] **SAVE**

---

## Final Testing

- [ ] **Open Google Chat**
- [ ] **Search** for "OPPA"
- [ ] **Start conversation**
- [ ] **Send**: "Hello OPPA" → Should get welcome message
- [ ] **Send**: "What happened recently?" → Should see messages from Sheet
- [ ] **Send**: "What did you say about [something]?" → Should search logs

---

## If Everything Works ✅

Your OPPA bot is live! Now you can:

1. **Update your 20+ webhook scripts** to also log to the Sheet
2. **Add more SOPs** to the Drive folder
3. **Start using OPPA** for real operations questions

---

## If Something Fails ❌

### Bot doesn't appear in Chat
- Check Deployment ID is correct in GCP
- Wait 5-10 minutes (Chat API can be slow)
- Check visibility settings (domain allowed?)

### Bot responds but says "no API key"
- Check `GEMINI_API_KEY` in Script Properties
- Make sure you pasted it exactly (no extra spaces)

### Bot says "permission denied"
- Check Sheet is shared with service account
- Run `testServiceAccountAccess()` again
- Check `SERVICE_ACCOUNT_KEY` in Script Properties

### Bot responds but shows no message history
- Check `MessageLog` tab exists in Sheet
- Check you added test data
- Run `testGetRecentMessages()` to debug

---

## Quick Commands Reference

### Test in Apps Script
```
testServiceAccountAccess()  // Test Sheet access
testGeminiDirectly()        // Test AI
testGetRecentMessages()     // Test memory
testOPPAResponse()          // Full integration test
```

### Test in Google Chat
```
"Hello OPPA"                      // Welcome message
"What happened recently?"         // Recent events
"What did you say about planka?"  // Search logs
"What's in the Studio Bible?"     // SOP search
```

---

## Support

If you get stuck, check:
1. Apps Script **Executions** log for errors
2. `README.md` for detailed troubleshooting
3. Google Sheet to verify test data exists

---

**Good luck! 🚀**
