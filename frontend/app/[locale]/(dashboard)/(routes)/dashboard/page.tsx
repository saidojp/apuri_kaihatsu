"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/navigation";
import {
  BarChart3,
  Users,
  UserRound,
  MessagesSquare,
  BookOpen,
  Shield,
  Calendar,
  TrendingUp,
  Clock,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type CardData = {
  id: number;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  stats?: {
    count: number;
    trend: "up" | "down" | "neutral";
    percentage: number;
  };
};

// Mock data for our improved dashboard
const cardData: CardData[] = [
  {
    id: 6,
    title: "Forms",
    description: "click here to view forms",
    href: "/forms",
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100",
    stats: {
      count: 24,
      trend: "up",
      percentage: 12,
    },
  },
  {
    id: 1,
    title: "Messages",
    description: "click here to view messages",
    href: "/messages",
    icon: <MessagesSquare className="h-5 w-5" />,
    color:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100",
    stats: {
      count: 156,
      trend: "up",
      percentage: 8,
    },
  },
  {
    id: 2,
    title: "Students",
    description: "click here to view students",
    href: "/students",
    icon: <UserRound className="h-5 w-5" />,
    color:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100",
    stats: {
      count: 100,
      trend: "up",
      percentage: 4,
    },
  },
  {
    id: 4,
    title: "Groups",
    description: "click here to view groups",
    href: "/groups",
    icon: <Users className="h-5 w-5" />,
    color: "bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-100",
    stats: {
      count: 6,
      trend: "neutral",
      percentage: 0,
    },
  },
  {
    id: 3,
    title: "Parents",
    description: "click here to view parents",
    href: "/parents",
    icon: <Users className="h-5 w-5" />,
    color: "bg-rose-50 text-rose-700 dark:bg-rose-900 dark:text-rose-100",
    stats: {
      count: 95,
      trend: "up",
      percentage: 6,
    },
  },
  {
    id: 5,
    title: "Admins",
    description: "click here to view admins",
    href: "/admins",
    icon: <Shield className="h-5 w-5" />,
    color:
      "bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-100",
    stats: {
      count: 12,
      trend: "neutral",
      percentage: 0,
    },
  },
];

// Mock data for recent activity
const recentActivity = [
  {
    id: 1,
    action: "New student registered",
    time: "10 minutes ago",
    icon: <UserRound className="h-4 w-4" />,
  },
  {
    id: 2,
    action: "New form submitted",
    time: "30 minutes ago",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    id: 3,
    action: "Message sent to Group A",
    time: "1 hour ago",
    icon: <MessagesSquare className="h-4 w-4" />,
  },
  {
    id: 4,
    action: "New parent added",
    time: "2 hours ago",
    icon: <Users className="h-4 w-4" />,
  },
];

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  // Helper function to render trend indicator
  const renderTrend = (
    trend: "up" | "down" | "neutral",
    percentage: number
  ) => {
    if (trend === "up") {
      return (
        <div className="flex items-center text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>+{percentage}%</span>
        </div>
      );
    } else if (trend === "down") {
      return (
        <div className="flex items-center text-red-600 dark:text-red-400">
          <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
          <span>-{percentage}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-slate-600 dark:text-slate-400">
        <span>No change</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("Dashboard")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back! Here's an overview of your school system.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cardData.map((data, index) => (
            <Link key={index} href={data.href} passHref>
              <Card className="w-full h-full transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
                <CardHeader className={`p-4 ${data.color} rounded-t-lg`}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-medium">
                      {t(data.title)}
                    </CardTitle>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                      {data.icon}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {data.stats && (
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="text-2xl font-bold">
                        {data.stats.count}
                      </div>
                      {renderTrend(data.stats.trend, data.stats.percentage)}
                    </div>
                  )}
                  <CardDescription className="mt-1">
                    {t(data.description)}
                  </CardDescription>
                </CardContent>
                <CardFooter className="px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-b-lg">
                  <span className="text-sm font-medium flex items-center">
                    View details
                    <svg
                      className="ml-1 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
