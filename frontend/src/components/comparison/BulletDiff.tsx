import React, { useState } from 'react';
import type { TailoredBullet } from '../../types/resume';
// @ts-ignore – diff-match-patch has no bundled TS types in all versions
import DiffMatchPatch from 'diff-match-patch';

interface Props {
  bullet: TailoredBullet;
  onAcceptChange: (id: string, accepted: boolean) => void;
  accepted: boolean;
  tailoredText: string;
  originalText: string;
  onEditTailored: (id: string, text: string) => void;
  onEditOriginal: (id: string, text: string) => void;
}

function renderDiff(original: string, tailored: string): React.ReactElement {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(original, tailored);
  dmp.diff_cleanupSemantic(diffs);

  return (
    <>
      {diffs.map(([op, text]: [number, string], i: number) => {
        if (op === 0) return <span key={i}>{text}</span>;
        if (op === 1) return <mark key={i} className="bg-green-200 text-green-900 rounded px-0.5">{text}</mark>;
        return null;
      })}
    </>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy bullet"
      className={`shrink-0 text-sm px-3 py-1 rounded-lg font-medium transition-colors ${
        copied ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
      }`}
    >
      {copied ? '✓' : '⎘'}
    </button>
  );
}

export default function BulletDiff({
  bullet,
  onAcceptChange,
  accepted,
  tailoredText,
  originalText,
  onEditTailored,
  onEditOriginal,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const currentText = bullet.changed && accepted ? tailoredText : originalText;

  const handleEditStart = () => {
    setDraft(accepted ? tailoredText : originalText);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      if (accepted) onEditTailored(bullet.id, trimmed);
      else onEditOriginal(bullet.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => setIsEditing(false);

  // Unchanged bullets — display + copy
  if (!bullet.changed) {
    return (
      <li className="flex items-start gap-2 py-2 pl-3 border-l-4 border-gray-200">
        <span className="text-sm text-gray-700 flex-1">{bullet.tailored}</span>
        <CopyButton text={bullet.tailored} />
      </li>
    );
  }

  return (
    <li className={`flex flex-col gap-2 py-2 px-3 rounded-lg border-l-4 transition-colors ${
      accepted ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
    }`}>
      {isEditing ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
            className="w-full text-sm text-gray-800 border border-indigo-300 rounded-lg p-2 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="text-xs px-2.5 py-1 rounded-full font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="text-xs px-2.5 py-1 rounded-full font-medium bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Text + action buttons */}
          <div className="flex items-start gap-2">
            <span className="text-sm text-gray-800 flex-1">
              {accepted ? renderDiff(originalText, tailoredText) : originalText}
            </span>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={handleEditStart}
                title={accepted ? 'Edit tailored text' : 'Edit original text'}
                className="text-sm px-3 py-1 rounded-lg font-medium transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                ✎
              </button>
              <CopyButton text={currentText} />
            </div>
          </div>

          {/* Accept / Keep Original toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => onAcceptChange(bullet.id, true)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                accepted
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-green-400 text-green-700 hover:bg-green-50'
              }`}
            >
              ✓ Accept
            </button>
            <button
              onClick={() => onAcceptChange(bullet.id, false)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                !accepted
                  ? 'bg-gray-500 text-white'
                  : 'bg-white border border-gray-400 text-gray-600 hover:bg-gray-50'
              }`}
            >
              ✗ Keep Original
            </button>
          </div>
        </>
      )}
    </li>
  );
}
