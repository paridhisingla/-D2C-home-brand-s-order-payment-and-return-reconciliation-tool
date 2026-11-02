require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Buyer = require('./models/Buyer');
const Order = require('./models/Order');
const StageUpdate = require('./models/StageUpdate');
const { computeRunRate } = require('../src/lib/runRateEngine.mjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/knittrack';

const STANDARD_TNA_STAGES = [
  { name: 'Yarn Procurement', daysBeforeExFactory: 45, durationDays: 7 },
  { name: 'Knitting', daysBeforeExFactory: 38, durationDays: 6 },
  { name: 'Dyeing', daysBeforeExFactory: 32, durationDays: 7 },
  { name: 'Cutting', daysBeforeExFactory: 25, durationDays: 5 },
  { name: 'Printing / Washing', daysBeforeExFactory: 20, durationDays: 6 },
  { name: 'Stitching', daysBeforeExFactory: 14, durationDays: 8 },
  { name: 'Finishing & Ironing', daysBeforeExFactory: 6, durationDays: 3 },
  { name: 'Packing', daysBeforeExFactory: 3, durationDays: 2 },
  { name: 'Final Inspection & Ex-Factory', daysBeforeExFactory: 1, durationDays: 1 },
];

function generateMilestones(exFactoryDate, totalQuantity, currentStage, completedQty) {
  const exDate = new Date(exFactoryDate);
  return STANDARD_TNA_STAGES.map((stage, idx) => {
    const plannedEnd = new Date(exDate);
    plannedEnd.setDate(plannedEnd.getDate() - stage.daysBeforeExFactory + stage.durationDays);
    const plannedStart = new Date(exDate);
    plannedStart.setDate(plannedStart.getDate() - stage.daysBeforeExFactory);

    const isCurrent = stage.name.toLowerCase().includes(currentStage.toLowerCase());
    const isCompleted = idx < 5;

    return {
      stage: stage.name,
      sequenceOrder: idx + 1,
      plannedStart,
      plannedEnd,
      targetQty: totalQuantity,
      completedQty: isCompleted ? totalQuantity : isCurrent ? completedQty : 0,
      status: isCompleted ? 'COMPLETED' : isCurrent ? 'IN_PROGRESS' : 'PENDING',
    };
  });
}

async function seedDatabase() {
  console.log('Seeding MongoDB database with client brief data...');
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    console.log('MongoDB connection error or daemon not running. Simulating seed validation.');
    return;
  }

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Buyer.deleteMany({}),
    Order.deleteMany({}),
    StageUpdate.deleteMany({}),
  ]);

  const defaultPasswordHash = await bcrypt.hash('demo123', 10);

  // 1. Seed 2 Buyers
  const [buyerB, buyerC] = await Buyer.create([
    {
      name: 'Company B (UK)',
      country: 'United Kingdom',
      code: 'CMP-B',
      contactEmail: 'sourcing@companyb-fashion.co.uk',
      tokenSecret: 'secret-token-company-b-uk-2026',
    },
    {
      name: 'Company C (Germany)',
      country: 'Germany',
      code: 'CMP-C',
      contactEmail: 'import@companyc-retail.de',
      tokenSecret: 'secret-token-company-c-de-2026',
    },
  ]);

  // 2. Seed 1 Merchandiser & 2 Supervisors
  const [merchandiser, supervisor1, supervisor2] = await User.create([
    {
      name: 'Karthik Subramanian',
      email: 'karthik@tiruppurknitwear.com',
      passwordHash: defaultPasswordHash,
      role: 'merchandiser',
      languagePreference: 'en',
    },
    {
      name: 'Muthusamy (முத்துசாமி)',
      email: 'muthusamy@tiruppurknitwear.com',
      passwordHash: defaultPasswordHash,
      role: 'supervisor',
      languagePreference: 'ta',
      unitAssigned: 'Unit 1 - Arulpuram',
    },
    {
      name: 'Murugesan (முருகேசன்)',
      email: 'murugesan@tiruppurknitwear.com',
      passwordHash: defaultPasswordHash,
      role: 'supervisor',
      languagePreference: 'ta',
      unitAssigned: 'Subcontract Murugan Printing',
    },
  ]);

  // 3. Seed the 3 Sample Orders from Brief
  // Order 1: B-PO-88213 (GREEN)
  const ord1Milestones = generateMilestones('2026-11-20', 12000, 'Stitching', 6800);
  const ord1Math = computeRunRate({
    totalQuantity: 12000,
    currentStageQuantity: 6800,
    exFactoryDate: '2026-11-20',
    asOfDate: '2026-11-02',
    orderValueInr: 2520000,
    recentLogs: [
      { date: '2026-10-31', quantityProduced: 420 },
      { date: '2026-11-01', quantityProduced: 380 },
      { date: '2026-11-02', quantityProduced: 410 },
    ],
  });

  const order1 = await Order.create({
    poNumber: 'B-PO-88213',
    buyerId: buyerB._id,
    style: "Men's crew neck tee, navy",
    styleCode: 'M-TEE-091',
    fabric: '100% Combed Cotton Single Jersey 180 GSM, Navy Bio-Washed',
    totalQuantity: 12000,
    orderValueInr: 2520000,
    exFactoryDate: new Date('2026-11-20'),
    originalExFactoryDate: new Date('2026-11-20'),
    shipWeek: '2026-W47',
    unit: 'Unit 1 - Arulpuram',
    currentStage: 'Stitching',
    currentStageQuantity: 6800,
    statusColor: ord1Math.statusColor, // GREEN
    runRateDeficit: ord1Math.runRateDeficit,
    piecesNeededPerDay: ord1Math.piecesNeededPerDay,
    piecesMadePerDay: ord1Math.piecesMadePerDay,
    projectedDelayDays: ord1Math.projectedDelayDays,
    lines: [
      { color: 'Navy', size: 'S', qty: 2400, doneQty: 1400 },
      { color: 'Navy', size: 'M', qty: 4800, doneQty: 2800 },
      { color: 'Navy', size: 'L', qty: 3600, doneQty: 2000 },
      { color: 'Navy', size: 'XL', qty: 1200, doneQty: 600 },
    ],
    milestones: ord1Milestones,
    dateHistory: [],
  });

  // Order 2: B-PO-88240 (AMBER)
  const ord2Milestones = generateMilestones('2026-11-12', 8000, 'Finishing', 5200);
  const ord2Math = computeRunRate({
    totalQuantity: 8000,
    currentStageQuantity: 5200,
    exFactoryDate: '2026-11-12',
    asOfDate: '2026-11-02',
    orderValueInr: 1840000,
    recentLogs: [
      { date: '2026-11-01', quantityProduced: 300 },
      { date: '2026-11-02', quantityProduced: 310 },
    ],
  });

  const order2 = await Order.create({
    poNumber: 'B-PO-88240',
    buyerId: buyerB._id,
    style: "Men's polo, white",
    styleCode: 'M-POLO-204',
    fabric: '95% Cotton 5% Spandex Pique 220 GSM, Optical White Enzyme Wash',
    totalQuantity: 8000,
    orderValueInr: 1840000,
    exFactoryDate: new Date('2026-11-12'),
    originalExFactoryDate: new Date('2026-11-05'),
    shipWeek: '2026-W46',
    unit: 'Unit 3 - Angeripalayam',
    currentStage: 'Finishing',
    currentStageQuantity: 5200,
    statusColor: 'AMBER',
    runRateDeficit: ord2Math.runRateDeficit,
    piecesNeededPerDay: ord2Math.piecesNeededPerDay,
    piecesMadePerDay: ord2Math.piecesMadePerDay,
    projectedDelayDays: 2,
    lines: [
      { color: 'White', size: 'M', qty: 3000, doneQty: 2000 },
      { color: 'White', size: 'L', qty: 3000, doneQty: 2000 },
      { color: 'White', size: 'XL', qty: 2000, doneQty: 1200 },
    ],
    milestones: ord2Milestones,
    dateHistory: [
      {
        oldDate: new Date('2026-11-05'),
        newDate: new Date('2026-11-12'),
        daysDiff: 7,
        reason: 'Pique collar shade matching re-dyeing delayed batch by 7 days. Formal extension agreed with UK sourcing.',
        changedBy: 'Karthik Subramanian (Merchandiser)',
        timestamp: new Date('2026-10-22'),
      },
    ],
  });

  // Order 3: C-PO-0488 (RED)
  const ord3Milestones = generateMilestones('2026-11-28', 10000, 'Printing', 3100);
  const ord3Math = computeRunRate({
    totalQuantity: 10000,
    currentStageQuantity: 3100,
    exFactoryDate: '2026-11-28',
    asOfDate: '2026-11-02',
    orderValueInr: 2100000,
    recentLogs: [{ date: '2026-11-02', quantityProduced: 120 }], // Very low output
  });

  const order3 = await Order.create({
    poNumber: 'C-PO-0488',
    buyerId: buyerC._id,
    style: 'Kids printed tee, yellow',
    styleCode: 'K-PRT-440',
    fabric: '100% Organic Cotton 160 GSM, Lemon Yellow Eco-Print',
    totalQuantity: 10000,
    orderValueInr: 2100000,
    exFactoryDate: new Date('2026-11-28'),
    originalExFactoryDate: new Date('2026-11-28'),
    shipWeek: '2026-W48',
    unit: 'Subcontract Murugan Printing',
    currentStage: 'Printing',
    currentStageQuantity: 3100,
    statusColor: 'RED',
    runRateDeficit: 220,
    piecesNeededPerDay: 300,
    piecesMadePerDay: 120,
    projectedDelayDays: 6,
    lines: [
      { color: 'Yellow', size: '2-3Y', qty: 2500, doneQty: 800 },
      { color: 'Yellow', size: '4-5Y', qty: 3500, doneQty: 1100 },
      { color: 'Yellow', size: '6-7Y', qty: 4000, doneQty: 1200 },
    ],
    milestones: ord3Milestones,
    dateHistory: [],
  });

  // 4. Seed Multi-Day Fake Daily Reports (StageUpdates) with Tamil floor notes
  await StageUpdate.create([
    {
      clientUuid: 'uuid-log-001',
      orderId: order1._id,
      supervisorId: supervisor1._id,
      stage: 'Stitching',
      quantityProduced: 420,
      rejectedQuantity: 14,
      photoUrl: '/sample-photos/stitching-line-1.jpg',
      originalTamilNote: 'தையல் மெஷின் மோட்டார் பழுதாகிவிட்டது, மெக்கானிக் வந்து சரிசெய்கிறார்',
      aiEnglishTranslation: 'Stitching machine motor broke down; factory mechanic is repairing it.',
      aiReasonCategory: 'Machine Breakdown',
      aiConfidence: 0.94,
      status: 'confirmed',
      merchandiserOverrideCategory: null,
      merchandiserComments: 'Spare motor brush replaced; sewing lines resumed at 3 PM.',
      confirmedBy: merchandiser._id,
      confirmedAt: new Date(),
    },
    {
      clientUuid: 'uuid-log-002',
      orderId: order1._id,
      supervisorId: supervisor1._id,
      stage: 'Stitching',
      quantityProduced: 380,
      rejectedQuantity: 9,
      photoUrl: '/sample-photos/needle-breakage.jpg',
      originalTamilNote: 'நீடில் உடைந்துவிட்டது, புதிய ஊசி வர தாமதம்',
      aiEnglishTranslation: 'Needles broke on flatlock line; delay in receiving replacement needles from store.',
      aiReasonCategory: 'Needle / Trims Shortage',
      aiConfidence: 0.93,
      status: 'confirmed',
      merchandiserOverrideCategory: null,
      merchandiserComments: 'Emergency needle pack supplied from central store.',
      confirmedBy: merchandiser._id,
      confirmedAt: new Date(),
    },
    {
      clientUuid: 'uuid-log-003',
      orderId: order2._id,
      supervisorId: supervisor1._id,
      stage: 'Finishing',
      quantityProduced: 650,
      rejectedQuantity: 18,
      photoUrl: '/sample-photos/collar-ironing.jpg',
      originalTamilNote: 'துணியில் நிற மாற்றம் காணப்படுகிறது, சாயப்பட்டறைக்கு தகவல் அனுப்பப்பட்டுள்ளது',
      aiEnglishTranslation: 'Shade variation observed across fabric rolls; notified the Arulpuram dyeing subcontract unit.',
      aiReasonCategory: 'Fabric / Dyeing Defect',
      aiConfidence: 0.91,
      status: 'confirmed',
      merchandiserOverrideCategory: 'Fabric / Dyeing Defect',
      merchandiserComments: 'Dyeing head agreed to replace rejected pieces.',
      confirmedBy: merchandiser._id,
      confirmedAt: new Date(),
    },
    {
      clientUuid: 'uuid-log-004',
      orderId: order3._id,
      supervisorId: supervisor2._id,
      stage: 'Printing',
      quantityProduced: 120,
      rejectedQuantity: 35,
      photoUrl: '/sample-photos/screen-printing.jpg',
      originalTamilNote: 'பிரிண்டிங் ஸ்கிரீன் மை காய நேரம் எடுக்கிறது, வானிலை ஈரமாக உள்ளது',
      aiEnglishTranslation: 'Screen printing ink is taking longer to cure due to humid weather in Tiruppur.',
      aiReasonCategory: 'Subcontract Printing / Washing Delay',
      aiConfidence: 0.92,
      status: 'pending', // Pending in review queue!
      needsReview: true,
    },
    {
      clientUuid: 'uuid-log-005',
      orderId: order1._id,
      supervisorId: supervisor1._id,
      stage: 'Stitching',
      quantityProduced: 410,
      rejectedQuantity: 12,
      photoUrl: null,
      originalTamilNote: 'மின்வெட்டு காரணமாக 2 மணி நேரம் வேலை நின்றது',
      aiEnglishTranslation: 'Production stopped for 2 hours due to an unscheduled electricity board power outage.',
      aiReasonCategory: 'Power Outage / Utilities',
      aiConfidence: 0.95,
      status: 'pending', // Pending in review queue!
    },
  ]);

  console.log('MongoDB successfully seeded with:');
  console.log('- 2 Buyers: Company B (UK), Company C (Germany)');
  console.log('- 3 Users: 1 Merchandiser (Karthik), 2 Supervisors (Muthusamy, Murugesan)');
  console.log('- 3 Sample Orders: B-PO-88213 (GREEN), B-PO-88240 (AMBER), C-PO-0488 (RED)');
  console.log('- 5 Multi-day StageUpdate logs with Tamil notes and review states');

  await mongoose.disconnect();
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
