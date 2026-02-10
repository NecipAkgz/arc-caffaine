"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { memo } from "react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface SupporterChartProps {
  data: { date: string; cumulativeSupporters: number }[];
}

/**
 * Line chart component displaying supporter growth over time.
 * Uses Chart.js with ArcCaffeine theme colors.
 */
export const SupporterChart = memo(function SupporterChart({
  data,
}: SupporterChartProps) {
  const chartData = {
    labels: data.map((d) => {
      // Format date as "Jan 15" style
      const date = new Date(d.date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: [
      {
        label: "Total Supporters",
        data: data.map((d) => d.cumulativeSupporters),
        borderColor: "hsl(35, 90%, 50%)", // Primary amber
        backgroundColor: "hsla(35, 90%, 50%, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "hsl(35, 90%, 50%)",
        pointBorderColor: "#0c0a09",
        pointBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "hsl(240, 10%, 10%)",
        titleColor: "hsl(0, 0%, 98%)",
        bodyColor: "hsl(0, 0%, 98%)",
        borderColor: "hsl(35, 90%, 50%)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return `${context.parsed.y} supporters`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "hsla(240, 5%, 30%, 0.3)",
        },
        ticks: {
          color: "hsl(240, 5%, 65%)",
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "hsla(240, 5%, 30%, 0.3)",
        },
        ticks: {
          color: "hsl(240, 5%, 65%)",
          font: {
            size: 11,
          },
          stepSize: 1,
        },
      },
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available yet
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
});
