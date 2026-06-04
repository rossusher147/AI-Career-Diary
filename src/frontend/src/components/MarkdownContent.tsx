import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import ReactMarkdown from "react-markdown";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown components={{ a: ExternalLink }}>{content}</ReactMarkdown>
    </div>
  );
}

function ExternalLink({
  children,
  href,
  node: _node,
  ...props
}: PropsWithChildren<ComponentPropsWithoutRef<"a"> & { node?: unknown }>) {
  // Ensure the link starts with http:// or https://
  const isValidExternalLink = href && (href.startsWith("http://") || href.startsWith("https://"));
  
  // If it's not a valid external link, render as plain text
  if (!isValidExternalLink) {
    return <span>{children}</span>;
  }
  
  return (
    <a {...props} href={href} rel="noopener noreferrer external" target="_blank">
      {children}
    </a>
  );
}
