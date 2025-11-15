"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { CodeEditor } from "@/components/code-editor"
import { ExecutionResult } from "@/components/execution-result"
import { Button } from "@/components/ui/button"
import { ChevronRight, Save, Play, BookOpen } from 'lucide-react'

const API_BASE = "https://unfactional-harriett-multiscreen.ngrok-free.dev"

interface ExecutionResultType {
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

interface CodeVersion {
  id: string
  code: string
  createdAt: Date
  result?: ExecutionResultType
  submission_id?: string
  apiStatus?: string
  attempt?: number
}

export default function EditorPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [code, setCode] = useState("")
  const [versions, setVersions] = useState<CodeVersion[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<ExecutionResultType | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)
  const [assignmentDescription, setAssignmentDescription] = useState("")

  useEffect(() => {
    const userType = sessionStorage.getItem("userType")
    const name = sessionStorage.getItem("userName")

    if (userType !== "student") {
      router.push("/")
      return
    }

    setUserName(name || "학생")

    const savedDescription = localStorage.getItem("assignmentDescription")
    if (savedDescription) {
      setAssignmentDescription(savedDescription)
    }
  }, [router])

  const handleSaveCode = async () => {
    if (!code.trim()) return

    setIsSaving(true)
    try {
      const url = `${API_BASE}/submissions`
      console.log("[v0] 코드 제출 API 요청 URL:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          assignment_id: "A1",
          language: "python",
          code: code,
        }),
      })

      console.log("[v0] 응답 상태:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API 에러 응답:", errorText)
        throw new Error(`코드 저장 실패: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] 코드 제출 API 응답:", data)

      const newVersion: CodeVersion = {
        id: `v${versions.length + 1}`,
        code: code,
        createdAt: new Date(data.created_at || new Date()),
        result: result,
        submission_id: data.submission_id,
        apiStatus: data.status,
        attempt: data.attempt,
      }

      setVersions([...versions, newVersion])
      alert(`버전 저장 완료!\n제출 ID: ${data.submission_id}\n상태: ${data.status}`)
    } catch (error) {
      console.error("[v0] 코드 저장 오류:", error)
      alert(`코드 저장 중 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRunCode = async () => {
    if (!code.trim()) return

    setIsRunning(true)
    setResult({ status: "running" })

    try {
      const submitResponse = await fetch(`${API_BASE}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          language: "python",
          code: code,
        }),
      })

      if (!submitResponse.ok) {
        throw new Error(`코드 제출 실패: ${submitResponse.status}`)
      }

      const submitData = await submitResponse.json()
      const submissionId = submitData.submission_id

      console.log("[v0] 코드 실행 제출 완료:", submissionId)

      const maxAttempts = 30
      let attempts = 0

      const pollResult = async () => {
        attempts++

        const resultResponse = await fetch(`${API_BASE}/submissions/${submissionId}`, {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        })

        if (!resultResponse.ok) {
          throw new Error(`결과 조회 실패: ${resultResponse.status}`)
        }

        const resultData = await resultResponse.json()
        console.log("[v0] 코드 실행 결과 조회:", resultData)

        if (
          resultData.status === "COMPLETED" ||
          resultData.status === "FAILED" ||
          resultData.status === "TIMEOUT" ||
          resultData.status === "SUCCESSED"
        ) {
          setResult({
            status: resultData.status === "FAILED" || resultData.status === "TIMEOUT" ? "error" : "success",
            output: resultData.status === "FAILED" ? "코드 실행 실패" : "코드 실행 성공",
            score: resultData.score,
            failTags: resultData.fail_tags,
            feedback: resultData.feedback,
            executionTime: resultData.metrics?.timeMs,
            metrics: resultData.metrics,
          })
          setIsRunning(false)
          return
        }

        if (attempts < maxAttempts) {
          setTimeout(() => pollResult(), 1000)
        } else {
          setResult({
            status: "error",
            output: "채점 시간 초과. 나중에 다시 시도해주세요.",
          })
          setIsRunning(false)
        }
      }

      await pollResult()
    } catch (error) {
      console.error("[v0] 코드 실행 오류:", error)
      setResult({
        status: "error",
        output: `코드 실행 중 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      })
      setIsRunning(false)
    }
  }

  const handleSubmit = () => {
    handleSaveCode()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} userType="student" />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">코드 작성 및 실습</h2>
          <p className="text-muted-foreground">아래에서 코드를 작성하고 즉시 실행 결과를 확인하세요.</p>
        </div>

        {assignmentDescription && (
          <div className="mb-6 bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-primary/10 p-4 border-b border-border flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">과제 설명</h3>
            </div>
            <div className="p-4">
              <p className="text-foreground whitespace-pre-wrap">{assignmentDescription}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-secondary p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">코드 에디터</h3>
              </div>
              <CodeEditor value={code} onChange={setCode} />
            </div>

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
                disabled={!code.trim() || isSaving}
                variant="outline"
                className="flex items-center gap-2 border-border text-foreground hover:bg-muted bg-transparent"
              >
                <Save size={18} />
                {isSaving ? "저장 중..." : "버전 저장"}
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

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-secondary p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">실행 결과</h3>
              </div>
              <ExecutionResult result={result} />
            </div>

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
                      {version.submission_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          제출 ID: {version.submission_id} | 상태: {version.apiStatus}
                        </p>
                      )}
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
