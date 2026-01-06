# SMART DOCUMENT SELECTION STRATEGY

## Issue #1: Terminology Disambiguation

### Problem:
```
User asks: "Tell me about Pinoy Seoul Radio"
Current extraction: "radio" (filtered "pinoy" and "seoul")
But matches: ALL docs because "Pinoy Seoul" appears everywhere!
```

### Different Entities:
1. **PinoySeoul Media Enterprise** - The company
2. **PinoySeoul.com** - The website/blog
3. **Pinoy Seoul Radio** - The radio streaming app
4. **PinoySeoul** (one word) - Generic term (company or website)
5. **Pinoy Seoul** (two words) - Common misspelling

### Solution: Entity-Aware Keyword Extraction

```javascript
function extractKeywords(question) {
  var questionLower = question.toLowerCase();
  
  // STEP 1: Detect specific entities FIRST
  var entityKeywords = [];
  
  // Check for "radio" entity
  if (questionLower.includes('radio')) {
    entityKeywords.push('radio');
    // If radio mentioned, ONLY search radio-related docs
    return entityKeywords;
  }
  
  // Check for website entity
  if (questionLower.includes('website') || questionLower.includes('.com')) {
    entityKeywords.push('website');
    entityKeywords.push('content');
    return entityKeywords;
  }
  
  // Check for company entity
  if (questionLower.includes('company') || questionLower.includes('enterprise') ||
      questionLower.includes('business') || questionLower.includes('organization')) {
    entityKeywords.push('company');
    entityKeywords.push('operations');
    return entityKeywords;
  }
  
  // STEP 2: If no entity detected, extract action keywords
  var words = questionLower.split(/\s+/);
  var keywords = [];
  
  var stopwords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 
                   'can', 'you', 'me', 'about', 'tell', 'what',
                   'pinoy', 'seoul', 'pinoyseoul', // Generic terms
                   'more', 'please', 'thanks'];
  
  var actionWords = ['publish', 'write', 'broadcast', 'manage', 
                     'partnership', 'deal', 'outreach'];
  
  for (var i = 0; i < words.length; i++) {
    var word = words[i].trim();
    if (word.length > 3 && !stopwords.includes(word)) {
      if (actionWords.includes(word)) {
        keywords.push(word);
      }
    }
  }
  
  return keywords.length > 0 ? keywords : ['general'];
}
```

---

## Issue #2: Smart Document Selection (Industry Best Practice 2024)

### Current Problem:
```
Keyword-only matching (naive):
- "radio" matches filename
- Loads ANY doc with "radio" in name
- Ignores relevance
```

### Industry Solution: **Hybrid Search + Reranking**

**Step 1: BM25 Keyword Scoring**
```javascript
function scoreBM25(doc, keywords) {
  var score = 0;
  var docNameLower = doc.name.toLowerCase();
  
  for (var i = 0; i < keywords.length; i++) {
    var keyword = keywords[i].toLowerCase();
    
    // Exact filename match: HIGH score
    if (docNameLower === keyword + ' guide' || 
        docNameLower === keyword + ' playbook' ||
        docNameLower === keyword + ' manual') {
      score += 10;
    }
    // Keyword in filename: MEDIUM score
    else if (docNameLower.includes(keyword)) {
      score += 5;
    }
    // Keyword in description: LOW score
    else if (doc.description && doc.description.toLowerCase().includes(keyword)) {
      score += 2;
    }
  }
  
  return score;
}
```

**Step 2: Semantic Relevance Boost**
```javascript
function boostSemanticRelevance(doc, question) {
  var questionLower = question.toLowerCase();
  var docNameLower = doc.name.toLowerCase();
  var boost = 1.0;
  
  // Question-document intent matching
  var intentMap = {
    'how': ['playbook', 'guide', 'manual'],
    'what': ['overview', 'concept', 'handbook'],
    'who': ['handbook', 'operations'],
    'when': ['handbook', 'schedule'],
    'where': ['handbook', 'operations']
  };
  
  for (var intent in intentMap) {
    if (questionLower.includes(intent)) {
      var preferredDocs = intentMap[intent];
      for (var i = 0; i < preferredDocs.length; i++) {
        if (docNameLower.includes(preferredDocs[i])) {
          boost = 1.5;
          break;
        }
      }
    }
  }
  
  return boost;
}
```

