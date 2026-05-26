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

interface MarkdownEditorFieldProps {
  label: string;
  name: string;
  value: string;
  error?: string | null;
  placeholder?: string;
  onChange: (value: string) => void;
}

const editorPlugins = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  linkPlugin(),
  linkDialogPlugin(),
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
        role="group"
      >
        <MDXEditor
          className="aicd-markdown-editor"
          contentEditableClassName="aicd-markdown-editor-content"
          markdown={value}
          onChange={(markdown, initialMarkdownNormalize) => {
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
