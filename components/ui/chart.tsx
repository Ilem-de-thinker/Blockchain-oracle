"use client"

import * as React from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Bar, Line, Pie } from "react-chartjs-2"
import { cn } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export type ChartType = "line" | "bar" | "pie"

interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

interface MultiValueDataPoint {
  label: string
  completed?: number
  total?: number
  [key: string]: any
}

interface ComparisonDataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  fill?: boolean
  tension?: number
  borderRadius?: number
}

interface ChartData {
  labels: string[]
  datasets: ComparisonDataset[]
}

export interface ChartProps
  extends React.HTMLAttributes<HTMLDivElement> {
  type?: ChartType
  data: ChartDataPoint[] | MultiValueDataPoint[] | ChartData
  height?: number
  showLabels?: boolean
}

const colors = ["#9333ea", "#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ className, type = "bar", data, height = 200, showLabels = true, ...props }, ref) => {
    const chartData = React.useMemo(() => {
      // Handle pre-formatted Chart.js data (for comparison)
      if ('labels' in data && 'datasets' in data) {
        return data as ChartData
      }

      if (type === "pie") {
        const d = data as ChartDataPoint[]
        return {
          labels: d.map((item) => item.label),
          datasets: [
            {
              data: d.map((item) => item.value),
              backgroundColor: d.map((_, i) => d[i].color || colors[i % colors.length]),
              borderWidth: 0,
            },
          ],
        }
      }

      if (type === "bar" && 'completed' in (data[0] || {})) {
        const multiData = data as MultiValueDataPoint[]
        return {
          labels: multiData.map((d) => d.label),
          datasets: [
            {
              label: "Completed",
              data: multiData.map((d) => d.completed || 0),
              backgroundColor: "#22c55e",
              borderRadius: 4,
            },
            {
              label: "Total",
              data: multiData.map((d) => d.total || 0),
              backgroundColor: "#e5e7eb",
              borderRadius: 4,
            },
          ],
        }
      }

      const d = data as ChartDataPoint[]
      return {
        labels: d.map((item) => item.label),
        datasets: [
          {
            label: type === "line" ? d[0]?.label || "Value" : "Amount",
            data: d.map((item) => item.value),
            borderColor: type === "line" ? (d[0]?.color || "#9333ea") : undefined,
            backgroundColor: type === "bar" ? (d[0]?.color || colors[0]) : undefined,
            fill: type === "line" ? false : undefined,
            tension: 0.4,
            borderRadius: type === "bar" ? 4 : undefined,
          },
        ],
      }
    }, [data, type])

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLabels && (type !== "line" || chartData.datasets.length > 1),
          position: "bottom" as const,
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: type !== "pie" ? {
        y: {
          beginAtZero: true,
        },
      } : undefined,
    }

    return (
      <div ref={ref} className={cn("w-full", className)} style={{ height, maxWidth: '100%', width: '100%' }} {...props}>
        {type === "bar" && <Bar data={chartData} options={options} />}
        {type === "line" && <Line data={chartData} options={options} />}
        {type === "pie" && <Pie data={chartData} options={options} />}
      </div>
    )
  }
)
Chart.displayName = "Chart"

export { Chart }
