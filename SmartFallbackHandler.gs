/**
 * Smart Fallback Handler - USER-FRIENDLY VERSION
 * When AI fails for ANY reason, just be helpful and encouraging
 * No technical error details - just guide them to resources
 */

// ==================== CONSTANTS ====================

const SMARTFALLBACK_DRIVE_FOLDER_ID = '1OpR685mZLd9VEJ69beMdPMm7qjNAIuxi';
const SMARTFALLBACK_DRIVE_URL = 'https://drive.google.com/drive/folders/' + SMARTFALLBACK_DRIVE_FOLDER_ID;

const SMARTFALLBACK_TOOLS = {
  'kimai': { name: 'Kimai', url: 'https://time.pinoyseoul.com', purpose: 'time tracking' },
  'planka': { name: 'Planka', url: 'https://projects.pinoyseoul.com', purpose: 'project boards' },
  'vaultwarden': { name: 'Vaultwarden', url: 'https://vault.pinoyseoul.com', purpose: 'passwords' },
  'vault': { name: 'Vaultwarden', url: 'https://vault.pinoyseoul.com', purpose: 'passwords' },
  'docuseal': { name: 'DocuSeal', url: 'https://legal.pinoyseoul.com', purpose: 'contracts' },
  'postiz': { name: 'Postiz', url: 'https://social.pinoyseoul.com', purpose: 'social media' },
  'azuracast': { name: 'AzuraCast', url: 'https://radio.pinoyseoul.com', purpose: 'radio' },
  'radio': { name: 'AzuraCast', url: 'https://radio.pinoyseoul.com', purpose: 'radio' },
  'jellyseerr': { name: 'Jellyseerr', url: 'https://request.pinoyseoul.com', purpose: 'media requests' },
  'jellyfin': { name: 'Jellyfin', url: 'https://server.pinoyseoul.com', purpose: 'streaming' },
  'invoiceshelf': { name: 'InvoiceShelf', url: 'https://office.pinoyseoul.com', purpose: 'invoicing' }
};

// ==================== MAIN HANDLER ====================

/**
 * Generates helpful fallback when AI fails
 * Warm, encouraging, acknowledges limitations
 */
function generateSmartFallback(errorMessage, userQuestion) {
  // Vary the opening line
  var openings = [
    "Can't answer that right now, but here's how to find it:",
    "Having trouble with that question! Here's where to look:",
    "Not able to help with that at the moment. Try these:",
    "Can't process that right now. Here are your options:"
  ];
  var response = openings[Math.floor(Math.random() * openings.length)] + "\n\n";
  
  // Check for specific tool mentions
  var toolHelp = detectToolInQuestion(userQuestion);
  if (toolHelp) {
    response += toolHelp + "\n\n";
  }
  
  // Check for procedure/"how to" questions
  if (isProcedureQuestion(userQuestion)) {
    response += "📚 Check our playbooks: " + SMARTFALLBACK_DRIVE_URL + "\n\n";
  }
  
  // Always provide search option
  response += "🔍 Or search online: " + generateGoogleSearchUrl(userQuestion) + "\n\n";
  
  // Vary the closing
  var closings = [
    "Ask your team lead if you need specific help!",
    "Your team lead can help if needed!",
    "Check with your lead for more details!",
    "Team lead knows more - ask them!"
  ];
  response += closings[Math.floor(Math.random() * closings.length)];
  
  return response;
}

// ==================== HELPER FUNCTIONS ====================

function detectToolInQuestion(question) {
  var lowerQ = question.toLowerCase();
  
  for (var key in SMARTFALLBACK_TOOLS) {
    if (lowerQ.includes(key)) {
      var tool = SMARTFALLBACK_TOOLS[key];
      return "🔧 " + tool.name + " (" + tool.purpose + "): " + tool.url;
    }
  }
  return null;
}

function isProcedureQuestion(question) {
  var lowerQ = question.toLowerCase();
  return lowerQ.includes('how') || lowerQ.includes('procedure') || 
         lowerQ.includes('steps') || lowerQ.includes('workflow') ||
         lowerQ.includes('process') || lowerQ.includes('start') ||
         lowerQ.includes('lane') || lowerQ.includes('begin');
}

function generateGoogleSearchUrl(question) {
  var cleanQ = question
    .toLowerCase()
    .replace(/what is|what's|how do i|how to|can you|tell me|explain/gi, '')
    .replace(/\?/g, '')
    .trim();
  
  // Add PinoySeoul context for work-related questions
  var workTerms = ['lane', 'publishing', 'broadcast', 'outreach', 'team', 
                   'playbook', 'employee', 'founder', 'company'];
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
