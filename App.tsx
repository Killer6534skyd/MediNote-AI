
import React, { useState } from 'react';
import { Save, FileText, Sparkles, Stethoscope, Clipboard, Microscope, User, Baby, Printer, FlaskConical } from 'lucide-react';
import { INITIAL_RECORD, MedicalRecord, Gender } from './types';
import { Input, TextArea, Select, MultiSelectChip, SectionTitle, Card, Accordion } from './components/FormElements';
import { analyzeMedicalRecord } from './services/geminiService';
import { generatePDF } from './services/pdfService';
import ReactMarkdown from 'react-markdown';

// --- DATA OPTIONS ---
const SYMPTOM_OPTIONS = ['Sốt cao', 'Sốt nhẹ', 'Ho khan', 'Ho đờm', 'Khò khè', 'Nôn trớ', 'Tiêu chảy', 'Phân nhầy máu', 'Bỏ bú', 'Quấy khóc', 'Co giật', 'Phát ban'];
const REASON_OPTIONS = ['Sốt', 'Ho', 'Khò khè', 'Nôn', 'Tiêu chảy', 'Đau bụng', 'Co giật', 'Vàng da'];
const GENERAL_OPTIONS = ['Tỉnh táo', 'Li bì', 'Vật vã kích thích', 'Môi hồng', 'Môi khô', 'Mắt trũng', 'Da tái', 'Dấu hiệu mất nước (-)'];
const SKIN_OPTIONS = ['Hồng hào', 'Tái', 'Vàng da', 'Phát ban rải rác', 'Xuất huyết dưới da'];
const RESP_OPTIONS = ['Thở đều', 'Rút lõm lồng ngực (+)', 'Thở gắng sức', 'Rales ẩm to hạt', 'Rales ẩm nhỏ hạt', 'Rales rít', 'Rales ngáy', 'Phổi thông khí kém'];
const DIGEST_OPTIONS = ['Bụng mềm', 'Chướng bụng', 'Gan lách không to', 'Phản ứng thành bụng (-)', 'Đi ngoài phân lỏng'];
const ENT_OPTIONS = ['Họng đỏ', 'Amidan sưng đỏ', 'Có giả mạc', 'Mũi chảy dịch trong', 'Mũi chảy dịch mủ', 'Tai màng nhĩ sáng'];
const NEURO_OPTIONS = ['Hội chứng màng não (-)', 'Gáy cứng (+)', 'Kernig (+)', 'Phản xạ gân xương bình thường'];
const TREATMENT_OPTIONS = ['Hạ sốt (Paracetamol)', 'Kháng sinh (Tiêm)', 'Kháng sinh (Uống)', 'Long đờm', 'Khí dung Ventolin', 'Khí dung Pulmicort', 'Bù dịch Oresol', 'Bù dịch IV (Ringer)', 'Men vi sinh', 'Kẽm', 'Thở oxy'];
const DELIVERY_OPTIONS = [{value: 'Đẻ thường', label: 'Đẻ thường'}, {value: 'Đẻ mổ', label: 'Đẻ mổ'}, {value: 'Hỗ trợ (Forceps/Giác)', label: 'Hỗ trợ'}];
const TEST_RESULT_OPTIONS = [
  {value: 'Chưa làm', label: 'Chưa làm'}, 
  {value: 'Âm tính', label: 'Âm tính'}, 
  {value: 'Dương tính', label: 'Dương tính'}
];

const TABS = [
  { id: 'admin', label: 'Hành chính', icon: User },
  { id: 'history', label: 'Bệnh sử', icon: Clipboard },
  { id: 'clinical', label: 'Lâm sàng', icon: Stethoscope },
  { id: 'labs', label: 'Cận LS', icon: Microscope },
  { id: 'treatment', label: 'Tổng kết', icon: FileText },
];

