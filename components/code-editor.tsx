"use client"

import { useEffect, useRef } from "react"
import type { editor } from "monaco-editor"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
}

let monacoEditor: typeof editor | null = null

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const initializeMonaco = async () => {
      // Monaco를 동적으로 로드
      const loader = await import("@monaco-editor/loader").then((m) => m.default)
      const monaco = await loader.init()
      monacoEditor = monaco.editor

      if (containerRef.current && !editorRef.current) {
        editorRef.current = monaco.editor.create(containerRef.current, {
          value: value,
          language: "javascript",
          theme: "vs-light",
          automaticLayout: true,
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: "Fira Code, Consolas, monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
        })

        // 코드 변경 감지
        editorRef.current.onDidChangeModelContent(() => {
          const code = editorRef.current?.getValue() || ""
          onChange(code)
        })
      }
    }

    initializeMonaco()

    return () => {
      // 에디터 정리는 필요시 여기서 수행
    }
  }, [onChange])

  // 외부에서 value가 변경되면 에디터 업데이트
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value)
    }
  }, [value])

  return (
    <div
      ref={containerRef}
      className="w-full h-96 rounded-b-lg border-0 overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  )
}
