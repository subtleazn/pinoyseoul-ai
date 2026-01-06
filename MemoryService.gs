/**
 * Memory Service - OPPA's Message Log Reader
 * 
 * Reads webhook message logs from Google Sheet to provide context for AI responses.
 * NEW Sheet Structure: Timestamp | Source | Message | User
 * 
 * Webhooks now dump Markdown directly - no parsing needed!
 */

// ==================== SMART LOG FILTERING ====================

/**
 * Detects time range from question (in days)
 * Enables efficient filtering of large logs
 * SMART DEFAULT: Vague "recent" = 7 days (not all 90!)
 */
function detectTimeRange(question) {
  var lower = question.toLowerCase();
  
  // Specific time references (precise)
  if (lower.includes('yesterday') || lower.includes('last night')) return 1;
  if (lower.includes('today') || lower.includes('this morning')) return 1;
  if (lower.includes('past day')) return 1;
  
  if (lower.includes('past few days') || lower.includes('few days ago')) return 3;
  if (lower.includes('past 3 days')) return 3;
  
  if (lower.includes('this week') || lower.includes('past week') || lower.includes('last week')) return 7;
  if (lower.includes('past 7 days')) return 7;
  
  if (lower.includes('past 2 weeks') || lower.includes('last 2 weeks')) return 14;
  
  if (lower.includes('this month') || lower.includes('past month') || lower.includes('last month')) return 30;
  if (lower.includes('past 30 days')) return 30;
  
  // New: Support longer ranges
  if (lower.includes('past 2 months') || lower.includes('last 2 months')) return 60;
  if (lower.includes('past 3 months') || lower.includes('last 3 months') || 
      lower.includes('quarter') || lower.includes('quarterly')) return 90;
  
  // SMART DEFAULT: "Recent" = last week (7 days), not all 90!
  // This prevents token overload on vague questions
  return 7;
}

/**
 * Detects event types to filter logs by
 * Returns array of {emoji, keywords} objects to match against
 * COMPREHENSIVE: Covers ALL webhook types + all event categories
 */