const App: React.FC = () => {
  const [record, setRecord] = useState<MedicalRecord>(INITIAL_RECORD);
  const [activeTab, setActiveTab] = useState('admin');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const updateRecord = (field: keyof MedicalRecord, value: any) => {
    setRecord(prev => ({ ...prev, [field]: value }));
  };

  const updateNested = (parent: keyof MedicalRecord, field: string, value: any) => {
    setRecord(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const updateDeep = (section: 'labs', subsection: string, field: string, value: any) => {
    setRecord(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [field]: value
        }
      }
    }));
  };

  // Helper for SymptomDetails updates
  const updateSymptom = (field: string, value: any) => {
    setRecord(prev => ({
      ...prev,
      symptomDetails: {
        ...prev.symptomDetails,
        [field]: value
      }
    }));
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setShowAnalysisModal(true);
    const result = await analyzeMedicalRecord(record);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'admin':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card>
              <SectionTitle>Thông tin hành chính</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Họ và tên trẻ" value={record.patientName} onChange={e => updateRecord('patientName', e.target.value)} placeholder="VD: NGUYEN VAN A" className="uppercase font-bold text-primary" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Tuổi (tháng)" type="number" value={record.ageMonth} onChange={e => updateRecord('ageMonth', e.target.value)} />
                  <Select 
                    label="Giới tính" 
                    options={[{ value: Gender.MALE, label: 'Nam' }, { value: Gender.FEMALE, label: 'Nữ' }]} 
                    value={record.gender}
                    onChange={e => updateRecord('gender', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <Input label="Ngày sinh" type="date" value={record.dob} onChange={e => updateRecord('dob', e.target.value)} />
                 <Input label="Số giường/Phòng" value={record.bedNumber} onChange={e => updateRecord('bedNumber', e.target.value)} placeholder="P.502" />
              </div>
              <Input label="Địa chỉ" value={record.address} onChange={e => updateRecord('address', e.target.value)} placeholder="Thôn, Xã, Huyện..." />
              <TextArea label="Ghi chú hành chính" value={record.adminNotes} onChange={e => updateRecord('adminNotes', e.target.value)} placeholder="Đối tượng bảo hiểm, dân tộc..." />
            </Card>

            <Card>
              <SectionTitle>Người giám hộ</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Họ tên Bố/Mẹ" value={record.parentName} onChange={e => updateRecord('parentName', e.target.value)} />
                <Input label="Điện thoại" type="tel" value={record.phone} onChange={e => updateRecord('phone', e.target.value)} />
              </div>
              <Input label="Ngày giờ vào viện" type="datetime-local" value={record.admissionDate} onChange={e => updateRecord('admissionDate', e.target.value)} />
            </Card>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <Card>
              <SectionTitle>Lý do & Bệnh sử</SectionTitle>
              <MultiSelectChip 
                label="Lý do vào viện (Chọn nhanh)" 
                options={REASON_OPTIONS} 
                selected={record.chiefComplaint} 
                onChange={val => updateRecord('chiefComplaint', val)} 
              />
              <Input label="Lý do chi tiết (Tự nhập)" value={record.chiefComplaintNotes} onChange={e => updateRecord('chiefComplaintNotes', e.target.value)} placeholder="Nhập thêm lý do..." />
              
              <div className="flex justify-between items-center mb-2 mt-4">
                   <label className="text-sm font-semibold text-slate-700">Thời gian bệnh</label>
                   <span className="text-lg font-bold text-primary bg-white px-3 py-1 rounded-lg border">{record.historyDays} ngày</span>
              </div>
              <input 
                  type="range" min="1" max="14" 
                  value={record.historyDays} 
                  onChange={e => updateRecord('historyDays', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary mb-6"
              />
             </Card>

             <Accordion title="Diễn biến chi tiết (Timeline)" defaultOpen>
                <div className="space-y-4">
                  {/* Fever Card */}
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" checked={record.symptomDetails.hasFever} onChange={e => updateSymptom('hasFever', e.target.checked)} className="w-5 h-5 accent-orange-500"/>
                      <h4 className="font-bold text-orange-700">Sốt</h4>
                    </div>
                    {record.symptomDetails.hasFever && (
                      <div className="grid grid-cols-2 gap-3 mt-2 animate-in fade-in">
                        <Select label="Tính chất" options={[{value: 'Từng cơn', label: 'Từng cơn'}, {value: 'Liên tục', label: 'Liên tục'}]} value={record.symptomDetails.feverPattern} onChange={e => updateSymptom('feverPattern', e.target.value)} />
                        <Input label="Nhiệt độ Max" suffix="°C" value={record.symptomDetails.maxTemp} onChange={e => updateSymptom('maxTemp', e.target.value)} />
                        <div className="col-span-2 flex gap-4 mt-1">
                          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={record.symptomDetails.hasChills} onChange={e => updateSymptom('hasChills', e.target.checked)} className="accent-orange-500" /> Rét run</label>
                          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={record.symptomDetails.hasConvulsions} onChange={e => updateSymptom('hasConvulsions', e.target.checked)} className="accent-orange-500" /> Co giật</label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vomiting Card */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" checked={record.symptomDetails.hasVomiting} onChange={e => updateSymptom('hasVomiting', e.target.checked)} className="w-5 h-5 accent-blue-500"/>
                      <h4 className="font-bold text-blue-700">Nôn trớ</h4>
                    </div>
                    {record.symptomDetails.hasVomiting && (
                      <div className="space-y-3 mt-2 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-3">
                          <Input label="Tần suất (lần/ngày)" value={record.symptomDetails.vomitFrequency} onChange={e => updateSymptom('vomitFrequency', e.target.value)} />
                          <Input label="Liên quan bữa ăn" value={record.symptomDetails.vomitRelation} onChange={e => updateSymptom('vomitRelation', e.target.value)} placeholder="VD: sau ăn 2p" />
                        </div>
                        <MultiSelectChip label="Đặc điểm dịch nôn" options={['Thức ăn', 'Dịch vàng', 'Dịch trong', 'Lẫn máu', 'Mùi chua']} selected={record.symptomDetails.vomitCharacteristics} onChange={val => updateSymptom('vomitCharacteristics', val)} />
                      </div>
                    )}
                  </div>

                  {/* Stool Card */}
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" checked={record.symptomDetails.hasDiarrhea} onChange={e => updateSymptom('hasDiarrhea', e.target.checked)} className="w-5 h-5 accent-green-500"/>
                      <h4 className="font-bold text-green-700">Đại tiện / Tiêu chảy</h4>
                    </div>
                    {record.symptomDetails.hasDiarrhea && (
                      <div className="space-y-3 mt-2 animate-in fade-in">
                        <Input label="Số lần / ngày" value={record.symptomDetails.stoolFrequency} onChange={e => updateSymptom('stoolFrequency', e.target.value)} />
                        <MultiSelectChip label="Tính chất phân" options={['Lỏng nước', 'Sệt', 'Hoa cà hoa cải', 'Phân sống', 'Mùi khắm']} selected={record.symptomDetails.stoolCharacteristics} onChange={val => updateSymptom('stoolCharacteristics', val)} />
                        <label className="flex items-center gap-2 text-sm text-green-800 font-medium"><input type="checkbox" checked={record.symptomDetails.stoolBloodMucus} onChange={e => updateSymptom('stoolBloodMucus', e.target.checked)} className="accent-green-500" /> Có nhầy máu mũi</label>
                      </div>
                    )}
                  </div>

                  {/* General */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <h4 className="font-bold text-slate-700 mb-2">Toàn trạng & Khác</h4>
                     <MultiSelectChip label="Trạng thái" options={['Quấy khóc', 'Mệt mỏi', 'Li bì', 'Bỏ ăn/bú', 'Tiểu ít', 'Tiểu vàng']} selected={record.symptomDetails.generalState} onChange={val => updateSymptom('generalState', val)} />
                     <Input label="Triệu chứng khác (Ho, đau bụng...)" value={record.symptomDetails.otherSymptoms} onChange={e => updateSymptom('otherSymptoms', e.target.value)} />
                  </div>
                </div>
             </Accordion>

             <Card>
               <SectionTitle>Tiền sử</SectionTitle>
               <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="col-span-1"><Input label="PARA" value={record.para} onChange={e => updateRecord('para', e.target.value)} placeholder="1001" /></div>
                  <div className="col-span-2"><Select label="Hình thức sinh" options={DELIVERY_OPTIONS} value={record.deliveryType} onChange={e => updateRecord('deliveryType', e.target.value)} /></div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <Input label="Tuổi thai (tuần)" type="number" suffix="tuần" value={record.birthWeek} onChange={e => updateRecord('birthWeek', e.target.value)} />
                  <Input label="CN sơ sinh (g)" type="number" suffix="g" value={record.birthWeight} onChange={e => updateRecord('birthWeight', e.target.value)} />
               </div>
               <Input label="Tiêm chủng" value={record.vaccination} onChange={e => updateRecord('vaccination', e.target.value)} />
               <Input label="Tiền sử bệnh lý" value={record.historyPathology} onChange={e => updateRecord('historyPathology', e.target.value)} />
             </Card>
          </div>
        );

      case 'clinical':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="bg-gradient-to-br from-white to-blue-50/50">
               <SectionTitle>Dấu hiệu sinh tồn</SectionTitle>
               <div className="grid grid-cols-2 gap-4">
                 <Input label="Mạch" suffix="l/p" type="number" value={record.vitals.heartRate} onChange={e => updateNested('vitals', 'heartRate', e.target.value)} className="font-bold text-center text-lg" />
                 <Input label="Nhiệt độ" suffix="°C" type="number" value={record.vitals.temperature} onChange={e => updateNested('vitals', 'temperature', e.target.value)} className="font-bold text-center text-lg text-red-500" />
                 <Input label="Nhịp thở" suffix="l/p" type="number" value={record.vitals.respiratoryRate} onChange={e => updateNested('vitals', 'respiratoryRate', e.target.value)} className="font-bold text-center text-lg" />
                 <Input label="SpO2" suffix="%" type="number" value={record.vitals.spO2} onChange={e => updateNested('vitals', 'spO2', e.target.value)} className="font-bold text-center text-lg text-blue-600" />
                 <Input label="Cân nặng" suffix="kg" type="number" value={record.vitals.weight} onChange={e => updateNested('vitals', 'weight', e.target.value)} className="font-bold text-center text-lg" />
                 <Input label="Chiều cao" suffix="cm" type="number" value={record.vitals.height} onChange={e => updateNested('vitals', 'height', e.target.value)} className="font-bold text-center text-lg" />
               </div>
            </Card>

            <Card>
               <SectionTitle>Khám toàn thân</SectionTitle>
               <MultiSelectChip label="Tinh thần" options={GENERAL_OPTIONS} selected={record.generalCondition} onChange={val => updateRecord('generalCondition', val)} />
               <MultiSelectChip label="Da & Niêm mạc" options={SKIN_OPTIONS} selected={record.skinExam} onChange={val => updateRecord('skinExam', val)} />
            </Card>

            <Card>
               <SectionTitle>Khám bộ phận</SectionTitle>
               <div className="space-y-6">
                 <div>
                   <MultiSelectChip label="1. Hô hấp" options={RESP_OPTIONS} selected={record.respiratoryExam} onChange={val => updateRecord('respiratoryExam', val)} />
                 </div>
                 <div className="border-t border-slate-100 pt-4">
                   <MultiSelectChip label="2. Tiêu hóa" options={DIGEST_OPTIONS} selected={record.digestiveExam} onChange={val => updateRecord('digestiveExam', val)} />
                 </div>
                 <div className="border-t border-slate-100 pt-4">
                   <MultiSelectChip label="3. Tai Mũi Họng" options={ENT_OPTIONS} selected={record.entExam} onChange={val => updateRecord('entExam', val)} />
                 </div>
                 <div className="border-t border-slate-100 pt-4">
                   <MultiSelectChip label="4. Thần kinh" options={NEURO_OPTIONS} selected={record.neuroExam} onChange={val => updateRecord('neuroExam', val)} />
                 </div>
                 <TextArea label="Khám khác (Tự nhập)" value={record.otherExam} onChange={e => updateRecord('otherExam', e.target.value)} placeholder="Cơ xương khớp, Thận tiết niệu..." />
                 <TextArea label="Ghi chú thêm về lâm sàng" value={record.examNotes} onChange={e => updateRecord('examNotes', e.target.value)} />
               </div>
            </Card>
          </div>
        );

      case 'labs':
        const renderTestRow = (label: string, field: string, noteField: string, options = TEST_RESULT_OPTIONS) => (
          <div className="flex gap-2 items-start mb-3">
            <div className="w-1/3">
              <Select 
                label={label}
                options={options} 
                value={(record.labs.microbiology as any)[field] || 'Chưa làm'}
                onChange={e => updateDeep('labs', 'microbiology', field, e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="w-2/3">
              <Input 
                label={`Ghi chú ${label}`} 
                value={(record.labs.microbiology as any)[noteField] || ''}
                onChange={e => updateDeep('labs', 'microbiology', noteField, e.target.value)}
                placeholder="CT, chỉ số..."
                className="text-sm"
              />
            </div>
          </div>
        );

        const renderUrineRow = (label: string, field: string, noteField: string) => (
          <div className="flex gap-2 items-start mb-3">
            <div className="w-1/3">
              <Input 
                label={label}
                value={(record.labs.urine as any)[field] || ''}
                onChange={e => updateDeep('labs', 'urine', field, e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="w-2/3">
              <Input 
                label={`Ghi chú ${label}`} 
                value={(record.labs.urine as any)[noteField] || ''}
                onChange={e => updateDeep('labs', 'urine', noteField, e.target.value)}
                placeholder="Kết quả cụ thể..."
                className="text-sm"
              />
            </div>
          </div>
        );

        const renderImagingRow = (label: string, field: string, noteField: string) => (
          <div className="grid grid-cols-1 mb-4 border-b border-slate-100 pb-4 last:border-0">
             <TextArea 
               label={`${label} (Mô tả)`}
               value={(record.labs.imaging as any)[field] || ''}
               onChange={e => updateDeep('labs', 'imaging', field, e.target.value)}
               placeholder={`Mô tả kết quả ${label}...`}
             />
             <Input 
               label="Kết luận / Ghi chú ngắn"
               value={(record.labs.imaging as any)[noteField] || ''}
               onChange={e => updateDeep('labs', 'imaging', noteField, e.target.value)}
               placeholder="VD: Viêm phổi, Gan to..."
             />
          </div>
        );

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Hematology Accordion */}
             <Accordion title="1. Công thức máu (Huyết học)" defaultOpen>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Input label="WBC (Bạch cầu)" suffix="G/L" value={record.labs.hematology.wbc} onChange={e => updateDeep('labs', 'hematology', 'wbc', e.target.value)} />
                  <Input label="NEU %" suffix="%" value={record.labs.hematology.neu} onChange={e => updateDeep('labs', 'hematology', 'neu', e.target.value)} />
                  <Input label="LYM %" suffix="%" value={record.labs.hematology.lym} onChange={e => updateDeep('labs', 'hematology', 'lym', e.target.value)} />
                  <Input label="PLT (Tiểu cầu)" suffix="G/L" value={record.labs.hematology.plt} onChange={e => updateDeep('labs', 'hematology', 'plt', e.target.value)} />
                  <Input label="RBC (Hồng cầu)" suffix="T/L" value={record.labs.hematology.rbc} onChange={e => updateDeep('labs', 'hematology', 'rbc', e.target.value)} />
                  <Input label="HGB" suffix="g/L" value={record.labs.hematology.hgb} onChange={e => updateDeep('labs', 'hematology', 'hgb', e.target.value)} />
                  <Input label="HCT" suffix="%" value={record.labs.hematology.hct} onChange={e => updateDeep('labs', 'hematology', 'hct', e.target.value)} />
                  <Input label="MCV" suffix="fL" value={record.labs.hematology.mcv} onChange={e => updateDeep('labs', 'hematology', 'mcv', e.target.value)} />
                </div>
                <Input label="Ghi chú huyết học" value={record.labs.hematology.notes} onChange={e => updateDeep('labs', 'hematology', 'notes', e.target.value)} placeholder="VD: Thiếu máu hồng cầu nhỏ..." />
             </Accordion>

             {/* Biochemistry Accordion */}
             <Accordion title="2. Sinh hóa (Gan, Thận, Đường, Mỡ)">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-primary mb-2 uppercase">Chức năng Thận & Đường</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Ure" suffix="mmol" value={record.labs.biochemistry.ure} onChange={e => updateDeep('labs', 'biochemistry', 'ure', e.target.value)} />
                    <Input label="Creatinin" suffix="µmol" value={record.labs.biochemistry.creatinin} onChange={e => updateDeep('labs', 'biochemistry', 'creatinin', e.target.value)} />
                    <Input label="Glucose" suffix="mmol" value={record.labs.biochemistry.glucose} onChange={e => updateDeep('labs', 'biochemistry', 'glucose', e.target.value)} />
                    <Input label="HbA1c" suffix="%" value={record.labs.biochemistry.hba1c} onChange={e => updateDeep('labs', 'biochemistry', 'hba1c', e.target.value)} />
                  </div>
                </div>
                <div className="mb-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-primary mb-2 uppercase">Men Gan & Mỡ Máu</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Input label="AST (GOT)" suffix="U/L" value={record.labs.biochemistry.ast} onChange={e => updateDeep('labs', 'biochemistry', 'ast', e.target.value)} />
                    <Input label="ALT (GPT)" suffix="U/L" value={record.labs.biochemistry.alt} onChange={e => updateDeep('labs', 'biochemistry', 'alt', e.target.value)} />
                    <Input label="GGT" suffix="U/L" value={record.labs.biochemistry.ggt} onChange={e => updateDeep('labs', 'biochemistry', 'ggt', e.target.value)} />
                    <Input label="Cholesterol TP" suffix="mmol" value={record.labs.biochemistry.cholesterol} onChange={e => updateDeep('labs', 'biochemistry', 'cholesterol', e.target.value)} />
                    <Input label="Triglyceride" suffix="mmol" value={record.labs.biochemistry.triglyceride} onChange={e => updateDeep('labs', 'biochemistry', 'triglyceride', e.target.value)} />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-primary mb-2 uppercase">Điện giải đồ</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     <Input label="Natri (Na+)" suffix="mmol" value={record.labs.biochemistry.na} onChange={e => updateDeep('labs', 'biochemistry', 'na', e.target.value)} />
                     <Input label="Kali (K+)" suffix="mmol" value={record.labs.biochemistry.k} onChange={e => updateDeep('labs', 'biochemistry', 'k', e.target.value)} />
                     <Input label="Clo (Cl-)" suffix="mmol" value={record.labs.biochemistry.cl} onChange={e => updateDeep('labs', 'biochemistry', 'cl', e.target.value)} />
                     <Input label="Canxi (Ca)" suffix="mmol" value={record.labs.biochemistry.ca} onChange={e => updateDeep('labs', 'biochemistry', 'ca', e.target.value)} />
                  </div>
                </div>
                <TextArea label="Ghi chú sinh hóa" value={record.labs.biochemistry.notes} onChange={e => updateDeep('labs', 'biochemistry', 'notes', e.target.value)} />
             </Accordion>

             {/* Microbiology Accordion */}
             <Accordion title="3. Vi sinh (Test nhanh/PCR)">
               {renderTestRow("Virus RSV", "rsv", "rsvNote")}
               {renderTestRow("Cúm A (Flu A)", "influenzaA", "influenzaANote")}
               {renderTestRow("Cúm B (Flu B)", "influenzaB", "influenzaBNote")}
               {renderTestRow("Covid-19", "covid", "covidNote")}
               {renderTestRow("Sốt xuất huyết (Dengue)", "dengue", "dengueNote")}
               {renderTestRow("Viêm gan B (HBsAg)", "hepB", "hepBNote")}
               {renderTestRow("Viêm gan C (HCV)", "hepC", "hepCNote")}
             </Accordion>

             {/* Urine Accordion */}
             <Accordion title="4. Tổng phân tích nước tiểu">
               {renderUrineRow("Bạch cầu (LEU)", "leukocytes", "leukocytesNote")}
               {renderUrineRow("Hồng cầu (ERY)", "erythrocytes", "erythrocytesNote")}
               {renderUrineRow("Nitrite (NIT)", "nitrite", "nitriteNote")}
               {renderUrineRow("Protein (PRO)", "protein", "proteinNote")}
               {renderUrineRow("Glucose (GLU)", "glucose", "glucoseNote")}
               {renderUrineRow("Ketone (KET)", "ketone", "ketoneNote")}
               {renderUrineRow("pH", "ph", "phNote")}
             </Accordion>

             {/* Imaging Accordion */}
             <Accordion title="5. Chẩn đoán hình ảnh">
               {renderImagingRow("X-Quang", "xray", "xrayNote")}
               {renderImagingRow("Siêu âm", "ultrasound", "ultrasoundNote")}
               {renderImagingRow("CT Scanner", "ct", "ctNote")}
               {renderImagingRow("MRI", "mri", "mriNote")}
               {renderImagingRow("Nội soi", "endoscopy", "endoscopyNote")}
               <div className="mt-4 pt-4 border-t border-slate-100">
                  <TextArea label="Các xét nghiệm khác (Gen, Ký sinh trùng...)" value={record.labs.otherLabs} onChange={e => updateNested('labs', 'otherLabs', e.target.value)} />
               </div>
             </Accordion>
          </div>
        );

      case 'treatment':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <Card className="border-l-4 border-l-primary">
               <SectionTitle>Chẩn đoán</SectionTitle>
               <Input 
                 label="Chẩn đoán xác định" 
                 value={record.diagnosis} 
                 onChange={e => updateRecord('diagnosis', e.target.value)} 
                 className="font-bold text-lg text-primary" 
                 placeholder="VD: Viêm phế quản phổi..." 
               />
               <TextArea 
                 label="Chẩn đoán phân biệt" 
                 value={record.differentialDiagnosis} 
                 onChange={e => updateRecord('differentialDiagnosis', e.target.value)} 
               />
             </Card>

             <Card>
               <SectionTitle>Hướng xử trí</SectionTitle>
               <MultiSelectChip 
                  label="Y lệnh điều trị (Chọn nhanh)" 
                  options={TREATMENT_OPTIONS} 
                  selected={record.treatmentPlan} 
                  onChange={val => updateRecord('treatmentPlan', val)} 
               />
               <div className="mt-4">
                 <TextArea
                   label="Y lệnh cụ thể & Dặn dò (Tự nhập)"
                   className="h-32"
                   value={record.doctorNotes}
                   onChange={e => updateRecord('doctorNotes', e.target.value)}
                   placeholder="Dặn dò chế độ ăn, tái khám..."
                 />
               </div>
             </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-28 font-sans text-slate-800">
      {/* Header - Glassmorphism */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 py-3 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Baby className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">MediNote AI</h1>
              <p className="text-xs font-medium text-slate-500">Hồ sơ bệnh án Nhi khoa</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => generatePDF(record)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all shadow-sm" title="Xuất Kết Quả">
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Xuất Kết Quả</span>
             </button>
             <button onClick={handleAIAnalysis} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors" title="AI Phân tích">
                <Sparkles className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 md:p-6">
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-30">
        <div className="max-w-3xl mx-auto px-2">
          <div className="flex justify-between items-center">
             {TABS.map((tab) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex flex-col items-center justify-center flex-1 py-3 transition-all duration-300 relative group
                     ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {isActive && (
                     <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-lg shadow-[0_2px_8px_rgba(14,165,233,0.5)]"></span>
                   )}
                   <Icon className={`w-6 h-6 mb-1 transition-transform duration-300 ${isActive ? '-translate-y-0.5' : 'group-hover:-translate-y-0.5'}`} strokeWidth={isActive ? 2.5 : 2} />
                   <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
                 </button>
               );
             })}
          </div>
        </div>
      </nav>

      {/* AI Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full md:w-[600px] md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 duration-300">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white rounded-t-2xl">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg">
                <Sparkles className="w-5 h-5" />
                <span>AI Phân tích & Gợi ý</span>
              </div>
              <button onClick={() => setShowAnalysisModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xl">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600 animate-pulse" />
                  </div>
                  <p className="text-slate-600 font-medium animate-pulse text-center">
                    Đang tổng hợp dữ liệu bệnh án...<br/>
                    <span className="text-sm text-slate-400 font-normal">Quá trình này mất khoảng vài giây</span>
                  </p>
                </div>
              ) : (
                <div className="prose prose-sm prose-indigo max-w-none">
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
               <button 
                onClick={() => setShowAnalysisModal(false)}
                className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold hover:bg-slate-700 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
               >
                 Đã hiểu
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
