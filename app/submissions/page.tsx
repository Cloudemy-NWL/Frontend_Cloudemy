"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Check, FileText, Clock } from "lucide-react"

interface CodeSubmission {
  submission_id: string
  user_id: string
  assignment_id: string
  language: string
  code?: string
  status: string
  score?: number
  fail_tags?: string[]
  feedback?: { case: string; message: string }[]
  metrics?: {
    timeMs: number
    memoryMB: number
  }
  finalized: boolean
  versionName?: string
  submittedAt?: Date
}

const API_BASE = "https://unfactional-harriett-multiscreen.ngrok-free.dev"

export default function SubmissionsPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [submissions, setSubmissions] = useState<CodeSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userType = sessionStorage.getItem("userType")
    const name = sessionStorage.getItem("userName")

    if (userType !== "student") {
      router.push("/")
      return
    }

    setUserName(name || "학생")

    // 임시 데이터 로드
    const mockSubmissions: CodeSubmission[] = [
      {
        submission_id: "sub_123",
        user_id: "user_1",
        assignment_id: "assign_1",
        language: "javascript",
        code: "console.log('Hello World');",
        status: "SUCCESS",
        score: 85,
        finalized: false,
        versionName: "v1 - 초기 버전",
        submittedAt: new Date(Date.now() - 3600000),
      },
      {
        submission_id: "sub_124",
        user_id: "user_1",
        assignment_id: "assign_1",
        language: "javascript",
        code: "const arr = [1, 2, 3];\nconsole.log(arr.map(x => x * 2));",
        status: "SUCCESS",
        score: 90,
        finalized: false,
        versionName: "v2 - 배열 처리 추가",
        submittedAt: new Date(Date.now() - 1800000),
      },
      {
        submission_id: "sub_125",
        user_id: "user_1",
        assignment_id: "assign_1",
        language: "javascript",
        code: "function sum(a, b) {\n  return a + b;\n}\nconsole.log(sum(5, 3));",
        status: "SUCCESS",
        score: 95,
        finalized: false,
        versionName: "v3 - 함수 리팩토링",
        submittedAt: new Date(Date.now() - 600000),
      },
    ]
    setSubmissions(mockSubmissions)
  }, [router])

  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      const submissionIds = ["sub_123", "sub_124", "sub_125"]
      const fetchedSubmissions: CodeSubmission[] = []

      for (const id of submissionIds) {
        try {
          const response = await fetch(`${API_BASE}/submissions/${id}`, {
            method: "GET",
          })

          if (response.ok) {
            const data = await response.json()
            fetchedSubmissions.push({
              ...data,
              versionName: `버전 ${fetchedSubmissions.length + 1}`,
              submittedAt: new Date(Date.now() - (submissionIds.length - fetchedSubmissions.length) * 3600000),
            })
          }
        } catch (error) {
          console.error(`[v0] ${id} 조회 실패:`, error)
        }
      }

      setSubmissions(fetchedSubmissions)
    } catch (error) {
      console.error("[v0] 제출 목록 조회 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSubmission = (id: string) => {
    setSelectedSubmission(id)
    setShowDetails(true)
  }

  const handleFinalSubmit = async (submissionId: string) => {
    try {
      const response = await fetch(`${API_BASE}/submissions/${submissionId}/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: "최종본 확정",
        }),
      })

      if (!response.ok) {
        throw new Error("최종 제출 확정 실패")
      }

      const data = await response.json()
      console.log("[v0] 최종 제출 확정:", data)

      // 상태 업데이트
      setSubmissions(
        submissions.map((sub) => ({
          ...sub,
          finalized: sub.submission_id === submissionId ? true : sub.finalized,
        })),
      )

      // 확인 페이지로 이동
      router.push(`/confirmation?submissionId=${submissionId}`)
    } catch (error) {
      console.error("[v0] 최종 제출 확정 오류:", error)
      alert("최종 제출 중 오류가 발생했습니다.")
    }
  }

  const selectedData = submissions.find((sub) => sub.submission_id === selectedSubmission)
  const finalSelected = submissions.find((sub) => sub.finalized)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userName={userName} userType="student" />
        <div className="max-w-7xl mx-auto p-6">
          <p className="text-center text-muted-foreground">제출 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} userType="student" />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">제출된 코드 관리</h2>
            <p className="text-muted-foreground">저장된 버전들을 확인하고 최종 제출 버전을 선택하세요.</p>
          </div>
          <Button
            onClick={() => router.push("/editor")}
            variant="outline"
            className="flex items-center gap-2 border-border text-foreground hover:bg-muted"
          >
            <ChevronLeft size={18} />
            에디터로 돌아가기
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-secondary p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">버전 목록</h3>
                <p className="text-sm text-muted-foreground mt-1">{submissions.length}개의 저장된 버전</p>
              </div>

              <div className="divide-y divide-border">
                {submissions.map((submission) => (
                  <div
                    key={submission.submission_id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors border-l-4 ${
                      submission.finalized ? "border-l-primary bg-primary/5" : "border-l-transparent"
                    }`}
                    onClick={() => handleSelectSubmission(submission.submission_id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          {submission.versionName || submission.submission_id}
                          {submission.finalized && <Check size={18} className="text-primary" />}
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock size={14} />
                          {submission.submittedAt?.toLocaleString() || "시간 정보 없음"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            submission.status === "SUCCESS"
                              ? "bg-green-100 text-green-700"
                              : submission.status === "FAILED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {submission.status === "SUCCESS"
                            ? "성공"
                            : submission.status === "FAILED"
                              ? "실패"
                              : submission.status}
                        </span>
                      </div>
                    </div>

                    {submission.code && (
                      <div className="bg-background rounded p-3 border border-border mb-3">
                        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap max-h-24 overflow-y-auto">
                          {submission.code}
                        </pre>
                      </div>
                    )}

                    {submission.score !== undefined && (
                      <p className="text-sm font-medium text-primary mt-2">점수: {submission.score}점</p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectSubmission(submission.submission_id)
                          setShowDetails(true)
                        }}
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground hover:bg-muted flex-1"
                      >
                        <FileText size={16} className="mr-1" />
                        자세히 보기
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFinalSubmit(submission.submission_id)
                        }}
                        disabled={submission.finalized}
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 disabled:opacity-50"
                      >
                        {submission.finalized ? "제출 완료" : "최종 제출"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Code Preview */}
            {showDetails && selectedData && (
              <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden sticky top-6">
                <div className="bg-secondary p-4 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">제출 상세 정보</h3>
                </div>
                <div className="p-4 space-y-3">
                  {selectedData.code && (
                    <div className="bg-background rounded p-3 border border-border mb-4">
                      <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {selectedData.code}
                      </pre>
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">제출 ID:</span>
                      <span className="text-foreground font-mono text-xs">{selectedData.submission_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">상태:</span>
                      <span
                        className={
                          selectedData.status === "SUCCESS" ? "text-green-600 font-medium" : "text-red-600 font-medium"
                        }
                      >
                        {selectedData.status === "SUCCESS" ? "✓ 성공" : "✗ 실패"}
                      </span>
                    </div>
                    {selectedData.score !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">점수:</span>
                        <span className="text-primary font-semibold">{selectedData.score}점</span>
                      </div>
                    )}
                    {selectedData.metrics && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">실행 시간:</span>
                          <span className="text-foreground">{selectedData.metrics.timeMs}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">메모리:</span>
                          <span className="text-foreground">{selectedData.metrics.memoryMB}MB</span>
                        </div>
                      </>
                    )}
                  </div>
                  {selectedData.feedback && selectedData.feedback.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-2 mt-3">
                      <p className="text-xs font-semibold text-blue-900">피드백:</p>
                      {selectedData.feedback.map((fb, idx) => (
                        <p key={idx} className="text-xs text-blue-800">
                          <span className="font-semibold">{fb.case}:</span> {fb.message}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Final Selection Info */}
            {finalSelected && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">최종 제출 완료</h4>
                <p className="text-sm text-foreground">{finalSelected.versionName || finalSelected.submission_id}</p>
                <Button
                  onClick={() => router.push(`/confirmation?submissionId=${finalSelected.submission_id}`)}
                  className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  제출 확인하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}