export const careerRoadmap = [
  {
    id: '1',
    stage: 'Education',
    title: 'BSc Nursing Degree',
    description: 'Complete a 5-year B.NSc program at an accredited Nigerian university (e.g., UNILAG, OAU, ABU).',
    status: 'completed',
  },
  {
    id: '2',
    stage: 'Licensing',
    title: 'NMCN Licensure Exam',
    description: 'Pass the Nursing and Midwifery Council of Nigeria (NMCN) licensing exam to practice as a Registered Nurse.',
    status: 'in-progress',
  },
  {
    id: '3',
    stage: 'Internship',
    title: 'NYSC / Clinical Internship',
    description: 'Serve a 1-year internship at a teaching hospital (LUTH, UCH, ABUTH) as part of mandatory licensing.',
    status: 'upcoming',
  },
  {
    id: '4',
    stage: 'Specialization',
    title: 'Choose a Specialty',
    description: 'Pursue a specialty like ICU, Pediatrics, Public Health, or Perioperative Nursing through PGD or MSc.',
    status: 'upcoming',
  },
  {
    id: '5',
    stage: 'Advancement',
    title: 'Advanced Practice & Leadership',
    description: 'Earn an MSc / DNP and take on roles like Nurse Educator, Nurse Manager, or Consultant.',
    status: 'upcoming',
  },
];

export type Comment = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
};

export type Post = {
  id: string;
  author: string;
  avatar: string;
  role: string;
  time: string;
  content: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
};

export const communityPosts: Post[] = [
  {
    id: '1',
    author: 'Chioma Obi',
    avatar: 'CO',
    role: 'BSN Student',
    time: '2h ago',
    content: 'Just submitted my final year project at UNILAG! The NMCN licensing exam is next — anyone studying together at LUTH?',
    likes: 34,
    liked: false,
    comments: [
      { id: 'c1', author: 'Dr. Oluwaseun Adeyemi', avatar: 'OA', content: 'Congratulations Chioma! I can help with NMCN prep questions anytime.', time: '1h ago' },
      { id: 'c2', author: 'Emeka Nwosu', avatar: 'EN', content: 'I am studying for it too! Count me in for a study group.', time: '30m ago' },
    ],
  },
  {
    id: '2',
    author: 'Dr. Oluwaseun Adeyemi',
    avatar: 'OA',
    role: 'Nurse Educator',
    time: '5h ago',
    content: 'Reminder: The NMCN portal opens next Monday for the September licensure exam. Early registration closes June 20. Don\'t miss it!',
    likes: 67,
    liked: true,
    comments: [
      { id: 'c3', author: 'Amina Abubakar', avatar: 'AA', content: 'Thanks for the reminder! Just set my calendar.', time: '4h ago' },
    ],
  },
  {
    id: '3',
    author: 'Amina Abubakar',
    avatar: 'AA',
    role: 'Registered Nurse',
    time: '1d ago',
    content: 'Started my ICU rotation at ABUTH today. The team is incredibly supportive. Any tips from seasoned ICU nurses? 🇳🇬',
    likes: 92,
    liked: false,
    comments: [
      { id: 'c4', author: 'Ifeanyi Okoro', avatar: 'IO', content: 'Stay organized, ask questions, and always double-check your drips! You will do great.', time: '20h ago' },
      { id: 'c5', author: 'Chioma Obi', avatar: 'CO', content: 'How exciting! ICU was my best rotation. Keep a small notebook for quick reference.', time: '15h ago' },
    ],
  },
  {
    id: '4',
    author: 'Emeka Nwosu',
    avatar: 'EN',
    role: 'Nursing Student',
    time: '2d ago',
    content: 'Looking for study partners for anatomy & physiology finals at OAU. Group chat on WhatsApp — DM me the link!',
    likes: 22,
    liked: false,
    comments: [],
  },
  {
    id: '5',
    author: 'Ifeanyi Okoro',
    avatar: 'IO',
    role: 'Community Health Nurse',
    time: '3d ago',
    content: 'Just completed a maternal health outreach in Ogun State. So rewarding to serve rural communities. Nursing is truly a calling.',
    likes: 128,
    liked: false,
    comments: [
      { id: 'c6', author: 'Dr. Oluwaseun Adeyemi', avatar: 'OA', content: 'Thank you for your service! Community health is the backbone of our system.', time: '2d ago' },
    ],
  },
];

export const userProfile = {
  name: 'Sarah Adekunle',
  email: 'sarah.adekunle@example.com',
  avatar: 'SA',
  role: 'BSN Student',
  year: '4th Year',
  institution: 'University of Lagos (UNILAG)',
  progress: {
    education: 85,
    licensing: 40,
    specialization: 15,
    internship: 0,
  },
  stats: {
    studyHours: 142,
    practiceQuestions: 510,
    connections: 72,
  },
};

