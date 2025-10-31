"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DashboardData } from "@/types/dashboard";

export const description = "Separate charts for teachers and students";

const teacherChartConfig = {
  teacher: {
    label: "Teachers",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const studentChartConfig = {
  student: {
    label: "Students",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface ChartAreaInteractiveProps {
  data: DashboardData;
}

// Transform API data to chart format for teachers
function transformTeacherChartData(
  chartData: DashboardData["Chart"],
  period: "oneYear" | "fiveYear"
) {
  // Add safety check for chartData
  if (!chartData?.teacher?.[period]) {
    return [];
  }

  const teacherData = chartData.teacher[period];

  if (period === "oneYear") {
    const months = [
      { key: "1", name: "Jan" },
      { key: "2", name: "Feb" },
      { key: "3", name: "Mar" },
      { key: "4", name: "Apr" },
      { key: "5", name: "Mei" },
      { key: "6", name: "Jun" },
      { key: "7", name: "Jul" },
      { key: "8", name: "Agu" },
      { key: "9", name: "Sep" },
      { key: "10", name: "Okt" },
      { key: "11", name: "Nov" },
      { key: "12", name: "Des" },
    ];

    return months.map((month) => ({
      period: month.name,
      teacher: teacherData[month.key] || 0,
    }));
  } else {
    const periods = Object.keys(teacherData).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
    return periods.map((key) => ({
      period: key,
      teacher: teacherData[key] || 0,
    }));
  }
}

// Transform API data to chart format for students
function transformStudentChartData(
  chartData: DashboardData["Chart"],
  period: "oneYear" | "fiveYear"
) {
  // Add safety check for chartData
  if (!chartData?.student?.[period]) {
    return [];
  }

  const studentData = chartData.student[period];

  if (period === "oneYear") {
    const months = [
      { key: "1", name: "Jan" },
      { key: "2", name: "Feb" },
      { key: "3", name: "Mar" },
      { key: "4", name: "Apr" },
      { key: "5", name: "Mei" },
      { key: "6", name: "Jun" },
      { key: "7", name: "Jul" },
      { key: "8", name: "Agu" },
      { key: "9", name: "Sep" },
      { key: "10", name: "Okt" },
      { key: "11", name: "Nov" },
      { key: "12", name: "Des" },
    ];

    return months.map((month) => ({
      period: month.name,
      student: studentData[month.key] || 0,
    }));
  } else {
    const periods = Object.keys(studentData).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
    return periods.map((key) => ({
      period: key,
      student: studentData[key] || 0,
    }));
  }
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<"oneYear" | "fiveYear">(
    "oneYear"
  );

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("oneYear");
    }
  }, [isMobile]);

  const teacherChartData = React.useMemo(() => {
    try {
      return transformTeacherChartData(data.Chart, timeRange);
    } catch (error) {
      console.error("Error transforming teacher chart data:", error);
      return [];
    }
  }, [data.Chart, timeRange]);

  const studentChartData = React.useMemo(() => {
    try {
      return transformStudentChartData(data.Chart, timeRange);
    } catch (error) {
      console.error("Error transforming student chart data:", error);
      return [];
    }
  }, [data.Chart, timeRange]);

  const handleTimeRangeChange = (value: string) => {
    // Prevent unnecessary state updates if the same value is selected
    if (!value || value === timeRange) {
      return;
    }

    // Validate the value before setting state
    if (value === "oneYear" || value === "fiveYear") {
      setTimeRange(value);
    }
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="text-xl @[540px]/card:text-2xl">
          Statistik Pendaftaran
        </CardTitle>
        <CardDescription className="text-sm @[540px]/card:text-base">
          Data tren pendaftaran guru dan siswa
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => {
              // ToggleGroup can send empty string when clicking the same item
              if (value) {
                handleTimeRangeChange(value);
              }
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-3 *:data-[slot=toggle-group-item]:text-sm @[540px]/card:*:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="oneYear">Tahun Ini</ToggleGroupItem>
            <ToggleGroupItem value="fiveYear">5 Tahun</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger
              className="flex w-36 @[540px]/card:w-40 text-sm **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="This Year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="oneYear" className="rounded-lg">
                Tahun Ini
              </SelectItem>
              <SelectItem value="fiveYear" className="rounded-lg">
                5 Tahun
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-6 @[540px]/card:gap-8 grid-cols-1">
        {/* Teacher Registration Chart */}
        <div className="space-y-3 @[540px]/card:space-y-4">
          <h3 className="text-base @[540px]/card:text-lg font-semibold text-foreground/90">
            Pendaftar Guru
          </h3>
          <ChartContainer
            config={teacherChartConfig}
            className="aspect-auto h-[200px] @[540px]/card:h-[250px] w-full"
          >
            <AreaChart data={teacherChartData}>
              <defs>
                <linearGradient id="fillTeacher" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="teacher"
                type="natural"
                fill="url(#fillTeacher)"
                stroke="var(--primary)"
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Student Registration Chart */}
        <div className="space-y-3 @[540px]/card:space-y-4">
          <h3 className="text-base @[540px]/card:text-lg font-semibold text-foreground/90">
            Pendaftar Siswa
          </h3>
          <ChartContainer
            config={studentChartConfig}
            className="aspect-auto h-[200px] @[540px]/card:h-[250px] w-full"
          >
            <AreaChart data={studentChartData}>
              <defs>
                <linearGradient id="fillStudent" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="student"
                type="natural"
                fill="url(#fillStudent)"
                stroke="var(--primary)"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
