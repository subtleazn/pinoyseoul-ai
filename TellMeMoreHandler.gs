/**
 * Tell Me More Handler - COMPREHENSIVE REWRITE
 * Detects when users ask for elaboration/more details
 * Redirects to specific resources with actual links and encouraging guidance
 * Encourages self-service and learning
 */

// ==================== DETECTION PATTERNS ====================

const TELL_ME_MORE_PATTERNS = [
  // Direct expansion requests
  'tell me more', 'explain more', 'give more details', 'more details',
  'elaborate', 'expand on that', 'go deeper', 'more information',
  'tell me about', 'explain about', 'more about',
  
  // Clarification requests
  'what do you mean', 'can you clarify', 'i dont understand', "i don't understand",
  'explain again', 'rephrase', 'say that differently', 'unclear',
  'what does that mean', 'can you explain', 'explain that',
  
  // Examples requests
  'give me examples', 'show me examples', 'for example', 'like what',
  'such as', 'any examples', 'example of', 'examples?',
  
  // Specifics requests
  'be more specific', 'exact steps', 'detailed process', 'step by step',
  'walk me through', 'show me how', 'specific steps', 'in detail',
  'complete guide', 'full instructions', 'comprehensive',
  
  // General follow-ups
  'and then', 'what else', 'anything else', 'more?', 'continue',
  'keep going', 'go on', 'next', 'what next', 'after that',
  
  // Learning requests
  'how do i learn', 'teach me', 'tutorial', 'guide me',
  'help me understand', 'help me learn', 'where can i learn',
  
  // Deep dive
  'in depth', 'deep dive', 'detailed explanation', 'thorough',
  'comprehensive guide', 'complete tutorial', 'everything about'
];

// ==================== TOOL RESOURCES ====================

const TELLMEMORE_TOOL_RESOURCES = {
  'kimai': {
    name: 'Kimai',
    docs: 'https://kimai.org/documentation/',
    url: 'https://time.pinoyseoul.com',
    type: 'tool'
  },
  'planka': {
    name: 'Planka',
    docs: 'https://docs.planka.cloud/',
    alternative: 'Trello guides work too (similar UI)',
    url: 'https://projects.pinoyseoul.com',
    type: 'tool'
  },
  'vaultwarden': {
    name: 'Vaultwarden',
    docs: 'https://bitwarden.com/help/',
    wiki: 'https://github.com/dani-garcia/vaultwarden/wiki',
    url: 'https://vault.pinoyseoul.com',
    type: 'tool'
  },
  'vault': {
    name: 'Vaultwarden',
    docs: 'https://bitwarden.com/help/',
    url: 'https://vault.pinoyseoul.com',
    type: 'tool'
  },
  'docuseal': {
    name: 'DocuSeal',
    docs: 'https://docuseal.co/docs',
    url: 'https://legal.pinoyseoul.com',
    type: 'tool'
  },
  'postiz': {
    name: 'Postiz',
    docs: 'https://docs.postiz.com/',
    url: 'https://social.pinoyseoul.com',
    type: 'tool'
  },
  'azuracast': {
    name: 'AzuraCast',
    docs: 'https://azuracast.com/docs/',
    url: 'https://radio.pinoyseoul.com',
    type: 'tool'
  },
  'radio': {
    name: 'AzuraCast',
    docs: 'https://azuracast.com/docs/',
    url: 'https://radio.pinoyseoul.com',
    type: 'tool'
  },
  'jellyseerr': {
    name: 'Jellyseerr',
    docs: 'https://docs.overseerr.dev/',
    url: 'https://request.pinoyseoul.com',
    type: 'tool'
  },
  'jellyfin': {
    name: 'Jellyfin',
    docs: 'https://jellyfin.org/docs/',
    url: 'https://server.pinoyseoul.com',
    type: 'tool'
  },
  'invoiceshelf': {
    name: 'InvoiceShelf',
    docs: null,
    url: 'https://office.pinoyseoul.com',
    type: 'tool'
  },
  'invoice': {
    name: 'InvoiceShelf',
    docs: null,
    url: 'https://office.pinoyseoul.com',
    type: 'tool'
  }
};

// ==================== TOPIC RESOURCES ====================

const TELLMEMORE_TOPIC_RESOURCES = {
  // HR/People
  'onboarding': 'Check with your team lead or the Employee Handbook in Drive!',
  'time off': 'Team lead approves leave - ask them directly!',
  'vacation': 'Talk to your team lead about time off!',
  'leave': 'Team lead handles leave requests!',
  
  // Finance
  'expense': 'Full expense process is in the Drive folder - check the playbooks!',
  'invoicing': 'InvoiceShelf handles this - check: https://office.pinoyseoul.com',
  'payment': 'Finance team manages payments - reach out to them!',
  
  // Learning/Development
  'video editing': 'YouTube tutorials are great! Search: "video editing tutorial"',
  'content creation': 'Try YouTube Creator Academy for free courses!',
  'social media': 'HubSpot Academy has free social media courses!',
  'design': 'Canva has built-in tutorials, or try Skillshare!',
  
  // Language/Culture
  'tagalog': 'YouTube has tons of Tagalog lessons - search and explore!',
  'filipino': 'Try r/Tagalog on Reddit or YouTube tutorials!',
  'korean': 'Talk To Me In Korean (ttmik.com) is the best free resource!',
  'hangul': 'ttmik.com has great Hangul lessons!'
};

