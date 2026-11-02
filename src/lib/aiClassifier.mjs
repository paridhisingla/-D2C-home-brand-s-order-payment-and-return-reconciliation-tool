/**
 * AI Tamil Translation & Issue Reason Categorization Engine (ESM)
 * Built for Tiruppur Knitwear Exporters (Company A)
 */

export const PRODUCTION_REASON_CATEGORIES = [
  'Machine Breakdown',
  'Needle / Trims Shortage',
  'Fabric / Dyeing Defect',
  'Subcontract Printing / Washing Delay',
  'Power Outage / Utilities',
  'Labour Absenteeism',
  'Buyer Sample Approval Pending',
  'Normal Production / No Issue',
  'Other / Uncategorized',
];

const KNOWLEDGE_BASE = [
  {
    category: 'Machine Breakdown',
    tamilKeywords: ['இயந்திரம்', 'மெஷின்', 'மோட்டார்', 'பழுது', 'ஓடவில்லை', 'கெட்டுப்போனது', 'லூப்பர்', 'ரிப்பேர்'],
    tanglishKeywords: ['machine repair', 'motor repair', 'machine problem', 'motor problem', 'motor odala', 'stitching machine', 'stitching machine fault', 'looper broken'],
    englishTranslationTemplate: 'Stitching/cutting machine breakdown reported; maintenance technician called for repairs.',
    confidence: 0.94,
  },
  {
    category: 'Needle / Trims Shortage',
    tamilKeywords: ['ஊசி', 'நீடில்', 'நூல்', 'பட்டன்', 'ஜிப்', 'லேபிள்', 'பற்றாக்குறை', 'ஸ்டாக் இல்லை'],
    tanglishKeywords: ['needle break', 'needle stock illai', 'nool shortage', 'thread illai', 'zipper shortage', 'trims pending'],
    englishTranslationTemplate: 'Production halted due to needle breakage and delay in replenishment of sewing threads/trims.',
    confidence: 0.93,
  },
  {
    category: 'Fabric / Dyeing Defect',
    tamilKeywords: ['துணி', 'சாயம்', 'ஓட்டை', 'கறை', 'நிற மாற்றம்', 'ஷேட்', 'துணியில் குறைபாடு', 'சுருக்கம்'],
    tanglishKeywords: ['fabric defect', 'thuni damage', 'shade variation', 'colour maari pochu', 'hole irukku', 'stain in fabric'],
    englishTranslationTemplate: 'Fabric shade variation and knitting defects observed; affected rolls sent back to dyeing unit.',
    confidence: 0.91,
  },
  {
    category: 'Subcontract Printing / Washing Delay',
    tamilKeywords: ['பிரிண்டிங்', 'வாஷிங்', 'மை காயவில்லை', 'ஸ்கிரீன்', 'சப் கான்ட்ராக்ட்', 'வெளியில் அனுப்பிய', 'டெலிவரி தாமதம்'],
    tanglishKeywords: ['printing delay', 'washing delay', 'subcontract delivery late', 'screen printing fault', 'ink dry aagala'],
    englishTranslationTemplate: 'Subcontracted chest print and enzyme wash lot returned late from external Tiruppur vendor.',
    confidence: 0.92,
  },
  {
    category: 'Power Outage / Utilities',
    tamilKeywords: ['மின்வெட்டு', 'கரண்ட் இல்லை', 'ஜெனரேட்டர்', 'டீசல்', 'கம்ப்ரசர்', 'காற்றழுத்தம்'],
    tanglishKeywords: ['current cut', 'power cut', 'current illai', 'generator problem', 'compressor leak', 'eb line fault'],
    englishTranslationTemplate: 'Factory floor electrical power cut disrupted sewing lines; resumed on backup diesel generator with reduced capacity.',
    confidence: 0.95,
  },
  {
    category: 'Labour Absenteeism',
    tamilKeywords: ['ஆட்கள் வரவில்லை', 'லீவு', 'ஆப்சென்ட்', 'ஹெல்பர் இல்லை', 'பண்டிகை', 'தொழிலாளர்கள் குறைவு', 'மந்தமாக'],
    tanglishKeywords: ['aatkal varala', 'operators leave', 'tailors absent', 'deepavali leave', 'pongal leave', 'helpers shortage'],
    englishTranslationTemplate: 'Sewing line operators and helpers absent; unit running at approximately 65% standard line efficiency.',
    confidence: 0.88,
  },
  {
    category: 'Buyer Sample Approval Pending',
    tamilKeywords: ['அப்ரூவல் வரவில்லை', 'பையர்', 'சாம்பிள்', 'சைஸ் செட்', 'அனுமதி பெண்டிங்', 'தாமதம்'],
    tanglishKeywords: ['buyer approval late', 'sample pending', 'fit sample not approved', 'size set rejection', 'merchandiser confirmation pending'],
    englishTranslationTemplate: 'Bulk cutting on hold awaiting buyer QA fit sample and lab dip shade approval.',
    confidence: 0.90,
  },
  {
    category: 'Normal Production / No Issue',
    tamilKeywords: ['பிரச்சனை இல்லை', 'சீராக', 'நன்றாக நடக்கிறது', 'டார்கெட் முடிந்தது', 'அமைதியாக'],
    tanglishKeywords: ['no problem', 'all good', 'target completed', 'line smooth', 'olunga pogudhu'],
    englishTranslationTemplate: 'Shift completed normally with no floor downtime or machine interruptions.',
    confidence: 0.96,
  },
];

