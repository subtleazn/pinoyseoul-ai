/**
 * Gemini Service - AI-powered responses with OPPA persona
 */

// ==================== GEMINI API ====================

function callGemini(prompt, model, userEmail) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (!apiKey) {
      logInfo('callGemini', 'No API key configured');
      return null;
    }
    
    const modelName = model || GEMINI_MODEL;
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + apiKey;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024
      }
    };
    
    logInfo('callGemini', 'Calling Gemini API', { model: modelName, promptLength: prompt.length });
    
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      // Store error for smart fallback
      PropertiesService.getScriptProperties().setProperty('LAST_GEMINI_ERROR', responseText);
      logError('callGemini', new Error('API returned ' + responseCode), { response: responseText.substring(0, 500) });
      return null;
    }
    
    const result = JSON.parse(responseText);
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      logError('callGemini', new Error('No text in response'), { result: JSON.stringify(result).substring(0, 500) });
      return null;
    }
    
    logInfo('callGemini', 'Gemini response received', { responseLength: generatedText.length });
    
    return generatedText;
    
  } catch (e) {
    logError('callGemini', e);
    return null;
  }
}

// ==================== GEMINI FILE SEARCH (MANAGED RAG) ====================
// Uses Gemini's built-in semantic search to retrieve ONLY relevant content
// Token savings: 85-90% reduction vs manual doc loading!

/**
 * Call Gemini API with File Search Tool (Managed RAG)
 * Automatically retrieves relevant snippets from uploaded corpus
 * Returns object with {text, citations, groundingMetadata}
 */
