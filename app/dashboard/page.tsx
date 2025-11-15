"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { DashboardStats } from "@/components/dashboard-stats"
import { StudentSubmissions } from "@/components/student-submissions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Save } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [assignmentDescription, setAssignmentDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const userType = sessionStorage.getItem("userType")
    const name = sessionStorage.getItem("userName")

    if (userType !== "ta") {
      router.push("/")
      return
    }

    setUserName(name || "조교")

    const savedDescription = localStorage.getItem("assignmentDescription")
    if (savedDescription) {
      setAssignmentDescription(savedDescription)
    }
  }, [router])

  const handleSaveDescription = () => {
    setIsSaving(true)
    localStorage.setItem("assignmentDescription", assignmentDescription)
    setTimeout(() => {
      setIsSaving(false)
      alert("과제 설명이 저장되었습니다!")
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} userType="ta" />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">조교 대시보드</h2>
          <p className="text-muted-foreground">실시간 과제 제출 현황</p>
        </div>

        <div className="mb-6 bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="bg-primary/10 p-4 border-b border-border flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">과제 설명 관리</h3>
          </div>
          <div className="p-4 space-y-3">
            <Textarea
              placeholder="학생들에게 표시될 과제 설명을 입력하세요..."
              value={assignmentDescription}
              onChange={(e) => setAssignmentDescription(e.target.value)}
              className="min-h-32 resize-none"
            />
            <Button
              onClick={handleSaveDescription}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save size={18} />
              {isSaving ? "저장 중..." : "과제 설명 저장"}
            </Button>
          </div>
        </div>

        <DashboardStats />
        <StudentSubmissions selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent} />
      </div>
    </div>
  )
}
