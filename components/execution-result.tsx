"use client"

import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface ExecutionResultProps {
  result?: {
    status: "success" | "error" | "running"
    output?: string
    executionTime?: number
    feedback?: string
  }
}

export function ExecutionResult({ result }: ExecutionResultProps) {
  if (!result) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">코드를 실행하면 결과가 여기에 표시됩니다</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {result.status === "running" && (
        <div className="flex items-center gap-3 text-primary mb-4">
          <Loader2 size={20} className="animate-spin" />
          <span>실행 중...</span>
        </div>
      )}

      {result.status === "success" && (
        <div className="flex items-center gap-3 text-green-600 mb-4">
          <CheckCircle2 size={20} />
          <span className="font-semibold">실행 성공</span>
        </div>
      )}

      {result.status === "error" && (
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle size={20} />
          <span className="font-semibold">오류 발생</span>
        </div>
      )}

      <div className="bg-background rounded p-3 border border-border text-xs font-mono max-h-32 overflow-y-auto">
        <pre className="text-foreground whitespace-pre-wrap break-words">{result.output}</pre>
      </div>

      {result.executionTime && (
        <p className="text-xs text-muted-foreground">실행 시간: {result.executionTime.toFixed(2)}ms</p>
      )}

      {result.feedback && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">AI 피드백</span>
          </div>
          <p className="text-xs text-blue-800 dark:text-blue-100 leading-relaxed whitespace-pre-wrap">
            {result.feedback}
          </p>
        </div>
      )}
    </div>
  )
}
