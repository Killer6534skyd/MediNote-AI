import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MedicalRecord } from '../types';

// Utility to remove Vietnamese tones for PDF safety (since standard fonts don't support it)
const removeVietnameseTones = (str: string) => {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
};

// Wrapper to safely add text
const safeText = (text: string | undefined | null) => {
  return removeVietnameseTones(text || '');
};

export const generatePDF = (record: MedicalRecord) => {
  const doc = new jsPDF();
  
  doc.setFont("helvetica", "normal"); 
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  const addBoldText = (text: string, x: number, y: number, align: "left" | "center" | "right" = "left") => {
    doc.setFont("helvetica", "bold");
    doc.text(removeVietnameseTones(text), x, y, { align });
    doc.setFont("helvetica", "normal");
  };

  const addText = (text: string, x: number, y: number) => {
    doc.text(removeVietnameseTones(text), x, y);
  };

  // -- HEADER --
  addBoldText("BENH AN NHI KHOA", pageWidth / 2, yPos, "center");
  yPos += 10;

  // -- I. HANH CHINH --
  addBoldText("I. HANH CHINH", margin, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0,0,0] },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    body: [
      [`1. Ho va ten: ${safeText(record.patientName.toUpperCase())}`, `Khoa: ${safeText(record.bedNumber)}`],
      [`2. Tuoi: ${record.ageMonth} thang (${safeText(record.dob)})`, `3. Gioi: ${safeText(record.gender)}`],
      [`4. Dia chi: ${safeText(record.address)}`, ``],
      [`5. Lien he: ${safeText(record.parentName)}`, `SDT: ${safeText(record.phone)}`],
      [`6. Ngay vao vien: ${safeText(record.admissionDate)}`, `Ghi chu: ${safeText(record.adminNotes)}`],
    ],
  });

  // @ts-ignore
  yPos = doc.lastAutoTable.finalY + 10;

  // -- II. CHUYEN MON --
  addBoldText("II. CHUYEN MON", margin, yPos);
  yPos += 7;

  addBoldText("1. Ly do vao vien:", margin, yPos);
  doc.text(safeText(`${record.chiefComplaint.join(', ')} ${record.chiefComplaintNotes ? '- ' + record.chiefComplaintNotes : ''}`), margin + 40, yPos);
  yPos += 7;

  addBoldText("2. Benh su:", margin, yPos);
  yPos += 5;
  const historyText = `Cach vao vien ${record.historyDays} ngay. Dien bien: ${safeText(record.historyCourse.join(', '))}. \n${safeText(record.historyNotes)}`;
  const splitHistory = doc.splitTextToSize(historyText, pageWidth - (margin * 2));
  doc.text(splitHistory, margin, yPos);
  yPos += (splitHistory.length * 7) + 5;

  // -- III. TIEN SU --
  addBoldText("3. Tien su", margin, yPos);
  yPos += 7;
  
  const historyLines = [
    `a. San khoa: PARA ${safeText(record.para)}. Sinh: ${safeText(record.deliveryType)}, ${record.birthWeek} tuan, ${record.birthWeight}g.`,
    `b. Tiem chung: ${safeText(record.vaccination)}`,
    `c. Benh tat: ${safeText(record.historyPathology)}`,
    `d. Di ung: ${safeText(record.historyAllergy)}`,
    `e. Dinh duong: ${safeText(record.nutrition)}`,
    `f. Ghi chu them: ${safeText(record.pastHistoryNotes)}`
  ];

  historyLines.forEach(line => {
    if (yPos > 270) { doc.addPage(); yPos = 20; }
    addText(line, margin + 5, yPos);
    yPos += 6;
  });
  yPos += 5;

  // -- IV. KHAM LAM SANG --
  if (yPos > 250) { doc.addPage(); yPos = 20; }
  addBoldText("4. Kham lam sang", margin, yPos);
  yPos += 7;

  addBoldText("4.1. Toan than:", margin + 5, yPos);
  yPos += 6;
  addText(`- ${safeText(record.generalCondition.join(', '))}`, margin + 10, yPos); yPos += 6;
  addText(`- ${safeText(record.skinExam.join(', '))}`, margin + 10, yPos); yPos += 6;
  addText(`- Mach: ${record.vitals.heartRate}, Nhiet do: ${record.vitals.temperature}, Nhip tho: ${record.vitals.respiratoryRate}, SpO2: ${record.vitals.spO2}%`, margin + 10, yPos); yPos += 6;
  addText(`- Can nang: ${record.vitals.weight} kg`, margin + 10, yPos); yPos += 6;

  addBoldText("4.2. Bo phan:", margin + 5, yPos);
  yPos += 6;
  
  const bodyParts = [
    { label: "a. Ho hap", val: record.respiratoryExam.join(', ') },
    { label: "b. Tieu hoa", val: record.digestiveExam.join(', ') },
    { label: "c. Tai Mui Hong", val: record.entExam.join(', ') },
    { label: "d. Than kinh", val: record.neuroExam.join(', ') },
    { label: "e. Kham khac", val: record.otherExam },
    { label: "f. Ghi chu", val: record.examNotes }
  ];

  bodyParts.forEach(part => {
    if (yPos > 270) { doc.addPage(); yPos = 20; }
    const text = `- ${part.label}: ${safeText(part.val)}`;
    const splitText = doc.splitTextToSize(text, pageWidth - margin - 15);
    doc.text(splitText, margin + 10, yPos);
    yPos += (splitText.length * 6);
  });
  yPos += 5;

  // -- V. CAN LAM SANG --
  doc.addPage(); yPos = 20;
  addBoldText("V. CAN LAM SANG", margin, yPos);
  yPos += 7;

  // Hematology
  autoTable(doc, {
    startY: yPos,
    head: [['HUYET HOC', 'KET QUA']],
    body: [
      ['Cong thuc mau', `RBC: ${safeText(record.labs.hematology.rbc)}, HGB: ${safeText(record.labs.hematology.hgb)}, HCT: ${safeText(record.labs.hematology.hct)}`],
      ['Bach cau', `WBC: ${safeText(record.labs.hematology.wbc)} (NEU: ${safeText(record.labs.hematology.neu)}%, LYM: ${safeText(record.labs.hematology.lym)}%)`],
      ['Tieu cau', `PLT: ${safeText(record.labs.hematology.plt)}`],
      ['Ghi chu', safeText(record.labs.hematology.notes)]
    ],
    theme: 'grid',
  });
  // @ts-ignore
  yPos = doc.lastAutoTable.finalY + 5;

  // Biochemistry
  autoTable(doc, {
    startY: yPos,
    head: [['SINH HOA', 'KET QUA']],
    body: [
      ['Chuc nang Than', `Ure: ${safeText(record.labs.biochemistry.ure)}, Crea: ${safeText(record.labs.biochemistry.creatinin)}`],
      ['Chuc nang Gan', `AST: ${safeText(record.labs.biochemistry.ast)}, ALT: ${safeText(record.labs.biochemistry.alt)}, GGT: ${safeText(record.labs.biochemistry.ggt)}`],
      ['Duong huyet', `Glucose: ${safeText(record.labs.biochemistry.glucose)}, HbA1c: ${safeText(record.labs.biochemistry.hba1c)}`],
      ['Mo mau', `Chol: ${safeText(record.labs.biochemistry.cholesterol)}, TG: ${safeText(record.labs.biochemistry.triglyceride)}`],
      ['Dien giai do', `Na: ${safeText(record.labs.biochemistry.na)}, K: ${safeText(record.labs.biochemistry.k)}, Cl: ${safeText(record.labs.biochemistry.cl)}`],
      ['Ghi chu', safeText(record.labs.biochemistry.notes)]
    ],
    theme: 'grid',
  });
  // @ts-ignore
  yPos = doc.lastAutoTable.finalY + 5;

  // Urine & Micro
  autoTable(doc, {
    startY: yPos,
    head: [['XET NGHIEM KHAC', 'KET QUA']],
    body: [
      ['Nuoc tieu', `Protein: ${safeText(record.labs.urine.protein)}, Leu: ${safeText(record.labs.urine.leukocytes)}, Nitrite: ${safeText(record.labs.urine.nitrite)}`],
      ['Vi sinh', `RSV: ${safeText(record.labs.microbiology.rsv)}, Viem gan B: ${safeText(record.labs.microbiology.hepB)}`],
      ['Chan doan hinh anh', `X-Quang: ${safeText(record.labs.imaging.xray)}\nSieu am: ${safeText(record.labs.imaging.ultrasound)}`],
      ['Khac', safeText(record.labs.otherLabs)]
    ],
    theme: 'grid',
  });
  // @ts-ignore
  yPos = doc.lastAutoTable.finalY + 10;

  // -- VI. TONG KET --
  if (yPos > 240) { doc.addPage(); yPos = 20; }
  addBoldText("VI. CHAN DOAN & XU TRI", margin, yPos);
  yPos += 7;

  addBoldText("1. Chan doan:", margin + 5, yPos);
  const diagText = doc.splitTextToSize(safeText(record.diagnosis), 140);
  doc.text(diagText, margin + 40, yPos);
  yPos += (diagText.length * 6) + 2;

  addBoldText("2. Chan doan phan biet:", margin + 5, yPos);
  const diffText = doc.splitTextToSize(safeText(record.differentialDiagnosis), 140);
  doc.text(diffText, margin + 55, yPos);
  yPos += (diffText.length * 6) + 2;

  addBoldText("3. Huong xu tri:", margin + 5, yPos);
  yPos += 6;
  record.treatmentPlan.forEach(plan => {
    addText(`- ${plan}`, margin + 10, yPos);
    yPos += 6;
  });

  if (record.doctorNotes) {
    yPos += 2;
    const noteLines = doc.splitTextToSize(`* Ghi chu: ${safeText(record.doctorNotes)}`, pageWidth - margin - 15);
    doc.text(noteLines, margin + 10, yPos);
  }

  yPos += 20;
  if (yPos > 270) { doc.addPage(); yPos = 30; }
  addText(`Ha Noi, ngay ${new Date().getDate()} thang ${new Date().getMonth() + 1} nam ${new Date().getFullYear()}`, 130, yPos);
  yPos += 5;
  addBoldText("Bac si dieu tri", 145, yPos, "center");
  
  doc.save(`${safeText(record.patientName.replace(/\s/g, '_'))}_BenhAn.pdf`);
};