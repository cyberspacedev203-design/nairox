import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Clock, Gift } from "lucide-react";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface Task {
  id: number;
  title: string;
  description: string;
  reward: string;
  amount: number;
  status: "available" | "completed";
  type: "once" | "daily" | "link" | "referral";
  link?: string;
}

const Tasks = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user + tasks on mount
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);
      await loadTasks(user.id);
    };

    init();
  }, [navigate]);

  const loadTasks = async (uid: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_daily_checkin")
      .eq("id", uid)
      .maybeSingle();

    const lastCheckin = profile?.last_daily_checkin
      ? new Date(profile.last_daily_checkin)
      : null;

    const today = new Date().toDateString();
    const alreadyCheckedToday =
      lastCheckin && lastCheckin.toDateString() === today;

    setTasks([
      {
        id: 1,
        title: "Join Telegram Channel",
        description: "Join our official Telegram channel for updates",
        reward: "₦5,000",
        amount: 5000,
        status: "available",
        type: "link",
        link: "https://t.me/officialbluepay2025",
      },
      {
        id: 2,
        title: "Join WhatsApp Group",
        description: "Join our WhatsApp community for instant updates",
        reward: "₦5,000",
        amount: 5000,
        status: "available",
        type: "link",
        link: "https://chat.whatsapp.com/EB6wii8cqxI25rENGOzI5d?mode=wwt",
      },
      {
        id: 3,
        title: "Complete Profile",
        description: "Fill out your profile information",
        reward: "₦2,000",
        amount: 2000,
        status: "available",
        type: "once",
      },
      {
        id: 4,
        title: "Make First Referral",
        description: "Invite your first friend to Chixx9ja",
        reward: "₦10,000",
        amount: 10000,
        status: "available",
        type: "referral",
      },
      {
        id: 5,
        title: "Daily Check-in",
        description: "Come back every day and claim your reward!",
        reward: "₦15,000",
        amount: 15000,
        status: alreadyCheckedToday ? "completed" : "available",
        type: "daily",
      },
    ]);
  };

  const handleTaskClick = async (task: Task) => {
    if (loading) return;

    // External links
    if (task.link) {
      window.open(task.link, "_blank", "noopener,noreferrer");
      toast.success("Opened! Complete the task to earn reward.");
      return;
    }

    // Daily Check-in
    if (task.type === "daily" && task.status === "available") {
      setLoading(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          balance: supabase.raw("balance + ?", [task.amount]),
          last_daily_checkin: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        toast.error("Claim failed. Try again.");
        setLoading(false);
        return;
      }

      toast.success(`₦${task.amount.toLocaleString()} added to your wallet!`);
      await loadTasks(userId!); // refresh task list
      setLoading(false);
      return;
    }

    // Other tasks (profile, referral, etc.)
    toast.info("This task will be activated soon!");
  };

  return (
    <div className="min-h-screen liquid-bg pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-primary-foreground hover:bg-background/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Daily Tasks</h1>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-lg border-border/50 p-6">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Earn Extra Rewards</h2>
              <p className="text-sm text-muted-foreground">
                Complete tasks and check in daily to boost your wallet!
              </p>
            </div>
          </div>
        </Card>

        {tasks.map((task) => (
          <Card key={task.id} className="bg-card/80 backdrop-blur-lg border-border/50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{task.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">{task.reward}</span>
                  <span className="text-xs text-muted-foreground">reward</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                {task.status === "available" ? (
                  <button
                    onClick={() => handleTaskClick(task)}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all min-w-[100px]"
                  >
                    {loading && task.type === "daily" ? "Claiming..." : "Claim"}
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Done</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        <Card className="bg-muted/50 border-border/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            More tasks coming soon • Daily check-in resets every 24 hours
          </p>
        </Card>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default Tasks;