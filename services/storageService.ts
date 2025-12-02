
import { MedicalRecord } from '../types';

const STORAGE_KEY = 'medinote_records';

export const saveRecordToLocal = (record: MedicalRecord): MedicalRecord => {
  const records = getSavedRecords();
  const timestamp = Date.now();
  
  // Ensure ID exists
  const recordToSave = {
    ...record,
    id: record.id || crypto.randomUUID(),
    lastModified: timestamp
  };

  // Update if exists, or add new
  const index = records.findIndex(r => r.id === recordToSave.id);
  if (index >= 0) {
    records[index] = recordToSave;
  } else {
    records.push(recordToSave);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return recordToSave;
};

export const getSavedRecords = (): MedicalRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading storage", error);
    return [];
  }
};

export const deleteRecord = (id: string) => {
  const records = getSavedRecords();
  const newRecords = records.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
};

export const exportRecordToFile = (record: MedicalRecord) => {
  const fileName = `HSBA_${record.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
  const jsonStr = JSON.stringify(record, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importRecordFromFile = (file: File): Promise<MedicalRecord> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic validation
        if (json.patientName !== undefined && json.vitals !== undefined) {
          resolve(json as MedicalRecord);
        } else {
          reject(new Error("File không đúng định dạng bệnh án."));
        }
      } catch (err) {
        reject(new Error("Lỗi đọc file JSON."));
      }
    };
    reader.onerror = () => reject(new Error("Lỗi đọc file."));
    reader.readAsText(file);
  });
};
