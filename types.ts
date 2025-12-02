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
  influenzaB: string;
  rsv: string;
  covid: string;
  hepB: string; // HBsAg
  hepC: string; // HCV Ab
  dengue: string;
  notes: string;
}

export interface Urine {
  leukocytes: string;
  nitrite: string;
  protein: string;
  glucose: string;
  ketone: string;
  ph: string;
  notes: string;
}

export interface Imaging {
  xray: string;
  ultrasound: string; // Bung, tim, ...
  ct: string;
  mri: string;
  endoscopy: string; // Noi soi
  notes: string;
}

export interface MedicalRecord {
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

  // III. Tiền sử
  para: string; 
  birthWeight: string;
  birthWeek: string;
  deliveryType: string; 
  vaccination: string;
  historyAllergy: string;
  historyPathology: string; 
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

  para: '1001',
  birthWeight: '3000',
  birthWeek: '39',
  deliveryType: 'Đẻ thường',
  vaccination: 'Đủ theo TCMR',
  historyAllergy: 'Chưa phát hiện',
  historyPathology: 'Khỏe mạnh',
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
      influenzaA: 'Chưa làm', influenzaB: 'Chưa làm', rsv: 'Chưa làm', covid: 'Chưa làm', hepB: 'Chưa làm', hepC: 'Chưa làm', dengue: 'Chưa làm', notes: ''
    },
    urine: {
      leukocytes: '', nitrite: '', protein: '', glucose: '', ketone: '', ph: '', notes: ''
    },
    imaging: {
      xray: '', ultrasound: '', ct: '', mri: '', endoscopy: '', notes: ''
    },
    otherLabs: ''
  },

  diagnosis: '',
  differentialDiagnosis: '',
  treatmentPlan: [],
  doctorNotes: ''
};