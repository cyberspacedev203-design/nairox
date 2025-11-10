import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Copy, Gift, DollarSign, CheckCircle2, History, Disc3, Radio } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { PromotionsCarousel } from "@/components/PromotionsCarousel";
import { ArrowRight } from "lucide-react";
import { WelcomeModal } from "@/components/WelcomeModal";
import { WithdrawalNotification } from "@/components/WithdrawalNotification";
import { AddBalanceModal } from "@/components/AddBalanceModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [lastClaimTime, setLastClaimTime] = useState<Date | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);

  useEffect(() => {
    checkAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (lastClaimTime) {
      const interval = setInterval(() => {
        const timeDiff = Date.now() - lastClaimTime.getTime();
        const canClaimNow = timeDiff >= 5 * 60 * 1000; // 5 minutes
        setCanClaim(canClaimNow);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lastClaimTime]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Add small delay to prevent race conditions on mobile
      setTimeout(() => navigate("/auth"), 100);
    } else {
      setUser(session.user);
      loadProfile(session.user.id);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);

      // Load last claim
      const { data: claims } = await supabase
        .from("claims")
        .select("*")
        .eq("user_id", userId)
        .order("claimed_at", { ascending: false })
        .limit(1);

      if (claims && claims.length > 0) {
        const lastClaim = new Date(claims[0].claimed_at);
        setLastClaimTime(lastClaim);
        const timeDiff = Date.now() - lastClaim.getTime();
        setCanClaim(timeDiff >= 5 * 60 * 1000);
      } else {
        setCanClaim(true);
      }
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(`${window.location.origin}/auth?ref=${profile.referral_code}`);
      toast.success("Referral link copied!");
    }
  };

  const handleClaim = async () => {
    if (!canClaim || claiming) return;

    setClaiming(true);
    try {
      // Create claim record
      const { error: claimError } = await supabase
        .from("claims")
        .insert({ user_id: user.id, amount: 15000 });

      if (claimError) throw claimError;

      // Update balance
      const newBalance = (profile?.balance || 0) + 15000;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Create transaction
      await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "credit",
          amount: 15000,
          description: "Mini claim bonus",
          status: "completed",
        });

      toast.success("₦15,000 claimed successfully!");
      setLastClaimTime(new Date());
      setCanClaim(false);
      await loadProfile(user.id);
    } catch (error: any) {
      toast.error("Failed to claim bonus");
    } finally {
      setClaiming(false);
    }
  };

  const getTimeRemaining = () => {
    if (!lastClaimTime || canClaim) return "Ready!";
    
    const now = Date.now();
    const timeDiff = 5 * 60 * 1000 - (now - lastClaimTime.getTime());
    
    if (timeDiff <= 0) return "Ready!";
    
    const minutes = Math.floor(timeDiff / 60000);
    const seconds = Math.floor((timeDiff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen liquid-bg pb-20" style={{ position: 'relative', zIndex: 1 }}>
      <WelcomeModal />
      <WithdrawalNotification />
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 text-primary-foreground glow-primary" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 2 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-lg flex items-center justify-center text-lg font-bold">
            {profile.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="text-xs opacity-90">Hi, {profile.full_name} 👋</p>
            <p className="text-sm font-semibold">Welcome back!</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 py-4" style={{ position: 'relative', zIndex: 2, pointerEvents: 'auto' }}>
        {/* Balance Card */}
        <div className="px-4">
          <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-lg border-border/50 p-4 glow-primary animate-fade-in">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBalance(!showBalance)}
                  className="hover:bg-muted h-8 w-8"
                >
                  {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                {showBalance ? `₦${Number(profile.balance || 0).toLocaleString()}.00` : "****"}
              </h2>
              <Button
                onClick={() => setShowTopUp(true)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Top-Up Wallet
              </Button>
            </div>
          </Card>
        </div>

        {/* Mini Claim Card */}
        <div className="px-4">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <Gift className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <div className="text-xs min-w-0">
                  <p className="font-semibold text-foreground">Claim ₦15,000 Every 5 Minutes!</p>
                  <p className="text-muted-foreground truncate">{canClaim ? "Free money waiting!" : `Next claim: ${getTimeRemaining()}`}</p>
                </div>
              </div>
              <Button
                onClick={handleClaim}
                disabled={!canClaim || claiming}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-xs px-3 py-1 h-auto flex-shrink-0"
              >
                {claiming ? "Claiming..." : canClaim ? "Claim Now" : getTimeRemaining()}
              </Button>
            </div>
          </Card>
        </div>

        {/* Promotions Carousel */}
        <PromotionsCarousel />

        {/* View Daily Tasks Link */}
        <div className="px-4">
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:underline py-2"
          >
            View Daily Tasks <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="px-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate("/referrals")}
              className="h-20 flex flex-col gap-1.5 items-center justify-center rounded-lg border bg-card/80 hover:bg-card border-border/50 transition-all active:scale-95 touch-manipulation cursor-pointer min-h-[44px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Gift className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold">💸 Refer & Earn</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/withdraw")}
              className="h-20 flex flex-col gap-1.5 items-center justify-center rounded-lg border bg-card/80 hover:bg-card border-border/50 transition-all active:scale-95 touch-manipulation cursor-pointer min-h-[44px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <DollarSign className="w-5 h-5 text-secondary" />
              <span className="text-xs font-semibold">💳 Withdraw</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="h-20 flex flex-col gap-1.5 items-center justify-center rounded-lg border bg-card/80 hover:bg-card border-border/50 transition-all active:scale-95 touch-manipulation cursor-pointer min-h-[44px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-xs font-semibold">✅ Tasks</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/history")}
              className="h-20 flex flex-col gap-1.5 items-center justify-center rounded-lg border bg-card/80 hover:bg-card border-border/50 transition-all active:scale-95 touch-manipulation cursor-pointer min-h-[44px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <History className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-semibold">📊 History</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/spin")}
              className="h-20 flex flex-col gap-1.5 items-center justify-center rounded-lg border bg-card/80 hover:bg-card border-border/50 transition-all active:scale-95 touch-manipulation cursor-pointer min-h-[44px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Disc3 className="w-5 h-5 text-accent" />
              <span className="text-xs font-semibold">🎡 Spin</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/broadcast")}
              className="h-20 flex flex-col gap-1.5 items-center justify-center rounded-lg border bg-card/80 hover:bg-card border-border/50 transition-all active:scale-95 touch-manipulation cursor-pointer min-h-[44px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Radio className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold">📣 Broadcast</span>
            </button>
          </div>
        </div>

        {/* Referral Card */}
        <div className="px-4">
          <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Referral Program</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Referrals</p>
                  <p className="text-xl font-bold text-primary">{profile.total_referrals || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Earnings/Referral</p>
                  <p className="text-xl font-bold text-secondary">₦{Number(profile.referral_earnings || 15000).toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1.5">Your Referral Link</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[10px] font-bold text-foreground truncate">{window.location.origin}/auth?ref={profile.referral_code}</code>
                  <Button
                    size="sm"
                    onClick={copyReferralCode}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 flex-shrink-0 h-7 w-7 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <FloatingActionButton />

      <AddBalanceModal
        open={showTopUp}
        onOpenChange={setShowTopUp}
        onSuccess={() => {
          if (user) loadProfile(user.id);
        }}
      />
    </div>
  );
};

export default Dashboard;
