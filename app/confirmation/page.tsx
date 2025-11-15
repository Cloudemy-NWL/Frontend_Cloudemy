"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { CheckCircle, ChevronLeft } from "lucide-react"

const API_BASE = "https://unfactional-harriett-multiscreen.ngrok-free.dev"

export default function ConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userName, setUserName] = useState("")
  const [submissionId, setSubmissionId] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submissionTime, setSubmissionTime] = useState<Date | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    const userType = sessionStorage.getItem("userType")
    const name = sessionStorage.getItem("userName")
    const id = searchParams.get("submissionId")

    if (userType !== "student") {
      router.push("/")
      return
    }

    setUserName(name || "학생")
    setSubmissionId(id || "")

    // URL에 submissionId가 있다면 이미 제출된 것으로 간주
    if (id) {
      setSubmitted(true)
      setSubmissionTime(new Date())
    }
  }, [router, searchParams])

  const handleConfirmSubmission = async () => {
    if (!submissionId) return

    setIsConfirming(true)
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

      setSubmitted(true)
      setSubmissionTime(new Date())
    } catch (error) {
      console.error("[v0] 최종 제출 확정 오류:", error)
      alert("최종 제출 중 오류가 발생했습니다.")
    } finally {
      setIsConfirming(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-secondary to-background">
        <Navbar userName={userName} userType="student" />

        <div className="max-w-3xl mx-auto p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle size={64} className="text-green-600" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-2">제출 완료!</h1>
            <p className="text-xl text-muted-foreground mb-6">코드가 성공적으로 제출되었습니다.</p>

            <div className="bg-card border border-border rounded-lg shadow-lg p-8 mb-6">
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">제출자:</span>
                  <span className="font-semibold text-foreground">{userName}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">제출 ID:</span>
                  <span className="font-semibold text-foreground font-mono text-sm">{submissionId}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">제출 시간:</span>
                  <span className="font-semibold text-foreground">{submissionTime?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">상태:</span>
                  <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                    제출 완료
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">조교 대시보드에서 현재 제출 현황을 확인할 수 있습니다.</p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => router.push("/editor")}
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-muted"
              >
                <ChevronLeft size={18} className="mr-2" />
                에디터로 돌아가기
              </Button>
              <Button
                onClick={() => router.push("/")}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                홈으로 이동
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} userType="student" />

      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">최종 제출 확인</h2>
          <p className="text-muted-foreground">선택한 코드 버전을 최종 제출하시겠습니까?</p>
        </div>

        {/* Confirmation Card */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-secondary p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">제출 정보</h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">제출자</p>
                <p className="text-lg font-semibold text-foreground">{userName}</p>
              </div>

              <div className="p-4 bg-muted rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">선택된 버전</p>
                <p className="text-lg font-semibold text-foreground">{submissionId}</p>
              </div>

              <div className="p-4 bg-muted rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">예상 제출 시간</p>
                <p className="text-lg font-semibold text-foreground">{new Date().toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">주의:</span> 최종 제출 후에는 다른 버전으로 변경할 수 없습니다. 신중하게
                선택해주세요.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-muted py-6 text-base"
          >
            <ChevronLeft size={20} className="mr-2" />
            돌아가기
          </Button>
          <Button
            onClick={handleConfirmSubmission}
            disabled={isConfirming}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-semibold"
          >
            {isConfirming ? "제출 중..." : "최종 제출하기"}
          </Button>
        </div>
      </div>
    </div>
  )
}