// ==================== MAIN HANDLER ====================

function handleTellMeMore(message, previousResponse) {
  if (!isTellMeMoreRequest(message)) {
    return null;
  }
  
  // EXCEPTION: Korean culture/K-pop questions should go to AI
  // These are PinoySeoul's CORE DOMAIN - we have content about them!
  var lowerMessage = message.toLowerCase();
  var koreanCultureKeywords = [
    'kpop', 'k-pop', 'k pop', 'korean pop',
    'kdrama', 'k-drama', 'k drama', 'korean drama',
    'korean culture', 'korean language', 'korean music',
    'korean food', 'korean entertainment', 'hallyu', 'kwave'
  ];
  
  for (var i = 0; i < koreanCultureKeywords.length; i++) {
    if (lowerMessage.includes(koreanCultureKeywords[i])) {
      return null; // Let AI handle it (we have content about this!)
    }
  }
  
  // EXCEPTION: PinoySeoul company/radio/website questions should go to AI
  // These are questions about OUR OWN company - we have specific info!
  var companyKeywords = [
    'pinoyseoul', 'pinoy seoul',
    'pinoyseoul.com', 'pinoy seoul radio',
    'our radio', 'our website', 'our blog', 'our site',
    'our company', 'our mission', 'our platform'
  ];
  
  for (var i = 0; i < companyKeywords.length; i++) {
    if (lowerMessage.includes(companyKeywords[i])) {
      return null; // Let AI handle it (company-specific questions!)
    }
  }
  
  var topic = detectTopic(message, previousResponse);
  return generateResourceResponse(topic, message);
}

function isTellMeMoreRequest(message) {
  if (!message) return false;
  var lowerMessage = message.toLowerCase();
  
  for (var i = 0; i < TELL_ME_MORE_PATTERNS.length; i++) {
    if (lowerMessage.includes(TELL_ME_MORE_PATTERNS[i])) {
      return true;
    }
  }
  return false;
}

function detectTopic(message, previousResponse) {
  var lowerMessage = message.toLowerCase();
  var lowerPrevious = previousResponse ? previousResponse.toLowerCase() : '';
  
  // Check for tool mentions
  for (var tool in TELLMEMORE_TOOL_RESOURCES) {
    if (lowerMessage.includes(tool)) {
      return { type: 'tool', name: tool };
    }
  }
  
  // Check in previous response too
  if (previousResponse) {
    for (var tool in TELLMEMORE_TOOL_RESOURCES) {
      if (lowerPrevious.includes(tool)) {
        return { type: 'tool', name: tool };
      }
    }
  }
  
  // Check for topic keywords
  for (var topic in TELLMEMORE_TOPIC_RESOURCES) {
    if (lowerMessage.includes(topic) || lowerPrevious.includes(topic)) {
      return { type: 'topic', name: topic };
    }
  }
  
  return { type: 'generic', name: null };
}

function generateResourceResponse(topic, message) {
  switch(topic.type) {
    case 'tool':
      return generateToolResponse(topic.name, message);
      
    case 'topic':
      return generateTopicResponse(topic.name);
      
    default:
      return generateGenericResponse(message);
  }
}

function generateToolResponse(toolName, message) {
  var toolInfo = TELLMEMORE_TOOL_RESOURCES[toolName];
  if (!toolInfo) {
    return "Try exploring the tool directly, or search online for guides!";
  }
  
  // Check if asking to learn/explore
  var isLearning = message.toLowerCase().includes('learn') || 
                   message.toLowerCase().includes('how to use');
  
  if (isLearning) {
    var response = "Best way to learn " + toolInfo.name + "? Explore it hands-on!\n\n";
    response += "🔧 Try it: " + toolInfo.url + "\n";
    if (toolInfo.docs) {
      response += "📚 Docs: " + toolInfo.docs + "\n";
    }
    response += "\nClick around and experiment - you'll learn faster that way!";
    return response;
  }
  
  // Asking for more info
  var response = "More about " + toolInfo.name + ":\n\n";
  if (toolInfo.docs) {
    response += "📚 Official docs: " + toolInfo.docs + "\n";
  }
  response += "🔧 Access tool: " + toolInfo.url + "\n";
  
  if (toolInfo.alternative) {
    response += "\n💡 Tip: " + toolInfo.alternative;
  }
  
  return response;
}

function generateTopicResponse(topicName) {
  var guidance = TELLMEMORE_TOPIC_RESOURCES[topicName];
  return guidance || "Check with your team or search online for that topic!";
}

function generateGenericResponse(message) {
  // Generate Google search for the topic
  var cleanQ = message
    .toLowerCase()
    .replace(/tell me more|explain more|more about|elaborate|what is|what's/gi, '')
    .replace(/\?/g, '')
    .trim();
  
  var searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(cleanQ);
  
  var responses = [
    "I only know what's in our docs - for more details, try searching:\n" + searchUrl,
    "That's all I've got! For more, search online:\n" + searchUrl,
    "My knowledge is limited to documentation. Try this search:\n" + searchUrl + "\n\nOr ask your team lead!",
    "I've shared what I know! For deeper info, search:\n" + searchUrl + "\n\nOr check with the team!"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
