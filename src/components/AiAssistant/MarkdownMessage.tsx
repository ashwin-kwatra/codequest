import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  // Split content by code blocks ```lang ... ```
  const segments = parseSegments(content);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, lineHeight: 1.6, color: 'var(--text-primary)' }}>
      {segments.map((seg, idx) => {
        if (seg.type === 'code') {
          return <CodeBlock key={idx} code={seg.content} language={seg.language} />;
        }
        return <FormattedParagraph key={idx} text={seg.content} />;
      })}
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      borderRadius: 6,
      overflow: 'hidden',
      border: '1px solid var(--border-strong)',
      backgroundColor: '#0F172A',
      margin: '6px 0',
    }}>
      {/* Code Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 12px',
        backgroundColor: '#1E293B',
        borderBottom: '1px solid #334155',
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: 600,
        textTransform: 'uppercase',
      }}>
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: copied ? '#4ADE80' : '#94A3B8',
            fontSize: 11,
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: 4,
          }}
          title="Copy code"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Body */}
      <pre style={{
        margin: 0,
        padding: '12px 14px',
        overflowX: 'auto',
        fontSize: 12,
        fontFamily: 'var(--font-mono)',
        color: '#F1F5F9',
        lineHeight: 1.5,
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FormattedParagraph({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} style={{ height: 4 }} />;

        // Header check ###
        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={lIdx} style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              {renderInline(trimmed.replace('#### ', ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={lIdx} style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>
              {renderInline(trimmed.replace('### ', ''))}
            </h3>
          );
        }

        // Bullet check
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={lIdx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingLeft: 6 }}>
              <span style={{ color: 'var(--accent-primary)', fontSize: 14, lineHeight: 1 }}>•</span>
              <span style={{ flex: 1 }}>{renderInline(trimmed.replace(/^[•\-*]\s+/, ''))}</span>
            </div>
          );
        }

        // Numbered list check (1. ...)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={lIdx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingLeft: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, minWidth: 16 }}>
                {numMatch[1]}.
              </span>
              <span style={{ flex: 1 }}>{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={lIdx} style={{ margin: 0 }}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`, and [label](url)
 */
function renderInline(str: string): React.ReactNode {
  // Regex matches: Markdown links [text](url), inline code `...`, bold **...**, italic *...*
  const pattern = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
  const parts = str.split(pattern);

  return parts.map((part, i) => {
    if (!part) return null;

    // Link: [text](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-primary)', textDecoration: 'underline', fontWeight: 500 }}
        >
          {linkMatch[1]} ↗
        </a>
      );
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={i} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
    }

    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={i}
          style={{
            padding: '1px 5px',
            borderRadius: 4,
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-primary)',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={i} style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

interface Segment {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

function parseSegments(raw: string): Segment[] {
  const segments: Segment[] = [];
  const lines = raw.split('\n');

  let inCode = false;
  let codeLang = '';
  let buffer: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        // Closing code block
        segments.push({
          type: 'code',
          content: buffer.join('\n'),
          language: codeLang,
        });
        buffer = [];
        inCode = false;
        codeLang = '';
      } else {
        // Opening code block
        if (buffer.length > 0) {
          segments.push({
            type: 'text',
            content: buffer.join('\n'),
          });
          buffer = [];
        }
        inCode = true;
        codeLang = line.trim().replace(/^```/, '').trim();
      }
    } else {
      buffer.push(line);
    }
  }

  if (buffer.length > 0) {
    segments.push({
      type: inCode ? 'code' : 'text',
      content: buffer.join('\n'),
      language: codeLang,
    });
  }

  return segments;
}
