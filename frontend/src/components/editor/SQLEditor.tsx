"use client";

import { useMemo } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";

import { cn } from "@/lib/utils";

const editorOptions = {
  fontSize: 13,
  minimap: { enabled: false },
  lineNumbers: "on" as const,
  wordWrap: "on" as const,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  padding: { top: 12, bottom: 12 },
  automaticLayout: true,
};

type SQLEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function SQLEditor({ value, onChange, className }: SQLEditorProps) {
  const theme = useMemo(
    () => ({
      base: "vs-dark",
      inherit: true,
      rules: [{ token: "comment", foreground: "6B7280" }],
      colors: {
        "editor.background": "#0F172A",
        "editor.lineHighlightBackground": "#111827",
        "editorGutter.background": "#0F172A",
        "editorLineNumber.foreground": "#475569",
        "editorCursor.foreground": "#00D4FF",
        "editor.selectionBackground": "#1E293B",
      },
    }),
    [],
  );

  const handleMount = (monaco: Monaco) => {
    monaco.languages.register({ id: "sql" });
    monaco.languages.setMonarchTokensProvider("sql", {
      tokenizer: {
        root: [
          [/--.*/, "comment"],
          [/\b(select|from|where|and|or|join|inner|left|right|on|group|by|order|limit|insert|update|delete)\b/i, "keyword"],
          [/"[^"]*"/, "string"],
          [/'[^']*'/, "string"],
          [/\d+/, "number"],
        ],
      },
    });
    monaco.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: () => {
        const suggestions = [
          "SELECT",
          "FROM",
          "WHERE",
          "JOIN",
          "LEFT JOIN",
          "RIGHT JOIN",
          "GROUP BY",
          "ORDER BY",
          "LIMIT",
        ].map((label) => ({
          label,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: label,
        }));
        return { suggestions };
      },
    });
    monaco.editor.defineTheme("iopsdata-dark", theme);
  };

  return (
    <div className={cn("h-full w-full overflow-hidden rounded-xl border border-border/60", className)}>
      <Editor
        height="100%"
        defaultLanguage="sql"
        theme="iopsdata-dark"
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={editorOptions}
        beforeMount={handleMount}
      />
    </div>
  );
}
