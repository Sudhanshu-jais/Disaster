import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface FormattedMessageProps {
  content: string;
  className?: string;
}

// Helper to parse inline bold, italic, and code
function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match **bold**, *italic*, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="text-white/90 italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-[#38bdf8]">
          {part.slice(1, -1)}
        </code>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`list-${elements.length}`} className="my-2 space-y-1 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-white/85 text-xs leading-relaxed">
                <span className="text-[#38bdf8] mt-1 shrink-0 text-[10px]">●</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${elements.length}`} className="my-2 space-y-1 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-white/85 text-xs leading-relaxed">
                <span className="font-mono text-[#38bdf8] font-bold text-[11px] mt-0.5 shrink-0">
                  {idx + 1}.
                </span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty lines
    if (!trimmed) {
      flushList();
      continue;
    }

    // Horizontal Rule (--- or ***)
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      elements.push(
        <hr key={`hr-${i}`} className="my-3 border-t border-white/15" />
      );
      continue;
    }

    // Emergency / Critical Alert Box (starts with 🚨 or ⚠️)
    if (trimmed.startsWith('🚨') || trimmed.startsWith('⚠️')) {
      flushList();
      const isRed = trimmed.startsWith('🚨');
      const textWithoutEmoji = trimmed.replace(/^(🚨|⚠️)\s*/, '');
      elements.push(
        <div
          key={`alert-${i}`}
          className={`my-2.5 p-3 rounded-xl border flex items-start gap-2.5 ${
            isRed
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-200'
          }`}
        >
          {isRed ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed font-medium">
            {parseInline(textWithoutEmoji)}
          </div>
        </div>
      );
      continue;
    }

    // Headings (###, ##, #)
    if (trimmed.startsWith('#')) {
      flushList();
      const level = (trimmed.match(/^#+/) || ['#'])[0].length;
      const headingText = trimmed.replace(/^#+\s*/, '');
      
      if (level === 1) {
        elements.push(
          <h2 key={`h1-${i}`} className="text-sm font-bold text-white mt-3 mb-1.5 flex items-center gap-1.5">
            {parseInline(headingText)}
          </h2>
        );
      } else if (level === 2) {
        elements.push(
          <h3 key={`h2-${i}`} className="text-xs font-bold text-white mt-2.5 mb-1 text-[#38bdf8]">
            {parseInline(headingText)}
          </h3>
        );
      } else {
        elements.push(
          <h4 key={`h3-${i}`} className="text-xs font-semibold text-white/95 mt-2 mb-1">
            {parseInline(headingText)}
          </h4>
        );
      }
      continue;
    }

    // Unordered list item (*, -, •)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const itemText = trimmed.replace(/^(\*|-|•)\s+/, '');
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(parseInline(itemText));
      continue;
    }

    // Ordered list item (1. , 2. )
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const itemText = numberedMatch[2];
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(parseInline(itemText));
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-xs text-white/85 leading-relaxed my-1.5">
        {parseInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
