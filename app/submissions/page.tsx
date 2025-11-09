"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Check, FileText, Clock } from "lucide-react"

interface CodeSubmission {
  id: string
  versionName: string
  code: string
  submittedAt: Date
  executionStatus: "pending" | "success" | "error"
  score?: number
  feedback?: string
  isSelected: boolean
}

export default function SubmissionsPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [submissions, setSubmissions] = useState<CodeSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

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
        id: "v1",
        versionName: "v1 - 초기 버전",
        code: "console.log('Hello World');",
        submittedAt: new Date(Date.now() - 3600000),
        executionStatus: "success",
        isSelected: false,
      },
      {
        id: "v2",
        versionName: "v2 - 배열 처리 추가",
        code: "const arr = [1, 2, 3];\nconsole.log(arr.map(x => x * 2));",
        submittedAt: new Date(Date.now() - 1800000),
        executionStatus: "success",
        isSelected: false,
      },
      {
        id: "v3",
        versionName: "v3 - 함수 리팩토링",
        code: "function sum(a, b) {\n  return a + b;\n}\nconsole.log(sum(5, 3));",
        submittedAt: new Date(Date.now() - 600000),
        executionStatus: "success",
        isSelected: false,
      },
    ]
    setSubmissions(mockSubmissions)
  }, [router])

  const handleSelectSubmission = (id: string) => {
    setSelectedSubmission(id)
    setShowDetails(true)
  }

  const handleFinalSubmit = (id: string) => {
    setSubmissions(
      submissions.map((sub) => ({
        ...sub,
        isSelected: sub.id === id,
      })),
    )
    router.push(`/confirmation?submissionId=${id}`)
  }

  const selectedData = submissions.find((sub) => sub.id === selectedSubmission)
  const finalSelected = submissions.find((sub) => sub.isSelected)

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
                    key={submission.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors border-l-4 ${
                      submission.isSelected ? "border-l-primary bg-primary/5" : "border-l-transparent"
                    }`}
                    onClick={() => handleSelectSubmission(submission.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          {submission.versionName}
                          {submission.isSelected && <Check size={18} className="text-primary" />}
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock size={14} />
                          {submission.submittedAt.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            submission.executionStatus === "success"
                              ? "bg-green-100 text-green-700"
                              : submission.executionStatus === "error"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {submission.executionStatus === "success"
                            ? "성공"
                            : submission.executionStatus === "error"
                              ? "오류"
                              : "대기 중"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-background rounded p-3 border border-border mb-3">
                      <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap max-h-24 overflow-y-auto">
                        {submission.code}
                      </pre>
                    </div>

                    {submission.feedback && (
                      <p className="text-sm text-muted-foreground italic border-l-2 border-accent pl-3">
                        피드백: {submission.feedback}
                      </p>
                    )}

                    {submission.score !== undefined && (
                      <p className="text-sm font-medium text-primary mt-2">점수: {submission.score}점</p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectSubmission(submission.id)
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
                          handleFinalSubmit(submission.id)
                        }}
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
                      >
                        최종 제출
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
                  <h3 className="text-lg font-semibold text-foreground">코드 미리보기</h3>
                </div>
                <div className="p-4">
                  <div className="bg-background rounded p-3 border border-border mb-4">
                    <pre className="text-xs font-mono text-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {selectedData.code}
                    </pre>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">상태:</span>
                      <span
                        className={
                          selectedData.executionStatus === "success"
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {selectedData.executionStatus === "success" ? "✓ 성공" : "✗ 오류"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">생성 시간:</span>
                      <span className="text-foreground">{selectedData.submittedAt.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Final Selection Info */}
            {finalSelected && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">최종 제출 선택됨</h4>
                <p className="text-sm text-foreground">{finalSelected.versionName}</p>
                <Button
                  onClick={() => router.push(`/confirmation?submissionId=${finalSelected.id}`)}
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