function detectEventTypes(question) {
  var lower = question.toLowerCase();
  var types = [];
  
  // Blog/Article publishing
  if (lower.includes('blog') || lower.includes('article') || 
      lower.includes('story') || lower.includes('publish')) {
    types.push({
      emoji: '🚀',
      keywords: ['Published', 'New Story', 'Blogger'],
      sources: ['Blogger'],
      name: 'blog posts'
    });
  }
  
  // Social media posts
  if (lower.includes('social') || lower.includes('postiz') ||
      lower.includes('facebook') || lower.includes('twitter') || 
      lower.includes('instagram') || lower.includes('tiktok')) {
    types.push({
      emoji: '🔄',
      keywords: ['Social Post', 'Postiz', 'Updated'],
      sources: ['Postiz'],
      name: 'social media'
    });
  }
  
  // Software/Security updates
  if (lower.includes('software') || lower.includes('update') ||
      lower.includes('watchtower') || lower.includes('security') ||
      lower.includes('upgrade')) {
    types.push({
      emoji: '🛡️',
      keywords: ['Security Update', 'Watchtower', 'Upgraded'],
      sources: ['Watchtower'],
      name: 'software updates'
    });
  }
  
  // Newsletter signups
  if (lower.includes('newsletter') || lower.includes('signup') ||
      lower.includes('subscriber') || lower.includes('form')) {
    types.push({
      emoji: '📝',
      keywords: ['Newsletter Subscriber', 'Google Forms', 'registered'],
      sources: ['Google Forms'],
      name: 'signups'
    });
  }
  
  // Business leads
  if (lower.includes('lead') || lower.includes('business') ||
      lower.includes('promotion') || lower.includes('applicant')) {
    types.push({
      emoji: '💼',
      keywords: ['Business Promotion Lead', 'Business Lead'],
      sources: ['Google Forms'],
      name: 'business leads'
    });
  }
  
  // Code commits
  if (lower.includes('code') || lower.includes('github') ||
      lower.includes('commit') || lower.includes('shipped') ||
      lower.includes('deploy')) {
    types.push({
      emoji: '🚀',
      keywords: ['Code Shipped', 'GitHub', 'deployed'],
      sources: ['GitHub'],
      name: 'code commits'
    });
  }
  
  // Comments/interactions
  if (lower.includes('comment') || lower.includes('disqus') ||
      lower.includes('planka comment') || lower.includes('feedback')) {
    types.push({
      emoji: '💬',
      keywords: ['Comment', 'Disqus', 'Planka'],
      sources: ['Disqus', 'Planka'],
      name: 'comments'
    });
  }
  
  // Daily/Summary reports
  if (lower.includes('report') || lower.includes('summary') ||
      lower.includes('daily summary') || lower.includes('health') ||
      lower.includes('weekly') || lower.includes('monthly')) {
    types.push({
      emoji: '📊',
      keywords: ['Daily Health Report', 'Weekly Summary', 'Monthly Summary'],
      sources: ['Portainer', 'Nginx Proxy Manager', 'Docker'],
      users: ['Morning-Daily-Summary', 'Night-Daily-Summary', 'Weekly-Summary', 'Monthly-Summary'],
      name: 'reports'
    });
  }
  
  // Radio/Broadcasting (NEW!)
  if (lower.includes('radio') || lower.includes('azuracast') ||
      lower.includes('schedule') || lower.includes('broadcast') ||
      lower.includes('streaming')) {
    types.push({
      emoji: '📻',
      keywords: ['Daily Schedule Synced', 'Radio', 'AzuraCast'],
      sources: ['AzuraCast', 'Pinoy Seoul Radio'],
      name: 'radio operations'
    });
  }
  
  // Backups/Infrastructure (NEW!)
  if (lower.includes('backup') || lower.includes('emergency') ||
      lower.includes('binder') || lower.includes('infrastructure') ||
      lower.includes('rclone') || lower.includes('portainer')) {
    types.push({
      emoji: '📚',
      keywords: ['Emergency Binder Updated', 'backup', 'Refreshed'],
      sources: ['Portainer', 'Docker', 'Rclone', 'Vaultwarden'],
      users: ['Server-Secrets Keys Backup'],
      name: 'backups'
    });
  }
  
  // Invoices/Billing (NEW!)
  if (lower.includes('invoice') || lower.includes('billing') ||
      lower.includes('invoiceshelf') || lower.includes('payment')) {
    types.push({
      emoji: '💰',
      keywords: ['Invoice', 'InvoiceShelf', 'billing'],
      sources: ['InvoiceShelf'],
      name: 'invoices'
    });
  }
  
  // Contracts/Legal (NEW!)
  if (lower.includes('contract') || lower.includes('docuseal') ||
      lower.includes('legal') || lower.includes('signing')) {
    types.push({
      emoji: '📄',
      keywords: ['DocuSeal', 'contract', 'signed'],
      sources: ['DocuSeal'],
      name: 'contracts'
    });
  }
  
  // Media Requests (NEW!)
  if (lower.includes('media') || lower.includes('jellyseerr') ||
      lower.includes('request') || lower.includes('movie') ||
      lower.includes('show')) {
    types.push({
      emoji: '🎬',
      keywords: ['Jellyseerr', 'media request', 'requested'],
      sources: ['Jellyseerr'],
      name: 'media requests'
    });
  }
  
  // Time Tracking (NEW!)
  if (lower.includes('time') || lower.includes('kimai') ||
      lower.includes('hours') || lower.includes('logged')) {
    types.push({
      emoji: '⏰',
      keywords: ['Kimai', 'time log', 'hours logged'],
      sources: ['Kimai'],
      users: ['Kimai Sync Bot'],
      name: 'time tracking'
    });
  }
  
  // OPPA Conversations (NEW! - Self-awareness)
  if (lower.includes('oppa') || lower.includes('question') ||
      lower.includes('conversation') || lower.includes('asked')) {
    types.push({
      emoji: '🤖',
      keywords: ['Q:', 'OPPA-AI', 'OPPA-Redirect'],
      sources: ['OPPA-AI'],
      name: 'OPPA conversations'
    });
  }
  
  return types;
}

/**
 * Detects SOURCE-based filtering (app-specific queries)
 * "What did Postiz do?" → Filter by SOURCE = Postiz
 */
function detectSourceFilters(question) {
  var lower = question.toLowerCase();
  var sources = [];
  
  var appNames = [
    'postiz', 'blogger', 'github', 'watchtower', 'azuracast',
    'google forms', 'disqus', 'planka', 'kimai', 'jellyseerr',
    'docuseal', 'invoiceshelf', 'portainer', 'rclone', 'vaultwarden',
    'oppa', 'nginx'
  ];
  
  for (var i = 0; i < appNames.length; i++) {
    if (lower.includes(appNames[i])) {
      sources.push(appNames[i]);
    }
  }
  
  return sources;
}

/**
 * Detects USER-based filtering (person/bot-specific queries)
 * "What did Nash do?" → Filter by USER = Nash Ang
 */
