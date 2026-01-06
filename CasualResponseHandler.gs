/**
 * Casual Response Handler
 * Handles greetings, thanks, and other casual messages WITHOUT using AI
 * Saves tokens and provides instant responses!
 */

// ==================== CASUAL MESSAGE PATTERNS ====================

const CASUAL_RESPONSES = {
  greetings: {
    patterns: ['hi', 'hey', 'hello', 'hi oppa', 'hi ', 'hey ', 'good morning', 'good afternoon', 'good evening', 'yo', 'sup', 'annyeong', 'kamusta', 'musta'],
    responses: [
      "안녕 (Hey)",
      "Sup",
      "Yo",
      "Hey",
      "Hi",
      "Hello",
      "Musta",
      "Kamusta",
      "화이팅",
      "�",
      "Annyeong",
      "Uy",
      "Hey there",
      "What's up",
      "Morning",
      "Afternoon",
      "Evening",
      "Yep",
      "'Sup",
      "Hola"
    ]
  },
  
  gratitude: {
    patterns: ['thanks', 'thank you', 'thx', 'ty', 'appreciate', 'tysm', 'gomawo', 'gamsahamnida', 'salamat'],
    responses: [
      "천만에",
      "No problem",
      "괜찮아",
      "Sure thing",
      "Yep",
      "👍",
      "Welcome",
      "Walang anuman",
      "Siyempre",
      "Oo naman",
      "대박",
      "✓",
      "🙌",
      "Gotcha",
      "Course",
      "For sure",
      "화이팅",
      "Happy to help out!",
      "No problem at all!",
      "Anytime you need!",
      "Glad I could help!",
      "Always here for you!",
      "My pleasure!"
    ]
  },
  
  status: {
    patterns: ['how are you', 'whats up', 'how r u', 'hows it going', 'how you doing', 'jal jinaess'],
    responses: [
      "잘 지내",
      "Good",
      "Doing well",
      "좋아",
      "All good",
      "Pretty good",
      "Fine",
      "화이팅",
      "Okay",
      "Not bad",
      "Busy",
      "Same old",
      "Musta"
    ]
  },
  
  acknowledgment: {
    patterns: ['ok', 'okay', 'got it', 'cool', 'nice', 'great', 'awesome', 'perfect', 'alright', 'kk', 'k', 'ㅋㅋ', 'daebak'],
    responses: [
      "👍",
      "ㅇㅋ! (OK!)",
      "대박! (Awesome!)",
      "완벽! (Perfect!)",
      "좋아! ✓",
      "🙌",
      "Sounds good!",
      "✅",
      "Cool cool!",
      "Noted! 👌",
      "알았어! (Got it!)",
      "Right on!",
      "Nice! 🎉",
      "화이팅!",
      "All set!"
    ]
  },
  
  farewell: {
    patterns: ['bye', 'goodbye', 'see you', 'later', 'cya', 'ttyl', 'gn', 'good night', 'annyeong'],
    responses: [
      "Bye",
      "Later",
      "See ya",
      "안녕",
      "👋",
      "잘가",
      "Peace",
      "Cya",
      "Good luck",
      "화이팅",
      "Night",
      "잘자",
      "✌️",
      "Take care",
      "조심히"
    ]
  },
  
  help: {
    patterns: ['help me', 'need help', 'what can you do', 'commands', 'how do i use you', 'what do you know', 'capabilities', 'mwoya', 'how to use oppa'],
    responses: [
      "I handle PinoySeoul work stuff:\n\n🔧 Tools info (Kimai, Planka, etc.)\n📚 Company procedures\n📊 Recent activity\n❓ Operational questions",
      "Ask me about:\n\n• PinoySeoul tools & systems\n• Company workflows\n• Recent events\n• Operational stuff",
      "I can help with:\n\n✓ Company procedures\n✓ Tool questions\n✓ Recent activity\n✓ Operational workflows"
    ]
  },
  
  apologies: {
    patterns: ['sorry', 'my bad', 'oops', 'my fault', 'pasensya', 'mianhae', 'sorry na', 'sori'],
    responses: [
      "No worries",
      "All good",
      "괜찮아",
      "Okay lang",
      "Fine",
      "👍",
      "No prob",
      "Chill",
      "괜찮아요",
      "Walang problema",
      "네",
      "Good",
      "S'okay"
    ]
  },
  
  laughter: {
    patterns: ['lol', 'haha', 'lmao', 'ㅋㅋ', 'hehe', 'funny', 'rofl', 'lmfao', 'omg', 'wtf'],
    responses: [
      "😄",
      "ㅋㅋ",
      "👍",
      "Haha",
      "😂",
      "ㅎㅎ",
      "Lol",
      "🤣",
      "😅",
      "Nice"
    ]
  },
  
  agreement: {
    patterns: ['agree', 'exactly', 'true', 'same', 'facts', 'right', 'correct', 'tama', 'oo nga', 'yup', 'yeah'],
    responses: [
      "👍",
      "Yep",
      "✓",
      "Oo",
      "네",
      "Tama",
      "Right",
      "Exactly",
      "Facts",
      "💯",
      "True"
    ]
  },
  
  encouragement: {
    patterns: ['fighting', 'good luck', 'kaya mo yan', 'you can do it', 'go go', 'lets go', '화이팅', 'ganbare', 'kaya natin'],
    responses: [
      "화이팅!",
      "Kaya natin!",
      "💪",
      "Go!",
      "파이팅!",
      "Let's go!",
      "Ganbatte!",
      "You got this!",
      "Kaya mo yan!",
      "🔥",
      "Tara na!",
      "You can do it!",
      "Rooting for you!",
      "I believe in you!",
      "Give it your best!"
    ]
  },
  
  confusion: {
    patterns: ['huh', 'confused', 'dont get it', 'ha', '???', 'wut', 'what do you mean', 'i dont understand'],
    responses: [
      "Clarify your question?",
      "What do you need?",
      "Ask again?",
      "뭐?",
      "Unclear - rephrase?"
    ]
  },
  
  weekend: {
    patterns: ['happy friday', 'tgif', 'happy monday', 'happy weekend', 'long day', 'long week', 'weekend', 'friday'],
    responses: [
      "화이팅",
      "Rest well",
      "Enjoy",
      "휴식",
      "Pahinga",
      "Nice",
      "Almost there",
      "👍",
      "Weekend mode",
      "Chill"
    ]
  },
  
  compliments: {
    patterns: ['nice', 'helpful', 'smart', 'good answer', 'thanks oppa', 'appreciate it', 'galing', 'good job'],
    responses: [
      "👍",
      "Thanks",
      "Yep",
      "Salamat",
      "고마워",
      "✓",
      "Sure",
      "Noted"
    ]
  },
  
  frustration: {
    patterns: ['ugh', 'tired', 'sleepy', 'busy', 'stressed', 'pagod', 'antok', 'hay'],
    responses: [
      "화이팅",
      "Rest up",
      "Break time?",
      "Pahinga",
      "Coffee?",
      "Almost done",
      "Hang in there",
      "☕",
      "💪",
      "Kaya yan"
    ]
  },
  
  affirmations: {
    patterns: ['yes', 'yep', 'yeah', 'yup', 'oo', '네', 'sige', 'sure', 'okay'],
    responses: [
      "👍",
      "Noted",
      "Got it",
      "Okay",
      "네",
      "Oo",
      "✓",
      "Sige",
      "Sure"
    ]
  },
  
  negations: {
    patterns: ['no', 'nope', 'nah', 'hindi', '아니', 'ayaw', 'not really'],
    responses: [
      "Okay",
      "Got it",
      "👍",
      "네",
      "Noted",
      "Sure",
      "Fine"
    ]
  },
  
  nvm: {
    patterns: ['nvm', 'nevermind', 'ignore that', 'disregard', 'wrong chat', 'oops wrong person', 'cancel', 'forget it'],
    responses: [
      "👍",
      "Noted",
      "Okay",
      "네",
      "Got it",
      "Sure",
      "No prob",
      "All good"
    ]
  },
  
  waiting: {
    patterns: ['brb', 'one sec', 'hold on', 'wait', 'sandali', '잠깐', 'sec', 'gimme a sec'],
    responses: [
      "👍",
      "Sure",
      "Okay",
      "네",
      "Sige",
      "Take your time",
      "No rush"
    ]
  },
  
  celebrations: {
    patterns: ['yay', 'woohoo', 'congrats', 'nice done', 'we did it', 'success', 'yahoo', 'yey'],
    responses: [
      "🎉",
      "Nice!",
      "💯",
      "대박!",
      "Congrats!",
      "화이팅!",
      "Galing!",
      "🙌",
      "Awesome!",
      "Great!",
      "That's amazing!",
      "Way to go!",
      "Proud of you!",
      "Nice work!",
      "You crushed it!",
      "Celebrate! 🎊"
    ]
  },
  
  kimai_urls: {
    patterns: ['kimai link', 'kimai url', 'where is kimai', 'kimai site', 'time tracking link', 'timesheet link'],
    responses: ["time.pinoyseoul.com"]
  },
  
  planka_urls: {
    patterns: ['planka link', 'planka url', 'where is planka', 'planka site', 'project board link', 'boards link'],
    responses: ["projects.pinoyseoul.com"]
  },
  
  vaultwarden_urls: {
    patterns: ['vaultwarden link', 'vault link', 'password link', 'where is vaultwarden', 'vault url'],
    responses: ["vault.pinoyseoul.com"]
  },
  
  docuseal_urls: {
    patterns: ['docuseal link', 'docuseal url', 'where is docuseal', 'contract link', 'signing link'],
    responses: ["legal.pinoyseoul.com"]
  },
  
  postiz_urls: {
    patterns: ['postiz link', 'postiz url', 'where is postiz', 'social media link', 'scheduler link'],
    responses: ["social.pinoyseoul.com"]
  },
  
  azuracast_urls: {
    patterns: ['azuracast link', 'radio link', 'where is azuracast', 'azura url', 'streaming link'],
    responses: ["radio.pinoyseoul.com"]
  },
  
  jellyseerr_urls: {
    patterns: ['jellyseerr link', 'request link', 'where is jellyseerr', 'media request link'],
    responses: ["request.pinoyseoul.com"]
  },
  
  jellyfin_urls: {
    patterns: ['jellyfin link', 'media link', 'where is jellyfin', 'streaming server link', 'watch link'],
    responses: ["server.pinoyseoul.com"]
  },
  
  invoiceshelf_urls: {
    patterns: ['invoiceshelf link', 'invoice link', 'billing link', 'where is invoiceshelf', 'office link'],
    responses: ["office.pinoyseoul.com"]
  },
  
  urgency: {
    patterns: ['urgent', 'asap', 'emergency', 'now', 'quickly', 'rush', 'important'],
    responses: [
      "Ask away.",
      "What's up?",
      "뭐?",
      "Ano?",
      "Go ahead.",
      "Shoot."
    ]
  },
  
  emojireact: {
    patterns: ['👍', '❤️', '🔥', '💯', '✅', '✓'],
    responses: [
      "👍",
      "✓",
      "Yep",
      "네",
      "Noted"
    ]
  },
  
  wrongperson: {
    patterns: ['wrong person', 'not you', 'meant for', 'not oppa', 'my bad oppa'],
    responses: [
      "👍",
      "No prob",
      "All good",
      "Okay",
      "괜찮아",
      "네"
    ]
  },
  
  meeting: {
    patterns: ['in a meeting', 'on a call', 'meeting now', 'busy with meeting', 'call right now'],
    responses: [
      "👍",
      "Got it",
      "Okay",
      "네",
      "Noted",
      "Sure",
      "No worries"
    ]
  },
  
  availability: {
    patterns: ['free now', 'available', 'back', 'available now', 'im free'],
    responses: [
      "👍",
      "Cool",
      "Good",
      "Okay",
      "네",
      "Nice"
    ]
  },
  
  taskstatus: {
    patterns: ['done', 'finished', 'completed', 'working on it', 'in progress', 'almost done'],
    responses: [
      "Nice!",
      "👍",
      "Great!",
      "Good stuff!",
      "Awesome!",
      "💯",
      "Keep going!",
      "화이팅!",
      "Galing!"
    ]
  },
  
  fyi: {
    patterns: ['fyi', 'heads up', 'btw', 'by the way', 'just so you know'],
    responses: [
      "Noted",
      "👍",
      "Thanks",
      "Got it",
      "Okay",
      "네",
      "Good to know",
      "Salamat"
    ]
  },
  
  // ==================== TROUBLESHOOTING ====================
  troubleshooting: {
    patterns: [
      'cant login', "can't login", 'forgot password', 'reset password', 'password reset',
      'cant access', "can't access", 'getting error', 'error message', 'not loading',
      'broken', 'not working', 'down', 'wont load', "won't load",
      'stuck', 'frozen', 'crashed', 'login failed', 'access denied'
    ],
    responses: [
      "Can't login? Use forgot password link!",
      "Password reset: Click forgot password on the tool!",
      "Error? Try refreshing or ask the team!",
      "Not working? Refresh the page first!",
      "Access issue? Ping your team lead!",
      "Try clearing cache or different browser!",
      "Still broken? Ask in group chat!",
      "Restart and try again!",
      "Check your internet connection!",
      "Tech issues? Reach out to the team!",
      "Try logging out and back in!",
      "Clear cookies and retry!"
    ]
  },
  
  // ==================== WRONG COMMAND/DIRECTIVE ====================
  wrongcommand: {
    patterns: [
      'tell him to', 'tell her to', 'tell them to', 'send this to', 'forward to',
      'remind me', 'set reminder', 'schedule a', 'schedule this', 'set timer', 'set alarm',
      'call', 'email', 'message', 'ping them', 'notify', 'alert',
      'create task for', 'assign to', 'delegate to'
    ],
    responses: [
      "I don't send messages - do it yourself!",
      "Can't schedule - use calendar!",
      "Not a messenger - ping them directly!",
      "I don't create tasks - use Planka!",
      "Can't forward - send it yourself!",
      "Not a reminder bot - set your own!",
      "No messaging capability - DM them!",
      "Can't notify others - you do it!",
      "I'm not a task manager - handle it!",
      "Direct communication works better!"
    ]
  },
  
  // ==================== PERMISSION QUESTIONS ====================
  permission: {
    patterns: [
      'can i', 'am i allowed', 'is it ok if', 'is it okay if',
      'do i need permission', 'who do i ask', 'may i', 'should i ask',
      'allowed to', 'permitted to', 'authorization', 'approval needed'
    ],
    responses: [
      "Ask your team lead!",
      "Check with the team!",
      "Your call - talk to your lead!",
      "Team lead approves that!",
      "Run it by your lead!",
      "Ask the team - you'll figure it out!",
      "Team decision - bring it up!",
      "Discuss with the team!"
    ]
  },
  
  // ==================== REPETITION/MISHEAR ====================
  repetition: {
    patterns: [
      'what did you say', 'come again', 'repeat that', 'say again',
      'didnt catch that', "didn't catch that", 'pardon', 'excuse me what',
      'repeat please', 'one more time'
    ],
    responses: [
      "Scroll up - it's in the chat!",
      "Check message history!",
      "Look above!",
      "Already answered - scroll up!",
      "See previous message!",
      "It's in the chat history!"
    ]
  },

  // ==================== CONFUSION/CLARIFICATION ====================
  confusion: {
    patterns: [
      'what are you saying', 'what do you mean', 'what does that mean', 'what did you say',
      'huh', 'confused', 'unclear', 'didnt understand', "didn't get that", 
      'repeat that', 'say again', 'say that again', 'come again',
      'ano daw', 'ano raw', 'ano yun', 'mwo', '뭐라고', 'pardon', 'excuse me'
    ],
    responses: [
      "Sorry if that wasn't clear! Ask me more specifically?",
      "Let me know what part was confusing!",
      "Unclear? Ask again with more details!",
      "My bad if that was confusing - be more specific?",
      "Rephrase your question so I understand better!"
    ]
  },

  // ==================== MEDIA/MOVIES ====================
  media_watching: {
    patterns: [
      'watch movie', 'watch a movie', 'watch movies', 'how to watch',
      'media server', 'jellyfin', 'jellyseerr', 'streaming server',
      'request movie', 'request show', 'request content',
      'where to watch', 'how do i watch'
    ],
    responses: [
      "Use Jellyfin (our media server) to watch movies and shows: server.pinoyseoul.com\n\nWant something new? Request it via Jellyseerr: request.pinoyseoul.com",
      "We have Jellyfin for streaming! Go to server.pinoyseoul.com\n\nRequest new content at request.pinoyseoul.com and the team will add it.",
      "Jellyfin is our media server - stream at server.pinoyseoul.com\nJellyseerr is for requests - request.pinoyseoul.com"
    ]
  },

  // ==================== SICK/EMERGENCY LEAVE ====================
  sick_leave: {
    patterns: [
      'i am sick', 'im sick', 'not feeling well', 'sick today', 'feeling sick',
      'emergency leave', 'family emergency', 'urgent leave', 'cant come in',
      "can't work today", 'absent today', 'need to be absent'
    ],
    responses: [
      "Message your Manager or team lead on Google Chat *right away* to let them know.\n\nMake sure to update your Planka cards and log any hours in Kimai before you're out!",
      "Tell your team lead via Google Chat immediately!\n\nUpdate your Planka status and log time in Kimai so the team knows what's covered.",
      "DM your Manager on Google Chat ASAP!\n\nLeave notes on your Planka cards so teammates know the status. Feel better!"
    ]
  },

  // ==================== RADIO SCHEDULE ====================
  // radio_schedule removed - AI should check logs for actual schedule sync data
  // company_overview removed - AI should give specific tailored answers, not generic overview
  
  // ==================== FOUNDER INFO ====================
  founder_info: {
    patterns: [
      'who is the founder', 'about the founder', 'who founded', 'founder info',
      'who started pinoy seoul', 'nash ang', 'who is nash', 'who created pinoyseoul'
    ],
    responses: [
      "PinoySeoul was founded in 2017 by *Nash Ang* to give back to the Filipino community that supported his education in Korea.\n\n" +
      "Nash created PinoySeoul.com as a bridge for Filipinos in Korea and launched the EPS-TOPIK Online community in 2018 to help aspiring workers."
    ]
  },

  // ==================== EPS-TOPIK PROGRAM ====================
  eps_topik_info: {
    patterns: [
      'eps topik', 'eps-topik', 'topik exam', 'korean exam', 'korean test',
      'eps topik online', 'korean language training', 'how to pass eps topik'
    ],
    responses: [
      "EPS-TOPIK Online is our free Korean language training program for aspiring Filipino workers!\n\n" +
      "📚 136,000+ community members\n" +
      "✅ Free tutorials & study materials\n" +
      "🎯 Helps Filipinos pass the exam for Korea jobs\n\n" +
      "Founded 2018, hosted by Nash Ang on Facebook, YouTube, and Spotify."
    ]
  },

  // ==================== RADIO PROGRAM ====================
  // radio_program_info removed - AI should give specific answers based on Company-Overview.md
  
  // ==================== MISSION/PURPOSE ====================
  mission_info: {
    patterns: [
      'mission', 'vision', 'purpose', 'why pinoy seoul', 'why pinoyseoul',
      'who do we serve', 'target audience', 'who is this for', 'our mission'
    ],
    responses: [
      "Our mission: Serve as a bridge for Filipinos in Korea and give back through accessible media.\n\n" +
      "We serve:\n" +
      "🏭 OFWs currently in Korea\n" +
      "📚 Aspiring Korea workers (EPS-TOPIK)\n" +
      "💜 K-culture enthusiasts in PH\n\n" +
      "100% free access to all content!"
    ]
  },

  // ==================== OFF-TOPIC: PERSONAL AI QUESTIONS ====================
  offtopic_personal: {
    patterns: [
      'where do you live', 'how old are you', 'are you human', 'are you ai', 'are you a bot',
       'whats your name', 'who made you', 'who are you', 'who is oppa',
      'your family', 'your parents', 'your birthday', 'do you have feelings', 'do you dream',
      'favorite color', 'favorite food', 'favorite movie', 'do you sleep', 'are you real'
    ],
    responses: [
      "I'm OPPA - I focus on PinoySeoul work questions!",
      "I stick to work stuff! Try searching for personal topics.",
      "👔 Work questions are my thing! Search online for that."
    ]
  },
  
  // ==================== OFF-TOPIC: ENTERTAINMENT ====================
  offtopic_fun: {
    patterns: [
      'tell me a joke', 'write a poem', 'write a story', 'sing a song',
      'play a game', 'riddle', 'quiz me', 'trivia'
    ],
    responses: [
      "For fun stuff, try Reddit or search online! I stick to work.",
      "Entertainment isn't my focus - try Google for that!",
      "I'm work-focused! Search online for entertainment stuff."
    ]
  },
  
  // ==================== OFF-TOPIC: TIME ====================
  offtopic_time: {
    patterns: ['what time', 'current time', 'time is it', 'what day', 'what date'],
    responses: [
      "I don't track time! Check your device 😊",
      "Time stuff isn't my thing - check your phone!",
      "Your device knows the time better than I do!"
    ]
  },
  
  // ==================== OFF-TOPIC: GAMES ====================
  offtopic_games: {
    patterns: ['game', 'gaming', 'play', 'favorite game', 'video game', 'pc game'],
    responses: [
      "I'm all about PinoySeoul work! For gaming stuff, try r/gaming or search online.",
      "Gaming questions aren't my focus! Try Reddit or gaming forums.",
      "I stick to work topics! Search for gaming info online."
    ]
  },
  
  // ==================== OFF-TOPIC: RECIPES ====================
  offtopic_recipes: {
    patterns: ['cook', 'recipe', 'how to make', 'cooking', 'bake', 'prepare food'],
    responses: [
      "Recipe questions aren't my focus! Try panlasangpinoy.com for Filipino recipes!",
      "Cooking stuff? Check panlasangpinoy.com or search YouTube for tutorials!",
      "I'm work-focused! For recipes, try panlasangpinoy.com or Google."
    ]
  },
  
  // ==================== OFF-TOPIC: TEAM/MANAGER QUESTIONS ====================
  offtopic_team: {
    patterns: ['who is my manager', 'my manager', 'team lead', 'who do i report', 'org chart'],
    responses: [
      "Team structure questions - ask your team lead directly! They'll know best.",
      "For team/manager info, talk to your lead or check with the team!",
      "That's a team question - ask your lead or colleagues directly!"
    ]
  },
  
  // ==================== OFF-TOPIC: WEATHER ====================
  offtopic_weather: {
    patterns: ['weather', 'temperature', 'forecast', 'will it rain', 'how hot', 'how cold'],
    responses: [
      "I don't track weather! Try weather.com for forecasts.",
      "Weather isn't my thing - check weather.com or your weather app!",
      "For weather updates, weather.com has you covered!"
    ]
  },
  
  // ==================== OFF-TOPIC: TRANSLATION ====================
  offtopic_translate: {
    patterns: ['translate this', 'how do you say', 'what does this mean in', 'translate to'],
    responses: [
      "I don't do translations! Use Google Translate: translate.google.com",
      "For translations, Google Translate works great: translate.google.com",
      "Translation help at: translate.google.com - super easy to use!"
    ]
  },
  
  // ==================== OFF-TOPIC: MATH/CALCULATIONS ====================
  offtopic_math: {
    patterns: ['calculate tip', 'what is 5', 'what is 10', 'solve math', 'math homework', 'help with math', 'algebra', 'geometry'],
    responses: [
      "I don't crunch numbers! Use your phone's calculator or calculator.net.",
      "Math stuff? Your calculator app is perfect for that!",
      "For calculations, calculator.net or Google Calculator work great!"
    ]
  },
  
  // ==================== OFF-TOPIC: NEWS ====================
  offtopic_news: {
    patterns: ['latest news', 'current events', 'breaking news', 'news about', 'whats happening'],
    responses: [
      "I focus on PinoySeoul work! For news, try: news.google.com",
      "News isn't my thing - check news.google.com!",
      "Current events? news.google.com has you covered!"
    ]
  },
  
  // ==================== OFF-TOPIC: SHOPPING ====================
  offtopic_shopping: {
    patterns: [
      'best phone', 'best laptop', 'where to buy', 'how much does', 'price of',
      'product recommendation', 'shopping', 'cheapest'
    ],
    responses: [
      "I don't shop! For deals, try Lazada (lazada.com.ph) or Shopee (shopee.ph).",
      "Shopping questions aren't my thing - check Lazada or Shopee for products!",
      "For product recommendations, Lazada or Shopee are your best bet!"
    ]
  },
  
  // ==================== OFF-TOPIC: RECIPES/COOKING ====================
  offtopic_recipes: {
    patterns: ['recipe for', 'how to cook chicken', 'how to cook adobo', 'how to bake', 'cooking recipe', 'baking recipe', 'ingredients for adobo'],
    responses: [
      "Recipes? Try: panlasangpinoy.com or allrecipes.com",
      "Check panlasangpinoy.com for recipes!",
      "allrecipes.com or panlasangpinoy.com!"
    ]
  },
  

  // ==================== OFF-TOPIC: MUSIC ====================
  offtopic_music: {
    patterns: ['song', 'music', 'lyrics', 'artist', 'album', 'concert', 'playlist'],
    responses: [
      "I don't handle music stuff! Try Spotify (spotify.com) or YouTube for songs.",
      "Music questions? YouTube or Spotify are perfect for that!",
      "For music, spotify.com or youtube.com have everything!"
    ]
  },
  
  // ==================== OFF-TOPIC: TRAVEL ====================
  offtopic_travel: {
    patterns: [
      'vacation spot', 'vacation destination', 'holiday destination',
      'travel to korea', 'trip to korea', 'visiting korea',
      'tourist destination', 'tourist attraction in',
      'hotel in', 'book hotel', 'hotel booking',
      'flight to', 'flight booking', 'plane ticket'
    ],
    responses: [
      "Travel? Try: booking.com or agoda.com",
      "Check Agoda or Booking.com!",
      "booking.com or agoda.com for trips!"
    ]
  },
  
  // ==================== OFF-TOPIC: DIRECTIONS ====================
  offtopic_directions: {
    patterns: ['how to get to', 'directions to', 'nearest', 'location of', 'address of'],
    responses: [
      "Directions? Use: maps.google.com",
      "Check Google Maps!",
      "maps.google.com for directions!"
    ]
  },
  
  // ==================== OFF-TOPIC: SPORTS ====================
  offtopic_sports: {
    patterns: ['game score', 'who won', 'sports', 'basketball', 'football', 'soccer', 'tennis'],
    responses: [
      "Sports? Try: espn.com or sports.abs-cbn.com",
      "Check ESPN for scores!",
      "espn.com for sports updates!"
    ]
  },
  
  // ==================== OFF-TOPIC: TECH HELP ====================
  offtopic_techhelp: {
    patterns: [
      'fix my computer', 'my phone', 'windows problem', 'android issue',
      'iphone help', 'wifi not working'
    ],
    responses: [
      "Tech help? Try: support.google.com or reddit.com/r/techsupport",
      "Check Reddit techsupport or Google it!",
      "Google your device issue or ask Reddit!"
    ]
  },
  
  // ==================== OFF-TOPIC: ACADEMIC ====================
  offtopic_academic: {
    patterns: [
      'homework', 'essay', 'assignment', 'school project',
      'exam', 'taking a test', 'study test', 'test exam', 
      'quiz', 'midterm', 'final exam'
    ],
    responses: [
      "Homework? Try: khanacademy.org or chegg.com",
      "Check Khan Academy for learning!",
      "khanacademy.org for study help!"
    ]
  },
  
  // ==================== OFF-TOPIC: GENERIC CATCHALL ====================
  offtopic_generic: {
    patterns: [
      'pretend you are', 'act like', 'roleplay', 'politics', 'religious',
      'dating', 'romance', 'medical advice', 'legal advice', 'stock market',
      'horoscope', 'fortune', 'meaning of life', 'consciousness'
    ],
    responses: [
      "I focus on PinoySeoul work stuff! For that, try a regular search.",
      "Outside my work scope - Google can help with that!",
      "I'm work-focused! Try searching for that topic online.",
      "That's personal stuff - I stick to work questions!",
      "💼 Work questions only! Search online for that topic."
    ]
  },
  
  test: {
    patterns: ['test', 'testing', 'ping', 'are you there', 'are you alive', 'hello?', 'you there', 'isseo'],
    responses: [
      "Online",
      "있어",
      "Yep",
      "Here",
      "✅",
      "Pong",
      "👋",
      "Present",
      "Ready",
      "네",
      "Working",
      "Active"
    ]
  }
};

