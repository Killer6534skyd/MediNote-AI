
export enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ'
}

export interface Vitals {
  weight: string;
  height: string;
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  spO2: string;
}

export interface Hematology {
  wbc: string;
  neu: string; // % or count
  lym: string;
  mono: string;
  rbc: string;
  hgb: string;
  hct: string;
  mcv: string;
  mch: string;
  mchc: string;
  plt: string;
  notes: string;
}

export interface Biochemistry {
  // Glucose
  glucose: string;
  hba1c: string;
  
  // Kidney
  ure: string;
  creatinin: string;

  // Liver
  ast: string; // GOT
  alt: string; // GPT
  ggt: string;
  bilirubinTotal: string;
  
  // Lipids
  cholesterol: string;
  triglyceride: string;
  hdl: string;
  ldl: string;

  // Electrolytes
  na: string;
  k: string;
  cl: string;
  ca: string;

  notes: string;
}

export interface Microbiology {
  influenzaA: string; 
  influenzaANote: string;
  influenzaB: string;
  influenzaBNote: string;
  rsv: string;
  rsvNote: string;
  covid: string;
  covidNote: string;
  hepB: string; // HBsAg
  hepBNote: string;
  hepC: string; // HCV Ab
  hepCNote: string;
  dengue: string;
  dengueNote: string;
  notes: string;
}

export interface Urine {
  leukocytes: string;
  leukocytesNote: string;
  nitrite: string;
  nitriteNote: string;
  protein: string;
  proteinNote: string;
  glucose: string;
  glucoseNote: string;
  ketone: string;
  ketoneNote: string;
  ph: string;
  phNote: string;
  notes: string;
}

export interface Imaging {
  xray: string;
  xrayNote: string;
  ultrasound: string; // Bung, tim, ...
  ultrasoundNote: string;
  ct: string;
  ctNote: string;
  mri: string;
  mriNote: string;
  endoscopy: string; // Noi soi
  endoscopyNote: string;
  notes: string;
}

export interface SymptomDetails {
  // Fever
  hasFever: boolean;
  feverPattern: string; // Cơn, liên tục
  maxTemp: string;
  hasChills: boolean;
  hasConvulsions: boolean;
  
  // Vomiting
  hasVomiting: boolean;
  vomitFrequency: string; // lần/ngày
  vomitRelation: string; // sau ăn, tự nhiên
  vomitCharacteristics: string[]; // thức ăn, dịch vàng, máu...
  
  // Stool
  hasDiarrhea: boolean;
  stoolFrequency: string; // lần/ngày
  stoolCharacteristics: string[]; // toé nước, hoa cà hoa cải...
  stoolBloodMucus: boolean;
  
  // Other
  generalState: string[]; // Quấy khóc, mệt mỏi
  otherSymptoms: string; // Đau đầu, đau bụng...
}

export interface MedicalRecord {
  id: string; // Unique ID for storage
  lastModified: number; // Timestamp

  // I. Hành chính
  patientName: string;
  dob: string;
  ageMonth: string;
  gender: Gender;
  address: string;
  parentName: string;
  phone: string;
  admissionDate: string;
  bedNumber: string;
  adminNotes: string; // Free text

  // II. Chuyên môn
  chiefComplaint: string[]; 
  chiefComplaintNotes: string; // Free text
  historyDays: number;
  historyCourse: string[]; 
  historyNotes: string; 
  symptomDetails: SymptomDetails; // Detailed structured history

  // III. Tiền sử
  para: string; 
  birthWeight: string;
  birthWeek: string;
  deliveryType: string; 
  vaccination: string;
  historyAllergy: string;
  historyPathology: string;
  historyFamily: string;
  historyEpidemiology: string; 
  nutrition: string; 
  pastHistoryNotes: string; // Free text (Renamed from historyNotes)

  // IV. Khám lâm sàng
  vitals: Vitals;
  generalCondition: string[]; 
  skinExam: string[]; 
  respiratoryExam: string[]; 
  digestiveExam: string[]; 
  entExam: string[]; 
  neuroExam: string[]; 
  otherExam: string; // Free text area for unstructured exam data
  examNotes: string; // General notes for exam