function detectUserFilters(question) {
  var lower = question.toLowerCase();
  var users = [];
  
  // Bot/System users
  if (lower.includes('morning') || lower.includes('daily summary')) {
    users.push('Morning-Daily-Summary');
  }
  if (lower.includes('night') || lower.includes('night summary')) {
    users.push('Night-Daily-Summary');
  }
  if (lower.includes('weekly')) {
    users.push('Weekly-Summary');
  }
  if (lower.includes('monthly')) {
    users.push('Monthly-Summary');
  }
  if (lower.includes('backup') || lower.includes('secrets')) {
    users.push('Server-Secrets Keys Backup');
  }
  
  // Person names (common in your logs)
  if (lower.includes('nash')) {
    users.push('Nash Ang', 'nash@pinoyseoul.com');
  }
  if (lower.includes('subtleazn')) {
    users.push('subtleazn', 'subtleazn@gmail.com');
  }
  
  return users;
}

/**
 * Filters logs based on detected time range and event types
 * MASSIVE token savings on specific questions!
 */
function filterLogsByContext(logs, question) {
  var timeRangeDays = detectTimeRange(question);
  var eventTypes = detectEventTypes(question);
  var sourceFilters = detectSourceFilters(question);
  var userFilters = detectUserFilters(question);
  
  // Calculate time cutoff
  var now = new Date();
  var cutoff = new Date(now.getTime() - (timeRangeDays * 24 * 60 * 60 * 1000));
  
  var filtered = [];
  
  for (var i = 0; i < logs.length; i++) {
    var log = logs[i];
    var logDate = new Date(log.timestamp);
    
    // Filter by time
    if (logDate < cutoff) continue;
    
    // === EVENT TYPE FILTERING (if specified) ===
    if (eventTypes.length > 0) {
      var matchesType = false;
      
      for (var j = 0; j < eventTypes.length; j++) {
        var type = eventTypes[j];
        
        // Check MESSAGE column
        if (log.message.includes(type.emoji)) {
          matchesType = true;
          break;
        }
        
        for (var k = 0; k < type.keywords.length; k++) {
          if (log.message.includes(type.keywords[k])) {
            matchesType = true;
            break;
          }
        }
        if (matchesType) break;
        
        // Check SOURCE column
        if (type.sources && type.sources.length > 0) {
          for (var k = 0; k < type.sources.length; k++) {
            if (log.source.toLowerCase().includes(type.sources[k].toLowerCase())) {
              matchesType = true;
              break;
            }
          }
        }
        if (matchesType) break;
        
        // Check USER column
        if (type.users && type.users.length > 0) {
          for (var k = 0; k < type.users.length; k++) {
            if (log.user.includes(type.users[k])) {
              matchesType = true;
              break;
            }
          }
        }
        if (matchesType) break;
      }
      
      if (!matchesType) continue;
    }
    
    // === SOURCE FILTERING (app-specific) ===
    if (sourceFilters.length > 0) {
      var matchesSource = false;
      for (var j = 0; j < sourceFilters.length; j++) {
        if (log.source.toLowerCase().includes(sourceFilters[j])) {
          matchesSource = true;
          break;
        }
      }
      if (!matchesSource) continue;
    }
    
    // === USER FILTERING (person/bot-specific) ===
    if (userFilters.length > 0) {
      var matchesUser = false;
      for (var j = 0; j < userFilters.length; j++) {
        if (log.user.includes(userFilters[j])) {
          matchesUser = true;
          break;
        }
      }
      if (!matchesUser) continue;
    }
    
    filtered.push(log);
  }
  
  // Log filtering effectiveness
  var eventTypeNames = eventTypes.map(function(t) { return t.name; }).join(', ');
  var filterDetails = [];
  if (eventTypeNames) filterDetails.push('types: ' + eventTypeNames);
  if (sourceFilters.length > 0) filterDetails.push('sources: ' + sourceFilters.join(', '));
  if (userFilters.length > 0) filterDetails.push('users: ' + userFilters.join(', '));
  
  logInfo('filterLogsByContext', '3-column smart filtering', {
    timeRangeDays: timeRangeDays,
    filters: filterDetails.join(' | ') || 'time only',
    totalLogs: logs.length,
    filteredLogs: filtered.length,
    reduction: Math.round((1 - filtered.length / logs.length) * 100) + '%'
  });
  
  return filtered;
}

// ==================== MESSAGE HISTORY RETRIEVAL ====================

/**
 * Gets recent messages from the MessageLog sheet
 * TIME-BASED: Last 30 days instead of message count
 * NEW COLUMNS: Timestamp | Source | Message | User
 * @param {number} daysBack - Number of days to look back (default: 90)
 * @param {string} spaceId - IGNORED - reads all messages
 * @returns {Array} Array of message objects
 */