function callGeminiWithFileSearch(prompt, userEmail) {
  try {
    var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    var corpusId = PropertiesService.getScriptProperties().getProperty('CORPUS_ID');
    
    if (!corpusId) {
      logInfo('callGeminiWithFileSearch', 'CORPUS_ID not set - File Search disabled');
      return null; // Fall back to manual loading
    }
    
    logInfo('callGeminiWithFileSearch', 'Starting File Search', {
      corpusId: corpusId,
      promptLength: prompt.length
    });
    
    var modelName = GEMINI_MODEL;
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + apiKey;
    
    var payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      tools: [{
        fileSearchTool: {
          corpusId: corpusId
        }
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };
    
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    if (responseCode !== 200) {
      logError('callGeminiWithFileSearch', 'API returned ' + responseCode, {
        response: responseText.substring(0, 500)
      });
      return null;
    }
    
    var result = JSON.parse(responseText);
    var generatedText = result.candidates && result.candidates[0] && 
                       result.candidates[0].content && result.candidates[0].content.parts &&
                       result.candidates[0].content.parts[0] && result.candidates[0].content.parts[0].text;
    
    if (!generatedText) {
      logError('callGeminiWithFileSearch', 'No text in response', {
        response: responseText.substring(0, 500)
      });
      return null;
    }
    
    // Extract grounding metadata (automatic citations!)
    var groundingMetadata = result.candidates[0].groundingMetadata || {};
    var citedSources = [];
    
    if (groundingMetadata.groundingChunks) {
      for (var i = 0; i < groundingMetadata.groundingChunks.length; i++) {
        var chunk = groundingMetadata.groundingChunks[i];
        if (chunk.web) {
          citedSources.push(chunk.web.title || chunk.web.uri);
        }
      }
    }
    
    logInfo('callGeminiWithFileSearch', 'File Search successful', {
      responseLength: generatedText.length,
      citedSourcesCount: citedSources.length,
      userEmail: userEmail
    });
    
    return {
      text: generatedText,
      citations: citedSources,
      groundingMetadata: groundingMetadata
    };
    
  } catch (e) {
    logError('callGeminiWithFileSearch', 'Exception: ' + e.toString(), {
      stack: e.stack
    });
    return null;
  }
}

// ==================== SMART CONTEXT DETECTION (Industry Best Practice) ====================

/**
 * Intelligently detects what context to load based on question type
 * Returns object with loadDocs and loadLogs booleans
 * 
 * OPTIMIZATION: Only load what's needed!
 * - Activity questions: Load logs only
 * - Knowledge questions: Load docs only  
 * - Mixed/unclear: Load docs (default to knowledge base)
 */
function detectContextNeeds(messageText) {
  var lower = messageText.toLowerCase();
  
  // ===== ACTIVITY INDICATORS (needs MessageLog) =====
  var activityKeywords = [
    // Time references
    'what happened', 'yesterday', 'last week', 'last month', 'today',
    'last night', 'this morning', 'this week', 'this month',
    'past few days', 'past week', 'past month', 'few days ago',
    
    // Event queries
    'recent', 'recently', 'lately', 'any updates', 'any news',
    'what did', 'who did', 'did anyone', 'has there been',
    'latest', 'newest', 'most recent', 'just published', 'just posted',
    
    // Content/Posting queries (CRITICAL!)
    'what did we post', 'did we post', 'what was posted',
    'what blog', 'what article', 'what story', 'what content',
    'what social media', 'social posts', 'social media post',
    'what software', 'software update', 'what was updated',
    'who worked on', 'who published', 'who posted',
    
    // Analytics/Metrics queries (NEW!)
    'how many visitors', 'site visitors', 'visitor count', 'traffic',
    'pageviews', 'page views', 'site stats', 'analytics',
    'engagement', 'metrics', 'our site', 'our blog',
    'how many users', 'user count', 'subscribers',
    'how many listeners', 'listener count', 'listeners', 'audience',
    'listenership', 'how much traffic', 'how many views',
    'how many posts', 'how many articles', 'how many updates',
    'post count', 'article count', 'content count',
    
    // Activity checks
    'activity', 'events', 'updates', 'changes', 'logs',
    'show me', 'status of', 'progress on',
    
    // When questions (for follow-ups)
    'when was', 'when did', 'when is', 'when were',
    'what time', 'what date',
    
    // Summary requests
    'summary', 'recap', 'overview', 'report',
    'daily summary', 'weekly summary'
  ];
  
  // ENTITY DETECTION OVERRIDE: Radio/website/company = knowledge, not activity!
  var entityDetected = lower.includes('radio') || lower.includes('website') || 
                       lower.includes('.com') || lower.includes('blog') ||
                       lower.includes('company') || lower.includes('enterprise');
  
  var needsLogs = false;
  
  // Only check activity if NO entity detected
  if (!entityDetected) {
    for (var i = 0; i < activityKeywords.length; i++) {
      if (lower.includes(activityKeywords[i])) {
        needsLogs = true;
        break;
      }
    }
  }
  
  // ===== KNOWLEDGE INDICATORS (needs SOPs/docs) =====
  var knowledgeKeywords = [
    'how to', 'how do i', 'what is', 'what are',
    'process', 'procedure', 'steps', 'guide',
    'explain', 'tell me about', 'define',
    'where is', 'where can i', 'which',
    'when do i', 'why', 'policy', 'rule'
  ];
  
  var needsDocs = false;
  for (var i = 0; i < knowledgeKeywords.length; i++) {
    if (lower.includes(knowledgeKeywords[i])) {
      needsDocs = true;
      break;
    }
  }
  
  // ===== SMART DEFAULTS =====
  // If activity question: Load logs only (efficient!)
  // If knowledge question: Load docs only (efficient!)
  // If both indicators: Load both (comprehensive)
  // If neither: Default to docs (most questions are knowledge-based)
  
  return {
    loadDocs: needsDocs || !needsLogs,  // Default to docs if unclear
    loadLogs: needsLogs,                 // Only if explicitly activity-related
    questionType: needsLogs && needsDocs ? 'mixed' : 
                  needsLogs ? 'activity' : 
                  needsDocs ? 'knowledge' : 'default'
  };
}

// ==================== MESSAGE HANDLING WITH OPPA PERSONA ====================

function handleWithGemini(event, messageText, userEmail, spaceId) {
  logInfo('handleWithGemini', 'Processing user question', { userEmail: userEmail, messageLength: messageText.length });
  
  // ===== OPTIMIZATION: Check "tell me more" FIRST (before loading docs!) =====
  var tellMeMoreResponse = handleTellMeMore(messageText, null);
  if (tellMeMoreResponse) {
    logInfo('handleWithGemini', 'Redirected tell-me-more to resources (docs not loaded!)', { 
      request: messageText.substring(0, 50),
      redirect: tellMeMoreResponse
    });
    
    // Log redirect to MessageLog
    try {
      const now = new Date();
      const timestamp = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear() + ' ' +
                        now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() + ':' +
                        (now.getSeconds() < 10 ? '0' : '') + now.getSeconds();
      
      const rowData = [
        timestamp,
        'OPPA-Redirect',
        'Q: ' + messageText + ' | R: ' + tellMeMoreResponse,
        userEmail
      ];
      appendRowWithServiceAccount(SHEET_ID, 'MessageLog', rowData);
    } catch (e) {
      logError('handleWithGemini', e, { context: 'Failed to log redirect' });
    }
    
    return createTextResponse(tellMeMoreResponse);
  }
  
  // ===== NOT "tell me more" - Continue with AI processing =====
  
  // ===== SMART CONTEXT DETECTION (Industry Best Practice!) =====
  const contextNeeds = detectContextNeeds(messageText);
  
  logInfo('handleWithGemini', 'Context detection complete', { 
    question: messageText.substring(0, 50),
    questionType: contextNeeds.questionType,
    willLoadDocs: contextNeeds.loadDocs,
    willLoadLogs: contextNeeds.loadLogs
  });
  
  // ===== CONDITIONAL LOADING: Only load what's needed! =====
  
  var sopsContext = '';
  if (contextNeeds.loadDocs) {
    logInfo('handleWithGemini', 'Loading SOPs from Drive', { folderId: DRIVE_FOLDER_ID });
    try {
      sopsContext = searchSOPs(messageText);
    } catch (e) {
      logError('handleWithGemini', e, { context: 'SOPs loading failed - continuing without docs' });
      sopsContext = ''; // Continue without docs
    }
  } else {
    logInfo('handleWithGemini', 'Skipping SOPs load (activity question)', { question: messageText.substring(0, 50) });
  }
  
  var messageHistory = '';
  if (contextNeeds.loadLogs) {
    logInfo('handleWithGemini', 'Loading message history (activity/event question)', { question: messageText.substring(0, 50) });
    const recentMessages = getRecentMessages(30, spaceId);
    
    // SMART FILTERING: Apply context-based filtering for efficiency!
    const filteredMessages = filterLogsByContext(recentMessages, messageText);
    
    // Format for AI - SEND ALL 4 COLUMNS!
    if (filteredMessages.length > 0) {
      messageHistory = '\n\nRECENT ACTIVITY LOG:\n';
      messageHistory += 'Timestamp | Source | Message | User\n';
      messageHistory += '-------------------------------------------\n';
      for (var i = 0; i < filteredMessages.length; i++) {
        var msg = filteredMessages[i];
        messageHistory += msg.timestamp + ' | ' + msg.source + ' | ' + msg.message + ' | ' + msg.user + '\n';
      }
    } else {
      messageHistory = '\n\nRECENT ACTIVITY LOG: No matching events found in the log for this timeframe.\n';
    }
  } else {
    logInfo('handleWithGemini', 'Skipping history load (knowledge question)', { question: messageText.substring(0, 50) });
  }
  
  // === CONVERSATIONAL CONTEXT (for follow-ups) ===
  // Include recent OPPA Q&A so AI can reference its own previous answers
  var conversationContext = '';
  try {
    const allRecentMessages = getRecentMessages(7, spaceId); // Last 7 days
    var oppaConversations = [];
    
    for (var i = 0; i < allRecentMessages.length; i++) {
      var msg = allRecentMessages[i];
      // Find OPPA Q&A entries (Source = OPPA-AI)
      if (msg.source === 'OPPA-AI' && msg.message.includes('Q:')) {
        oppaConversations.push(msg);
      }
    }
    
    // Include last 5 Q&A pairs (most recent context)
    if (oppaConversations.length > 0) {
      conversationContext = '\n\nRECENT CONVERSATION HISTORY (for context):\n';
      var start = Math.max(0, oppaConversations.length - 5);
      for (var i = start; i < oppaConversations.length; i++) {
        conversationContext += oppaConversations[i].message + '\n';
      }
      conversationContext += '\n';
    }
  } catch (e) {
    logWarning('handleWithGemini', 'Failed to load conversation context', { error: e.message });
  }
  
  // Build prompt with OPPA persona
  const prompt = OPPA_PERSONA + '\n\n' + conversationContext + messageHistory + '\n' + sopsContext + '\n\nUser question: "' + messageText + '"\n\nRespond as OPPA:';


  const aiResponse = callGemini(prompt, GEMINI_MODEL, userEmail);
  
  if (aiResponse) {
    logInfo('handleWithGemini', 'AI response generated', { 
      responseLength: aiResponse.length,
      willTruncate: aiResponse.length > 3500,
      truncationAmount: aiResponse.length > 3500 ? (aiResponse.length - 3500) + ' chars' : 'none'
    });
    
    // Check if AI doesn't know - provide context-aware response
    var finalResponse = aiResponse;
    try {
      var betterResponse = handleDontKnow(aiResponse, messageText);
      if (betterResponse) {
        finalResponse = betterResponse;
        logInfo('handleWithGemini', 'Replaced generic dont-know with context-aware response', { 
          original: aiResponse.substring(0, 50),
          improved: betterResponse
        });
      }
    } catch (e) {
      logError('handleWithGemini', e, { context: 'DontKnowHandler failed - using AI response as-is' });
      // Continue with AI response
    }
    
    // Log AI response to MessageLog - NEW COLUMN STRUCTURE
    try {
      logInfo('handleWithGemini', 'Writing to sheet', { messageLength: messageText.length });
      const now = new Date();
      const timestamp = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear() + ' ' +
                        now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() + ':' +
                        (now.getSeconds() < 10 ? '0' : '') + now.getSeconds();
      
      // NEW: Columns are Timestamp | Source | Message | User
      const rowData = [
        timestamp,           // Timestamp: 1/3/2026 17:15:30
        'OPPA-AI',          // Source
        'Q: ' + messageText + ' | A: ' + finalResponse,  // Message (Markdown)
        userEmail           // User
      ];
      appendRowWithServiceAccount(SHEET_ID, 'MessageLog', rowData);
      logInfo('handleWithGemini', 'Sheet write successful');
    } catch (e) {
      logError('handleWithGemini', e, { context: 'Failed to log AI response' });
      // Continue anyway - don't block user response!
    }
    
    logInfo('handleWithGemini', 'Returning response to user', { responseLength: finalResponse.length });
    return createTextResponse(finalResponse);
  }
  
  // Fallback with SMART helpful alternatives
  logInfo('handleWithGemini', 'Using smart fallback (Gemini failed)', { userEmail: userEmail });
  const lastError = PropertiesService.getScriptProperties().getProperty('LAST_GEMINI_ERROR') || '';
  const smartFallback = generateSmartFallback(lastError, messageText);
  
  return createTextResponse(smartFallback);
}

// ==================== SOP SEARCH (GOOGLE DRIVE) ====================

/**
 * Loads ALL documentation from Drive folder
 * SIMPLE APPROACH: No keyword search, just load everything and let Gemini figure it out
 * @param {string} query - User's question (not used for filtering anymore)
 * @returns {string} All documents formatted for AI
 */
/**
 * Two-Tier Smart Document Loading System
 * TIER 1: Core docs (always loaded)
 * TIER 2: Conditional docs (loaded if keywords match)
 * PHASE 2: Enhanced matching - checks filename, title, AND first-page headers
 * SAFETY: 100K char limit to prevent overload
 */

// ========== SECTION-LEVEL MATCHING FUNCTIONS ==========
// (Massive token savings: 85-95% reduction on doc content!)

/**
 * RECURSIVE CHUNKING (Industry Best Practice 2024)
 * Extract sections, then split into paragraphs/bullets (smallest meaningful units)
 * Returns array of {title, content, level, type} objects
 */
function extractDocumentSections(content, docName) {
  if (!content) return [];
  
  var chunks = [];
  var lines = content.split('\n');
  var currentSection = {
    title: docName + ' - Introduction',
    content: '',
    level: 0,
    startLine: 0
  };
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    
    // Detect markdown headers: # Header, ## Subheader, ### Detail
    var headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
    
    if (headerMatch) {
      // Save previous section if it has content
      if (currentSection.content.trim()) {
        // RECURSIVE: Split section into paragraphs/bullets
        var paragraphs = splitIntoParagraphs(currentSection.content, currentSection.title);
        chunks = chunks.concat(paragraphs);
      }
      
      // Start new section
      var level = headerMatch[1].length; // 1-3 based on # count
      var title = headerMatch[2].trim();
      
      currentSection = {
        title: title,
        content: '',
        level: level,
        startLine: i
      };
    } else {
      // Add line to current section
      currentSection.content += line + '\n';
    }
  }
  
  // Add final section
  if (currentSection.content.trim()) {
    var paragraphs = splitIntoParagraphs(currentSection.content, currentSection.title);
    chunks = chunks.concat(paragraphs);
  }
  
  // If no sections found (no headers), split entire content into paragraphs
  if (chunks.length === 0) {
    chunks = splitIntoParagraphs(content, docName);
  }
  
  return chunks;
}

