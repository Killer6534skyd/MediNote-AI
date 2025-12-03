
import React, { useState } from 'react';
import { ChevronDown, Check, Circle, ChevronUp } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  suffix?: string;
}

export const Input: React.FC<InputProps> = ({ label, suffix, className, ...props }) => (
  <div className="mb-3">
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
      <input
        className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-base ${className}`}
        {...props}
      />
      {suffix && (
        <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className, ...props }) => (
  <div className="mb-3">
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
    <textarea
      className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-base ${className}`}
      rows={3}
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, ...props }) => (
  <div className="mb-3 relative">
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
      <select
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm text-base"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

interface MultiSelectChipProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const MultiSelectChip: React.FC<MultiSelectChipProps> = ({ label, options, selected, onChange }) => {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-slate-700 mb-2.5">{label}</label>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 active:scale-95 touch-manipulation
                ${isSelected 
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {isSelected ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4 text-slate-300" />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface BinaryStatusInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  negativeValue?: string;
}

export const BinaryStatusInput: React.FC<BinaryStatusInputProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  negativeValue = 'Chưa phát hiện' 
}) => {
  const isPositive = value && 
                     value !== negativeValue && 
                     value !== 'Bình thường' && 
                     value !== 'Khỏe mạnh' && 
                     value !== 'Không có';

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        <div className="flex bg-slate-100 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => onChange(negativeValue)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${!isPositive ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Bình thường
          </button>
          <button
            type="button"
            onClick={() => {
                if (!isPositive) onChange('');
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${isPositive ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Bất thường
          </button>
        </div>
      </div>
      
      {isPositive ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm animate-in fade-in slide-in-from-top-1"
          autoFocus
        />
      ) : (
         <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-400 italic">
          {value || negativeValue}
        </div>
      )}
    </div>
  );
};

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-3 mb-5 mt-8 pb-2 border-b border-slate-100 first:mt-0">
    <div className="h-6 w-1 bg-primary rounded-full"></div>
    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
      {children}
    </h3>
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 ${className}`}>
    {children}
  </div>
);

export const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="font-bold text-slate-700">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white border-t border-slate-200">
          {children}
        </div>
      )}
    </div>
  );
};
