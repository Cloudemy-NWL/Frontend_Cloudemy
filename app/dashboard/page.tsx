"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { DashboardStats } from "@/components/dashboard-stats"
import { StudentSubmissions } from "@/components/student-submissions"

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

  useEffect(() => {
    const userType = sessionStorage.getItem("userType")
    const name = sessionStorage.getItem("userName")

    if (userType !== "ta") {
      router.push("/")
      return
    }

    setUserName(name || "조교")
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} userType="ta" />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">조교 대시보드</h2>
          <p className="text-muted-foreground">실시간 과제 제출 현황</p>
        </div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Student Submissions */}
        <StudentSubmissions selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent} />
      </div>
    </div>
  )
}
