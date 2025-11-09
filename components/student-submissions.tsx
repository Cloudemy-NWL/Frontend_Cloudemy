"use client"

import { useState } from "react"
import { Search, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StudentSubmissionsProps {
  selectedStudent: string | null
  setSelectedStudent: (studentId: string | null) => void
}

export function StudentSubmissions({ selectedStudent, setSelectedStudent }: StudentSubmissionsProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const students = [
    {
      id: "1",
      name: "김학생",
      email: "student1@cloudemy.com",
      submissionCount: 3,
      lastSubmission: "2 시간 전",
      status: "submitted",
      score: 95,
      commonError: "None",
    },
    {
      id: "2",
      name: "이학생",
      email: "student2@cloudemy.com",
      submissionCount: 2,
      lastSubmission: "5 시간 전",
      status: "submitted",
      score: 87,
      commonError: "None",
    },
    {
      id: "3",
      name: "박학생",
      email: "student3@cloudemy.com",
      submissionCount: 1,
      lastSubmission: "12 시간 전",
      status: "submitted",
      score: 78,
      commonError: "Syntax Error",
    },
    {
      id: "4",
      name: "정학생",
      email: "student4@cloudemy.com",
      submissionCount: 0,
      lastSubmission: "제출 없음",
      status: "pending",
      score: 0,
      commonError: "N/A",
    },
  ]

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div>
      {/* Students List */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-secondary p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">학생 제출 현황</h3>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="학생 이름 또는 이메일 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student.id)}
              className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors border-l-4 ${
                selectedStudent === student.id ? "border-l-primary bg-primary/5" : "border-l-transparent"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-foreground">{student.name}</h4>
                  <p className="text-xs text-muted-foreground">{student.email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.status === "submitted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {student.status === "submitted" ? "제출됨" : "미제출"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <p className="text-muted-foreground">제출 횟수: {student.submissionCount}</p>
                  <p className="text-muted-foreground">마지막: {student.lastSubmission}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">점수: {student.score}점</p>
                  <p className="text-muted-foreground">오류: {student.commonError}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-muted text-xs bg-transparent"
                >
                  <Eye size={14} className="mr-1" />
                  코드 보기
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-muted text-xs bg-transparent"
                >
                  <Download size={14} className="mr-1" />
                  다운로드
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
