import { GoogleGenAI } from "@google/genai";
import { MedicalRecord } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeMedicalRecord = async (record: MedicalRecord): Promise<string> => {
  if (!apiKey) {
    return "⚠️ Lỗi: Chưa cấu hình API Key. Vui lòng kiểm tra cài đặt môi trường.";
  }

  const prompt = `
    Đóng vai trò là một Bác sĩ Nhi khoa Trưởng khoa giàu kinh nghiệm. 
    Phân tích dữ liệu bệnh án chi tiết dưới đây để hỗ trợ bác sĩ trực:

    --- THÔNG TIN BỆNH ÁN ---
    Tên: ${record.patientName}, ${record.ageMonth} tháng tuổi, Giới: ${record.gender}.
    Lý do vào viện: ${record.chiefComplaint.join(', ')}. ${record.chiefComplaintNotes}.
    
    1. BỆNH SỬ: 
    - ${record.historyDays} ngày.
    - Diễn biến: ${record.historyCourse.join(', ')}.
    - Ghi chú: ${record.historyNotes}.

    2. TIỀN SỬ:
    - PARA: ${record.para}, Sinh ${record.deliveryType} ${record.birthWeek}w, ${record.birthWeight}g.
    - Bệnh lý: ${record.historyPathology}.

    3. KHÁM LÂM SÀNG:
    - Mạch: ${record.vitals.heartRate}, Nhiệt: ${record.vitals.temperature}, Thở: ${record.vitals.respiratoryRate}, SpO2: ${record.vitals.spO2}%.
    - Toàn thân: ${record.generalCondition.join(', ')}. Da: ${record.skinExam.join(', ')}.
    - Hô hấp: ${record.respiratoryExam.join(', ')}.
    - Tiêu hóa: ${record.digestiveExam.join(', ')}.
    - Khám khác: ${record.otherExam}. ${record.examNotes}.

    4. CẬN LÂM SÀNG (LABS):
    - Huyết học: WBC ${record.labs.hematology.wbc}, NEU ${record.labs.hematology.neu}%, RBC ${record.labs.hematology.rbc}, HGB ${record.labs.hematology.hgb}, PLT ${record.labs.hematology.plt}.
    - Sinh hóa: CRP ${record.labs.hematology.notes}, Glucose ${record.labs.biochemistry.glucose}, Ure ${record.labs.biochemistry.ure}, Crea ${record.labs.biochemistry.creatinin}, AST/ALT ${record.labs.biochemistry.ast}/${record.labs.biochemistry.alt}, Na/K ${record.labs.biochemistry.na}/${record.labs.biochemistry.k}.
    - Vi sinh: RSV ${record.labs.microbiology.rsv}, Cúm ${record.labs.microbiology.influenzaA}.
    - Hình ảnh: ${record.labs.imaging.xray}, ${record.labs.imaging.ultrasound}.

    --- YÊU CẦU ---
    Trả về định dạng Markdown:
    1. **Tóm tắt bệnh án (Summary)**: Nêu bật các triệu chứng dương tính và kết quả xét nghiệm bất thường.
    2. **Biện luận Chẩn đoán**: 
       - Đánh giá sự phù hợp của các triệu chứng với chẩn đoán sơ bộ.
       - Phân tích kết quả CLS (ví dụ: Bạch cầu tăng cao hay bình thường? Men gan có tăng không? Điện giải có rối loạn không?).
    3. **Đề xuất xử trí**: 
       - Điều trị cụ thể (dựa trên hướng dẫn Nhi khoa).
       - Đề xuất xét nghiệm bổ sung nếu thiếu (ví dụ: khí máu, cấy máu nếu nghi ngờ nhiễm trùng nặng).

    Giọng văn chuyên nghiệp, ngắn gọn.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "Không thể tạo phân tích.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra đường truyền.";
  }
};