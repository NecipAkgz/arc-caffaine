"use client";

import { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Coffee } from "lucide-react";

interface Activity {
  id: string;
  username: string;
  amount: number;
}

const MOCK_ACTIVITIES: Omit<Activity, "id">[] = [
  { username: "neco", amount: 5 },
  { username: "croky", amount: 1 },
  { username: "jane", amount: 3 },
  { username: "emma", amount: 8 },
  { username: "john", amount: 3 },
];

/**
 * Live Activity Feed
 *
 * Displays toast-style notifications of recent support activity.
 * Auto-cycles through mock data with smooth GSAP animations.
 */
export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    let counter = 0;

    const addActivity = () => {
      const mockActivity =
        MOCK_ACTIVITIES[Math.floor(Math.random() * MOCK_ACTIVITIES.length)];
      const newActivity: Activity = {
        id: `activity-${Date.now()}-${counter++}`,
        ...mockActivity,
      };

      setActivities((prev) => [...prev, newActivity]);

      // Remove after 4 seconds
      setTimeout(() => {
        setActivities((prev) => prev.filter((a) => a.id !== newActivity.id));
      }, 4000);
    };

    // Initial activity after 2 seconds
    const initialTimeout = setTimeout(addActivity, 2000);

    // Then every 6-8 seconds
    const interval = setInterval(() => {
      addActivity();
    }, 6000 + Math.random() * 2000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {activities.map((activity) => (
        <ActivityToast key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

function ActivityToast({ activity }: { activity: Activity }) {
  const toastRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!toastRef.current) return;

      // Entrance animation
      gsap.fromTo(
        toastRef.current,
        {
          x: 100,
          opacity: 0,
          scale: 0.8,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.5)",
        }
      );

      // Exit animation after 3.5s
      gsap.to(toastRef.current, {
        x: 100,
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        delay: 3.5,
        ease: "power2.in",
      });
    },
    { scope: toastRef }
  );

  return (
    <div
      ref={toastRef}
      className="glass-card px-4 py-3 flex items-center gap-3 min-w-[280px] pointer-events-auto"
    >
      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
        <Coffee className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          <span className="text-primary font-bold">@{activity.username}</span>{" "}
          just received
        </p>
        <p className="text-xs text-muted-foreground">
          {activity.amount} USDC ☕
        </p>
      </div>
    </div>
  );
}
