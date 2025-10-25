import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Copy, Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [lastClaimTime, setLastClaimTime] = useState<Date | null>(null);

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
      navigate("/auth");
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
        });

      toast.success("₦15,000 claimed successfully!");
      setLastClaimTime(new Date());
      setCanClaim(false);
      loadProfile(user.id);
    } catch (error: any) {
      toast.error("Failed to claim bonus");
    } finally {
      setClaiming(false);
    }
  };

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen liquid-bg pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground glow-primary">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-lg flex items-center justify-center text-xl font-bold">
              {profile.full_name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-sm opacity-90">Hi, {profile.full_name} 👋</p>
              <p className="font-semibold">Welcome back!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-lg border-border/50 p-6 glow-primary animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Your Balance</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="hover:bg-muted"
              >
                {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </Button>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text">
              {showBalance ? `₦${Number(profile.balance || 0).toLocaleString()}.00` : "****"}
            </h2>
          </div>
        </Card>

        {/* Mini Claim Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Claim ₦15,000 Every 5 Minutes!</p>
                <p className="text-muted-foreground">Free money waiting for you</p>
              </div>
            </div>
            <Button
              onClick={handleClaim}
              disabled={!canClaim || claiming}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {claiming ? "Claiming..." : canClaim ? "Claim Now" : "Wait..."}
            </Button>
          </div>
        </Card>

        {/* Referral Card */}
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Referral Program</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold text-primary">{profile.total_referrals || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Earnings/Referral</p>
                <p className="text-2xl font-bold text-secondary">₦{Number(profile.referral_earnings || 15000).toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">Your Referral Link</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-bold text-foreground break-all">{window.location.origin}/auth?ref={profile.referral_code}</code>
                <Button
                  size="sm"
                  onClick={copyReferralCode}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default Dashboard;
