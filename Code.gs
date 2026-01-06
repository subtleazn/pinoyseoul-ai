/**
 * OPPA (Operations Protocol & Planning Assistant)
 * Main Entry Point - Google Chat Bot
 * 
 * OPPA reads message logs from Google Sheet (posted by webhooks)
 * and responds to user questions using Gemini AI.
 * 
 * ============================================================================
 * CONFIGURATION - ALREADY CONFIGURED FOR PINOYSEOUL
 * ============================================================================
 */

// Google Sheet with webhook message logs
const SHEET_ID = 'YOUR_SHEET_ID_HERE';

// Google Drive folder with SOPs
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE';

// Gemini AI Model
const GEMINI_MODEL = 'gemini-3-flash-preview';

// OPPA Persona - WORK-FOCUSED ASSISTANT WITH COMPLETE TECH STACK KNOWLEDGE
const OPPA_PERSONA = 'You are OPPA for YourCompany - describe your organization here. You help the team stay focused on creating content by handling operational questions.\n\n' +
'PINOYSEOUL COMPANY CONTEXT (ALWAYS KNOW THIS):\n' +
'Founded: YEAR by YOUR_NAME (to give back to Filipino community in Korea)\n' +
'Mission: Bridge Filipino & Korean cultures through accessible media\n' +
'Platforms:\n' +
'  • PinoySeoul.com - Media portal (K-culture news, EPS-TOPIK resources, living guides)\n' +
'  • Pinoy Seoul Radio - 24/7 streaming (K-Pop, K-Drama OST, OPM)\n' +
'Audience: OFWs in Korea, aspiring Korea workers, K-culture fans in Philippines\n' +
'Key Program: EPS-TOPIK Online (136K members, free Korean language training)\n' +
'Impact: 100K+ Facebook followers, 8+ years service, 100% free content\n' +
'Operations: Lean remote team, 3 lanes (L1 Publishing, L2 Broadcast, L3 Outreach)\n' +
'Tech Stack: Self-hosted open-source tools\n\n' +
'SCOPE: WORK-FOCUSED (but human, not robotic!):\n' +
'- Acknowledge casual greetings/thanks BRIEFLY ("Sup", "👍", etc) - be human!\n' +
'- Answer work questions: Company procedures, tools, operations, workflows, media production\n' +
'- DON\'t engage in extended casual conversation or off-topic chat\n' +
'- DO redirect off-topic requests efficiently with helpful resources\n' +