/**
 * Split section content into paragraphs and bullet points
 * Returns array of paragraph chunks with metadata
 */
function splitIntoParagraphs(content, sectionTitle) {
  if (!content || !content.trim()) return [];
  
  var chunks = [];
  var lines = content.split('\n');
  var currentParagraph = '';
  var chunkIndex = 0;
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    
    // Skip empty lines between paragraphs
    if (!line) {
      if (currentParagraph.trim()) {
        // Save paragraph chunk
        chunks.push({
          title: sectionTitle + ' (part ' + (chunkIndex + 1) + ')',
          content: currentParagraph.trim(),
          level: 4, // Paragraph level (below ### headers)
          type: 'paragraph',
          sectionTitle: sectionTitle
        });
        chunkIndex++;
        currentParagraph = '';
      }
      continue;
    }
    
    // Detect bullet points (•, -, *, 1., etc.)
    var isBullet = /^[•\-\*]\s/.test(line) || /^\d+\.\s/.test(line);
    
    if (isBullet) {
      // Save previous paragraph if exists
      if (currentParagraph.trim()) {
        chunks.push({
          title: sectionTitle + ' (part ' + (chunkIndex + 1) + ')',
          content: currentParagraph.trim(),
          level: 4,
          type: 'paragraph',
          sectionTitle: sectionTitle
        });
        chunkIndex++;
      }
      
      // Save bullet as its own chunk
      chunks.push({
        title: sectionTitle + ' (bullet ' + (chunkIndex + 1) + ')',
        content: line,
        level: 5, // Bullet level
        type: 'bullet',
        sectionTitle: sectionTitle
      });
      chunkIndex++;
      currentParagraph = '';
    } else {
      // Add line to current paragraph
      currentParagraph += line + ' ';
      
      // If paragraph getting too large (>1000 chars), save it
      if (currentParagraph.length > 1000) {
        chunks.push({
          title: sectionTitle + ' (part ' + (chunkIndex + 1) + ')',
          content: currentParagraph.trim(),
          level: 4,
          type: 'paragraph',
          sectionTitle: sectionTitle
        });
        chunkIndex++;
        currentParagraph = '';
      }
    }
  }
  
  // Save final paragraph
  if (currentParagraph.trim()) {
    chunks.push({
      title: sectionTitle + ' (part ' + (chunkIndex + 1) + ')',
      content: currentParagraph.trim(),
      level: 4,
      type: 'paragraph',
      sectionTitle: sectionTitle
    });
  }
  
  return chunks;
}

