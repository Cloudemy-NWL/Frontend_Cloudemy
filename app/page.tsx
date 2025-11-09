"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("student")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.")
      return
    }

    // 하드코딩된 로그인 로직
    if (userType === "student") {
      if (email === "student@cloudemy.com" && password === "password123") {
        sessionStorage.setItem("userType", "student")
        sessionStorage.setItem("userName", "김학생")
        router.push("/editor")
      } else {
        setError("학생 계정 정보가 일치하지 않습니다.")
      }
    } else {
      if (email === "ta@cloudemy.com" && password === "password123") {
        sessionStorage.setItem("userType", "ta")
        sessionStorage.setItem("userName", "이조교")
        router.push("/dashboard")
      } else {
        setError("조교 계정 정보가 일치하지 않습니다.")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-primary">Cloudemy</h1>
            <p className="text-sm text-muted-foreground">클라우드 기반 자동 채점 플랫폼</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* User Type Selection */}
            <div className="flex gap-2 bg-muted rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUserType("student")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  userType === "student"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                학생
              </button>
              <button
                type="button"
                onClick={() => setUserType("ta")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  userType === "ta"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                조교
              </button>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={userType === "student" ? "student@cloudemy.com" : "ta@cloudemy.com"}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/30">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-all"
            >
              로그인
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">테스트 계정:</p>
            <p>학생: student@cloudemy.com / password123</p>
            <p>조교: ta@cloudemy.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
