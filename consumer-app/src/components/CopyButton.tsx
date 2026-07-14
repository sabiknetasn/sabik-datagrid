import { useState } from 'react';
import { IconCheck, IconCopy } from './Icons';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      className={`copy-btn ${copied ? 'is-copied' : ''} ${className}`.trim()}
      onClick={onCopy}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
}