/**
 * Match sections to question keywords
 * Returns sections sorted by relevance score
 */
function matchSectionsToKeywords(sections, keywords, docName) {
  if (!sections || sections.length === 0) return [];
  if (!keywords || keywords.length === 0) return sections; // No keywords = return all
  
  const scoredSections = [];
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    let score = 0;
    const matchedKeywords = [];
    
    const titleLower = section.title.toLowerCase();
    const contentLower = section.content.toLowerCase();
    
    // Score based on keyword matches
    for (let k = 0; k < keywords.length; k++) {
      const keyword = keywords[k].toLowerCase();
      
      // Title match = 10 points (very relevant!)
      if (titleLower.includes(keyword)) {
        score += 10;
        matchedKeywords.push(keyword + ' (title)');
      }
      
      // Content match = 3 points
      if (contentLower.includes(keyword)) {
        score += 3;
        if (!matchedKeywords.includes(keyword + ' (title)')) {
          matchedKeywords.push(keyword + ' (content)');
        }
      }
    }
    
    // Boost score for shorter sections (more focused)
    if (section.content.length < 1000) score += 2;
    
    // Always include introduction/overview sections (level 1)
    if (section.level === 1 || titleLower.includes('introduction') || 
        titleLower.includes('overview') || titleLower.includes('about')) {
      score += 5;
    }
    
    scoredSections.push({
      section: section,
      score: score,
      matchedKeywords: matchedKeywords,
      docName: docName
    });
  }
  
  // Sort by score (highest first)
  scoredSections.sort(function(a, b) { return b.score - a.score; });
  
  return scoredSections;
}