export const drugDatabase = [
  { name: 'Paracetamol (Acetaminophen)', commonDosage: '10-15 mg/kg/dose q4-6h', maxDaily: '75 mg/kg/day (max 4g)', indication: 'Pain, fever', route: 'PO/IV' },
  { name: 'Amoxicillin', commonDosage: '20-40 mg/kg/day divided q8h', maxDaily: '90 mg/kg/day', indication: 'Bacterial infections', route: 'PO' },
  { name: 'Artemether/Lumefantrine', commonDosage: '1.5/9 mg/kg twice daily x 3 days', maxDaily: 'As per weight', indication: 'Malaria (uncomplicated)', route: 'PO' },
  { name: 'IV Normal Saline (0.9% NaCl)', commonDosage: '10-20 mL/kg bolus', maxDaily: 'As per clinical need', indication: 'Dehydration, shock', route: 'IV' },
  { name: 'Diazepam', commonDosage: '0.2-0.3 mg/kg IV/PR', maxDaily: '10 mg', indication: 'Seizures, anxiety', route: 'IV/PR' },
  { name: 'Adrenaline (Epinephrine)', commonDosage: '0.01 mg/kg (0.1 mL/kg of 1:10,000) IV', maxDaily: '1 mg per dose', indication: 'Anaphylaxis, cardiac arrest', route: 'IV/IM' },
  { name: 'Furosemide', commonDosage: '1-2 mg/kg/dose IV/PO', maxDaily: '6 mg/kg/day', indication: 'Fluid overload, heart failure', route: 'IV/PO' },
  { name: 'Morphine', commonDosage: '0.1-0.2 mg/kg/dose IV/SC q4h', maxDaily: 'Titrate to effect', indication: 'Severe pain', route: 'IV/SC' },
  { name: 'Ceftriaxone', commonDosage: '50-80 mg/kg/day divided q12-24h', maxDaily: '4 g/day', indication: 'Broad-spectrum infection', route: 'IV/IM' },
  { name: 'Magnesium Sulfate', commonDosage: '20-40 mg/kg/dose IV 10% solution', maxDaily: 'As per protocol', indication: 'Eclampsia, asthma', route: 'IV' },
];

export const nursingGuides = [
  { id: 'g1', title: 'IV Cannulation', steps: ['Wash hands and don gloves', 'Select appropriate vein', 'Clean site with 70% alcohol swab', 'Insert cannula at 15-30° angle', 'Flashback confirms venous entry', 'Advance cannula, withdraw needle', 'Secure with transparent dressing', 'Flush with normal saline', 'Document date, time, and site'] },
  { id: 'g2', title: 'Nasogastric Tube Insertion', steps: ['Explain procedure to patient', 'Measure from nose to earlobe to xiphoid', 'Lubricate tube tip', 'Insert gently through nostril', 'Advance as patient swallows', 'Confirm placement via air insufflation + auscultation', 'Secure with tape', 'Check pH of aspirate (<5.5 confirms placement)', 'Document insertion details'] },
  { id: 'g3', title: 'Urinary Catheterization (Female)', steps: ['Explain procedure and obtain consent', 'Position patient supine with knees flexed', 'Clean perineal area with antiseptic', 'Open sterile catheter kit', 'Lubricate catheter tip', 'Separate labia, identify urethral meatus', 'Insert catheter until urine flows', 'Inflate balloon with 10mL sterile water', 'Secure catheter, connect drainage bag', 'Document output and catheter size'] },
  { id: 'g4', title: 'IM Injection', steps: ['Identify injection site (vastus lateralis, deltoid or gluteal)', 'Clean skin with alcohol swab (circular motion)', 'Hold syringe like a dart at 90° angle', 'Quickly insert needle', 'Aspirate (check for blood return)', 'Inject medication slowly', 'Withdraw needle and apply pressure', 'Dispose of sharps appropriately', 'Document site and medication'] },
  { id: 'g5', title: 'Blood Pressure Measurement', steps: ['Patient seated, arm at heart level', 'Select appropriate cuff size', 'Wrap cuff 2-3 cm above antecubital fossa', 'Palpate brachial artery', 'Inflate cuff to 30 mmHg above palpable pulse', 'Place stethoscope over brachial artery', 'Deflate at 2-3 mmHg/second', 'Note Korotkoff sounds (Systolic = first sound, Diastolic = last sound)', 'Record BP to nearest 2 mmHg', 'Clean earpieces and bell'] },
];
