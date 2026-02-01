import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const Upgrade = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const upgradeTiers = [
    { level: "Silver", amount: 15000, price: 15000, color: "from-gray-400 to-gray-600" },
    { level: "Gold", amount: 20000, price: 20000, color: "from-yellow-400 to-yellow-600" },
    { level: "Platinum", amount: 25000, price: 25000, color: "from-blue-400 to-blue-600" },
    { level: "Diamond", amount: 30000, price: 30000, color: "from-purple-400 to-purple-600" },
  ];

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
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (tier: typeof upgradeTiers[0]) => {
    navigate("/upgrade-payment", { state: tier });
  };

  const currentEarnings = 10000;

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen liquid-bg pb-20">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/referrals")}
            className="text-primary-foreground hover:bg-background/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Upgrade Earnings</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Tier */}
        <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-lg border-border/50 p-6 glow-primary">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Current Earnings Per Referral</p>
            <p className="text-4xl font-bold gradient-text">₦{Number(currentEarnings).toLocaleString()}</p>
          </div>
        </Card>

        {/* Upgrade Tiers */}
        <div className="space-y-4">
          {upgradeTiers.map((tier) => (
            <Card
              key={tier.level}
              className="bg-card/80 backdrop-blur-lg border-border/50 p-6 hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    {tier.level}
                  </h3>
                  <p className="text-2xl font-bold text-primary">₦{tier.amount.toLocaleString()}/referral</p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary" />
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Earn ₦{tier.amount.toLocaleString()} per referral</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Lifetime upgrade benefit</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Priority support</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Upgrade Price: <span className="font-bold text-foreground">₦{tier.price.toLocaleString()}</span>
                </p>
                <Button
                  onClick={() => handleUpgrade(tier)}
                  className={`bg-gradient-to-r ${tier.color}`}
                >
                  Upgrade Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default Upgrade;