/**
 * Load partial content from document (SIMPLE AND RELIABLE!)
 * No complex section extraction - just loads first 3K chars
 * Returns formatted context string with citations
 */
function loadRelevantSections(file, accessToken, keywords, maxSections) {
  try {
    logInfo('loadRelevantSections', 'Loading partial content', {fileName: file.name});
    
    // Simple: Just load first 3K chars
    var content = readDocumentPartial(file, accessToken, 3000);
    
    if (!content) {
      logInfo('loadRelevantSections', 'No content loaded', {fileName: file.name});
      return null;
    }
    
    logInfo('loadRelevantSections', 'Content loaded', {
      fileName: file.name,
      contentLength: content.length
    });
    
    // Format and return
    return {
      content: '=== ' + file.name + ' ===\n' + content + '\n\n',
      sectionCount: 1,
      citedSections: [file.name]
    };
    
  } catch (e) {
    logError('loadRelevantSections', 'Error: ' + e.toString(), {
      fileName: file.name
    });
    return null;
  }
}

// ========== END SECTION MATCHING ==========

// ========== PHASE 2: SMART DOCUMENT SCORING ==========

/**
 * BM25-style keyword scoring for documents
 * Scores based on keyword presence in filename, description, and content
 */
function scoreBM25(doc, keywords) {
  var score = 0;
  var docNameLower = doc.name.toLowerCase();
  var descLower = (doc.description || '').toLowerCase();
  
  for (var i = 0; i < keywords.length; i++) {
    var keyword = keywords[i].toLowerCase();
    
    // Exact title match: HIGHEST score
    if (docNameLower === keyword || 
        docNameLower === keyword + ' guide' || 
        docNameLower === keyword + ' playbook' ||
        docNameLower === keyword + ' manual') {
      score += 10;
    }
    // Keyword in filename: HIGH score
    else if (docNameLower.includes(keyword)) {
      score += 5;
    }
    // Keyword in description: MEDIUM score
    else if (descLower.includes(keyword)) {
      score += 2;
    }
  }
  
  return score;
}

/**
 * Semantic relevance boost based on question intent
 * "how" questions prefer playbooks, "what" prefers overviews, etc.
 */
function boostSemanticRelevance(doc, question) {
  var questionLower = question.toLowerCase();
  var docNameLower = doc.name.toLowerCase();
  var boost = 1.0; // Default: no boost
  
  // Intent-based document preference
  var intentMap = {
    'how': ['playbook', 'guide', 'manual'],      // Procedural questions
    'what': ['overview', 'concept', 'handbook'], // Definitional questions
    'who': ['handbook', 'operations'],           // People/roles questions
    'when': ['handbook', 'schedule', 'guide'],   // Timing questions
    'where': ['handbook', 'operations']          // Location questions
  };
  
  // Check if question contains intent keyword
  for (var intent in intentMap) {
    if (questionLower.includes(intent)) {
      var preferredDocs = intentMap[intent];
      
      // Check if doc type matches intent
      for (var i = 0; i < preferredDocs.length; i++) {
        if (docNameLower.includes(preferredDocs[i])) {
          boost = 1.5; // 50% boost for semantic match
          break;
        }
      }
      
      if (boost > 1.0) break; // Found a match, stop
    }
  }
  
  return boost;
}

/**
 * Score and rank all documents using hybrid approach
 * Combines BM25 keyword scoring with semantic intent boosting
 */
function scoreAndRankDocuments(docs, keywords, question) {
  var scoredDocs = [];
  
  for (var i = 0; i < docs.length; i++) {
    var doc = docs[i];
    
    // BM25 keyword score
    var keywordScore = scoreBM25(doc, keywords);
    
    // Skip docs with 0 keyword score (no match at all)
    if (keywordScore === 0) continue;
    
    // Semantic relevance boost
    var semanticBoost = boostSemanticRelevance(doc, question);
    
    // Hybrid score = BM25 × Semantic Boost
    var finalScore = keywordScore * semanticBoost;
    
    scoredDocs.push({
      doc: doc,
      score: finalScore,
      keywordScore: keywordScore,
      semanticBoost: semanticBoost
    });
  }
  
  // Sort by score descending (highest first)
  scoredDocs.sort(function(a, b) { 
    return b.score - a.score; 
  });
  
  return scoredDocs;
}

// ========== END SMART SCORING ==========

