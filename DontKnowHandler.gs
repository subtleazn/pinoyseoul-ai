/**
 * Don't Know Handler - COMPREHENSIVE REWRITE
 * Provides helpful, encouraging responses with actual links when AI doesn't know
 * Always actionable - never just "I don't know"
 */

// ==================== CONSTANTS ====================

const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1OpR685mZLd9VEJ69beMdPMm7qjNAIuxi';

const TOOL_DOCS = {
  'kimai': { name: 'Kimai', docs: 'https://kimai.org/documentation/', url: 'https://time.pinoyseoul.com' },
  'planka': { name: 'Planka', docs: 'https://docs.planka.cloud/', url: 'https://projects.pinoyseoul.com' },
  'vaultwarden': { name: 'Vaultwarden', docs: 'https://bitwarden.com/help/', url: 'https://vault.pinoyseoul.com' },
  'vault': { name: 'Vaultwarden', docs: 'https://bitwarden.com/help/', url: 'https://vault.pinoyseoul.com' },
  'docuseal': { name: 'DocuSeal', docs: 'https://docuseal.co/docs', url: 'https://legal.pinoyseoul.com' },
  'postiz': { name: 'Postiz', docs: 'https://docs.postiz.com/', url: 'https://social.pinoyseoul.com' },
  'azuracast': { name: 'AzuraCast', docs: 'https://azuracast.com/docs/', url: 'https://radio.pinoyseoul.com' },
  'radio': { name: 'AzuraCast', docs: 'https://azuracast.com/docs/', url: 'https://radio.pinoyseoul.com' },
  'jellyseerr': { name: 'Jellyseerr', docs: 'https://docs.overseerr.dev/', url: 'https://request.pinoyseoul.com' },
  'jellyfin': { name: 'Jellyfin', docs: 'https://jellyfin.org/docs/', url: 'https://server.pinoyseoul.com' },
  'invoiceshelf': { name: 'InvoiceShelf', docs: null, url: 'https://office.pinoyseoul.com' }
};

// ==================== DETECTION PATTERNS ====================

const DONT_KNOW_PHRASES = [
  "don't have", "don't know", "not sure", "unclear", "no information",
  "can't find", "unable to", "not available", "missing", "not in",
  "no record", "not found", "doesn't appear", "no details"
];

const TOOL_KEYWORDS = ['kimai', 'planka', 'vaultwarden', 'vault', 'docuseal', 'postiz', 
                       'azuracast', 'radio', 'jellyseerr', 'jellyfin', 'invoiceshelf'];

const ACTIVITY_KEYWORDS = ['what happened', 'recent', 'yesterday', 'today', 'last week',
                           'activity', 'logs', 'events', 'updates', 'changes'];

const PROCEDURE_KEYWORDS = ['how do i', 'how to', 'steps', 'process', 'procedure',
                            'guide', 'instructions', 'tutorial'];

// ==================== MAIN HANDLER ====================

function handleDontKnow(aiResponse, userQuestion) {
  if (!isDontKnowResponse(aiResponse)) {
    return null; // AI has an answer
  }
  
  // Detect question type and generate helpful response
  var questionType = detectQuestionType(userQuestion);
  return generateHelpfulResponse(questionType, userQuestion);
}

function isDontKnowResponse(response) {
  if (!response) return false;
  var lowerResponse = response.toLowerCase();
  
  // Check if AI says it doesn't know
  var hasDontKnow = false;
  for (var i = 0; i < DONT_KNOW_PHRASES.length; i++) {
    if (lowerResponse.includes(DONT_KNOW_PHRASES[i])) {
      hasDontKnow = true;
      break;
    }
  }
  
  if (!hasDontKnow) return false;
  
  // ONLY trigger if it's about company-specific stuff (docs, logs, PinoySeoul data)
  // DON'T trigger if AI is using general knowledge to answer
  var isCompanySpecific = lowerResponse.includes("docs") ||
                          lowerResponse.includes("documentation") ||
                          lowerResponse.includes("logs") ||
                          lowerResponse.includes("playbook") ||
                          lowerResponse.includes("in the drive") ||
                          lowerResponse.includes("pinoyseoul");
  
  // If AI provides helpful general advice, don't override it!
  var hasGeneralAdvice = lowerResponse.includes("typically") ||
                         lowerResponse.includes("usually") ||
                         lowerResponse.includes("generally") ||
                         lowerResponse.includes("professional") ||
                         lowerResponse.includes("best practice");
  
  // Only trigger if company-specific AND no general advice given
  return isCompanySpecific && !hasGeneralAdvice;
}

