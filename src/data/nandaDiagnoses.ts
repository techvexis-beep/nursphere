export type NandaDiagnosis = {
  code: string;
  label: string;
  type: 'problem-focused' | 'risk' | 'health-promotion' | 'syndrome';
};

export type NandaClass = {
  name: string;
  diagnoses: NandaDiagnosis[];
};

export type NandaDomain = {
  id: number;
  name: string;
  classes: NandaClass[];
};

export const nandaDomains: NandaDomain[] = [
  {
    id: 1,
    name: 'Health Promotion',
    classes: [
      {
        name: 'Health Awareness',
        diagnoses: [
          { code: '00097', label: 'Decreased diversional activity engagement', type: 'problem-focused' },
          { code: '00354', label: 'Risk for decreased diversional activity engagement', type: 'risk' },
          { code: '00355', label: 'Excessive sedentary behavior', type: 'problem-focused' },
          { code: '00356', label: 'Risk for excessive sedentary behavior', type: 'risk' },
          { code: '00273', label: 'Imbalanced energy field', type: 'problem-focused' },
        ],
      },
      {
        name: 'Health Management',
        diagnoses: [
          { code: '00276', label: 'Ineffective health self-management', type: 'problem-focused' },
          { code: '00277', label: 'Risk for ineffective health self-management', type: 'risk' },
          { code: '00278', label: 'Readiness for enhanced health self-management', type: 'health-promotion' },
          { code: '00080', label: 'Ineffective family health management', type: 'problem-focused' },
          { code: '00357', label: 'Risk for ineffective family health management', type: 'risk' },
          { code: '00358', label: 'Ineffective community health management', type: 'problem-focused' },
          { code: '00359', label: 'Risk for ineffective community health management', type: 'risk' },
          { code: '00360', label: 'Risk for ineffective blood glucose pattern self-management', type: 'risk' },
          { code: '00361', label: 'Ineffective dry eye self-management', type: 'problem-focused' },
          { code: '00362', label: 'Ineffective dry mouth self-management', type: 'problem-focused' },
          { code: '00363', label: 'Risk for ineffective dry mouth self-management', type: 'risk' },
          { code: '00364', label: 'Ineffective fatigue self-management', type: 'problem-focused' },
          { code: '00365', label: 'Ineffective lymphedema self-management', type: 'problem-focused' },
          { code: '00366', label: 'Risk for ineffective lymphedema self-management', type: 'risk' },
          { code: '00367', label: 'Ineffective nausea self-management', type: 'problem-focused' },
          { code: '00368', label: 'Ineffective pain self-management', type: 'problem-focused' },
          { code: '00369', label: 'Risk for ineffective overweight self-management', type: 'risk' },
          { code: '00370', label: 'Ineffective underweight self-management', type: 'problem-focused' },
          { code: '00371', label: 'Risk for ineffective underweight self-management', type: 'risk' },
          { code: '00099', label: 'Ineffective health maintenance behaviors', type: 'problem-focused' },
          { code: '00372', label: 'Risk for ineffective health maintenance behaviors', type: 'risk' },
          { code: '00100', label: 'Ineffective home maintenance behaviors', type: 'problem-focused' },
          { code: '00373', label: 'Risk for ineffective home maintenance behaviors', type: 'risk' },
          { code: '00374', label: 'Readiness for enhanced home maintenance behaviors', type: 'health-promotion' },
          { code: '00375', label: 'Readiness for enhanced exercise engagement', type: 'health-promotion' },
          { code: '00376', label: 'Inadequate health literacy', type: 'problem-focused' },
          { code: '00377', label: 'Risk for inadequate health literacy', type: 'risk' },
          { code: '00378', label: 'Readiness for enhanced health literacy', type: 'health-promotion' },
          { code: '00379', label: 'Readiness for enhanced healthy aging', type: 'health-promotion' },
          { code: '00380', label: 'Elder frailty syndrome', type: 'syndrome' },
          { code: '00381', label: 'Risk for elder frailty syndrome', type: 'risk' },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Nutrition',
    classes: [
      {
        name: 'Ingestion',
        diagnoses: [
          { code: '00103', label: 'Inadequate nutritional intake', type: 'problem-focused' },
          { code: '00382', label: 'Risk for inadequate nutritional intake', type: 'risk' },
          { code: '00383', label: 'Readiness for enhanced nutritional intake', type: 'health-promotion' },
          { code: '00384', label: 'Inadequate protein-energy nutritional intake', type: 'problem-focused' },
          { code: '00385', label: 'Risk for inadequate protein-energy nutritional intake', type: 'risk' },
          { code: '00386', label: 'Ineffective chest feeding', type: 'problem-focused' },
          { code: '00387', label: 'Risk for ineffective chest feeding', type: 'risk' },
          { code: '00388', label: 'Disrupted exclusive chest feeding', type: 'problem-focused' },
          { code: '00389', label: 'Risk for disrupted exclusive chest feeding', type: 'risk' },
          { code: '00390', label: 'Readiness for enhanced chest feeding', type: 'health-promotion' },
          { code: '00391', label: 'Inadequate human milk production', type: 'problem-focused' },
          { code: '00392', label: 'Risk for inadequate human milk production', type: 'risk' },
          { code: '00107', label: 'Ineffective infant feeding dynamics', type: 'problem-focused' },
          { code: '00393', label: 'Ineffective child eating dynamics', type: 'problem-focused' },
          { code: '00394', label: 'Ineffective adolescent eating dynamics', type: 'problem-focused' },
          { code: '00103', label: 'Impaired swallowing', type: 'problem-focused' },
        ],
      },
      {
        name: 'Digestion',
        diagnoses: [],
      },
      {
        name: 'Absorption',
        diagnoses: [],
      },
      {
        name: 'Metabolism',
        diagnoses: [
          { code: '00194', label: 'Neonatal hyperbilirubinemia', type: 'problem-focused' },
          { code: '00395', label: 'Risk for neonatal hyperbilirubinemia', type: 'risk' },
          { code: '00167', label: 'Risk for unstable blood glucose level', type: 'risk' },
        ],
      },
      {
        name: 'Hydration',
        diagnoses: [
          { code: '00396', label: 'Risk for impaired water-electrolyte balance', type: 'risk' },
          { code: '00397', label: 'Risk for impaired fluid volume balance', type: 'risk' },
          { code: '00026', label: 'Excessive fluid volume', type: 'problem-focused' },
          { code: '00398', label: 'Risk for excessive fluid volume', type: 'risk' },
          { code: '00421', label: 'Inadequate fluid volume', type: 'problem-focused' },
          { code: '00399', label: 'Risk for inadequate fluid volume', type: 'risk' },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Elimination and Exchange',
    classes: [
      {
        name: 'Urinary Function',
        diagnoses: [
          { code: '00016', label: 'Impaired urinary elimination', type: 'problem-focused' },
          { code: '00400', label: 'Risk for urinary retention', type: 'risk' },
          { code: '00401', label: 'Disability-associated urinary incontinence', type: 'problem-focused' },
          { code: '00402', label: 'Mixed urinary incontinence', type: 'problem-focused' },
          { code: '00017', label: 'Stress urinary incontinence', type: 'problem-focused' },
          { code: '00019', label: 'Urge urinary incontinence', type: 'problem-focused' },
          { code: '00403', label: 'Risk for urge urinary incontinence', type: 'risk' },
        ],
      },
      {
        name: 'Gastrointestinal Function',
        diagnoses: [
          { code: '00404', label: 'Impaired gastrointestinal motility', type: 'problem-focused' },
          { code: '00405', label: 'Risk for impaired gastrointestinal motility', type: 'risk' },
          { code: '00406', label: 'Impaired intestinal elimination', type: 'problem-focused' },
          { code: '00407', label: 'Risk for impaired intestinal elimination', type: 'risk' },
          { code: '00408', label: 'Chronic functional constipation', type: 'problem-focused' },
          { code: '00409', label: 'Risk for chronic functional constipation', type: 'risk' },
          { code: '00410', label: 'Impaired fecal continence', type: 'problem-focused' },
          { code: '00411', label: 'Risk for impaired fecal continence', type: 'risk' },
        ],
      },
      {
        name: 'Integumentary Function',
        diagnoses: [
          { code: '00412', label: 'Impaired skin integrity', type: 'problem-focused' },
          { code: '00413', label: 'Risk for impaired skin integrity', type: 'risk' },
        ],
      },
      {
        name: 'Respiratory Function',
        diagnoses: [
          { code: '00030', label: 'Impaired gas exchange', type: 'problem-focused' },
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'Activity / Rest',
    classes: [
      {
        name: 'Sleep / Rest',
        diagnoses: [
          { code: '00198', label: 'Ineffective sleep pattern', type: 'problem-focused' },
          { code: '00414', label: 'Risk for ineffective sleep pattern', type: 'risk' },
          { code: '00415', label: 'Readiness for enhanced sleep pattern', type: 'health-promotion' },
          { code: '00416', label: 'Ineffective sleep hygiene behaviors', type: 'problem-focused' },
          { code: '00417', label: 'Risk for ineffective sleep hygiene behaviors', type: 'risk' },
        ],
      },
      {
        name: 'Activity / Exercise',
        diagnoses: [
          { code: '00085', label: 'Impaired physical mobility', type: 'problem-focused' },
          { code: '00418', label: 'Risk for impaired physical mobility', type: 'risk' },
          { code: '00091', label: 'Impaired bed mobility', type: 'problem-focused' },
          { code: '00419', label: 'Impaired wheelchair mobility', type: 'problem-focused' },
          { code: '00420', label: 'Impaired sitting ability', type: 'problem-focused' },
          { code: '00421', label: 'Impaired standing ability', type: 'problem-focused' },
          { code: '00090', label: 'Impaired transferring ability', type: 'problem-focused' },
          { code: '00088', label: 'Impaired walking ability', type: 'problem-focused' },
        ],
      },
      {
        name: 'Energy Balance',
        diagnoses: [
          { code: '00298', label: 'Decreased activity tolerance', type: 'problem-focused' },
          { code: '00422', label: 'Risk for decreased activity tolerance', type: 'risk' },
          { code: '00423', label: 'Excessive fatigue burden', type: 'problem-focused' },
          { code: '00424', label: 'Impaired surgical recovery', type: 'problem-focused' },
          { code: '00425', label: 'Risk for impaired surgical recovery', type: 'risk' },
        ],
      },
      {
        name: 'Cardiovascular / Pulmonary Responses',
        diagnoses: [
          { code: '00426', label: 'Risk for impaired cardiovascular function', type: 'risk' },
          { code: '00427', label: 'Risk for imbalanced blood pressure', type: 'risk' },
          { code: '00029', label: 'Risk for decreased cardiac output', type: 'risk' },
          { code: '00428', label: 'Risk for ineffective cerebral tissue perfusion', type: 'risk' },
          { code: '00204', label: 'Ineffective peripheral tissue perfusion', type: 'problem-focused' },
          { code: '00429', label: 'Risk for ineffective peripheral tissue perfusion', type: 'risk' },
          { code: '00032', label: 'Ineffective breathing pattern', type: 'problem-focused' },
          { code: '00033', label: 'Impaired spontaneous ventilation', type: 'problem-focused' },
          { code: '00430', label: 'Impaired child ventilatory weaning response', type: 'problem-focused' },
          { code: '00431', label: 'Impaired adult ventilatory weaning response', type: 'problem-focused' },
        ],
      },
      {
        name: 'Self-Care',
        diagnoses: [
          { code: '00331', label: 'Decreased self-care ability syndrome', type: 'syndrome' },
          { code: '00432', label: 'Risk for decreased self-care ability syndrome', type: 'risk' },
          { code: '00433', label: 'Readiness for enhanced self-care abilities', type: 'health-promotion' },
          { code: '00108', label: 'Decreased bathing abilities', type: 'problem-focused' },
          { code: '00109', label: 'Decreased dressing abilities', type: 'problem-focused' },
          { code: '00102', label: 'Decreased feeding abilities', type: 'problem-focused' },
          { code: '00110', label: 'Decreased grooming abilities', type: 'problem-focused' },
          { code: '00111', label: 'Decreased toileting abilities', type: 'problem-focused' },
          { code: '00434', label: 'Ineffective oral hygiene behaviors', type: 'problem-focused' },
          { code: '00435', label: 'Risk for ineffective oral hygiene behaviors', type: 'risk' },
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Perception / Cognition',
    classes: [
      {
        name: 'Attention',
        diagnoses: [],
      },
      {
        name: 'Orientation',
        diagnoses: [
          { code: '00436', label: 'Impaired situational orientation', type: 'problem-focused' },
        ],
      },
      {
        name: 'Sensation / Perception',
        diagnoses: [
          { code: '00437', label: 'Unilateral neglect', type: 'problem-focused' },
        ],
      },
      {
        name: 'Cognition',
        diagnoses: [
          { code: '00128', label: 'Acute confusion', type: 'problem-focused' },
          { code: '00438', label: 'Risk for acute confusion', type: 'risk' },
          { code: '00129', label: 'Chronic confusion', type: 'problem-focused' },
          { code: '00439', label: 'Ineffective impulse control', type: 'problem-focused' },
          { code: '00440', label: 'Disrupted thought processes', type: 'problem-focused' },
          { code: '00441', label: 'Inadequate health knowledge', type: 'problem-focused' },
          { code: '00442', label: 'Readiness for enhanced health knowledge', type: 'health-promotion' },
          { code: '00443', label: 'Impaired memory', type: 'problem-focused' },
          { code: '00444', label: 'Impaired decision-making', type: 'problem-focused' },
          { code: '00445', label: 'Readiness for enhanced decision-making', type: 'health-promotion' },
          { code: '00446', label: 'Impaired emancipated decision-making', type: 'problem-focused' },
          { code: '00447', label: 'Risk for impaired emancipated decision-making', type: 'risk' },
          { code: '00448', label: 'Readiness for enhanced emancipated decision-making', type: 'health-promotion' },
        ],
      },
      {
        name: 'Communication',
        diagnoses: [
          { code: '00051', label: 'Impaired verbal communication', type: 'problem-focused' },
          { code: '00449', label: 'Risk for impaired verbal communication', type: 'risk' },
          { code: '00450', label: 'Readiness for enhanced verbal communication', type: 'health-promotion' },
        ],
      },
    ],
  },
  {
    id: 6,
    name: 'Self-Perception',
    classes: [
      {
        name: 'Self-Concept',
        diagnoses: [
          { code: '00451', label: 'Readiness for enhanced self-concept', type: 'health-promotion' },
          { code: '00221', label: 'Disrupted personal identity', type: 'problem-focused' },
          { code: '00452', label: 'Disrupted family identity syndrome', type: 'syndrome' },
          { code: '00453', label: 'Risk for disrupted family identity syndrome', type: 'risk' },
          { code: '00454', label: 'Risk for impaired human dignity', type: 'risk' },
          { code: '00455', label: 'Readiness for enhanced transgender social identity', type: 'health-promotion' },
        ],
      },
      {
        name: 'Self-Esteem',
        diagnoses: [
          { code: '00120', label: 'Chronic inadequate self-esteem', type: 'problem-focused' },
          { code: '00119', label: 'Situational low self-esteem', type: 'problem-focused' },
          { code: '00456', label: 'Risk for situational low self-esteem', type: 'risk' },
        ],
      },
      {
        name: 'Body Image',
        diagnoses: [
          { code: '00497', label: 'Disrupted body image', type: 'problem-focused' },
        ],
      },
    ],
  },
  {
    id: 7,
    name: 'Role Relationship',
    classes: [
      {
        name: 'Caregiving Roles',
        diagnoses: [
          { code: '00457', label: 'Impaired parenting behaviors', type: 'problem-focused' },
          { code: '00458', label: 'Risk for impaired parenting behaviors', type: 'risk' },
          { code: '00459', label: 'Readiness for enhanced parenting behaviors', type: 'health-promotion' },
          { code: '00460', label: 'Excessive parental role conflict', type: 'problem-focused' },
        ],
      },
      {
        name: 'Family Relationships',
        diagnoses: [
          { code: '00461', label: 'Disrupted family interaction patterns', type: 'problem-focused' },
          { code: '00462', label: 'Risk for disrupted family interaction patterns', type: 'risk' },
        ],
      },
      {
        name: 'Role Performance',
        diagnoses: [
          { code: '00052', label: 'Impaired social interaction', type: 'problem-focused' },
          { code: '00463', label: 'Ineffective role performance', type: 'problem-focused' },
        ],
      },
    ],
  },
  {
    id: 8,
    name: 'Sexuality',
    classes: [
      {
        name: 'Sexual Identity',
        diagnoses: [],
      },
      {
        name: 'Sexual Function',
        diagnoses: [
          { code: '00059', label: 'Impaired sexual function', type: 'problem-focused' },
        ],
      },
      {
        name: 'Reproduction',
        diagnoses: [
          { code: '00349', label: 'Risk for impaired maternal-fetal dyad', type: 'risk' },
        ],
      },
    ],
  },
  {
    id: 9,
    name: 'Coping / Stress Tolerance',
    classes: [
      {
        name: 'Post-Trauma Responses',
        diagnoses: [
          { code: '00141', label: 'Post-trauma syndrome', type: 'syndrome' },
          { code: '00464', label: 'Risk for post-trauma syndrome', type: 'risk' },
          { code: '00465', label: 'Relocation stress syndrome', type: 'syndrome' },
          { code: '00466', label: 'Risk for relocation stress syndrome', type: 'risk' },
        ],
      },
      {
        name: 'Coping Responses',
        diagnoses: [
          { code: '00405', label: 'Maladaptive coping', type: 'problem-focused' },
          { code: '00372', label: 'Ineffective emotion regulation', type: 'problem-focused' },
          { code: '00146', label: 'Anxiety', type: 'problem-focused' },
          { code: '00147', label: 'Death anxiety', type: 'problem-focused' },
          { code: '00136', label: 'Fear', type: 'problem-focused' },
          { code: '00135', label: 'Grieving', type: 'problem-focused' },
          { code: '00467', label: 'Complicated grieving', type: 'problem-focused' },
          { code: '00137', label: 'Powerlessness', type: 'problem-focused' },
          { code: '00468', label: 'Risk for powerlessness', type: 'risk' },
          { code: '00469', label: 'Hopelessness', type: 'problem-focused' },
          { code: '00470', label: 'Readiness for enhanced hope', type: 'health-promotion' },
        ],
      },
      {
        name: 'Neuro-Behavioral Stress',
        diagnoses: [
          { code: '00471', label: 'Risk for autonomic dysreflexia', type: 'risk' },
        ],
      },
    ],
  },
  {
    id: 10,
    name: 'Life Principles',
    classes: [
      {
        name: 'Values',
        diagnoses: [
          { code: '00472', label: 'Impaired religiosity', type: 'problem-focused' },
          { code: '00473', label: 'Risk for impaired religiosity', type: 'risk' },
          { code: '00474', label: 'Readiness for enhanced religiosity', type: 'health-promotion' },
        ],
      },
      {
        name: 'Beliefs',
        diagnoses: [],
      },
      {
        name: 'Value / Belief / Action Congruence',
        diagnoses: [
          { code: '00475', label: 'Decisional conflict', type: 'problem-focused' },
          { code: '00476', label: 'Readiness for enhanced decisional conflict resolution', type: 'health-promotion' },
          { code: '00069', label: 'Spiritual distress', type: 'problem-focused' },
          { code: '00477', label: 'Risk for spiritual distress', type: 'risk' },
          { code: '00478', label: 'Readiness for enhanced spiritual well-being', type: 'health-promotion' },
        ],
      },
    ],
  },
  {
    id: 11,
    name: 'Safety / Protection',
    classes: [
      {
        name: 'Infection',
        diagnoses: [
          { code: '00479', label: 'Impaired immune response', type: 'problem-focused' },
          { code: '00004', label: 'Risk for infection', type: 'risk' },
          { code: '00480', label: 'Risk for surgical wound infection', type: 'risk' },
        ],
      },
      {
        name: 'Physical Injury',
        diagnoses: [
          { code: '00031', label: 'Ineffective airway clearance', type: 'problem-focused' },
          { code: '00039', label: 'Risk for aspiration', type: 'risk' },
          { code: '00138', label: 'Risk for bleeding', type: 'risk' },
          { code: '00481', label: 'Risk for adult falls', type: 'risk' },
          { code: '00482', label: 'Risk for child falls', type: 'risk' },
          { code: '00035', label: 'Risk for injury', type: 'risk' },
          { code: '00483', label: 'Risk for corneal injury', type: 'risk' },
          { code: '00484', label: 'Risk for pressure ulcer', type: 'risk' },
          { code: '00485', label: 'Impaired dentition', type: 'problem-focused' },
          { code: '00486', label: 'Impaired oral mucous membrane integrity', type: 'problem-focused' },
          { code: '00487', label: 'Risk for impaired oral mucous membrane integrity', type: 'risk' },
          { code: '00488', label: 'Impaired tissue integrity', type: 'problem-focused' },
          { code: '00489', label: 'Risk for impaired tissue integrity', type: 'risk' },
          { code: '00490', label: 'Risk for shock', type: 'risk' },
          { code: '00181', label: 'Contamination', type: 'problem-focused' },
          { code: '00491', label: 'Risk for contamination', type: 'risk' },
        ],
      },
      {
        name: 'Violence',
        diagnoses: [
          { code: '00150', label: 'Risk for suicide', type: 'risk' },
          { code: '00492', label: 'Risk for self-directed violence', type: 'risk' },
          { code: '00493', label: 'Risk for other-directed violence', type: 'risk' },
        ],
      },
      {
        name: 'Environmental Hazards',
        diagnoses: [
          { code: '00494', label: 'Risk for poisoning', type: 'risk' },
        ],
      },
      {
        name: 'Defensive Processes',
        diagnoses: [
          { code: '00495', label: 'Risk for allergy response', type: 'risk' },
          { code: '00496', label: 'Risk for latex allergy response', type: 'risk' },
        ],
      },
      {
        name: 'Thermoregulation',
        diagnoses: [
          { code: '00008', label: 'Ineffective thermoregulation', type: 'problem-focused' },
          { code: '00497', label: 'Risk for ineffective thermoregulation', type: 'risk' },
          { code: '00498', label: 'Decreased neonatal body temperature', type: 'problem-focused' },
          { code: '00499', label: 'Risk for decreased neonatal body temperature', type: 'risk' },
          { code: '00500', label: 'Decreased body temperature', type: 'problem-focused' },
          { code: '00501', label: 'Risk for decreased body temperature', type: 'risk' },
          { code: '00502', label: 'Risk for decreased perioperative body temperature', type: 'risk' },
          { code: '00503', label: 'Hyperthermia', type: 'problem-focused' },
          { code: '00504', label: 'Risk for hyperthermia', type: 'risk' },
        ],
      },
    ],
  },
  {
    id: 12,
    name: 'Comfort',
    classes: [
      {
        name: 'Physical Comfort',
        diagnoses: [
          { code: '00261', label: 'Impaired physical comfort', type: 'problem-focused' },
          { code: '00505', label: 'Readiness for enhanced physical comfort', type: 'health-promotion' },
          { code: '00506', label: 'Impaired end-of-life comfort syndrome', type: 'syndrome' },
          { code: '00132', label: 'Acute pain', type: 'problem-focused' },
          { code: '00507', label: 'Chronic pain syndrome', type: 'syndrome' },
          { code: '00133', label: 'Chronic pain', type: 'problem-focused' },
          { code: '00508', label: 'Labor pain', type: 'problem-focused' },
          { code: '00134', label: 'Nausea', type: 'problem-focused' },
        ],
      },
      {
        name: 'Environmental Comfort',
        diagnoses: [],
      },
      {
        name: 'Social Comfort',
        diagnoses: [
          { code: '00509', label: 'Risk for loneliness', type: 'risk' },
        ],
      },
      {
        name: 'Psychological Comfort',
        diagnoses: [
          { code: '00510', label: 'Impaired psychological comfort', type: 'problem-focused' },
          { code: '00511', label: 'Readiness for enhanced psychological comfort', type: 'health-promotion' },
        ],
      },
    ],
  },
  {
    id: 13,
    name: 'Growth / Development',
    classes: [
      {
        name: 'Growth',
        diagnoses: [
          { code: '00512', label: 'Delayed child growth', type: 'problem-focused' },
          { code: '00513', label: 'Risk for delayed child growth', type: 'risk' },
        ],
      },
      {
        name: 'Development',
        diagnoses: [
          { code: '00514', label: 'Delayed child development', type: 'problem-focused' },
          { code: '00515', label: 'Risk for delayed child development', type: 'risk' },
          { code: '00314', label: 'Delayed infant motor development', type: 'problem-focused' },
          { code: '00315', label: 'Risk for delayed infant motor development', type: 'risk' },
          { code: '00451', label: 'Impaired infant neurodevelopmental organization', type: 'problem-focused' },
          { code: '00516', label: 'Risk for impaired infant neurodevelopmental organization', type: 'risk' },
          { code: '00517', label: 'Readiness for enhanced infant neurodevelopmental organization', type: 'health-promotion' },
          { code: '00295', label: 'Ineffective infant suck-swallow response', type: 'problem-focused' },
        ],
      },
    ],
  },
];

export function searchDiagnoses(query: string): { domain: NandaDomain; class: NandaClass; diagnosis: NandaDiagnosis }[] {
  const q = query.toLowerCase();
  const results: { domain: NandaDomain; class: NandaClass; diagnosis: NandaDiagnosis }[] = [];
  for (const domain of nandaDomains) {
    for (const cls of domain.classes) {
      for (const diagnosis of cls.diagnoses) {
        if (diagnosis.label.toLowerCase().includes(q) || diagnosis.code.includes(q)) {
          results.push({ domain, class: cls, diagnosis });
        }
      }
    }
  }
  return results;
}
