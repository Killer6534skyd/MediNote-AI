import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MedicalRecord } from '../types';

// Utility to remove Vietnamese tones for PDF safety
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

// Generate Narrative for History of Present Illness
const generateHistoryNarrative = (record: MedicalRecord) => {
  const { historyDays, symptomDetails: s, historyCourse, historyNotes } = record;
  let narrative = `Benh dien bien ${historyDays} ngay nay. `;

  // Vomiting
  if (s.hasVomiting) {
    narrative += `Tre xuat hien non ${s.vomitFrequency ? s.vomitFrequency : 'nhieu lan'}. `;
    if (s.vomitRelation) narrative += `Non ${safeText(s.vomitRelation)}. `;
    if (s.vomitCharacteristics.length > 0) narrative += `Dich non: ${safeText(s.vomitCharacteristics.join(', '))}. `;
  }

  // Stool
  if (s.hasDiarrhea) {
    narrative += `Tre di ngoai phan long ${s.stoolFrequency ? s.stoolFrequency : 'nhieu lan'}. `;
    if (s.stoolCharacteristics.length > 0) narrative += `Tinh chat phan: ${safeText(s.stoolCharacteristics.join(', '))}. `;
    narrative += s.stoolBloodMucus ? 'Co nhay mau. ' : 'Khong nhay mau. ';
  }

  // Fever
  if (s.hasFever) {
    narrative += `Tre sot ${safeText(s.feverPattern)}. `;
    if (s.maxTemp) narrative += `Nhiet do cao nhat ${s.maxTemp} do C. `;
    narrative += s.hasChills ? 'Co ret run. ' : 'Khong ret run. ';
    narrative += s.hasConvulsions ? 'Co co giat. ' : 'Khong co giat. ';
  } else {
    narrative += 'Tre khong sot. ';
  }

  // General & Other
  if (s.generalState.length > 0) narrative += `Tre ${safeText(s.generalState.join(', '))}. `;
  if (s.otherSymptoms) narrative += `${safeText(s.otherSymptoms)}. `;
  
  // Fallback if structured data is empty
  if (!s.hasVomiting && !s.hasDiarrhea && !s.hasFever) {
    narrative += `Dien bien: ${safeText(historyCourse.join(', '))}. `;
  }

  if (historyNotes) narrative += `\n${safeText(historyNotes)}`;

  return narrative;
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

  // -- HEADER (OPTIMIZED) --
  doc.setFontSize(14);
  addBoldText("PHIEU TOM TAT QUA TRINH KHAM VA KET QUA", pageWidth / 2, yPos, "center");
  yPos += 8;
  
  doc.setFontSize(10);
  const patientInfo = `${safeText(record.patientName.toUpperCase())}  |  ${record.ageMonth}T  |  ${safeText(record.gender)}  |  ID: ${safeText(record.bedNumber || '---')}`;
  doc.text(patientInfo, pageWidth / 2, yPos, { align: "center" });
  yPos += 5;
  
  // Separator
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // -- I. PROCESS --
  addBoldText("I. QUA TRINH KHAM BENH (PROCESS)", margin, yPos);
  yPos += 7;

  // 1. History
  addBoldText("1. Benh su & Ly do vao vien:", margin + 5, yPos);
  yPos += 5;
  const reasonText = `Ly do: ${safeText(record.chiefComplaint.join(', '))}. ${safeText(record.chiefComplaintNotes)}`;
  doc.text(doc.splitTextToSize(reasonText, pageWidth - (margin * 2) - 5), margin + 5, yPos);
  yPos += 6;
  
  // Detailed Narrative Generation
  const narrative = generateHistoryNarrative(record);
  const splitHistory = doc.splitTextToSize(narrative, pageWidth - (margin * 2) - 5);
  doc.text(splitHistory, margin + 5, yPos);
  yPos += (splitHistory.length * 5) + 5;

  // 2. Clinical Exam
  addBoldText("2. Kham lam sang:", margin + 5, yPos);
  yPos += 5;
  const vitalsText = `Mach: ${record.vitals.heartRate} l/p - Nhiet: ${record.vitals.temperature} C - Tho: ${record.vitals.respiratoryRate} l/p - SpO2: ${record.vitals.spO2}% - CN: ${record.vitals.weight}kg`;
  addText(vitalsText, margin + 10, yPos);
  yPos += 6;

  const clinicalFindings = [
    record.generalCondition.length > 0 ? `Toan than: ${record.generalCondition.join(', ')}` : '',
    record.skinExam.length > 0 ? `Da/Niem mac: ${record.skinExam.join(', ')}` : '',
    record.respiratoryExam.length > 0 ? `Ho hap: ${record.respiratoryExam.join(', ')}` : '',
    record.digestiveExam.length > 0 ? `Tieu hoa: ${record.digestiveExam.join(', ')}` : '',
    record.entExam.length > 0 ? `Tai Mui Hong: ${record.entExam.join(', ')}` : '',
    record.neuroExam.length > 0 ? `Than kinh: ${record.neuroExam.join(', ')}` : '',
    record.otherExam ? `Khac: ${record.otherExam}` : '',
    record.examNotes ? `Ghi chu: ${record.examNotes}` : ''
  ].filter(Boolean);

  clinicalFindings.forEach(finding => {
    if (yPos > 275) { doc.addPage(); yPos = 20; }
    const splitFinding = doc.splitTextToSize(`- ${safeText(finding)}`, pageWidth - margin - 15);
    doc.text(splitFinding, margin + 10, yPos);
    yPos += (splitFinding.length * 5);
  });
  yPos += 5;

  // -- II. LAB RESULTS --
  if (yPos > 260) { doc.addPage(); yPos = 20; }
  addBoldText("II. KET QUA CAN LAM SANG (RESULTS)", margin, yPos);
  yPos += 7;

  // Helper to format result with note
  const resWithNote = (val: string, note: string) => {
    const v = safeText(val);
    const n = safeText(note);
    if (!v || v === 'Chua lam') return '';
    return n ? `${v} (${n})` : v;
  };

  const headStyle = { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' as const, fontSize: 9 };
  const bodyStyle = { fontSize: 9 };

  // Hematology Table
  autoTable(doc, {
    startY: yPos,
    head: [['HUYET HOC', 'KET QUA']],
    body: [
      ['RBC / HGB / HCT', `${safeText(record.labs.hematology.rbc)} / ${safeText(record.labs.hematology.hgb)} / ${safeText(record.labs.hematology.hct)}`],
      ['WBC (NEU/LYM)', `${safeText(record.labs.hematology.wbc)} (${safeText(record.labs.hematology.neu)}% / ${safeText(record.labs.hematology.lym)}%)`],
      ['PLT', safeText(record.labs.hematology.plt)],
    ],
    theme: 'grid',
    headStyles: headStyle,
    styles: bodyStyle,
    columnStyles: { 0: { cellWidth: 50 } }
  });
  // @ts-ignore
  yPos = doc.lastAutoTable.finalY + 5;

  // Biochemistry Table
  autoTable(doc, {
    startY: yPos,
    head: [['SINH HOA', 'KET QUA']],
    body: [
      ['Chuc nang Than', `Ure: ${safeText(record.labs.biochemistry.ure)} - Crea: ${safeText(record.labs.biochemistry.creatinin)}`],
      ['Men Gan (AST/ALT)', `${safeText(record.labs.biochemistry.ast)} / ${safeText(record.labs.biochemistry.alt)}`],
      ['Dien giai (Na/K/Cl)', `${safeText(record.labs.biochemistry.na)} / ${safeText(record.labs.biochemistry.k)} / ${safeText(record.labs.biochemistry.cl)}`],
      ['CRP / Glucose', `${safeText(record.labs.hematology.notes)} / ${safeText(record.labs.biochemistry.glucose)}`],
    ],
    theme: 'grid',
    headStyles: headStyle,
    styles: bodyStyle,
    columnStyles: { 0: { cellWidth: 50 } }
  });
  // @ts-ignore
  yPos = doc.lastAutoTable.finalY + 5;

  // Microbiology Table
  const micro = record.labs.microbiology;
  const microData = [
    ['RSV', resWithNote(micro.rsv, micro.rsvNote)],
    ['Cum A', resWithNote(micro.influenzaA, micro.influenzaANote)],
    ['Cum B', resWithNote(micro.influenzaB, micro.influenzaBNote)],
    ['Covid-19', resWithNote(micro.covid, micro.covidNote)],
    ['Dengue', resWithNote(micro.dengue, micro.dengueNote)],
    ['Viem gan B (HBsAg)', resWithNote(micro.hepB, micro.hepBNote)],
    ['Viem gan C (HCV)', resWithNote(micro.hepC, micro.hepCNote)],
  ].filter(row => row[1] !== '');

  if (microData.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['VI SINH', 'KET QUA']],
      body: microData,
      theme: 'grid',
      headStyles: headStyle,
      styles: bodyStyle,
      columnStyles: { 0: { cellWidth: 50 } }
    });
    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 5;
  }

  // Urine Table
  const urine = record.labs.urine;
  const urineData = [
    ['BC Niew', resWithNote(urine.leukocytes, urine.leukocytesNote)],
    ['Protein Niew', resWithNote(urine.protein, urine.proteinNote)],
    ['Nitrite', resWithNote(urine.nitrite, urine.nitriteNote)],
    ['Glucose Niew', resWithNote(urine.glucose, urine.glucoseNote)],
    ['Ketone', resWithNote(urine.ketone, urine.ketoneNote)],
    ['pH', resWithNote(urine.ph, urine.phNote)],
  ].filter(row => row[1] !== '');

  if (urineData.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['NUOC TIEU', 'KET QUA']],
      body: urineData,
      theme: 'grid',
      headStyles: headStyle,
      styles: bodyStyle,
      columnStyles: { 0: { cellWidth: 50 } }
    });
    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 5;
  }

  // Imaging Table
  if (record.labs.imaging.xray || record.labs.imaging.ultrasound || record.labs.imaging.ct || record.labs.imaging.mri) {
    autoTable(doc, {
      startY: yPos,
      head: [['CHAN DOAN HINH ANH', 'KET QUA']],
      body: [
        ['X-Quang', resWithNote(record.labs.imaging.xray, record.labs.imaging.xrayNote)],
        ['Sieu am', resWithNote(record.labs.imaging.ultrasound, record.labs.imaging.ultrasoundNote)],
        ['CT Scanner', resWithNote(record.labs.imaging.ct, record.labs.imaging.ctNote)],
        ['MRI', resWithNote(record.labs.imaging.mri, record.labs.imaging.mriNote)],
        ['Noi soi', resWithNote(record.labs.imaging.endoscopy, record.labs.imaging.endoscopyNote)],
        ['Khac', safeText(record.labs.otherLabs)]
      ].filter(row => row[1] !== ''),
      theme: 'grid',
      headStyles: headStyle,
      styles: bodyStyle,
      columnStyles: { 0: { cellWidth: 50 } }
    });
    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 10;
  }

  // -- III. CONCLUSION --
  if (yPos > 240) { doc.addPage(); yPos = 20; }
  addBoldText("III. CHAN DOAN & XU TRI (CONCLUSION)", margin, yPos);
  yPos += 7;

  addBoldText(`1. Chan doan: ${safeText(record.diagnosis)}`, margin + 5, yPos);
  yPos += 6;
  if (record.differentialDiagnosis) {
    addText(`(PB: ${safeText(record.differentialDiagnosis)})`, margin + 10, yPos);
    yPos += 6;
  }

  addBoldText("2. Huong dieu tri (Y lenh):", margin + 5, yPos);
  yPos += 6;
  record.treatmentPlan.forEach(plan => {
    addText(`- ${plan}`, margin + 10, yPos);
    yPos += 6;
  });

  if (record.doctorNotes) {
    yPos += 2;
    doc.setFont("helvetica", "italic");
    const noteLines = doc.splitTextToSize(`* ${safeText(record.doctorNotes)}`, pageWidth - margin - 15);
    doc.text(noteLines, margin + 10, yPos);
    doc.setFont("helvetica", "normal");
    yPos += (noteLines.length * 5);
  }

  // Footer Signature
  yPos += 15;
  if (yPos > 270) { doc.addPage(); yPos = 30; }
  const date = new Date();
  addText(`Ngay ${date.getDate()} thang ${date.getMonth() + 1} nam ${date.getFullYear()}`, pageWidth - 60, yPos);
  yPos += 5;
  addBoldText("Bac si dieu tri", pageWidth - 50, yPos, "center");
  
  doc.save(`${safeText(record.patientName.replace(/\s/g, '_'))}_KetQua.pdf`);
};