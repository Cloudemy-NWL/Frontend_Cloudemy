"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Check, FileText, Clock } from "lucide-react"

interface SubmissionListItem {
  submission_id: string
  language: string
  status: string
  score: number
  created_at: string
}

interface SubmissionListOut {
  items: SubmissionListItem[]
  total: number
  page: number
  size: number
}

interface SubmissionDetail {
  submission_id: string
  user_id?: string
  assignment_id: string
  language: string
  status: string
  score: number
  fail_tags: string[]
  feedback: { case: string; message: string }[]
  metrics: {
    timeMs: number
    memoryMB: number
  }
  finalized: boolean
  created_at: string
}

const API_BASE = "https://alfredia-unriskable-shellie.ngrok-free.dev"

export default function SubmissionsPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [finalizedId, setFinalizedId] = useState<string | null>(null)

  useEffect(() => {
    const userType = sessionStorage.getItem("userType")
    const name = sessionStorage.getItem("userName")

    if (userType !== "student") {
      router.push("/")
      return
    }

    setUserName(name || "학생")
    fetchSubmissions()
  }, [router])

  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      const url = `${API_BASE}/submissions?assignment_id=A1&page=1&size=50`
      console.log("[v0] 제출 목록 조회 요청 URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })

      console.log("[v0] 응답 상태:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API 에러 응답:", errorText)
        throw new Error(`제출 목록 조회 실패: ${response.status}`)
      }

      const data: SubmissionListOut = await response.json()
      console.log("[v0] 제출 목록 조회 API 응답:", data)

      setSubmissions(data.items || [])
    } catch (error) {
      console.error("[v0] 제출 목록 조회 오류:", error)
      alert(`제출 목록 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
      setSubmissions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSubmission = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/submissions/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })

      if (!response.ok) {
        throw new Error("제출 상세 조회 실패")
      }

      const data: SubmissionDetail = await response.json()
      console.log("[v0] 제출 상세 조회 API 응답:", data)

      setSelectedSubmission(data)
      setShowDetails(true)
    } catch (error) {
      console.error("[v0] 제출 상세 조회 오류:", error)
      alert("제출 상세 정보를 불러오는데 실패했습니다.")
    }
  }

  const handleFinalSubmit = async (submissionId: string) => {
    try {
      const response = await fetch(`${API_BASE}/submissions/${submissionId}/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          note: "최종본 확정",
        }),
      })

      if (!response.ok) {
        throw new Error("최종 제출 확정 실패")
      }

      const data = await response.json()
      console.log("[v0] 최종 제출 확정 API 응답:", data)

      setFinalizedId(submissionId)
      alert(`최종 제출이 확정되었습니다!\n제출 ID: ${data.submission_id}\n상태: ${data.status}`)

      router.push(`/confirmation?submissionId=${submissionId}`)
    } catch (error) {
      console.error("[v0] 최종 제출 확정 오류:", error)
      alert("이미 최종 제출 완료되었습니다.")
    }
  }

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
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-secondary p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">버전 목록</h3>
                <p className="text-sm text-muted-foreground mt-1">{submissions.length}개의 저장된 버전</p>
              </div>

              <div className="divide-y divide-border">
                {submissions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    아직 제출된 코드가 없습니다. 에디터에서 코드를 작성하고 버전 저장을 해주세요.
                  </div>
                ) : (
                  submissions.map((submission, index) => (
                    <div
                      key={submission.submission_id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors border-l-4 ${
                        finalizedId === submission.submission_id
                          ? "border-l-primary bg-primary/5"
                          : "border-l-transparent"
                      }`}
                      onClick={() => handleSelectSubmission(submission.submission_id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            버전 {index + 1}
                            {finalizedId === submission.submission_id && <Check size={18} className="text-primary" />}
                          </h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock size={14} />
                            {new Date(submission.created_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">ID: {submission.submission_id}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              submission.status === "COMPLETED" || submission.status === "SUCCESSED"
                                ? "bg-green-100 text-green-700"
                                : submission.status === "FAILED"
                                  ? "bg-red-100 text-red-700"
                                  : submission.status === "RUNNING"
                                    ? "bg-blue-100 text-blue-700"
                                    : submission.status === "FINALIZED"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {submission.status}
                          </span>
                          {submission.score > 0 && (
                            <p className="text-sm font-semibold text-primary mt-1">{submission.score}점</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectSubmission(submission.submission_id)
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
                          disabled={finalizedId === submission.submission_id || submission.status === "FINALIZED"}
                          size="sm"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 disabled:opacity-50"
                        >
                          {submission.status === "FINALIZED" || finalizedId === submission.submission_id
                            ? "제출 완료"
                            : "최종 제출"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {showDetails && selectedSubmission && (
              <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden sticky top-6">
                <div className="bg-secondary p-4 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">제출 상세 정보</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">제출 ID:</span>
                      <span className="text-foreground font-mono text-xs">{selectedSubmission.submission_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">과제 ID:</span>
                      <span className="text-foreground">{selectedSubmission.assignment_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">언어:</span>
                      <span className="text-foreground">{selectedSubmission.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">상태:</span>
                      <span
                        className={
                          selectedSubmission.status === "COMPLETED" || selectedSubmission.status === "SUCCESSED"
                            ? "text-green-600 font-medium"
                            : selectedSubmission.status === "FAILED"
                              ? "text-red-600 font-medium"
                              : "text-yellow-600 font-medium"
                        }
                      >
                        {selectedSubmission.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">점수:</span>
                      <span className="text-primary font-semibold">{selectedSubmission.score}점</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">생성 시간:</span>
                      <span className="text-foreground text-xs">
                        {new Date(selectedSubmission.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">최종 제출:</span>
                      <span className={selectedSubmission.finalized ? "text-green-600" : "text-muted-foreground"}>
                        {selectedSubmission.finalized ? "완료" : "미완료"}
                      </span>
                    </div>
                  </div>

                  {selectedSubmission.metrics && (
                    <div className="bg-muted rounded p-3 space-y-1">
                      <p className="text-xs font-semibold text-foreground mb-2">실행 메트릭스</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">실행 시간:</span>
                        <span className="text-foreground">{selectedSubmission.metrics.timeMs}ms</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">메모리:</span>
                        <span className="text-foreground">{selectedSubmission.metrics.memoryMB}MB</span>
                      </div>
                    </div>
                  )}

                  {selectedSubmission.fail_tags && selectedSubmission.fail_tags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-red-700">오류 태그:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSubmission.fail_tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSubmission.feedback && selectedSubmission.feedback.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-2 mt-3">
                      <p className="text-xs font-semibold text-blue-900">채점 피드백:</p>
                      {selectedSubmission.feedback.map((fb, idx) => (
                        <p key={idx} className="text-xs text-blue-800">
                          <span className="font-semibold">{fb.case}:</span> {fb.message}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {finalizedId && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">최종 제출 완료</h4>
                <p className="text-sm text-foreground">제출 ID: {finalizedId}</p>
                <Button
                  onClick={() => router.push(`/confirmation?submissionId=${finalizedId}`)}
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