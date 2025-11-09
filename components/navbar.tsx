"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  userName?: string
  userType?: string
}

export function Navbar({ userName = "사용자", userType = "student" }: NavbarProps) {
  const router = useRouter()

  const handleLogout = () => {
    sessionStorage.removeItem("userType")
    sessionStorage.removeItem("userName")
    router.push("/")
  }

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1
            onClick={() => {
              if (userType === "student") router.push("/editor")
              else router.push("/dashboard")
            }}
            className="text-2xl font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors"
          >
            Cloudemy
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-foreground font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{userType === "student" ? "학생" : "조교"}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-border text-foreground hover:bg-muted bg-transparent"
          >
            로그아웃
          </Button>
        </div>
      </div>
    </nav>
  )
}