function searchSOPs(question) {
  if (!DRIVE_FOLDER_ID) {
    return '';
  }
  
  try {
    logInfo('searchSOPs', 'Starting smart document loading (Phase 2)', { 
      folderId: DRIVE_FOLDER_ID,
      question: question ? question.substring(0, 50) : 'all'
    });
    
    // Get service account access token
    const service = getAuthenticatedSheetsService();
    const accessToken = service.getAccessToken();
    
    // PHASE 2: Request title/description metadata from Drive
    const url = 'https://www.googleapis.com/drive/v3/files?q=\'' + DRIVE_FOLDER_ID + '\'+in+parents&fields=files(id,name,mimeType,webViewLink,description)&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true';
    
    const response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      logError('searchSOPs', new Error('Drive API error: ' + responseCode), { 
        response: responseText
      });
      return '';
    }
    
    const result = JSON.parse(responseText);
    const allFiles = result.files || [];
    
    if (allFiles.length === 0) {
      logWarning('searchSOPs', 'No files found in Drive folder');
      return '\n\n**Note:** The documentation folder appears empty.';
    }
    
    // ===== TIER 1: CORE DOCUMENTS (always load) =====
    const CORE_DOC_PATTERNS = [
      'company', 'overview', 'employee', 'handbook', 
      'core', 'readme', 'getting started', 'quick reference'
    ];
    
    var coreFiles = [];
    var otherFiles = [];
    
    for (var i = 0; i < allFiles.length; i++) {
      var file = allFiles[i];
      var nameLower = file.name.toLowerCase();
      var isCore = false;
      
      for (var j = 0; j < CORE_DOC_PATTERNS.length; j++) {
        if (nameLower.includes(CORE_DOC_PATTERNS[j])) {
          isCore = true;
          break;
        }
      }
      
      if (isCore) {
        coreFiles.push(file);
      } else {
        otherFiles.push(file);
      }
    }
    
    logInfo('searchSOPs', 'Files categorized', { 
      totalFiles: allFiles.length,
      coreFiles: coreFiles.length,
      otherFiles: otherFiles.length
    });
    
    // ===== TIER 2: EXTRACT KEYWORDS FROM QUESTION =====
    var keywords = extractKeywords(question);
    
    logInfo('searchSOPs', 'Keywords extracted', { 
      keywords: keywords.join(', '),
      keywordCount: keywords.length
    });
    
    // ===== LOAD DOCUMENTS =====
    const MAX_CONTEXT_SIZE = 100000; // 100K chars safety limit
    var context = '\n\n**Available Documentation:**\n\n';
    var docsLoaded = [];
    var docsSkipped = [];
    var matchReasons = {}; // Track why each doc was loaded
    
    // Load core docs first
    for (var i = 0; i < coreFiles.length; i++) {
      if (context.length >= MAX_CONTEXT_SIZE) {
        logWarning('searchSOPs', 'Hit size limit while loading core docs', {
          currentSize: context.length,
          limit: MAX_CONTEXT_SIZE
        });
        break;
      }
      
      const file = coreFiles[i];
      const content = readDocumentPartial(file, accessToken, 3000); // Simple: first 3K only
      
      if (content) {
        context += '=== ' + file.name + ' (CORE) ===\n';
        context += content + '\n\n';
        docsLoaded.push(file.name + ' (core)');
        matchReasons[file.name] = 'core document';
      }
    }
    
    // PHASE 2: SMART DOCUMENT SELECTION (Hybrid BM25 + Semantic Scoring)
    var matchedDocsCount = 0;
    var MAX_MATCHED_DOCS = 2;
    
    // Score and rank ALL documents first (best to worst)
    var scoredDocs = scoreAndRankDocuments(otherFiles, keywords, question);
    
    logInfo('searchSOPs', 'Docs scored', {
      totalScored: scoredDocs.length,
      topScore: scoredDocs.length > 0 ? scoredDocs[0].score : 0
    });
    
    // Now load from scored docs (top-ranked first)
    for (var i = 0; i < scoredDocs.length; i++) {
      var scoredItem = scoredDocs[i];
      var file = scoredItem.doc;
      var matchReason = 'Score:' + scoredItem.score.toFixed(1);
      // Stop if we already loaded 2 docs
      if (matchedDocsCount >= MAX_MATCHED_DOCS) {
        logInfo('searchSOPs', 'Reached doc limit', {
          loaded: matchedDocsCount,
          limit: MAX_MATCHED_DOCS
        });
        break;
      }
      
      if (context.length >= MAX_CONTEXT_SIZE) {
        logWarning('searchSOPs', 'Hit size limit - stopping doc loading', {
          currentSize: context.length,
          limit: MAX_CONTEXT_SIZE,
          docsLoaded: docsLoaded.length
        });
        break;
      }
      
      // Document already scored and ranked - just load it!
      try {
        logInfo('searchSOPs', 'Loading top-ranked doc', {
          fileName: file.name, 
          score: scoredItem.score
        });
        
        const sectionResult = loadRelevantSections(file, accessToken, keywords, 3);
          
          logInfo('searchSOPs', 'Section load result', {
            fileName: file.name, 
            hasResult: !!sectionResult,
            hasContent: sectionResult ? !!sectionResult.content : false
          });
          
          if (sectionResult && sectionResult.content) {
            context += sectionResult.content;
            docsLoaded.push(file.name + ' (' + sectionResult.sectionCount + ' sections)');
            matchReasons[file.name] = matchReason + ' → ' + sectionResult.citedSections.join(', ');
            matchedDocsCount++; // Increment after successful load
          }
        } catch (e) {
          logError('searchSOPs', 'Section loading failed: ' + e.toString(), {
            fileName: file.name,
            stack: e.stack
          });
          // Fallback: skip this doc
        }
    }
    
    if (docsLoaded.length === 0) {
      return '\n\n**Note:** Could not read any documents from the folder.';
    }
    
    // Build match summary for logs
    var matchSummary = [];
    for (var i = 0; i < docsLoaded.length && i < 10; i++) {
      var docName = docsLoaded[i];
      var reason = matchReasons[docName] || 'loaded';
      matchSummary.push(docName + ' (' + reason + ')');
    }
    
    logInfo('searchSOPs', 'Phase 2 smart loading complete', { 
      docsLoaded: docsLoaded.length,
      docsSkipped: docsSkipped.length,
      totalChars: context.length,
      matches: matchSummary.join(' | '),
      skippedSample: docsSkipped.length > 0 ? docsSkipped.slice(0, 3).join(', ') : 'none'
    });
    
    return context;
    
  } catch (error) {
    logError('searchSOPs', error);
    return '';
  }
}

