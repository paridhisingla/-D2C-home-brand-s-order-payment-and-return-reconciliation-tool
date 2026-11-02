/**
 * Bilingual UI Dictionary (Tamil & English)
 * Specially calibrated for Tiruppur knitwear factory supervisors & merchandisers
 */

export type Language = 'ta' | 'en';

export const DICTIONARY = {
  // App Header & Navigation
  appTitle: {
    en: 'KnitTrack Tiruppur',
    ta: 'நிட்-ட்ராக் திருப்பூர்',
  },
  tagline: {
    en: 'TNA & Floor Production Tracker',
    ta: 'ஆடை உற்பத்தி & TNA கண்காணிப்பு',
  },
  roleMerchandiser: {
    en: 'Merchandiser',
    ta: 'மெர்ச்சன்டைசர்',
  },
  roleSupervisor: {
    en: 'Unit Supervisor (Floor)',
    ta: 'யூனிட் மேற்பார்வையாளர் (தளம்)',
  },
  roleBuyer: {
    en: 'Buyer Sourcing Staff',
    ta: 'வாங்குபவர் (பையர்)',
  },
  roleMD: {
    en: 'Managing Director',
    ta: 'நிர்வாக இயக்குனர்',
  },

  // Supervisor Mobile View
  mobileHeader: {
    en: 'Daily Production Update',
    ta: 'தினசரி உற்பத்தி பதிவு',
  },
  selectOrder: {
    en: 'Select Purchase Order (PO)',
    ta: 'ஆர்டரைத் தேர்ந்தெடுக்கவும் (PO)',
  },
  selectStage: {
    en: 'Select Production Stage',
    ta: 'உற்பத்தி நிலையைத் தேர்ந்தெடுக்கவும்',
  },
  qtyProduced: {
    en: 'Quantity Produced Today (Pieces)',
    ta: 'இன்று தைக்கப்பட்ட/உற்பத்தி அளவு (எண்ணிக்கை)',
  },
  qtyRejected: {
    en: 'Rejection / Defect Pieces',
    ta: 'குறைபாடு / நிராகரிப்பு எண்ணிக்கை',
  },
  takePhoto: {
    en: 'Attach Photo Evidence',
    ta: 'புகைப்படம் இணைக்கவும்',
  },
  photoCaptured: {
    en: 'Photo attached successfully',
    ta: 'புகைப்படம் இணைக்கப்பட்டது',
  },
  issueNoteLabel: {
    en: 'Floor Notes / Problem Reason (Tamil or English)',
    ta: 'தள குறிப்புகள் / தாமத காரணம் (தமிழில் தட்டச்சு செய்யவும்)',
  },
  voiceRecordButton: {
    en: 'Record Voice Note (Tamil)',
    ta: 'குரல் பதிவு (தமிழ் வாய்ஸ் நோட்)',
  },
  stopRecording: {
    en: 'Stop & Transcribe',
    ta: 'பதிவை நிறுத்து',
  },
  submitLog: {
    en: 'Submit Floor Log',
    ta: 'பதிவை அனுப்பவும்',
  },
  offlineQueueNotice: {
    en: 'Offline Mode: Changes will queue and sync when network resumes',
    ta: 'ஆஃப்லைன் முறை: நெட்வொர்க் வரும்போது தானாக பதிவேறும்',
  },
  syncedSuccessfully: {
    en: 'Production log synced successfully',
    ta: 'உற்பத்தி பதிவு வெற்றிகரமாக அனுப்பப்பட்டது',
  },
  queuedOffline: {
    en: 'Saved to offline phone storage',
    ta: 'மொபைலில் சேமிக்கப்பட்டது (ஆஃப்லைன்)',
  },
  quickTamilNotes: {
    en: 'Quick Notes Preset:',
    ta: 'விரைவு குறிப்புகள்:',
  },

  // Production Stages
  stages: {
    YarnProcurement: { en: 'Yarn Procurement', ta: 'நூல் கொள்முதல்' },
    Knitting: { en: 'Knitting', ta: 'பின்னல் (Knitting)' },
    Dyeing: { en: 'Dyeing', ta: 'சாயமிடுதல் (Dyeing)' },
    Cutting: { en: 'Cutting', ta: 'வெட்டுதல் (Cutting)' },
    Printing: { en: 'Printing / Washing', ta: 'பிரிண்டிங் / வாஷிங்' },
    Stitching: { en: 'Stitching', ta: 'தையல் (Stitching)' },
    Finishing: { en: 'Finishing & Ironing', ta: 'அயர்னிங் & ஃபினிஷிங்' },
    Packing: { en: 'Packing', ta: 'பேக்கிங் (Packing)' },
    FinalInspection: { en: 'Final Inspection', ta: 'இறுதி ஆய்வு (Inspection)' },
  },

  // Status Indicators
  statusGreen: {
    en: 'On Track (Green)',
    ta: 'சரியான பாதையில் (பச்சை)',
  },
  statusAmber: {
    en: 'Warning - Delay Risk (Amber)',
    ta: 'எச்சரிக்கை - தாமத வாய்ப்பு (மஞ்சள்)',
  },
  statusRed: {
    en: 'Critical Delay (Red)',
    ta: 'அபாயகரமான தாமதம் (சிவப்பு)',
  },

  // Metrics
  piecesNeededPerDay: {
    en: 'Pieces Needed / Day',
    ta: 'ஒரு நாளைக்கு தேவைப்படும் உற்பத்தி',
  },
  piecesMadePerDay: {
    en: 'Actual Run-Rate / Day',
    ta: 'தற்போதைய தினசரி உற்பத்தி',
  },
  runRateDeficit: {
    en: 'Run-Rate Shortfall',
    ta: 'தினசரி பற்றாக்குறை',
  },
  daysRemaining: {
    en: 'Working Days Left',
    ta: 'மீதமுள்ள வேலை நாட்கள்',
  },
  exFactoryDate: {
    en: 'Ex-Factory Date',
    ta: 'தொழிற்சாலை முடிவு தேதி',
  },
};

export function t(key: keyof typeof DICTIONARY, lang: Language = 'ta'): string {
  const item = DICTIONARY[key] as any;
  if (!item) return key;
  return item[lang] || item.en || key;
}