  // V. Cận lâm sàng (New Expanded Structure)
  labs: {
    hematology: Hematology;
    biochemistry: Biochemistry;
    microbiology: Microbiology;
    urine: Urine;
    imaging: Imaging;
    otherLabs: string; // Tumor markers, Genetics, etc.
  };

  // VI. Chẩn đoán & Điều trị
  diagnosis: string;
  differentialDiagnosis: string;
  treatmentPlan: string[];
  doctorNotes: string; // Free text
}

export const INITIAL_RECORD: MedicalRecord = {
  id: '',
  lastModified: Date.now(),
  patientName: '',
  dob: '',
  ageMonth: '',
  gender: Gender.MALE,
  address: '',
  parentName: '',
  phone: '',
  admissionDate: new Date().toISOString().split('T')[0],
  bedNumber: '',
  adminNotes: '',

  chiefComplaint: [],
  chiefComplaintNotes: '',
  historyDays: 1,
  historyCourse: [],
  historyNotes: '',
  symptomDetails: {
    hasFever: false,
    feverPattern: 'Từng cơn',
    maxTemp: '',
    hasChills: false,
    hasConvulsions: false,
    hasVomiting: false,
    vomitFrequency: '',
    vomitRelation: '',
    vomitCharacteristics: [],
    hasDiarrhea: false,
    stoolFrequency: '',
    stoolCharacteristics: [],
    stoolBloodMucus: false,
    generalState: [],
    otherSymptoms: ''
  },

  para: '1001',
  birthWeight: '3000',
  birthWeek: '39',
  deliveryType: 'Đẻ thường',
  vaccination: 'Đủ theo TCMR',
  historyAllergy: 'Chưa phát hiện',
  historyPathology: 'Khỏe mạnh',
  historyFamily: 'Khỏe mạnh',
  historyEpidemiology: 'Chưa phát hiện',
  nutrition: 'Cơm nát/Cháo',
  pastHistoryNotes: '', // Renamed from historyNotes

  vitals: {
    weight: '',
    height: '',
    temperature: '',
    heartRate: '',
    respiratoryRate: '',
    spO2: ''
  },
  generalCondition: ['Tỉnh táo', 'A/AVPU'],
  skinExam: ['Da niêm mạc hồng'],
  respiratoryExam: [],
  digestiveExam: ['Bụng mềm'],
  entExam: [],
  neuroExam: ['Hội chứng màng não (-)'],
  otherExam: '',
  examNotes: '',

  labs: {
    hematology: {
      wbc: '', neu: '', lym: '', mono: '', rbc: '', hgb: '', hct: '', mcv: '', mch: '', mchc: '', plt: '', notes: ''
    },
    biochemistry: {
      glucose: '', hba1c: '', ure: '', creatinin: '', ast: '', alt: '', ggt: '', bilirubinTotal: '',
      cholesterol: '', triglyceride: '', hdl: '', ldl: '', na: '', k: '', cl: '', ca: '', notes: ''
    },
    microbiology: {
      influenzaA: 'Chưa làm', influenzaANote: '', 
      influenzaB: 'Chưa làm', influenzaBNote: '',
      rsv: 'Chưa làm', rsvNote: '',
      covid: 'Chưa làm', covidNote: '',
      hepB: 'Chưa làm', hepBNote: '',
      hepC: 'Chưa làm', hepCNote: '',
      dengue: 'Chưa làm', dengueNote: '',
      notes: ''
    },
    urine: {
      leukocytes: '', leukocytesNote: '',
      nitrite: '', nitriteNote: '',
      protein: '', proteinNote: '',
      glucose: '', glucoseNote: '',
      ketone: '', ketoneNote: '',
      ph: '', phNote: '',
      notes: ''
    },
    imaging: {
      xray: '', xrayNote: '',
      ultrasound: '', ultrasoundNote: '',
      ct: '', ctNote: '',
      mri: '', mriNote: '',
      endoscopy: '', endoscopyNote: '',
      notes: ''
    },
    otherLabs: ''
  },

  diagnosis: '',
  differentialDiagnosis: '',
  treatmentPlan: [],
  doctorNotes: ''
};