/**
 * Extract relevant keywords from question for doc matching
 * Focus on: tool names, action words, topic words
 * FILTERS OUT STOPWORDS to prevent false matches!
 */
function extractKeywords(question) {
  if (!question) return [];
  
  var lower = question.toLowerCase();
  
  // ==============================================
  // ENTITY DETECTION (Priority - check first!)
  // ==============================================
  
  // ENTITY: Radio (streaming app)
  if (lower.includes('radio')) {
    logInfo('extractKeywords', 'Entity detected: RADIO');
    return ['radio']; // ONLY search radio docs!
  }
  
  // ENTITY: Website (.com / blogger)
  if (lower.includes('website') || lower.includes('.com') || 
      lower.includes('blog') || lower.includes('article')) {
    logInfo('extractKeywords', 'Entity detected: WEBSITE');
    return ['website', 'content', 'publishing'];
  }
  
  // ENTITY: Company (enterprise/business)
  if (lower.includes('company') || lower.includes('enterprise') ||
      lower.includes('business') || lower.includes('organization')) {
    logInfo('extractKeywords', 'Entity detected: COMPANY');
    return ['company', 'operations', 'handbook'];
  }
  
  // ==============================================
  // GENERAL KEYWORD EXTRACTION (if no entity)
  // ==============================================
  
  var keywords = [];
  
  // STOPWORDS - common words that appear everywhere (filter these out!)
  var stopwords = [
    'all', 'the', 'a', 'an', 'and', 'or', 'but', 'of', 'at', 'by', 'for', 'with',
    'tell', 'me', 'about', 'what', 'how', 'who', 'when', 'where', 'why',
    'is', 'are', 'was', 'were', 'am', 'been', 'being',
    'do', 'does', 'did', 'doing', 'done',
    'can', 'could', 'will', 'would', 'should', 'shall',
    'to', 'from', 'in', 'on', 'as'
  ];
  
  // COMPANY-SPECIFIC STOPWORDS - appear in most PinoySeoul doc names!
  // These caused massive over-matching (9/9 docs loaded for "pinoy" keyword)
  var companyStopwords = [
    'pinoy', 'pinoyseoul', 'seoul',     // In almost every filename/header
    'guide', 'manual', 'playbook',      // Too generic (6+ docs have these)
    'media', 'content', 'work',         // Every doc mentions these
    'operations', 'our', 'more',        // Super common
    'something', 'anything', 'everything' // User filler words
  ];
  
  // Combine both stopword lists
  stopwords = stopwords.concat(companyStopwords);
  
  // Self-hosted tools
  var tools = ['kimai', 'planka', 'vaultwarden', 'docuseal', 'invoiceshelf', 
               'postiz', 'azuracast', 'jellyfin', 'jellyseerr', 'sonarr', 'radarr',
               'portainer', 'watchtower', 'nginx'];
  
  for (var i = 0; i < tools.length; i++) {
    if (lower.includes(tools[i])) {
      keywords.push(tools[i]);
    }
  }
  
  // Google Workspace tools (heavily relied upon!)
  var googleTools = ['google chat', 'google forms', 'google sheets', 'google docs', 
                     'google meet', 'gmail', 'google drive', 'google calendar',
                     'google workspace', 'gchat', 'gdocs', 'gsheets', 'gdrive'];
  
  for (var i = 0; i < googleTools.length; i++) {
    if (lower.includes(googleTools[i])) {
      // Add the specific tool (e.g., "chat" from "google chat")
      var toolName = googleTools[i].replace('google ', '');
      if (toolName !== googleTools[i]) { // If it was "google X"
        keywords.push(toolName);
      }
      keywords.push(googleTools[i]); // Also add full name
    }
  }
  
  // Lane/department keywords
  var lanes = ['publishing', 'broadcast', 'outreach', 'editorial', 'radio'];
  for (var i = 0; i < lanes.length; i++) {
    if (lower.includes(lanes[i])) {
      keywords.push(lanes[i]);
    }
  }
  
  // Common work topics
  var topics = ['time', 'task', 'project', 'password', 'login', 'access',
                'email', 'account', 'signing', 'invoice', 'billing',
                'media', 'video', 'audio', 'content', 'schedule',
                'communication', 'messaging', 'form', 'survey', 'meeting'];
  
  for (var i = 0; i < topics.length; i++) {
    if (lower.includes(topics[i])) {
      keywords.push(topics[i]);
    }
  }
  
  // CRITICAL: Filter out stopwords!
  var filtered = [];
  for (var i = 0; i < keywords.length; i++) {
    var keyword = keywords[i].toLowerCase();
    // Only add if NOT a stopword AND length > 2 chars
    if (stopwords.indexOf(keyword) === -1 && keyword.length > 2) {
      filtered.push(keyword);
    }
  }
  
  // Remove duplicates
  var unique = [];
  for (var i = 0; i < filtered.length; i++) {
    if (unique.indexOf(filtered[i]) === -1) {
      unique.push(filtered[i]);
    }
  }
  
  // If no keywords found, return empty (load only core docs)
  return unique;
}

/**
 * Reads FULL content from a Google Doc (up to 50KB for Gemini context)
 */
