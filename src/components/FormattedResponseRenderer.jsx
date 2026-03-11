import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function FormattedResponseRenderer({ content }) {
  // Pre-process the content: we want to preserve SVGs but avoid rehype-raw messing with them completely or getting stripped.
  // Actually, rehype-raw + react-markdown usually handles SVG reasonably well if properly formed, but AI SVGs might lack xmlns etc.
  // Let's rely on standard rehype-raw processing first.

  return (
    <div className="formatted-response markdown-body">
      <ReactMarkdown
        plugin={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                children={String(children).replace(/\n$/, '')}
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                showLineNumbers={true}
                customStyle={{
                  borderRadius: '8px',
                  padding: '15px',
                  fontSize: '0.95em',
                  lineHeight: '1.5',
                  margin: '15px 0'
                }}
              />
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
