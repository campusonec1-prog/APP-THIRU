import React from 'react';
import { CheckCircle, Circle, BookmarkCheck } from 'lucide-react';

export const SECTIONS = [
  { id: 'section-a', title: 'A. Program & Branch' },
  { id: 'section-b', title: 'B. Personal Details' },
  { id: 'section-c', title: 'C. Contact Details' },
  { id: 'section-d', title: 'D. Academic Qualifications' },
  { id: 'section-e', title: 'E. Entrance Details' },
  { id: 'section-f', title: 'F. Document Upload' },
  { id: 'section-g', title: 'G. Declaration & Submit' },
];

export function SectionNav({ activeSection, completedSections = {}, onSaveDraft, lastSavedTime }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sticky top-24 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-extrabold text-tec-navy uppercase tracking-wider">
          Form Progress
        </h3>
        <span className="text-xs font-bold bg-blue-50 text-tec-navy px-2 py-0.5 rounded">
          {Object.keys(completedSections).filter(k => completedSections[k]).length} / {SECTIONS.length}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        {SECTIONS.map((sec) => {
          const isDone = completedSections[sec.id];
          const isActive = activeSection === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-between group ${
                isActive
                  ? 'bg-tec-navy text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="truncate pr-2">{sec.title}</span>
              {isDone ? (
                <CheckCircle className={`w-4 h-4 shrink-0 ${isActive ? 'text-tec-gold' : 'text-emerald-600'}`} />
              ) : (
                <Circle className={`w-4 h-4 shrink-0 ${isActive ? 'text-white/60' : 'text-slate-300'}`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Draft Save Action Card */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <button
          type="button"
          onClick={onSaveDraft}
          className="w-full py-2 px-3 rounded-lg border border-slate-300 hover:border-tec-navy text-tec-navy bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-1.5 transition"
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Save Draft to Device</span>
        </button>
        {lastSavedTime && (
          <p className="text-[10px] text-center text-slate-400">
            Last saved: {lastSavedTime}
          </p>
        )}
      </div>
    </div>
  );
}