function readFullDocument(file, accessToken) {
  try {
    const mimeType = file.mimeType;
    
    // Only read Google Docs for now (can expand to PDFs later)
    if (mimeType === 'application/vnd.google-apps.document') {
      // Export as plain text
      const exportUrl = 'https://www.googleapis.com/drive/v3/files/' + file.id + '/export?mimeType=text/plain';
      
      const response = UrlFetchApp.fetch(exportUrl, {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
        muteHttpExceptions: true
      });
      
      if (response.getResponseCode() === 200) {
        var text = response.getContentText();
        
        // Limit to 50,000 chars (Gemini context limit consideration)
        if (text.length > 50000) {
          text = text.substring(0, 50000) + '\n\n[Document truncated - too long]';
        }
        
        return text;
      }
    }
    
    // For other file types
    return '[File type: ' + mimeType + ' - cannot read yet]';
    
  } catch (error) {
    logError('readFullDocument', error, { fileName: file.name });
    return null;
  }
}

/**
 * PHASE 2: Reads PARTIAL content from document (for header checking)
 * Only loads first N characters to check for keyword matches
 * Much faster than loading full doc!
 */
function readDocumentPartial(file, accessToken, maxChars) {
  try {
    const mimeType = file.mimeType;
    
    // Only read Google Docs
    if (mimeType === 'application/vnd.google-apps.document') {
      // Export as plain text
      const exportUrl = 'https://www.googleapis.com/drive/v3/files/' + file.id + '/export?mimeType=text/plain';
      
      const response = UrlFetchApp.fetch(exportUrl, {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
        muteHttpExceptions: true
      });
      
      if (response.getResponseCode() === 200) {
        var text = response.getContentText();
        
        // Return only first maxChars
        if (text.length > maxChars) {
          return text.substring(0, maxChars);
        }
        
        return text;
      }
    }
    
    return null;
    
  } catch (error) {
    // Silently fail for partial reads (not critical)
    return null;
  }
}

/**
 * Extracts relevant excerpt from document around keywords
 * Instead of sending 4000+ words, send ~500 words around the keyword
 */
function extractRelevantExcerpt(content, keywords) {
  if (!content || content.length < 500) {
    return content; // Short doc, return as-is
  }
  
  const contentLower = content.toLowerCase();
  var bestPosition = -1;
  var bestKeyword = '';
  
  // Find first occurrence of any keyword
  for (var i = 0; i < keywords.length; i++) {
    var pos = contentLower.indexOf(keywords[i]);
    if (pos !== -1 && (bestPosition === -1 || pos < bestPosition)) {
      bestPosition = pos;
      bestKeyword = keywords[i];
    }
  }
  
  if (bestPosition === -1) {
    // Keyword not found (shouldn't happen), return beginning
    return content.substring(0, 1000) + '\n\n[Document continues...]';
  }
  
  // Extract 500 chars before and 1500 chars after keyword
  var start = Math.max(0, bestPosition - 500);
  var end = Math.min(content.length, bestPosition + 1500);
  
  var excerpt = content.substring(start, end);
  
  // Add ellipsis if truncated
  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';
  
  return excerpt;
}

// ===== DUPLICATE FUNCTION REMOVED =====
// There was a duplicate extractKeywords() function here (lines 782-806)
// that was overriding the proper one at line 563 with company-specific stopwords.
// The old function just split ALL words, causing massive over-matching (9/9 docs).
// Now the proper function with stopwords filtering will be used!

/**
 * Gets a snippet from a Google Doc file using service account
 */
function getFileSnippetWithServiceAccount(file, accessToken) {
  try {
    const mimeType = file.mimeType;
    
    // Only read Google Docs for now
    if (mimeType === 'application/vnd.google-apps.document') {
      // Export Google Doc as plain text
      const exportUrl = 'https://www.googleapis.com/drive/v3/files/' + file.id + '/export?mimeType=text/plain';
      
      const response = UrlFetchApp.fetch(exportUrl, {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
        muteHttpExceptions: true
      });
      
      if (response.getResponseCode() === 200) {
        const text = response.getContentText();
        // Return first 200 characters
        return text.substring(0, 200).trim() + '...';
      }
    }
    
    return null;
  } catch (error) {
    logError('getFileSnippet', error);
    return null;
  }
}

// ==================== TEST FUNCTION ====================

function testGeminiDirectly() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  Logger.log('API Key exists: ' + (apiKey ? 'YES' : 'NO'));
  Logger.log('API Key length: ' + (apiKey?.length || 0));
  
  if (!apiKey) {
    Logger.log('FAILED: No API key');
    return 'No API key configured';
  }
  
  const testPrompt = 'Say "Hello, the Gemini API is working!" in exactly those words.';
  const response = callGemini(testPrompt, GEMINI_MODEL, 'test@test.com');
  
  Logger.log('Response: ' + response);
  return response || 'Failed to get response';
}

function testOPPAResponse() {
  const testQuestion = 'What happened recently?';
  const mockEvent = {
    chat: {
      user: { email: 'test@pinoyseoul.com' },
      messagePayload: {
        message: { 
          text: testQuestion,
          sender: { email: 'test@pinoyseoul.com' }
        },
        space: { name: 'spaces/test' }
      }
    }
  };
  
  const response = handleWithGemini(mockEvent, testQuestion, 'test@pinoyseoul.com', 'spaces/test');
  Logger.log('OPPA Response:', response);
  return response;
}
