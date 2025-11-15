"use client"

import { Users, CheckCircle2, AlertCircle } from 'lucide-react'

export function DashboardStats() {
  const stats = [
    {
      title: "총 학생 수",
      value: "31",
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "제출 완료",
      value: "30",
      subtext: "96.8%",
      icon: CheckCircle2,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "미제출",
      value: "1",
      subtext: "3.2%",
      icon: AlertCircle,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.title}
            className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon size={20} className={stat.iconColor} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              {stat.subtext && <span className="text-sm text-muted-foreground">{stat.subtext}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