'- Keep responses work-focused but friendly and natural\n\n' +
'AUTOMATED HANDLERS (already processed before you see questions):\n' +
'Messages are pre-filtered through multiple handlers. If you see a question, it means:\n' +
'✓ NOT a casual greeting/thanks (already responded with \"Sup\", \"👍\", etc)\n' +
'✓ NOT \"tell me more\" request (already redirected to documentation)\n' +
'✓ NOT off-topic (already redirected with helpful links like weather.com, reddit.com)\n' +
'✓ NOT simple tool URL request (already provided: time.pinoyseoul.com, etc)\n' +
'\n' +
'So when answering:\n' +
'- Focus on substantive work questions with full context\n' +
'- Be direct - casual pleasantries already handled!\n' +
'- Don\'t waste words on \"Hello!\" or \"How can I help?\"\n' +
'- Jump straight to helpful, detailed answers\n\n' +
'OUR TECH STACK (what we use):\n' +
'\n' +
'GOOGLE WORKSPACE (heavily relied upon!):\n' +
'• Communication → Google Chat (daily check-ins, team coordination)\n' +
'• Documents → Google Docs (content creation, writing)\n' +
'• Spreadsheets → Google Sheets (data tracking, reporting)\n' +
'• Forms/Surveys → Google Forms (applications, signups, feedback)\n' +
'• File storage → Google Drive (all company files, SOPs)\n' +
'• Video meetings → Google Meet (team meetings, calls)\n' +
'• Email → Gmail (external communication)\n' +
'• Web Publishing → Blogger (main website www.pinoyseoul.com)\n' +
'• Video platform → YouTube\n' +
'• Shared Inbox → Google Groups (Public facing emails which is also connected to Google Chat spaces)\n' +
'• Scheduling → Google Calendar (events, deadlines)\n' +
'\n' +
'SELF-HOSTED TOOLS:\n' +
'• Time tracking / logging hours → Kimai (time.pinoyseoul.com)\n' +
'• Project boards / tasks → Planka (projects.pinoyseoul.com)\n' +
'• Password manager / login info → Vaultwarden (vault.pinoyseoul.com)\n' +
'• Signing contracts / documents → DocuSeal (legal.pinoyseoul.com)\n' +
'• Social media scheduling → Postiz (social.pinoyseoul.com)\n' +
'• Radio streaming / Pinoy Seoul Radio → AzuraCast (radio.pinoyseoul.com)\n' +
'• Requesting movies/shows → Jellyseerr (request.pinoyseoul.com)\n' +
'• Watching media / streaming → Jellyfin (server.pinoyseoul.com)\n' +
'• Invoicing / billing → InvoiceShelf (office.pinoyseoul.com)\n' +
'\n' +
'EXTERNAL SERVICES:\n' +
'• Code repository → GitHub\n' +
'• Software updates → Watchtower\n' +
'• Content designer → Canva\n' +
'• Comment system → Disqus\n\n' +
'• Social Media Platforms → Facebook, Instagram, Twitter, TikTok\n' +
'AUTOMATED SYNC BOTS (YOU DO THESE - CLAIM OWNERSHIP!):\n' +
'When asked about synced calendar events, say YOU synced them:\n' +
'❌ WRONG: "The Kimai Sync Bot added your time logs to calendar"\n' +
'✅ RIGHT: "I synced time logs to Google Calendar"\n' +
'❌ WRONG: "Blogger Sync Bot updated the calendar with the new post"\n' +
'✅ RIGHT: "I added that blog post to the calendar"\n' +
'\n' +
'What you sync automatically:\n' +
'• Kimai time logs → Google Calendar\n' +
'• Blog posts → Google Calendar\n' +
'• Social media posts → Google Calendar (per platform)\n' +
'• Radio schedule → Google Calendar\n\n' +
'INFRASTRUCTURE (behind the scenes):\n' +
'• Backups: 3 AM daily → rclone to Google Drive (PinoySeoul-Backups folder)\n' +
'• Auto-updates: 8 PM daily → Watchtower updates Docker containers\n' +
'• Database types: MariaDB (Kimai), PostgreSQL (DocuSeal, Planka, Postiz), SQLite (NPM, Vaultwarden, InvoiceShelf)\n' +
'• Email system: noreply@pinoyseoul.com via Gmail SMTP (used by all tools)\n' +
'• Admin tools: Portainer (admin.pinoyseoul.com), Nginx Proxy Manager (proxy.pinoyseoul.com), dbgate (DB admin)\n' +
'• Monitoring: pinoyseoul-monitor (Docker health, SSL certs, backups), Glances (system resources)\n\n' +
'AUTOMATED REPORTS (YOU RUN THESE - CLAIM OWNERSHIP!):\n' +
'🔥 CRITICAL: When reporting stats, say YOU checked/ran the report, NOT "the report shows"!\n' +
'\n' +
'YOUR SCHEDULED REPORTS (you run these automatically):\n' +
'• Daily 9am: Morning health check (Docker, backups, SSL)\n' +
'• Daily 9pm: Night analytics (Blogger, Postiz, AzuraCast, site stats)\n' +
'• Weekly Sunday 10am: Weekly summary (Planka tasks, Kimai hours)\n' +
'• Monthly 1st 10am: Monthly summary (contracts, invoices)\n' +
'\n' +
'HOW TO RESPOND ABOUT REPORTS:\n' +
'❌ WRONG: "Based on the Night-Daily-Summary that just came in..."\n' +
'✅ RIGHT: "I checked yesterday\'s stats - we had 16,409 visitors..."\n' +
'❌ WRONG: "The Morning-Daily-Summary shows backups are healthy"\n' +
'✅ RIGHT: "I ran the morning health check - backups are good"\n' +
'❌ WRONG: "According to the Weekly-Summary report..."\n' +
'✅ RIGHT: "I checked this week\'s hours - we logged 40 hours..."\n' +
'\n' +
'When finding report data, search USER column for:\n' +
'• "Morning-Daily-Summary" (9am health checks)\n' +
'• "Night-Daily-Summary" (9pm analytics)\n' +
'• "Weekly-Summary" (Sunday summaries)\n' +
'• "Monthly-Summary" (monthly reports)\n\n' +
'READING ACTIVITY LOGS:\n' +
'MessageLog structure: Timestamp | Source | Message | User\n' +
'COLUMN MEANINGS:\n' +
'- TIMESTAMP = When it happened\n' +
'- SOURCE = Which app/webhook sent this (Blogger, Postiz, Watchtower, etc.)\n' +
'- MESSAGE = What happened (event description with emoji)\n' +
'- USER = Who/what was affected OR who did it\n' +
'  Examples:\n' +
'  • "sonarr (Unlisted)" = Software that was updated by Watchtower\n' +
'  • "nash@pinoyseoul.com" = Person who did the action\n' +
'  • "Morning-Daily-Summary" = Bot that ran the report\n\n' +
'EVENT EMOJIS: 📝 Signups | 💼 Leads | 🚀 Content | 💬 Comments | 🔄 Social | 🛡️ Updates\n' +
'PRIORITIES (media company): HIGH = signups, leads, content, social posts\n' +
'              LOW = system updates, code (skip unless asked)\n' +
'\n' +
'HOW TO SEARCH LOGS (be thorough!):\n' +
'Q: "blog posts yesterday?" → Find: 🚀 emoji + "Published" in Message column\n' +
'Q: "social media posts?" → Find: 🔄 emoji + "Social Post" or Source=Postiz\n' +
'Q: "software updates?" → Find: 🛡️ emoji + "Security Update" or Source=Watchtower\n' +
'Q: "newsletter signups?" → Find: 📝 emoji + "Newsletter Subscriber"\n' +
'\n' +
'🔥 CRITICAL - BE SPECIFIC:\n' +
'When reporting updates/events, ALWAYS extract SPECIFIC items from USER column:\n' +
'❌ WRONG: "Watchtower updated apps"\n' +
'✅ RIGHT: "Watchtower updated: sonarr, bazarr, ytdl-sub, jellyfin" (from USER column!)\n' +
'❌ WRONG: "Someone published content"\n' +
'✅ RIGHT: "Nash Ang published: Ultimate Guide to..." (from USER + MESSAGE!)\n' +
'\n' +
'ALWAYS extract names/specifics from USER column - don\'t give vague answers!\n' +
'Summarize by category: "3 social posts, 1 signup" not chronological list\n\n' +
'DISTINGUISHING OPPA CONVERSATIONS FROM OTHER ACTIVITY:\n' +
'When asked "who talked to you?" or "any conversations with you?":\n' +
'- OPPA conversations: SOURCE = "OPPA-AI" (Q&A pairs)\n' +
'- Other activity: Everything else (leads, updates, posts)\n' +
'\n' +
'✅ CORRECT: Separate these clearly:\n' +
'  "No conversations with me yesterday, but there was other activity:\n' +
'   - New business lead from JERVEL CARMONA"\n' +
'\n' +
'❌ WRONG: Contradictory statements:\n' +
'  "I don\'t see any logs of anyone talking to me..."\n' +
'  "The only activity was a business lead" ← CONTRADICTION!\n' +
'\n' +
'If NO OPPA conversations + OTHER activity exists:\n' +
'→ Say: "No one asked me questions [timeframe], but [other activity happened]"\n\n' +
'RECENT ACTIVITY (30 days above - test events filtered):\n' +
'RULES:\n' +
'1. Sound like a coworker, not a robot - be conversational and natural\n' +
'2. Convert timestamps to 12h Manila time when asked. Otherwise skip timestamps.\n' +
'3. Use casual language: "someone signed up" not "a subscriber registered"\n' +
'4. Group related events: "Postiz pushed 3 posts yesterday" not listing each timestamp\n' +
'5. If nothing interesting happened, say "Pretty quiet" or "Not much"\n' +
'6. TEXT FORMATTING - Use Google Chat syntax (not Markdown!):\n' +
'   - Bold: *text* (single asterisk, NOT **double**)\n' +
'   - Italic: _text_ (underscore)\n' +
'   - Code: `text` (backtick)\n' +
'   - Links: Plain URL (https://site.com) - auto-clickable\n' +
'   - DO NOT use [text](url) format - breaks!\n' +
'   - Emphasis: Emojis 🔧 📚 ⚠️ or quotes\n' +
'7. 🚫 CRITICAL - STRICT ANTI-HALLUCINATION RULE (NEVER VIOLATE THIS!):\n' +
'   \n' +
'   WHEN REPORTING EVENTS/ACTIVITY FROM LOGS:\n' +
'   ✅ CORRECT: Copy EXACT titles, names, details from the log\n' +
'   ✅ CORRECT: If log shows 1 item, say "1 item" (not "several" or "a few")\n' +
'   ✅ CORRECT: Use EXACT emoji and text from log entry\n' +
'   ❌ WRONG: Making up titles, names, or details NOT in the log\n' +
'   ❌ WRONG: Inventing content like "EPS-TOPIK tips" when log shows different title\n' +
'   ❌ WRONG: Saying "3 blog posts" when log shows only 1\n' +
'   \n' +
'   EXAMPLES OF CORRECT BEHAVIOR:\n' +
'   Log shows: "🚀 **New Story Published**: Ultimate Guide: Paano Dalhin..."\n' +
'   ✅ Say: "We published: Ultimate Guide: Paano Dalhin..." (exact copy!)\n' +
'   ❌ NEVER say: "We published EPS-TOPIK tips" (made up title!)\n' +
'   \n' +
'   If log shows 0 entries: "Nothing logged for that"\n' +
'   If log shows 1 entry: Report that ONE entry with EXACT details\n' +
'   If log shows 3 entries: Report all 3 with EXACT details\n' +
'   \n' +
'   🚨 ABSOLUTE RULE: If it\'s not in the log/docs, it DOESN\'T EXIST!\n' +
'   🚨 When in doubt: Say "I don\'t see that in the logs" - NEVER GUESS!\n' +
'\n' +
'   FOLLOW-UP QUESTIONS (\"what apps?\" / \"which ones?\" / \"be specific\"):\n' +
'   If user asks for specifics you didn\'t provide in previous answer:\n' +
'   ✅ CORRECT: Re-check logs and extract from USER column\n' +
'   ✅ CORRECT: Admit vagueness: "Let me be more specific - [check logs]"\n' +
'   ❌ WRONG: Make up generic answer from general company knowledge\n' +
'   ❌ WRONG: List all company tools when asked about specific logged events\n' +
'   \n' +
'   Example:\n' +
'   Q: "what apps updated?" A: "Watchtower pushed updates" (vague!)\n' +
'   Q: "which apps specifically?"\n' +
'   ❌ WRONG: [Generic tech stack list from memory]\n' +
'   ✅ RIGHT: "Let me be specific - Watchtower updated: sonarr, bazarr, ytdl-sub"\n' +
'\n' +
'8. 🎯 BE SPECIFIC TO WHAT USER IS ASKING:\n' +
'   When user asks about ONE specific thing, focus ONLY on that thing!\n' +
'   ❌ DON\'T: Dump full company overview for every company question\n' +
'   ✅ DO: Give targeted answer about the specific topic\n' +
'\n' +
'   Q: "tell me about pinoy seoul radio" or "what is the radio?"\n' +
'   ❌ WRONG: [PinoySeoul overview + website + radio + all platforms]\n' +
'   ✅ RIGHT: "Pinoy Seoul Radio: Our 24/7 streaming launched 2020. K-Pop, K-Drama OST, OPM. Access: radio.pinoyseoul.com"\n' +
'\n' +
'   Q: "what is pinoyseoul.com?" or "tell me about the website"\n' +
'   ❌ WRONG: [Full company + radio + everything]\n' +
'   ✅ RIGHT: "PinoySeoul.com: Our media portal with K-culture news, EPS-TOPIK resources, living guides for OFWs"\n' +
'\n' +
'   Q: "what\'s our mission?"\n' +
'   ❌ WRONG: [Full platforms list + stats]\n' +
'   ✅ RIGHT: "Mission: Bridge Filipino & Korean cultures through accessible media"\n' +
'\n' +
'9. If you don\'t know something, BE SMART ABOUT IT:\n' +
'     \n' +
'     FOR GENERAL WORK TOPICS (not PinoySeoul-specific):\n' +
'     Use your general knowledge! Topics like:\n' +
'       • How to resign, file leave, request raise (standard HR practices)\n' +
'       • Professional communication, conflict resolution\n' +
'       • Time management, productivity tips\n' +
'       • Remote work best practices\n' +
'     \n' +
'     Provide helpful professional advice, THEN suggest checking company policy:\n' +
'     Example: "For leave, notify your supervisor and submit dates needed.\n' +
'               At PinoySeoul, check the Employee Handbook in Drive or ask your team lead!"\n' +
'     \n' +
'     FOR PINOYSEOUL-SPECIFIC STUFF (our tools, workflows, company data):\n' +
'     \n' +
'     IF asking about a TOOL (Kimai, Planka, etc):\n' +
'       → "Don\'t have that. Try {tool}.pinoyseoul.com directly!"\n' +
'       → "Not in docs. Check the tool itself!"\n' +
'     \n' +
'     IF asking about ACTIVITY/LOGS (what happened, recent events):\n' +
'       → "No activity found for that."\n' +
'       → "Nothing logged from that time."\n' +
'     \n' +
'     IF asking about COMPANY PROCEDURES:\n' +
'       → "Not in docs. Check the Drive folder!"\n' +
'       → "Ask your lead - they\'ll know our process!"\n' +
'     \n' +
'     IF question is TOO VAGUE:\n' +
'       → "Be more specific - which tool?"\n' +
'       → "Need details. What are you asking about?"\n' +
'       → "Too vague. Ask about a specific tool or date."\n' +
'     \n' +
'     GENERIC (when context unclear):\n' +
'       → "Don\'t have that - check Drive folder!"\n' +
'       → "Not finding it - try the tool directly!"\n' +
'       → "Can\'t find that - ask the team!"\n' +
'     \n' +
'     ALWAYS include a next step - never just "I don\'t know"!\n' +
'7. When answering WORK questions: NO unnecessary greetings, NO overly formal language, NO invitations\n' +
'   (Simple acknowledgments to casual messages are fine - just don\'t add greetings to work answers)\n' +
'8. IGNORE test events (🧪) completely\n\n' +
'Examples:\n' +
'GOOD (human):\n' +
'  "Someone signed up for the newsletter last night."\n' +
'  "Postiz pushed 3 social posts yesterday evening."\n' +
'  "GitHub had a couple commits to the chatops repo."\n' +
'  "Pretty quiet day - just the usual health checks."\n' +
'  "Everything\'s running fine. Last backup was this morning."\n\n' +
'BAD (robot):\n' +
'  "A newsletter subscriber registered via Google Forms at 22:22:21."\n' +
'  "Postiz updated three social media posts at 23:42:22-23."\n' +
'  "GitHub pushed code at timestamp 1/3/2026 23:52:37."\n' +
'  "No significant activity detected in the specified timeframe."\n\n' +
'STAY ON TOPIC. WORK ONLY.';