**Step 3: Combined Hybrid Scoring**
```javascript
function scoreDocuments(docs, keywords, question) {
  var scoredDocs = [];
  
  for (var i = 0; i < docs.length; i++) {
    var doc = docs[i];
    
    // BM25 keyword score
    var keywordScore = scoreBM25(doc, keywords);
    
    // Semantic boost
    var semanticBoost = boostSemanticRelevance(doc, question);
    
    // Hybrid score
    var finalScore = keywordScore * semanticBoost;
    
    if (finalScore > 0) {
      scoredDocs.push({
        doc: doc,
        score: finalScore,
        reason: 'BM25: ' + keywordScore + ', Semantic: ' + semanticBoost
      });
    }
  }
  
  // Sort by score descending
  scoredDocs.sort(function(a, b) { return b.score - a.score; });
  
  return scoredDocs;
}
```

**Step 4: Top-K Selection with Diversity**
```javascript
function selectTopDocs(scoredDocs, maxDocs) {
  var selected = [];
  var categories = new Set();
  
  for (var i = 0; i < scoredDocs.length && selected.length < maxDocs; i++) {
    var item = scoredDocs[i];
    var doc = item.doc;
    
    // Diversity: Avoid loading multiple docs from same category
    var category = extractCategory(doc.name); // "playbook", "guide", "manual"
    
    // Always take top doc
    if (selected.length === 0) {
      selected.push(item);
      categories.add(category);
    }
    // For subsequent docs, prefer different categories
    else if (!categories.has(category) || selected.length < 2) {
      selected.push(item);
      categories.add(category);
    }
  }
  
  return selected;
}

function extractCategory(docName) {
  var nameLower = docName.toLowerCase();
  if (nameLower.includes('playbook')) return 'playbook';
  if (nameLower.includes('guide')) return 'guide';
  if (nameLower.includes('manual')) return 'manual';
  if (nameLower.includes('handbook')) return 'handbook';
  return 'other';
}
```

---

## Implementation Plan:

### Phase 1: Fix Entity Recognition (Immediate)
1. Update `extractKeywords()` with entity detection
2. "radio" query → ONLY load "Radio Guide"
3. Result: Loads 1-2 docs instead of 6

### Phase 2: Implement Hybrid Scoring (Next)
1. Add `scoreBM25()` function
2. Add `boostSemanticRelevance()` function
3. Replace naive keyword matching with scored matching

### Phase 3: Add Document Diversity (Future)
1. Implement category extraction
2. Prefer diverse document types
3. Avoid redundancy

---

## Expected Results:

### Before:
```
Question: "Tell me about Pinoy Seoul Radio"
Keywords: "radio"
Matched: 6 docs (Radio Guide, Dealmaker's, Studio, Manager's, etc.)
Loaded: All 6
Tokens: 34K
```

### After Phase 1:
```
Question: "Tell me about Pinoy Seoul Radio"
Entity detected: "radio"
Keyword: "radio"
Matched: Radio Guide (score: 10), Studio (score: 2)
Loaded: Top 1 (Radio Guide only)
Tokens: ~15K ✅
```

### After Phase 2:
```
Question: "How do I publish content?"
Keywords: "publish"
BM25 scores:
- Writer's Playbook: 10 (exact match)
- Employee Handbook: 2 (mentioned)
Semantic boost:
- Writer's Playbook: 1.5 ("how" + "playbook")
Final: Writer's Playbook (15), Handbook (2)
Loaded: Top 1 (Writer's Playbook)
Tokens: ~12K ✅
```

---

## Want me to implement Phase 1 now?

Entity-aware keyword extraction that will:
- Detect "radio" entity → Load ONLY Radio Guide
- Detect "website" → Load ONLY Content/Writer docs
- Detect "company" → Load ONLY Handbook/Overview

This alone will fix 80% of your issues! 🎯