const TAMIL_PHRASES_MAP = {
  'தையல் மெஷின் மோட்டார் பழுதாகிவிட்டது, மெக்கானிக் வந்து சரிசெய்கிறார்':
    'Stitching machine motor broke down; factory mechanic is repairing it.',
  'நீடில் உடைந்துவிட்டது, புதிய ஊசி வர தாமதம்':
    'Needles broke on flatlock line; delay in receiving replacement needles from store.',
  'பிரிண்டிங் ஸ்கிரீன் மை காய நேரம் எடுக்கிறது, வானிலை ஈரமாக உள்ளது':
    'Screen printing ink is taking longer to cure due to humid weather in Tiruppur.',
  'மின்வெட்டு காரணமாக 2 மணி நேரம் வேலை நின்றது':
    'Production stopped for 2 hours due to an unscheduled electricity board power outage.',
  'துணியில் நிற மாற்றம் காணப்படுகிறது, சாயப்பட்டறைக்கு தகவல் அனுப்பப்பட்டுள்ளது':
    'Shade variation observed across fabric rolls; notified the Arulpuram dyeing subcontract unit.',
  'இன்று வேலை மந்தமாக உள்ளது, சில ஆட்கள் வரவில்லை':
    'Work is progressing slowly today as several line operators are absent without notice.',
  'வாஷிங் முடிந்து இன்னும் லாரியில் லோடு வரவில்லை':
    'Washed garment lots have not yet arrived from the subcontract washing facility.',
  'சைஸ் எக்ஸ்எல் கட்டிங் முடிந்தது, ஸ்டிச்சிங் தொடங்குகிறது':
    'Size XL cutting completed; garments are being fed into the sewing lines.',
};

export function classifyTamilNote(note) {
  const trimmed = (note || '').trim();

  if (!trimmed) {
    return {
      originalTamil: '',
      englishTranslation: 'No notes provided by supervisor.',
      predictedCategory: 'Normal Production / No Issue',
      confidence: 1.0,
      needsReview: false,
      explanation: 'No floor disruption reported.',
      detectedKeywords: [],
      alternativeCategories: [],
    };
  }

  // 1. Exact dictionary match
  for (const [tamilPhrase, translation] of Object.entries(TAMIL_PHRASES_MAP)) {
    if (trimmed.includes(tamilPhrase) || tamilPhrase.includes(trimmed)) {
      const matchedRule = KNOWLEDGE_BASE.find(rule => 
        rule.tamilKeywords.some(k => trimmed.includes(k)) || 
        rule.tanglishKeywords.some(k => trimmed.toLowerCase().includes(k))
      );
      
      const category = matchedRule ? matchedRule.category : 'Machine Breakdown';
      const conf = matchedRule ? matchedRule.confidence : 0.92;

      return {
        originalTamil: trimmed,
        englishTranslation: translation,
        predictedCategory: category,
        confidence: conf,
        needsReview: conf < 0.75,
        explanation: `High confidence match (${Math.round(conf * 100)}%) from Tiruppur floor dictionary.`,
        detectedKeywords: matchedRule ? matchedRule.tamilKeywords.filter(k => trimmed.includes(k)) : [],
        alternativeCategories: [
          { category: 'Machine Breakdown', confidence: 0.15 },
          { category: 'Labour Absenteeism', confidence: 0.10 },
        ].filter(a => a.category !== category),
      };
    }
  }

  // 2. Keyword & semantic matching
  const lower = trimmed.toLowerCase();
  const scores = [];

  for (const rule of KNOWLEDGE_BASE) {
    const matchedKeywords = [];
    let matchCount = 0;

    for (const kw of rule.tamilKeywords) {
      if (trimmed.includes(kw)) {
        matchedKeywords.push(kw);
        matchCount += 2;
      }
    }

    for (const kw of rule.tanglishKeywords) {
      if (lower.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
        matchCount += 1.5;
      }
    }

    if (matchCount > 0) {
      scores.push({
        category: rule.category,
        score: matchCount * rule.confidence,
        rule,
        matchedKeywords,
      });
    }
  }

  scores.sort((a, b) => b.score - a.score);

  if (scores.length > 0) {
    const best = scores[0];
    const normalizedConfidence = Math.min(0.96, Math.max(0.60, +(best.score / 3).toFixed(2)));
    const needsReview = normalizedConfidence < 0.75;

    let englishTranslation = best.rule.englishTranslationTemplate;
    if (trimmed.length < 50 && !trimmed.includes(' ')) {
      englishTranslation = `Issue related to ${best.category.toLowerCase()}: "${trimmed}".`;
    }

    const alternatives = scores.slice(1, 4).map(s => ({
      category: s.category,
      confidence: +(s.score / (scores[0].score * 2)).toFixed(2),
    }));

    return {
      originalTamil: trimmed,
      englishTranslation,
      predictedCategory: best.category,
      confidence: normalizedConfidence,
      needsReview,
      explanation: needsReview
        ? `Ambiguous note. AI detected '${best.matchedKeywords.join(', ')}' but confidence is only ${Math.round(normalizedConfidence * 100)}%. Merchandiser confirmation recommended.`
        : `Identified keywords: ${best.matchedKeywords.join(', ')} (${Math.round(normalizedConfidence * 100)}% confidence).`,
      detectedKeywords: best.matchedKeywords,
      alternativeCategories: alternatives,
    };
  }

  return {
    originalTamil: trimmed,
    englishTranslation: `Supervisor note: "${trimmed}" (Automated translation requires merchandiser verification).`,
    predictedCategory: 'Other / Uncategorized',
    confidence: 0.45,
    needsReview: true,
    explanation: 'Low confidence (45%). No textile disruption pattern matched. Please manually select the category.',
    detectedKeywords: [],
    alternativeCategories: [
      { category: 'Machine Breakdown', confidence: 0.30 },
      { category: 'Labour Absenteeism', confidence: 0.25 },
      { category: 'Fabric / Dyeing Defect', confidence: 0.20 },
    ],
  };
}
