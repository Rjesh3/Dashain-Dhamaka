const errorMessages: Record<string, string> = {
  MISSING_IDEMPOTENCY_KEY: 'खेलको अनुरोध पूरा भएन। कृपया फेरि प्रयास गर्नुहोस्।',
  INVALID_IDEMPOTENCY_KEY: 'खेलको अनुरोध मान्य भएन। कृपया फेरि प्रयास गर्नुहोस्।',
  SESSION_INVALID: 'तपाईंको खेल सत्र अमान्य वा समाप्त भएको छ। पृष्ठ पुनःलोड गरेर फेरि प्रयास गर्नुहोस्।',
  NO_SPINS_REMAINING: 'तपाईंका सबै निःशुल्क स्पिन सकिएका छन्।',
  RATE_LIMITED: 'धेरै छिटो अनुरोध गरियो। केही बेरपछि फेरि प्रयास गर्नुहोस्।',
  TEMPORARILY_UNAVAILABLE: 'सेवा अहिले उपलब्ध छैन। तपाईंको अंक काटिएको छैन। कृपया फेरि प्रयास गर्नुहोस्।',
}

const messageTranslations: Array<[string, string]> = [
  ['you have used your free spins', 'तपाईंका सबै निःशुल्क स्पिन सकिएका छन्।'],
  ['session required', 'खेल सत्र आवश्यक छ। पृष्ठ पुनःलोड गरेर फेरि प्रयास गर्नुहोस्।'],
  ['session invalid', 'तपाईंको खेल सत्र अमान्य वा समाप्त भएको छ। पृष्ठ पुनःलोड गरेर फेरि प्रयास गर्नुहोस्।'],
  ['no active configuration found', 'खेल अहिले उपलब्ध छैन। कृपया केही बेरपछि फेरि प्रयास गर्नुहोस्।'],
  ['request failed', 'अनुरोध पूरा भएन। कृपया फेरि प्रयास गर्नुहोस्।'],
]