function getRecentMessages(daysBack, spaceId) {
  try {
    daysBack = daysBack || 90; // Default to 90 days (3 months)
    const data = getSheetDataWithServiceAccount(SHEET_ID, 'MessageLog');
    
    if (!data || data.length <= 1) {
      logInfo('getRecentMessages', 'No messages found in MessageLog');
      return [];
    }
    
    // Calculate cutoff date (30 days ago)
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    // NEW: Columns are [Timestamp, Source, Message, User]
    const messages = [];
    for (var i = data.length - 1; i >= 1; i--) {
      const row = data[i];
      const timestamp = row[0] || '';
      
      // Parse timestamp (format: 1/3/2026 17:15:30)
      const msgDate = new Date(timestamp);
      
      // Skip if older than cutoff
      if (msgDate < cutoffDate) {
        continue; // Too old, skip
      }
      
      messages.unshift({
        timestamp: timestamp,
        source: row[1] || 'unknown',
        message: row[2] || '',  // Already Markdown formatted!
        user: row[3] || ''
      });
    }
    
    // FILTER: Remove test events to reduce noise and save tokens
    var filteredMessages = [];
    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];
      // Skip test events (they clutter the log)
      if (!msg.message.includes('🧪 **Test Event**') && 
          !msg.message.includes('🧪 Verification Check')) {
        filteredMessages.push(msg);
      }
    }
    
    logInfo('getRecentMessages', 'Retrieved and filtered messages', { 
      totalCount: messages.length,
      filteredCount: filteredMessages.length,
      testEventsRemoved: messages.length - filteredMessages.length,
      daysBack: daysBack,
      cutoffDate: cutoffDate.toISOString()
    });
    return filteredMessages;
    
  } catch (error) {
    logError('getRecentMessages', error);
    return [];
  }
}

/**
 * Formats message history for Gemini AI context
 * @param {Array} messages - Array of message objects
 * @returns {string} Formatted text for AI prompt
 */
function buildContextFromHistory(messages) {
  if (!messages || messages.length === 0) {
    return 'No recent messages in my log.';
  }
  
  var context = 'Recent activity:\n\n';
  
  for (var i = 0; i < messages.length; i++) {
    var msg = messages[i];
    var icon = APP_ICONS[msg.source] || APP_ICONS['default'];
    
    context += icon + ' [' + msg.timestamp + '] ' + msg.source + ': ' + msg.message + '\n';
  }
  
  return context;
}

/**
 * Searches message history for specific keywords
 * @param {string} keyword - Keyword to search for
 * @param {number} maxResults - Maximum results to return (default: 10)
 * @returns {Array} Array of matching message objects
 */
function searchMessageHistory(keyword, maxResults) {
  try {
    maxResults = maxResults || 10;
    const data = getSheetDataWithServiceAccount(SHEET_ID, 'MessageLog');
    
    if (!data || data.length <= 1) {
      return [];
    }
    
    const keywordLower = keyword.toLowerCase();
    const matches = [];
    
    // Search from most recent backwards
    for (var i = data.length - 1; i >= 1 && matches.length < maxResults; i--) {
      const row = data[i];
      const source = (row[1] || '').toLowerCase();
      const message = (row[2] || '').toLowerCase();
      
      // Check if keyword appears in source or message
      if (source.includes(keywordLower) || message.includes(keywordLower)) {
        matches.unshift({
          timestamp: row[0] || '',
          source: row[1] || 'unknown',
          message: row[2] || '',
          user: row[3] || ''
        });
      }
    }
    
    logInfo('searchMessageHistory', 'Search completed', { 
      keyword: keyword, 
      matches: matches.length 
    });
    
    return matches;
    
  } catch (error) {
    logError('searchMessageHistory', error);
    return [];
  }
}

// ==================== TEST FUNCTIONS ====================

/**
 * Test function - View recent messages
 */
function testGetRecentMessages() {
  const messages = getRecentMessages(5);
  Logger.log('Recent messages:');
  for (var i = 0; i < messages.length; i++) {
    Logger.log('[' + messages[i].timestamp + '] ' + messages[i].source + ': ' + messages[i].message);
  }
  return messages.length + ' messages found';
}

/**
 * Test function - Search for keyword
 */
function testSearchMessages() {
  const keyword = 'planka'; // Change this to test
  const results = searchMessageHistory(keyword);
  Logger.log('Search results for "' + keyword + '":');
  for (var i = 0; i < results.length; i++) {
    Logger.log('[' + results[i].timestamp + '] ' + results[i].source + ': ' + results[i].message);
  }
  return results.length + ' results found';
}
