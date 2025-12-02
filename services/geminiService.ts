import { GoogleGenAI } from "@google/genai";
import { MedicalRecord } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeMedicalRecord = async (record: MedicalRecord): Promise<string> => {
  if (!apiKey) return "⚠️ Lỗi: Chưa cấu hình API Key.";

  const prompt = `
    Đóng vai trò là một Bác sĩ Nhi khoa Trưởng khoa. Phân tích dữ liệu:
    - BN: ${record.patientName}, ${record.ageMonth} tháng, ${record.gender}. ${record.vitals.weight}kg.
    - Lý do: ${record.chiefComplaint.join(', ')}.
    - Bệnh sử (${record.historyDays} ngày): ${record.historyCourse.join(', ')}. ${record.historyNotes}.
    - Tiền sử: ${record.historyPathology}.
    - Khám: ${record.generalCondition.join(', ')}, ${record.respiratoryExam.join(', ')}, ${record.digestiveExam.join(', ')}. ${record.otherExam}.
    - CLS: WBC ${record.labs.hematology.wbc}, CRP ${record.labs.hematology.notes}, RSV ${record.labs.microbiology.rsv}, XQ ${record.labs.imaging.xray}.

    Yêu cầu (Markdown):
    1. **Tóm tắt**: Triệu chứng dương tính & CLS bất thường.
    2. **Biện luận**: Phân tích logic lâm sàng.
    3. **Hướng xử trí nhanh**: Đề xuất ban đầu.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Không thể phân tích.";
  } catch (error) {
    return "Lỗi kết nối AI.";
  }
};

export const suggestDiagnosis = async (record: MedicalRecord): Promise<string> => {
  if (!apiKey) return "⚠️ Lỗi: Chưa cấu hình API Key.";

  const prompt = `
    Bạn là chuyên gia chẩn đoán bệnh học Nhi khoa. Dựa trên hồ sơ sau, hãy đưa ra chẩn đoán xác định và chẩn đoán phân biệt.
    
    DỮ LIỆU BỆNH NHÂN:
    - Tuổi/Giới: ${record.ageMonth} tháng, ${record.gender}.
    - Lâm sàng nổi bật: ${record.chiefComplaint.join(', ')}. ${record.historyCourse.join(', ')}. ${record.respiratoryExam.join(', ')}. ${record.digestiveExam.join(', ')}.
    - Dấu hiệu sinh tồn: Sốt ${record.vitals.temperature} độ, SpO2 ${record.vitals.spO2}%.
    - Cận lâm sàng quan trọng: 
      + Huyết học: WBC ${record.labs.hematology.wbc} (Neu ${record.labs.hematology.neu}%), CRP ${record.labs.hematology.notes}.
      + Vi sinh: RSV ${record.labs.microbiology.rsv}, Cúm ${record.labs.microbiology.influenzaA}, Dengue ${record.labs.microbiology.dengue}.
      + Hình ảnh: ${record.labs.imaging.xray}, ${record.labs.imaging.ultrasound}.

    NHIỆM VỤ:
    1. **Chẩn đoán xác định**: (Kèm mã ICD-10 nếu có thể). Giải thích ngắn gọn tại sao (dựa trên bằng chứng nào trong hồ sơ).
    2. **Chẩn đoán phân biệt**: Liệt kê 2-3 bệnh lý khác cần loại trừ và lý do.
    3. **Đề xuất làm thêm**: Nếu thiếu bằng chứng, cần làm thêm xét nghiệm gì?
  `;

  try {
    // Using gemini-3-pro-preview for complex reasoning tasks like diagnosis
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Không thể đưa ra gợi ý chẩn đoán.";
  } catch (error) {
    return "Lỗi kết nối AI khi chẩn đoán.";
  }
};

export const suggestTreatment = async (record: MedicalRecord): Promise<string> => {
  if (!apiKey) return "⚠️ Lỗi: Chưa cấu hình API Key.";

  const prompt = `
    Bạn là bác sĩ điều trị Nhi khoa. Hãy đề xuất phác đồ điều trị chi tiết.
    
    THÔNG TIN:
    - Bệnh nhân: ${record.ageMonth} tháng, Cân nặng: ${record.vitals.weight} kg (Rất quan trọng để tính liều).
    - Chẩn đoán hiện tại: ${record.diagnosis} (Nếu chưa có, dựa trên: ${record.chiefComplaint.join(', ')}).
    - Tình trạng: ${record.generalCondition.join(', ')}. Sốt ${record.vitals.temperature}, SpO2 ${record.vitals.spO2}.
    - Tiền sử dị ứng: ${record.historyAllergy}.

    YÊU CẦU:
    Đưa ra y lệnh điều trị cụ thể (Tên thuốc, Hàm lượng, Liều dùng theo cân nặng ${record.vitals.weight}kg, Cách dùng):
    1. **Điều trị nguyên nhân**: (Kháng sinh/Kháng virus nếu cần). Tính toán liều chính xác.
    2. **Điều trị triệu chứng**: Hạ sốt, Bù dịch (tính lượng dịch nhu cầu), Long đờm, v.v.
    3. **Chăm sóc & Dinh dưỡng**: Chế độ ăn, theo dõi.
    4. **Dấu hiệu cảnh báo**: Khi nào cần gọi bác sĩ ngay.
  `;

  try {
    // Using gemini-3-pro-preview for precise calculation and protocol adherence
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Không thể đưa ra gợi ý điều trị.";
  } catch (error) {
    return "Lỗi kết nối AI khi gợi ý điều trị.";
  }
};