// ==================== SMART PATTERN MATCHING ====================

/**
 * Smart pattern matching with word boundaries
 * Prevents false positives while maximizing matches
 * 
 * Examples:
 * - "hi" matches "oh hi there" ✅ but NOT "shift" ❌
 * - "weather" matches "whats the weather" ✅ but NOT "sweater" ❌
 */
function matchesPattern(message, pattern) {
  var lowerMsg = message.toLowerCase();
  var lowerPattern = pattern.toLowerCase();
  
  // Quick rejection if pattern not in message at all
  if (!lowerMsg.includes(lowerPattern)) {
    return false;
  }
  
  // For very short patterns (1-3 chars), verify word boundary to avoid false positives
  // e.g., "hi" should NOT match "shift" or "this"
  if (lowerPattern.length <= 3) {
    // Escape special regex characters in pattern
    var escapedPattern = lowerPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regex = new RegExp('\\b' + escapedPattern + '\\b', 'i');
    return regex.test(message);
  }
  
  // For longer patterns (4+ chars), includes() is sufficient
  // Rare for false positives with longer strings
  return true;
}

// ==================== CASUAL MESSAGE DETECTION ====================

/**
 * Checks if message is casual and returns canned response
 * @param {string} message - User's message
 * @returns {string|null} Canned response or null if not casual
 */
