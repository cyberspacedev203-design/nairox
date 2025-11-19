import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Gift } from "lucide-react";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface Task {
  id: number;
  title: string;
  reward: string;
  amount: number;
  status: "available" | "completed";
  type: "link" | "daily";
  link?: string;
}

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);

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
    // Check daily check-in
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_daily_checkin, telegram_joined, whatsapp_joined")
      .eq("id", uid)
      .single();

    const today = new Date().toDateString();
    const lastDaily = profile?.last_daily_checkin
      ? new Date(profile.last_daily_checkin).toDateString()
      : null;

    setTasks([
      {
        id: 1,
        title: "Join Telegram Channel",
        reward: "₦5,000",
        amount: 5000,
        status: profile?.telegram_joined ? "completed" : "available",
        type: "link",
        link: "https://t.me/officialbluepay2025",
      },
      {
        id: 2,
        title: "Join WhatsApp Group",
        reward: "₦5,000",
        amount: 5000,
        status: profile?.whatsapp_joined ? "completed" : "available",
        type: "link",
        link: "https://chat.whatsapp.com/EB6wii8cqxI25rENGOzI5d?mode=wwt",
      },
      {
        id: 5,
        title: "Daily Check-in",
        reward: "₦15,000",
        amount: 15000,
        status: lastDaily === today ? "completed" : "available",
        type: "daily",
      },
    ]);
  };

  const handleTaskClick = async (task: Task) => {
    if (task.status === "completed" || claimingId) return;

    setClaimingId(task.id);

    if (task.link) {
      // Instant payout + mark as done
      const field = task.id === 1 ? "telegram_joined" : "whatsapp_joined";

      const { error } = await supabase
        .from("profiles")
        .update({
          balance: supabase.raw("balance + ?", [task.amount]),
          [field]: true,
        })
        .eq("id", userId);

      if (error) {
        toast.error("Failed. Try again.");
        setClaimingId(null);
        return;
      }

      toast.success(`₦${task.amount.toLocaleString()} added instantly!`);
      window.open(task.link, "_blank");
    } 
    else if (task.type === "daily") {
      const { error } = await supabase
        .from("profiles")
        .update({
          balance: supabase.raw("balance + ?", [task.amount]),
          last_daily_checkin: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        toast.error("Claim failed.");
        setClaimingId(null);
        return;
      }

      toast.success("₦15,000 daily bonus claimed!");
    }

    // Refresh tasks
    await loadTasks(userId!);
    setClaimingId(null);
  };

  return (
    <div className="min-h-screen liquid-bg pb-20">
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
              <h2 className="text-xl font-bold">Instant Rewards</h2>
              <p className="text-sm text-muted-foreground">
                Click any task → get paid immediately!
              </p>
            </div>
          </div>
        </Card>

        {tasks.map((task) => (
          <Card key={task.id} className="bg-card/80 backdrop-blur-lg border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{task.title}</h3>
                <p className="text-sm text-muted-foreground">Click to claim reward</p>
              </div>

              {task.status === "available" ? (
                <Button
                  onClick={() => handleTaskClick(task)}
                  disabled={!!claimingId}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-8"
                >
                  {claimingId === task.id ? "Paying..." : `Claim ${task.reward}`}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-bold">Completed</span>
                </div>
              )}
            </div>
          </Card>
        ))}

        <Card className="bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            All rewards paid instantly • No waiting • Daily reset at midnight
          </p>
        </Card>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default Tasks;