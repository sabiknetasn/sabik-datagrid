import { CopyButton } from './CopyButton';

interface CodeBlockProps {
  code: string;
  label?: string;
  language?: string;
}

export function CodeBlock({ code, label, language = 'bash' }: CodeBlockProps) {
  return (
    <div className="code-block">
      <div className="code-block__bar">
        <div className="code-block__meta">
          {label ? <span className="code-block__label">{label}</span> : null}
          <span className="code-block__lang">{language}</span>
        </div>
        <CopyButton value={code} />
      </div>
      <pre className="code-block__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
