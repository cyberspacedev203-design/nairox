import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Copy, Share2, Users, Gift, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const Referrals = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const referralLink = profile ? `${window.location.origin}/auth?ref=${profile.referral_code}` : "";

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const shareReferral = async () => {
    const shareData = {
      title: "Join Chixx9ja",
      text: `Join me on Chixx9ja and earn ₦50,000 welcome bonus! Use my referral code: ${profile?.referral_code}`,
      url: referralLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyReferralCode();
      }
    } else {
      copyReferralCode();
    }
  };

  if (loading || !profile) return null;

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
          <h1 className="text-2xl font-bold">Refer & Earn</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-lg border-border/50 p-6 glow-primary">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-3xl font-bold text-primary">{profile.total_referrals || 0}</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <p className="text-sm text-muted-foreground">Earnings Per Referral</p>
              <p className="text-3xl font-bold text-secondary">₦{Number(profile.referral_earnings).toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Referral Link Card */}
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Your Referral Link
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <code className="text-sm font-mono break-all block">{referralLink}</code>
              <div className="flex gap-2">
                <Button
                  onClick={copyReferralCode}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  onClick={shareReferral}
                  className="flex-1 bg-gradient-to-r from-secondary to-primary"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Upgrade Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            Upgrade Referral Earnings
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Increase your earnings per referral by upgrading to premium tiers
          </p>
          <Button
            onClick={() => navigate("/upgrade")}
            className="w-full bg-gradient-to-r from-primary to-secondary"
          >
            View Upgrade Options
          </Button>
        </Card>

        {/* How It Works */}
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <h3 className="font-semibold mb-4">How It Works</h3>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
              <span>Share your unique referral link with friends</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
              <span>They sign up using your link and get ₦50,000 welcome bonus</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
              <span>You earn ₦{Number(profile.referral_earnings).toLocaleString()} added to your balance instantly!</span>
            </li>
          </ol>
        </Card>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default Referrals;