export const ne = {
  landing: {
    brandNepali: 'दशैं धमाका',
    eyebrowNepali: 'दशैंको विशेष खेल',
    eyebrowEnglish: 'Dashain Festival Game',
    headlineEnglish: 'Play & Win iPhone 17 Pro Max!',
    headlineNepali: 'खेल्नुहोस् र जित्नुहोस् — iPhone 17 Pro Max!',
    descriptionEnglish: 'Celebrate Dashain with Dashain Dhamaka! Spin the wheel, collect virtual points, and enjoy the festive game. Are you ready for the excitement?',
    descriptionNepali: 'दशैं धमाकासँग दशैंको रमाइलो मनाउनुहोस्! भाग्यचक्र घुमाउनुहोस्, भर्चुअल पोइन्टहरू सङ्कलन गर्नुहोस् र चाडपर्वको रमाइलो खेलको मजा लिनुहोस्। के तपाईं तयार हुनुहुन्छ?',
    playEnglish: 'PLAY NOW',
    playNepali: 'खेल सुरु गर्नुहोस्',
    adventureEnglish: 'Your Dashain adventure starts here.',
    adventureNepali: 'तपाईंको दशैंको रमाइलो यात्रा यहीँबाट सुरु हुन्छ।',
    disclaimerEnglish: 'This is a virtual entertainment game. Points have no cash value and cannot be exchanged for an actual iPhone.',
    disclaimerNepali: 'यो भर्चुअल मनोरञ्जन खेल हो। पोइन्टहरूको नगद मूल्य छैन र तिनलाई वास्तविक iPhone सँग साट्न मिल्दैन।',
    decorativeArt: 'सजावटी चित्र',
    rulesEnglish: 'Game Rules',
    privacyEnglish: 'Privacy Policy',
    footer: 'भर्चुअल रमाइलो मात्र',
    informationLabel: 'खेलसम्बन्धी जानकारी',
    disclaimerLabel: 'खेलबारे महत्त्वपूर्ण जानकारी',
    imageAlt: 'सजावटका लागि राखिएको iPhone 17 Pro Max को चित्र; वास्तविक पुरस्कार होइन',
  },
  brandEyebrow: 'दशैँको रमाइलो खेल',
  mainNavigation: 'मुख्य नेभिगेसन',
  home: 'गृहपृष्ठ',
  rules: 'खेलका नियम',
  privacy: 'गोपनीयता',
  about: 'हाम्रोबारे',
  virtualNotice: 'यो निःशुल्क भर्चुअल खेल हो। अङ्कको नगद मूल्य छैन र पुरस्कारसँग साट्न मिल्दैन।',
  wheel: 'अङ्क जित्ने चक्र',
  spinning: 'घुम्दैछ…',
  spin: 'स्पिन गर्नुहोस्',
  wallet: 'अङ्कको थैली',
  points: 'अङ्क',
  remaining: 'बाँकी',
  used: 'प्रयोग',
  total: 'जम्मा',
  walletMilestone: '100,000 अङ्क = iPhone लक्ष्य',
  walletMilestoneDisclaimer: 'भर्चुअल लक्ष्य मात्र — वास्तविक iPhone पुरस्कार होइन।',
  shareToWin: 'Share to win',
  share: 'Share',
  copyLink: 'Copy link',
  copied: 'Game link copied.',
  sharePointsAwarded: 'Share गर्नुभयो! 1,000 अङ्क थपियो।',
  sharePointsNote: 'हरेक share मा 1,000 अङ्क',
  iphoneGoalRemaining: 'iPhone लक्ष्यसम्म {percent}% बाँकी',
  iphoneGoalProgress: 'iPhone लक्ष्यतर्फको प्रगति',
  iphoneGoalImageAlt: 'iPhone लक्ष्यको सानो चित्र; वास्तविक पुरस्कार होइन',
  copyFailed: 'लिङ्क प्रतिलिपि गर्न सकिएन। ब्राउजरको share विकल्प प्रयोग गर्नुहोस्।',
  unlimitedSpins: 'असीमित स्पिन',
  spinsPlayed: 'स्पिन खेलियो',
  howToPlay: 'कसरी खेल्ने',
  howToPlaySteps: [
    'तपाईंले असीमित पटक निःशुल्क स्पिन गर्न सक्नुहुन्छ।',
    'स्पिन गर्नुहोस् थिच्नुहोस्; नतिजा सर्भरले छान्छ।',
    'भर्चुअल अङ्क जम्मा गर्नुहोस् र साथीहरूसँग रमाइलो बाँड्नुहोस्।',
  ],
  privacyAndFairPlay: 'गोपनीयता र पारदर्शिता',
  privacySummary: 'Dashain Dhamaka निःशुल्क भर्चुअल खेल हो। अङ्क मनोरञ्जनका लागि मात्र हुन्, तिनको नगद मूल्य छैन। हामी फोन नम्बर, इमेल वा खाता लगइन माग्दैनौँ।',
  loading: 'खेल सुरु हुँदैछ…',
  retry: 'फेरि प्रयास गर्नुहोस्',
  adSlot: 'विज्ञापन स्थान',
  result: 'तपाईंको नतिजा',
  congratulations: 'बधाई छ!',
  resultDescription: 'तपाईंको स्पिनमा {label} अङ्क आयो।',
  resultDisclaimer: 'यो मनोरञ्जनका लागि मात्र हो। भर्चुअल अङ्कको नगद मूल्य छैन र कुनै वास्तविक पुरस्कार दिइँदैन।',
  close: 'बन्द गर्नुहोस्',
  rulesTitle: 'खेलका नियम',
  ruleStatements: [
    'Dashain Dhamaka मनोरञ्जनका लागि बनाइएको निःशुल्क भर्चुअल खेल हो।',
    'खेल सत्रमा असीमित निःशुल्क स्पिन गर्न सकिन्छ।',
    'हरेक स्पिनको नतिजा ब्राउजरले होइन, सर्भरले तय गर्छ।',
    'अङ्कको नगद मूल्य हुँदैन र तिनलाई पुरस्कार, सामान वा भुक्तानीसँग साट्न मिल्दैन।',
    'लिङ्क साझा गर्नु ऐच्छिक हो र रमाइलोका लागि मात्र हो।',
  ],
  wheelOdds: 'चक्रका नतिजा र सम्भावना',
  odds: [
    ['10', '30%'],
    ['100', '25%'],
    ['200', '20%'],
    ['500', '12%'],
    ['700', '7%'],
    ['1,000', '5.6%'],
    ['10,000', '0.4%'],
  ],
  randomness: 'हरेक नतिजा अनियमित हुन्छ। सम्भावनाको औसतले तपाईंको अर्को नतिजा बताउँदैन, र ठूलो अङ्कको ग्यारेन्टी हुँदैन।',
  exhausted: 'तपाईंको अङ्क र प्रगति यही ब्राउजरको local storage मा सुरक्षित हुन्छ। ब्राउजरको डाटा मेटाएमा अङ्क हराउन सक्छ।',
  privacyTitle: 'गोपनीयता नीति',
  privacyParagraphs: [
    'हामी खेललाई सरल राख्छौँ र तपाईंको गोपनीयताको सम्मान गर्छौँ। फोन नम्बर, इमेल ठेगाना वा खाता लगइन आवश्यक पर्दैन।',
    'स्पिन इतिहास बेनाम सत्रसँग सर्भरमा राखिन्छ। अङ्कको थैली यही ब्राउजरको local storage मा सुरक्षित हुन्छ।',
    'कुन साझा लिङ्क प्रयोग भयो भन्ने बुझ्न मात्र सिफारिस विवरण प्रयोग गरिन्छ; यसबाट वास्तविक व्यक्तिको पहिचान गरिँदैन।',
    'ब्राउजरको डाटा मेटाएमा तपाईंको खेल प्रगति हराउन सक्छ। विज्ञापन वा अन्य सेवाबाट सङ्कलित विवरणबारे थप जानकारी तिनका आफ्नै गोपनीयता नीतिमा हेर्नुहोस्।',
  ],
  aboutTitle: 'यस खेलबारे',
  aboutParagraphs: [
    'Dashain Dhamaka दशैँमा छिटो र रमाइलो खेल खेल्न चाहने नेपाली प्रयोगकर्ताका लागि बनाइएको ब्राउजरमा चल्ने खेल हो।',
    'यसमा सर्भरले नतिजा तय गर्ने चक्र, बेनाम खेल सत्र र फोनमा सजिलै खेल्न मिल्ने बनोट छ।',
    'खेलका सबै अङ्क भर्चुअल हुन्; तिनको नगद मूल्य छैन र कुनै वास्तविक पुरस्कार दिइँदैन।',
  ],
  footerTagline: 'दशैँको रमाइलो, अङ्क भर्चुअल मात्र।',
  moreInformation: 'थप जानकारी',
  pageMetadata: {
    '/': {
      title: 'Dashain Dhamaka — दशैं धमाका',
      description: 'दशैंको रमाइलो भर्चुअल खेल खेल्नुहोस्। पोइन्टहरूको नगद मूल्य छैन र तिनलाई वास्तविक iPhone सँग साट्न मिल्दैन।',
    },
    '/play': {
      title: 'खेल सुरु गर्नुहोस् — Dashain Dhamaka',
      description: 'Dashain Dhamaka को भर्चुअल भाग्यचक्र खेल्नुहोस् र रमाइलोका लागि पोइन्टहरू सङ्कलन गर्नुहोस्।',
    },
    '/rules': {
      title: 'खेलका नियम — Dashain Dhamaka',
      description: 'स्पिनका नियम, अङ्कको सम्भावना र भर्चुअल खेलबारे Dashain Dhamaka को जानकारी।',
    },
    '/privacy': {
      title: 'गोपनीयता नीति — Dashain Dhamaka',
      description: 'Dashain Dhamaka खेलमा तपाईंको बेनाम सत्र र गोपनीयता कसरी सुरक्षित राखिन्छ भन्ने जानकारी।',
    },
    '/about': {
      title: 'हाम्रोबारे — Dashain Dhamaka',
      description: 'Dashain Dhamaka दशैँमा रमाइलोका लागि बनाइएको निःशुल्क भर्चुअल खेल हो।',
    },
  },
} as const

export function nepaliError(code: string, message: string, status?: number): string {
  if (errorMessages[code]) return errorMessages[code]

  const normalizedMessage = message.toLowerCase()
  const translation = messageTranslations.find(([english]) => normalizedMessage.includes(english))
  if (translation) return translation[1]

  if (status === 429) return errorMessages.RATE_LIMITED
  if (status === 503) return errorMessages.TEMPORARILY_UNAVAILABLE
  if (status === 409) return errorMessages.NO_SPINS_REMAINING
  if (normalizedMessage.includes('failed to fetch') || normalizedMessage.includes('networkerror') || normalizedMessage.includes('network request failed')) {
    return 'सर्भरसँग जडान हुन सकेन। आफ्नो इन्टरनेट जडान जाँचेर फेरि प्रयास गर्नुहोस्।'
  }
  return 'केही समस्या आयो। कृपया पृष्ठ पुनःलोड गरेर फेरि प्रयास गर्नुहोस्।'
}