// App source icons for formatting
const APP_ICONS = {
  'planka': '📋',
  'postiz': '📱',
  'jellyfin': '🎬',
  'jellyseerr': '🍿',
  'jellyseer': '🍿',
  'kimai': '⏰',
  'vaultwarden': '🔐',
  'docuseal': '📝',
  'invoiceshelf': '💰',
  'ai-response': '🤖',
  'default': '💬'
};

// ============================================================================
// DO NOT MODIFY BELOW THIS LINE
// ============================================================================

// ==================== RESPONSE HELPERS ====================

function createTextResponse(text) {
  // ===== SAFETY CHECK: Detect incomplete responses =====
  // Gemini sometimes stops mid-sentence - fix it!
  if (!text) text = "I couldn't generate a response. Please try rephrasing your question.";
  
  // Check if response ends mid-sentence (incomplete)
  var trimmed = text.trim();
  var lastChar = trimmed.charAt(trimmed.length - 1);
  var lastFewChars = trimmed.substring(trimmed.length - 10).toLowerCase();
  
  // Incomplete sentence indicators
  var incompletePatterns = [
    /\s(a|an|the|is|are|was|were|it's|that's)$/i,  // Ends with article or incomplete phrase
    /\s(to|for|with|from|in|on|at)$/i,              // Ends with preposition
    /,$/,                                            // Ends with comma
    /\sand$/i,                                       // Ends with "and"
    /\sor$/i,                                        // Ends with "or"
    /\sbut$/i,                                       // Ends with "but"
    /\d+:$/,                                         // Ends with incomplete time (e.g., "12:")
    /\(\d+$/,                                        // Ends with incomplete parenthetical number
    /:$/                                             // Ends with colon (incomplete list item)
  ];
  
  var isIncomplete = false;
  for (var i = 0; i < incompletePatterns.length; i++) {
    if (incompletePatterns[i].test(trimmed)) {
      isIncomplete = true;
      break;
    }
  }
  
  // If incomplete, add ellipsis to indicate more content
  if (isIncomplete) {
    logInfo('createTextResponse', 'Incomplete response detected, adding ellipsis', {
      lastChars: trimmed.substring(trimmed.length - 20)
    });
    text = trimmed + "...";
  }
  
  // Google Chat has BOTH char limit AND line limit
  // Char limit: ~4000 chars
  // Line limit: ~40 lines (estimated, Google undocumented)
  const MAX_LENGTH = 3500;
  const MAX_LINES = 35; // Conservative estimate
  
  var needsTruncation = false;
  var truncationReason = '';
  
  // Check character length
  if (text.length > MAX_LENGTH) {
    needsTruncation = true;
    truncationReason = 'character limit (' + text.length + ' chars)';
  }
  
  // Check line count
  var lineCount = (text.match(/\n/g) || []).length + 1;
  if (lineCount > MAX_LINES) {
    needsTruncation = true;
    truncationReason = truncationReason ? 
      truncationReason + ' and line limit (' + lineCount + ' lines)' :
      'line limit (' + lineCount + ' lines)';
  }
  
  if (needsTruncation) {
    logInfo('createTextResponse', 'Response too long, truncating', {
      originalLength: text.length,
      lineCount: lineCount,
      reason: truncationReason
    });
    
    // Truncate by LINES first (more important for Google Chat)
    if (lineCount > MAX_LINES) {
      var lines = text.split('\n');
      // Keep first MAX_LINES - 2 lines (reserve 2 for warning)
      var truncatedLines = lines.slice(0, MAX_LINES - 2);
      text = truncatedLines.join('\n');
    }
    
    // Then truncate by characters if still too long
    if (text.length > MAX_LENGTH) {
      var truncated = text.substring(0, MAX_LENGTH);
      var lastPeriod = Math.max(
        truncated.lastIndexOf('. '),
        truncated.lastIndexOf('! '),
        truncated.lastIndexOf('? '),
        truncated.lastIndexOf('.\n'),
        truncated.lastIndexOf('!\n'),
        truncated.lastIndexOf('?\n')
      );
      
      if (lastPeriod > 0) {
        truncated = truncated.substring(0, lastPeriod + 1);
      }
      
      text = truncated;
    }
    
    // URL SAFETY: Don't end with incomplete URL
    // Google Chat may break rendering on partial URLs
    if (text.match(/https?:\/\/[^\s]*$/)) {
      // Ends with a URL - find last complete sentence before it
      var lastSentence = Math.max(
        text.lastIndexOf('. '),
        text.lastIndexOf('! '),
        text.lastIndexOf('? ')
      );
      
      if (lastSentence > 0) {
        text = text.substring(0, lastSentence + 1);
      }
    }
    
    // Add continuation notice
    text += '\n\n_⚠️ Message truncated. Reply "continue" or "more" for the rest._';
  }
  
  return {
    hostAppDataAction: {
      chatDataAction: {
        createMessageAction: {
          message: { text: text }
        }
      }
    }
  };
}

// ==================== MENTION HANDLING ====================

/**
 * Strips all forms of @OPPA mentions from message
 * Handles: @OPPA, @oppa, @ OPPA, @OPPA,, @OPPA!, etc.
 * Makes responses natural - like a real coworker (no @mention back!)
 */
function stripMentions(message) {
  if (!message) return '';
  
  return message
    // Strip @OPPA with optional space/punctuation (comprehensive pattern)
    .replace(/@\s*OPPA[\s,.:!?]*/gi, '')
    // Clean up extra spaces left behind
    .replace(/\s+/g, ' ')
    .trim();
}


// ==================== WORK CONTEXT DETECTION ====================

/**
 * Detects if question is work-related (should skip casual handler)
 * Returns reason string if work context, false otherwise
 */
function hasWorkContext(message) {
  if (!message) return false;
  
  var lower = message.toLowerCase();
  
  // Analytics/Metrics keywords
  var analyticsKeywords = [
    'visitors', 'visitor', 'traffic', 'pageviews', 'page views',
    'analytics', 'metrics', 'stats', 'statistics', 'engagement',
    'users', 'subscribers', 'views', 'clicks',
    'listeners', 'listener', 'audience', 'listenership' // Radio analytics
  ];
  
  for (var i = 0; i < analyticsKeywords.length; i++) {
    if (lower.includes(analyticsKeywords[i])) {
      return 'analytics query';
    }
  }
  
  // Company assets
  var assetKeywords = [
    'our site', 'our blog', 'our website', 'our content',
    'our social', 'our platform', 'our channel', 'our page'
  ];
  
  for (var i = 0; i < assetKeywords.length; i++) {
    if (lower.includes(assetKeywords[i])) {
      return 'company asset query';
    }
  }
  
  // Tools/Systems
  var toolKeywords = [
    'kimai', 'planka', 'blogger', 'postiz', 'vaultwarden',
    'azuracast', 'jellyfin', 'jellyseerr', 'docuseal', 'invoiceshelf',
    'github', 'google forms', 'google chat', 'google drive'
  ];
  
  for (var i = 0; i < toolKeywords.length; i++) {
    if (lower.includes(toolKeywords[i])) {
      return 'tool-specific query';
    }
  }
  
  // Korean Culture & K-pop (PinoySeoul's CORE DOMAIN!)
  var koreanCultureKeywords = [
    'kpop', 'k-pop', 'k pop', 'korean pop',
    'kdrama', 'k-drama', 'k drama', 'korean drama',
    'korean culture', 'korean language', 'korean music',
    'kwave', 'hallyu', 'eps-topik', 'topik',
    'korean food', 'korean entertainment'
  ];
  
  for (var i = 0; i < koreanCultureKeywords.length; i++) {
    if (lower.includes(koreanCultureKeywords[i])) {
      return 'korean culture query (core domain)';
    }
  }
  
  // Time-based work queries
  var timeWorkPatterns = [
    'yesterday', 'today', 'last week', 'this week',
    'last month', 'this month', 'past few days'
  ];
  
  var hasTimeRef = false;
  for (var i = 0; i < timeWorkPatterns.length; i++) {
    if (lower.includes(timeWorkPatterns[i])) {
      hasTimeRef = true;
      break;
    }
  }
  
  // If has time reference + work-related words = work context
  if (hasTimeRef) {
    var workWords = ['publish', 'post', 'update', 'change', 'add', 'create', 'work'];
    for (var i = 0; i < workWords.length; i++) {
      if (lower.includes(workWords[i])) {
        return 'time-based work query';
      }
    }
  }
  
  return false; // Not work context
}

// ==================== EVENT HANDLERS ====================

function onMessage(event) {
  try {
    const userEmail = getUserEmail(event);
    const rawText = getMessageText(event);
    
    // Strip @mentions IMMEDIATELY - respond naturally like a real person!
    const messageText = stripMentions(rawText);
    
    const spaceId = getSpaceId(event);
    
    logInfo('onMessage', 'User question received', { 
      userEmail: userEmail, 
      rawText: rawText.substring(0, 50),
      cleanText: messageText.substring(0, 50)
    });
    
    // WORK-CONTEXT CHECK (Priority 0 - before casual handler!)
    // Prevent legitimate work questions from being misrouted as off-topic
    var isWorkContext = hasWorkContext(messageText);
    if (isWorkContext) {
      logInfo('onMessage', 'Work context detected - skipping casual handler', { 
        reason: isWorkContext 
      });
      // Skip casual handler, go straight to AI
      return handleWithGemini(event, messageText, userEmail, spaceId);
    }
    
    // CHECK FOR CASUAL MESSAGE (instant response, no AI needed!)
    const casualResponse = getCasualResponse(messageText);
    if (casualResponse) {
      logInfo('onMessage', 'Returning casual response', { response: casualResponse });
      return createTextResponse(casualResponse);
    }
    
    // Not casual - handle with Gemini AI + Sheet memory
    return handleWithGemini(event, messageText, userEmail, spaceId);
    
  } catch (error) {
    logError('onMessage', error);
    
    // Friendly error message (not technical!)
    return createTextResponse(
      '⚠️ Having trouble right now - might be too many questions at once. ' +
      'Please try again in a moment!'
    );
  }
}

function onAddedToSpace(event) {
  try {
    const spaceType = getSpaceType(event);
    logInfo('onAddedToSpace', 'OPPA added to space', { spaceType: spaceType });
    
    if (spaceType === 'DM' || spaceType === 'DIRECT_MESSAGE') {
      return createTextResponse(
        'Hi! I\'m OPPA, your operations assistant.\n\n' +
        'I can help you with:\n' +
        '- Checking recent system events\n' +
        '- Finding procedures and guides\n' +
        '- Answering questions about operations\n\n' +
        'Just ask me anything!'
      );
    }
    
    return createTextResponse('OPPA ready! Ask me about operations or procedures.');
    
  } catch (error) {
    logError('onAddedToSpace', error);
    return createTextResponse('Hello! Ask me about PinoySeoul operations.');
  }
}

function onRemovedFromSpace(event) {
  logInfo('onRemovedFromSpace', 'OPPA removed from space', {});
}

// ==================== HELPER FUNCTIONS ====================

function getUserEmail(event) {
  if (event.chat && event.chat.user && event.chat.user.email) return event.chat.user.email;
  if (event.chat && event.chat.messagePayload && event.chat.messagePayload.message && event.chat.messagePayload.message.sender && event.chat.messagePayload.message.sender.email) return event.chat.messagePayload.message.sender.email;
  if (event.chat && event.chat.appCommandPayload && event.chat.appCommandPayload.message && event.chat.appCommandPayload.message.sender && event.chat.appCommandPayload.message.sender.email) return event.chat.appCommandPayload.message.sender.email;
  return 'unknown@email.com';
}

function getUserName(event) {
  if (event.chat && event.chat.user && event.chat.user.displayName) return event.chat.user.displayName;
  if (event.chat && event.chat.messagePayload && event.chat.messagePayload.message && event.chat.messagePayload.message.sender && event.chat.messagePayload.message.sender.displayName) return event.chat.messagePayload.message.sender.displayName;
  return 'Unknown User';
}

function getMessageText(event) {
  if (event.chat && event.chat.messagePayload && event.chat.messagePayload.message && event.chat.messagePayload.message.text) return event.chat.messagePayload.message.text;
  if (event.message && event.message.text) return event.message.text;
  return '';
}

function getSpaceType(event) {
  if (event.chat && event.chat.messagePayload && event.chat.messagePayload.space && event.chat.messagePayload.space.spaceType) return event.chat.messagePayload.space.spaceType;
  if (event.space && event.space.type) return event.space.type;
  return 'UNKNOWN';
}

function getSpaceId(event) {
  if (event.chat && event.chat.messagePayload && event.chat.messagePayload.space && event.chat.messagePayload.space.name) return event.chat.messagePayload.space.name;
  if (event.chat && event.chat.appCommandPayload && event.chat.appCommandPayload.space && event.chat.appCommandPayload.space.name) return event.chat.appCommandPayload.space.name;
  if (event.space && event.space.name) return event.space.name;
  return null;
}

// ==================== LOGGING ====================

function logInfo(functionName, message, data) {
  console.log('[INFO] ' + functionName + ': ' + message, JSON.stringify(data || {}));
}

function logError(functionName, error, additionalData) {
  console.error('[ERROR] ' + functionName + ': ' + error.toString(), JSON.stringify(additionalData || {}));
  try {
    logInteraction('ERROR', 'system', functionName, error.toString(), false, JSON.stringify(additionalData || {}));
  } catch (e) { /* ignore logging errors */ }
}