function detectQuestionType(question) {
  var lowerQ = question.toLowerCase();
  
  // Check for tools
  for (var i = 0; i < TOOL_KEYWORDS.length; i++) {
    if (lowerQ.includes(TOOL_KEYWORDS[i])) {
      return { type: 'tool', tool: TOOL_KEYWORDS[i] };
    }
  }
  
  // Check for activity
  for (var i = 0; i < ACTIVITY_KEYWORDS.length; i++) {
    if (lowerQ.includes(ACTIVITY_KEYWORDS[i])) {
      return { type: 'activity' };
    }
  }
  
  // Check for procedure
  for (var i = 0; i < PROCEDURE_KEYWORDS.length; i++) {
    if (lowerQ.includes(PROCEDURE_KEYWORDS[i])) {
      return { type: 'procedure' };
    }
  }
  
  return { type: 'generic' };
}

function generateHelpfulResponse(questionType, userQuestion) {
  var searchUrl = generateGoogleSearchUrl(userQuestion);
  
  switch(questionType.type) {
    case 'tool':
      return generateToolResponse(questionType.tool, searchUrl);
      
    case 'activity':
      return "I don't have activity logs for that. Check the MessageLog sheet, or ask your team directly if you need specifics!";
      
    case 'procedure':
      return "That process isn't in my docs yet. Best to:\n\n📚 Check the playbooks in Drive: " + DRIVE_FOLDER_URL + "\n🔍 Or search: " + searchUrl + "\n\nOr ask your team lead - they'll know!";
      
    default:
      var responses = [
        "I only know what's in our docs - that's not there yet. Try searching for it: " + searchUrl + "\n\nOr check the Drive folder: " + DRIVE_FOLDER_URL + " for any related playbooks!",
        "That specific info isn't in my documentation. Here's how to find it:\n\n🔍 Search online: " + searchUrl + "\n📚 Check Drive: " + DRIVE_FOLDER_URL + "\n\nOr ask your team lead - they'll know better!",
        "My knowledge is limited to what's in our company docs, and I don't have that yet. Try:\n\n" + searchUrl + "\n\nOr check with your team - they might know!",
        "Don't have that in my docs. Your best bet is to search for it (" + searchUrl + ") or ask your team lead directly!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
  }
}

function generateToolResponse(toolName, searchUrl) {
  var toolInfo = TOOL_DOCS[toolName];
  
  if (!toolInfo) {
    return "Try the tool directly, or search: " + searchUrl;
  }
  
  var response = "I don't have that info about " + toolInfo.name + ". Here's where to look:\n\n";
  
  if (toolInfo.docs) {
    response += "📚 Official docs: " + toolInfo.docs + "\n";
  }
  
  response += "🔧 Tool itself: " + toolInfo.url + "\n";
  response += "🔍 Or search: " + searchUrl;
  
  return response;
}

function generateGoogleSearchUrl(question) {
  // Clean up question
  var cleanQ = question
    .toLowerCase()
    .replace(/what is|what's|how do i|how to|can you|tell me|explain/gi, '')
    .replace(/\?/g, '')
    .trim();
  
  // Add PinoySeoul context for work-related terms
  var workTerms = ['founder', 'company', 'team', 'manager', 'employee', 'handbook'];
  var addContext = false;
  for (var i = 0; i < workTerms.length; i++) {
    if (cleanQ.includes(workTerms[i])) {
      addContext = true;
      break;
    }
  }
  
  var searchQuery = addContext ? 'PinoySeoul ' + cleanQ : cleanQ;
  return 'https://www.google.com/search?q=' + encodeURIComponent(searchQuery);
}
