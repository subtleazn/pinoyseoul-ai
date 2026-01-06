/**
 * Logging Service - Simple interaction logging for OPPA
 */

// ==================== LOGGING FUNCTIONS ====================

/**
 * Logs any interaction to the ChatLogs sheet (if it exists)
 * This is separate from MessageLog which stores webhook messages
 */
function logInteraction(type, userEmail, input, output, success, details) {
  try {
    // Use service account for Sheet access
    const rowData = [
      new Date().toISOString(),
      type,
      userEmail,
      String(input || '').substring(0, 500),
      String(output || '').substring(0, 500),
      success ? 'SUCCESS' : 'FAILURE',
      String(details || '').substring(0, 500)
    ];
    
    // Try to append to ChatLogs sheet if it exists
    try {
      appendRowWithServiceAccount(SHEET_ID, 'ChatLogs', rowData);
    } catch (e) {
      // ChatLogs sheet doesn't exist, that's OK
      // Just log to console
      console.log('[INTERACTION]', type, userEmail, success ? 'SUCCESS' : 'FAILURE');
    }
    
  } catch (e) {
    console.error('logInteraction failed:', e);
  }
}

// ==================== TEST LOGGING ====================

function testLogging() {
  logInteraction('TEST', 'test@example.com', 'Test input', 'Test output', true, 'Manual test');
  Logger.log('Check ChatLogs sheet for test entry (or console if sheet doesn\'t exist)');
}