function getCasualResponse(message) {
  if (!message || message.length > 150) {
    return null; // Long messages probably aren't casual
  }
  
  // Skip if message has multiple sentences (likely a real question)
  var sentenceCount = (message.match(/[.!?]+/g) || []).length;
  if (sentenceCount > 1) {
    return null;
  }
  
  // Message is already clean (stripped at entry point)
  var messageLower = message.toLowerCase().trim();
  
  // Check each pattern category
  for (var category in CASUAL_RESPONSES) {
    var config = CASUAL_RESPONSES[category];
    
    // SPECIAL CHECK: Acknowledgment should ONLY match very short messages
    // Prevents "what software was updated" from matching "updated" in acknowledgment
    if (category === 'acknowledgment' && message.length > 15) {
      continue; // Skip this category for longer messages
    }
    
    for (var i = 0; i < config.patterns.length; i++) {
      var pattern = config.patterns[i];
      
      // Use smart pattern matching (handles word boundaries)
      if (matchesPattern(message, pattern)) {
        // Return random response from this category
        var responses = config.responses;
        var randomIndex = Math.floor(Math.random() * responses.length);
        
        logInfo('getCasualResponse', 'Matched casual pattern', { 
          category: category,
          pattern: pattern,
          originalMessage: message,
          cleanedMessage: message,
          response: responses[randomIndex]
        });
        
        return responses[randomIndex];
      }
    }
  }
  
  return null; // Not a casual message
}

/**
 * Checks if message is JUST casual (entire message is casual)
 * Used to decide whether to skip AI entirely
 */
function isJustCasual(message) {
  const casualResponse = getCasualResponse(message);
  return casualResponse !== null;
}
