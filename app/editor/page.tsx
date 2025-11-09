"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { CodeEditor } from "@/components/code-editor"
import { ExecutionResult } from "@/components/execution-result"
import { Button } from "@/components/ui/button"
import { ChevronRight, Save, Play } from "lucide-react"

interface CodeVersion {
  id: string
  code: string
  createdAt: Date
  result?: {
    status: "success" | "error" | "running"
    output?: string
    executionTime?: number
    feedback?: string
  }
}

export default function EditorPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [code, setCode] = useState("")
  const [versions, setVersions] = useState<CodeVersion[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<CodeVersion["result"]>()
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false)

  useEffect(() => {
    const userType = sessionStorage.getItem("userType")
    const name = sessionStorage.getItem("userName")

    if (userType !== "student") {
      router.push("/")
      return
    }

    setUserName(name || "학생")
  }, [router])

  const handleSaveCode = () => {
    const newVersion: CodeVersion = {
      id: `v${versions.length + 1}`,
      code: code,
      createdAt: new Date(),
      result: result,
    }
    setVersions([...versions, newVersion])
  }

  const fetchFeedback = async (code: string, output: string, status: string) => {
    try {
      setIsFeedbackLoading(true)
      const response = await fetch("/api/code/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, output, status }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.feedback
      }
    } catch (error) {
      console.error("피드백 요청 실패:", error)
    } finally {
      setIsFeedbackLoading(false)
    }
    return null
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setResult({ status: "running" })

    setTimeout(async () => {
      try {
        // eslint-disable-next-line no-eval
        const output = eval(code)
        const outputStr = String(output)

        const feedback = await fetchFeedback(code, outputStr, "success")

        setResult({
          status: "success",
          output: outputStr,
          executionTime: Math.random() * 1000,
          feedback: feedback || undefined,
        })
      } catch (error) {
        const errorMsg = (error as Error).message

        const feedback = await fetchFeedback(code, errorMsg, "error")

        setResult({
          status: "error",
          output: errorMsg,
          feedback: feedback || undefined,
        })
      }
      setIsRunning(false)
    }, 800)
  }

  const handleSubmit = () => {
    if (code.trim()) {
      handleSaveCode()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} userType="student" />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">코드 작성 및 실습</h2>
          <p className="text-muted-foreground">아래에서 코드를 작성하고 즉시 실행 결과를 확인하세요.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Editor Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-secondary p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">코드 에디터</h3>
              </div>
              <CodeEditor value={code} onChange={setCode} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleRunCode}
                disabled={!code.trim() || isRunning}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play size={18} />
                {isRunning ? "실행 중..." : "코드 실행"}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!code.trim()}
                variant="outline"
                className="flex items-center gap-2 border-border text-foreground hover:bg-muted bg-transparent"
              >
                <Save size={18} />
                버전 저장
              </Button>
              <Button
                onClick={() => router.push("/submissions")}
                variant="outline"
                className="flex items-center gap-2 border-border text-foreground hover:bg-muted ml-auto"
              >
                제출된 코드 <ChevronRight size={18} />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Execution Result */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-secondary p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">실행 결과</h3>
                {isFeedbackLoading && <p className="text-xs text-muted-foreground mt-1">피드백 생성 중...</p>}
              </div>
              <ExecutionResult result={result} />
            </div>

            {/* Versions List */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-secondary p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">저장된 버전</h3>
                <p className="text-sm text-muted-foreground mt-1">{versions.length}개 버전</p>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto space-y-2">
                {versions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">아직 저장된 버전이 없습니다</p>
                ) : (
                  versions.map((version) => (
                    <div
                      key={version.id}
                      className="p-3 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors border border-border/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground text-sm">{version.id}</span>
                        <span className="text-xs text-muted-foreground">{version.createdAt.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{version.code.split("\n")[0]}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
