import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  toolbarPlugin
} from "@mdxeditor/editor";
import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";

interface MarkdownEditorFieldProps {
  label: string;
  name: string;
  value: string;
  error?: string | null;
  placeholder?: string;
  onChange: (value: string) => void;
}

const validateLink = (url: string): boolean => {
  return url.startsWith("https://") || url.startsWith("http://");
};

const editorPlugins = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  linkPlugin({
    createLinkMarkdown: (text: string, url: string) => {
      if (!validateLink(url)) {
        alert("Links must start with https:// or http://");
        return null;
      }
      return `[${text}](${url})`;
    }
  }),
  linkDialogPlugin({
    validateUrl: validateLink
  }),
  markdownShortcutPlugin(),
  toolbarPlugin({
    toolbarClassName: "aicd-markdown-editor-toolbar",
    toolbarContents: () => (
      <>
        <UndoRedo />
        <Separator />
        <BlockTypeSelect />
        <Separator />
        <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
        <CodeToggle />
        <Separator />
        <ListsToggle options={["bullet", "number"]} />
        <Separator />
        <CreateLink />
      </>
    )
  })
];

export function MarkdownEditorField({ error, label, name, onChange, placeholder, value }: MarkdownEditorFieldProps) {
  const fieldId = name || label.toLowerCase().replace(/\s+/g, "-");
  const labelId = `${fieldId}-label`;
  const descriptionId = `${fieldId}-description`;
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = editorWrapperRef.current;

    if (!wrapper) {
      return;
    }

    function applyExternalLinkAttributes(target: HTMLDivElement) {
      target.querySelectorAll<HTMLAnchorElement>(".aicd-markdown-editor-content a[href]").forEach((link) => {
        link.target = "_blank";
        link.rel = "noopener noreferrer external";
      });
    }

    applyExternalLinkAttributes(wrapper);

    const observer = new MutationObserver(() => applyExternalLinkAttributes(wrapper));
    observer.observe(wrapper, {
      attributeFilter: ["href"],
      attributes: true,
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [value]);

  function handleEditorClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (!(event.target instanceof Element)) {
      return;
    }

    const content = event.target.closest(".aicd-markdown-editor-content");
    const link = event.target.closest("a[href]");

    if (!(content instanceof HTMLElement) || !(link instanceof HTMLAnchorElement) || !content.contains(link)) {
      return;
    }

    event.preventDefault();
    window.open(link.href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-ink" id={labelId}>
        {label}
      </span>
      <div
        aria-describedby={error ? descriptionId : undefined}
        aria-invalid={Boolean(error)}
        aria-labelledby={labelId}
        className={[
          "overflow-hidden rounded-md border bg-white shadow-sm",
          error ? "border-red-700" : "border-ink/20 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20"
        ].join(" ")}
        onClick={handleEditorClick}
        ref={editorWrapperRef}
        role="group"
      >
        <MDXEditor
          className="aicd-markdown-editor"
          contentEditableClassName="aicd-markdown-editor-content"
          markdown={value}
          onChange={(markdown: string, initialMarkdownNormalize: boolean) => {
            if (!initialMarkdownNormalize) {
              onChange(markdown);
            }
          }}
          placeholder={placeholder}
          plugins={editorPlugins}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-700" id={descriptionId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
