import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const Withdraw = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requireReferrals, setRequireReferrals] = useState(false);
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
  });

  const MINIMUM_WITHDRAW = 120000;

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

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = Number(withdrawData.amount);
    
    // When toggle is OFF (requireReferrals = false), enforce minimum and referral requirement
    if (!requireReferrals) {
      if (amount < MINIMUM_WITHDRAW) {
        toast.error(`Minimum withdrawal is ₦${MINIMUM_WITHDRAW.toLocaleString()}`);
        return;
      }
      
      if (profile.total_referrals < 5) {
        toast.error("You need at least 5 referrals to withdraw");
        return;
      }
    }

    if (amount > profile.balance) {
      toast.error("Insufficient balance");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { data: withdrawalData, error } = await supabase.from("withdrawals").insert({
        user_id: session?.user.id,
        amount,
        account_name: withdrawData.accountName,
        account_number: withdrawData.accountNumber,
        bank_name: withdrawData.bankName,
        status: "pending",
      }).select().single();

      if (error) throw error;

      // Create transaction
      await supabase.from("transactions").insert({
        user_id: session?.user.id,
        type: "debit",
        amount,
        description: `Withdrawal to ${withdrawData.bankName}`,
        status: "pending",
      });

      // Update balance
      const newBalance = profile.balance - amount;
      await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", session?.user.id);

      toast.success("Withdrawal request submitted!");
      
      // If toggle is ON, redirect to gateway activation
      if (requireReferrals) {
        navigate("/gateway-activation", { state: { withdrawalId: withdrawalData.id } });
      } else {
        navigate("/history");
      }
    } catch (error: any) {
      toast.error("Failed to submit withdrawal");
    } finally {
      setSubmitting(false);
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
          <h1 className="text-2xl font-bold">Withdraw Funds</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <div className="flex items-center justify-between mb-6 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-primary">₦{Number(profile.balance).toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-secondary" />
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <Label htmlFor="require-referrals">Enable Gateway Activation</Label>
                <p className="text-xs text-muted-foreground">Toggle to withdraw any amount (requires ₦13,250 activation fee)</p>
              </div>
              <Switch
                id="require-referrals"
                checked={requireReferrals}
                onCheckedChange={setRequireReferrals}
              />
            </div>

            {requireReferrals && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  ✓ Gateway activation allows you to withdraw any amount without restrictions. You'll pay a one-time ₦13,250 activation fee after submitting your withdrawal.
                </p>
              </div>
            )}

            {!requireReferrals && profile.total_referrals < 5 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  You have {profile.total_referrals} referrals. You need {5 - profile.total_referrals} more to withdraw, or enable Gateway Activation above.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount {!requireReferrals && `(Min: ₦${MINIMUM_WITHDRAW.toLocaleString()})`}
              </Label>
              <Input
                id="amount"
                type="number"
                required
                min={requireReferrals ? 0.01 : MINIMUM_WITHDRAW}
                max={profile.balance}
                value={withdrawData.amount}
                onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                type="text"
                required
                value={withdrawData.accountName}
                onChange={(e) => setWithdrawData({ ...withdrawData, accountName: e.target.value })}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                type="text"
                required
                value={withdrawData.accountNumber}
                onChange={(e) => setWithdrawData({ ...withdrawData, accountNumber: e.target.value })}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                type="text"
                required
                value={withdrawData.bankName}
                onChange={(e) => setWithdrawData({ ...withdrawData, bankName: e.target.value })}
                className="bg-background/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Withdrawal"}
            </Button>
          </form>
        </Card>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default Withdraw;
