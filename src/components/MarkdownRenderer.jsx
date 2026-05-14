import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import { cn } from '../lib/utils';

const MarkdownRenderer = ({ content, className }) => {
  return (
    <div className={cn("markdown-content prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative group my-4 rounded-xl overflow-hidden border border-border/50 shadow-2xl">
                <div className="absolute top-0 right-0 p-2 bg-muted/50 backdrop-blur-md border-b border-l border-border/50 rounded-bl-xl z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{match[1]}</span>
                </div>
                <SyntaxHighlighter
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: '#1a1b26',
                    borderRadius: '0',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={cn("bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm font-bold text-primary", className)} {...props}>
                {children}
              </code>
            );
          },
          // Custom styles for other markdown elements to match the UI
          p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed font-medium">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
          h1: ({ children }) => <h1 className="text-2xl font-black mb-4 mt-6">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-black mb-3 mt-5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-black mb-2 mt-4">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-primary/5 py-2 rounded-r-xl my-4">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-2xl border border-border shadow-sm">
              <table className="w-full border-collapse text-left">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="bg-muted/50 p-3 font-black text-xs uppercase tracking-widest border-b border-border">{children}</th>,
          td: ({ children }) => <td className="p-3 border-b border-border/50 text-sm font-medium">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
