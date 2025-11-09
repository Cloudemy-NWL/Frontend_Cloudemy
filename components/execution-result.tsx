"use client"

import { CheckCircle2, AlertCircle, Loader2, Clock, Database } from "lucide-react"

interface ExecutionResultProps {
  result?: {
    status: "success" | "error" | "running"
    output?: string
    executionTime?: number
    feedback?: { case: string; message: string }[]
    score?: number
    failTags?: string[]
    metrics?: {
      timeMs: number
      memoryMB: number
    }
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

      {result.score !== undefined && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
          <p className="text-sm font-semibold text-primary">점수: {result.score}점</p>
        </div>
      )}

      <div className="bg-background rounded p-3 border border-border text-xs font-mono max-h-32 overflow-y-auto">
        <pre className="text-foreground whitespace-pre-wrap break-words">{result.output}</pre>
      </div>

      {result.metrics && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 bg-muted p-2 rounded">
            <Clock size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">실행 시간: {result.metrics.timeMs}ms</span>
          </div>
          <div className="flex items-center gap-2 bg-muted p-2 rounded">
            <Database size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">메모리: {result.metrics.memoryMB}MB</span>
          </div>
        </div>
      )}

      {result.failTags && result.failTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-red-700">오류 태그:</p>
          <div className="flex flex-wrap gap-2">
            {result.failTags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.feedback && result.feedback.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">채점 피드백</span>
          </div>
          <div className="space-y-2">
            {result.feedback.map((fb, idx) => (
              <div key={idx} className="text-xs text-blue-800 dark:text-blue-100">
                <span className="font-semibold">{fb.case}:</span> {fb.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}