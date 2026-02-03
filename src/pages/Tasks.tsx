import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Tasks = () => {
  const navigate = useNavigate();
  const [claimedTasks, setClaimedTasks] = useState<Set<number>>(new Set());
  const [pendingVerification, setPendingVerification] = useState<Set<number>>(new Set());
  const [verifyingTasks, setVerifyingTasks] = useState<Set<number>>(new Set());

  const tasks = [
    {
      id: 1,
      title: "Join Telegram Channel",
      description: "Join our official Telegram channel for updates",
      reward: "₦5,000",
      link: "https://t.me/Nairox9janews",
    },
    {
      id: 2,
      title: "Visit Sponsor Site",
      description: "Visit our sponsor site and complete the offer",
      reward: "₦8,000",
      link: "https://www.effectivegatecpm.com/zrq0krqr7?key=6bbc08a6b74b2538ceb2703f68d77926",
    },
    {
      id: 3,
      title: "Join WhatsApp Community",
      description: "Join our WhatsApp channel for community updates and support",
      reward: "₦5,000",
      link: "https://whatsapp.com/channel/0029Vb7JLVT8F2p6NI4EMJ01",
    },
    {
      id: 5,
      title: "Daily Check-in",
      description: "Come back every day and claim your reward!",
      reward: "₦10,000",
    },
  ];

  // Check if task was claimed today
  const isTaskClaimedToday = (taskId: number) => {
    const lastClaim = localStorage.getItem(`task_${taskId}_claimed`);
    if (!lastClaim) return false;
    
    const today = new Date().toDateString();
    const lastClaimDate = new Date(lastClaim).toDateString();
    return today === lastClaimDate;
  };

  // Mark task as claimed for today
  const markTaskAsClaimed = (taskId: number) => {
    localStorage.setItem(`task_${taskId}_claimed`, new Date().toISOString());
  };

  // Load pending tasks from localStorage on mount
  useEffect(() => {
    const pending = new Set<number>();
    tasks.forEach(task => {
      const pendingKey = `task_${task.id}_pending`;
      if (localStorage.getItem(pendingKey)) {
        pending.add(task.id);
      }
    });
    setPendingVerification(pending);
  }, []);

  const handleClaim = async (task: any) => {
    // Check if already claimed today
    if (isTaskClaimedToday(task.id)) {
      toast.error("Already claimed today! Come back tomorrow.");
      return;
    }

    // Mark as processing
    setClaimedTasks(prev => new Set(prev).add(task.id));

    try {
      // Only mark as pending - don't credit yet
      const pendingKey = `task_${task.id}_pending`;
      localStorage.setItem(pendingKey, new Date().toISOString());
      setPendingVerification(prev => new Set(prev).add(task.id));
      
      toast.success("Go complete the task. Return here to verify and claim your reward!");
      
      // Open link for Telegram tasks
      if (task.link) {
        window.open(task.link, "noopener noreferrer");
      }
    } catch (error) {
      console.error("Error:", error);
      setClaimedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
      toast.error("Something went wrong");
    } finally {
      setClaimedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    }
  };

  const handleVerify = async (task: any) => {
    // Mark as verifying
    setVerifyingTasks(prev => new Set(prev).add(task.id));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setVerifyingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
      toast.error("Please login first");
      return;
    }

    try {
      // Get current balance
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Calculate reward amount
      let amount = 0;
      if (task.id === 1 || task.id === 3) amount = 5000;
      if (task.id === 2) amount = 8000;
      if (task.id === 5) amount = 15000;

      const newBalance = profile.balance + amount;

      // Update balance in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", user.id);

      if (updateError) {
        toast.error("Failed to update balance. Try again.");
      } else {
        // Mark as claimed for today
        markTaskAsClaimed(task.id);
        
        // Clear pending status
        const pendingKey = `task_${task.id}_pending`;
        localStorage.removeItem(pendingKey);
        setPendingVerification(prev => {
          const newSet = new Set(prev);
          newSet.delete(task.id);
          return newSet;
        });
        
        // Show success message
        toast.success(`${task.reward} added to your balance!`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setVerifyingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    }
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
          <h2 className="text-xl font-bold mb-2">Earn Extra Rewards</h2>
          <p className="text-sm text-muted-foreground">
            Complete tasks to earn bonus credits and boost your earnings
          </p>
        </Card>

        {tasks.map((task) => {
          const isClaimed = isTaskClaimedToday(task.id);
          const isProcessing = claimedTasks.has(task.id);
          const isPending = pendingVerification.has(task.id);
          const isVerifying = verifyingTasks.has(task.id);
          
          return (
            <div key={task.id}>
              <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{task.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{task.reward}</span>
                      <span className="text-xs text-muted-foreground">reward</span>
                      {isPending && (
                        <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                          ⏳ Pending Verification
                        </span>
                      )}
                      {isClaimed && !isPending && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                          ✓ Claimed Today
                        </span>
                      )}
                      {isProcessing && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          Processing...
                        </span>
                      )}
                    </div>
                  </div>

                    onClick={() => isPending ? handleVerify(task) : handleClaim(task)}
                    disabled={isClaimed || isProcessing || isVerifying}
                    className={`px-6 py-3 font-bold ${
                      isClaimed
                        ? "bg-gray-400 cursor-not-allowed" 
                        : isPending
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : (isProcessing || isVerifying)
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    }`}
                  >
                    {isProcessing ? "Processing..." : isVerifying ? "Verifying..." : isPending ? "Verify & Claim" : isClaimed ? "Claimed Today" : "Claim Now"}
                  </Button>
                </div>
              </Card>

              {task.id === 2 && (
                <Card className="bg-yellow-500/10 border-yellow-500/30 p-3 mt-2">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    ⚠️ <strong>Important:</strong> Allow the page to load completely before closing to receive your full reward.
                  </p>
                </Card>
              )}
            </div>
          );
        })}

        <Card className="bg-muted/50 border-border/50 p-4">
          <p className="text-sm text-center text-muted-foreground">
            Tasks reset every day at midnight. Check back tomorrow for more rewards!
          </p>
        </Card>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default Tasks;