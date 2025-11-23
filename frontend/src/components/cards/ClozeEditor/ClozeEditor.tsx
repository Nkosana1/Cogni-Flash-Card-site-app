import React, { useState, useEffect } from 'react';
import { ClozeDeletion } from '@/types';

export interface ClozeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onDataChange?: (data: Record<string, any>) => void;
  className?: string;
}

export const ClozeEditor: React.FC<ClozeEditorProps> = ({
  value,
  onChange,
  onDataChange,
  className,
}) => {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    // Parse cloze syntax and create preview
    const clozePattern = /\{\{c(\d+)::([^:}]+)(?:::(.+?))?\}\}/g;
    let previewText = value;
    let match;
    let clozeCount = 0;

    while ((match = clozePattern.exec(value)) !== null) {
      clozeCount++;
      const placeholder = `[...${match[1]}]`;
      previewText = previewText.replace(match[0], placeholder);
    }

    setPreview(previewText);

    // Extract cloze data
    if (onDataChange) {
      const deletions: ClozeDeletion[] = [];
      const matches = value.matchAll(clozePattern);
      
      for (const match of matches) {
        deletions.push({
          index: parseInt(match[1]),
          text: match[2],
          hint: match[3],
          position: match.index || 0,
          full_match: match[0],
        });
      }

      onDataChange({
        total_deletions: deletions.length,
        deletions,
        cloze_numbers: [...new Set(deletions.map(d => d.index))].sort(),
      });
    }
  }, [value, onDataChange]);

  const insertCloze = () => {
    const textarea = document.getElementById('cloze-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (!selectedText) {
      alert('Please select text to create a cloze deletion');
      return;
    }

    // Find next cloze number
    const existingNumbers = (value.match(/\{\{c(\d+)::/g) || []).map(m => 
      parseInt(m.match(/\d+/)![0])
    );
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    const clozeText = `{{c${nextNumber}::${selectedText}}}`;
    const newValue = value.substring(0, start) + clozeText + value.substring(end);
    onChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + clozeText.length, start + clozeText.length);
    }, 0);
  };

  return (
    <div className={className}>
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Cloze Text
          </label>
          <button
            type="button"
            onClick={insertCloze}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Insert Cloze
          </button>
        </div>
        <textarea
          id="cloze-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
          rows={6}
          placeholder="Type text and use {{c1::text}} for cloze deletions..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Syntax: {'{{c1::hidden text}}'} or {'{{c1::hidden text::hint}}'}
        </p>
      </div>

      {preview && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preview
          </label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm">{preview}</p>
          </div>
        </div>
      )}
    </div>
  );
};

