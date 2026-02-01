import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const Withdraw = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawalTier, setWithdrawalTier] = useState<"light" | "standard">("light"); // light: 50k+2ref, standard: 100k+5ref
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
  });

  const nigerianBanks = [
    "Access Bank", "Citibank", "Ecobank", "FCMB", "Fidelity Bank",
    "First Bank", "GTBank", "Heritage Bank", "Keystone Bank", "Kuda Bank",
    "Opay", "Palmpay", "Polaris Bank", "Providus Bank", "Stanbic IBTC",
    "Standard Chartered", "Sterling Bank", "SunTrust Bank", "UBA", "Union Bank",
    "Unity Bank", "Wema Bank", "Zenith Bank", "Moniepoint MFB", "VFD MFB"
  ].sort();

  // Tier-specific settings
  const tiers = {
    light: { minAmount: 50000, requiredReferrals: 2, name: "Light (Quick)" },
    standard: { minAmount: 100000, requiredReferrals: 5, name: "Standard (More Earnings)" }
  };

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

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    const tier = tiers[withdrawalTier];
    const amount = Math.floor(Number(withdrawData.amount));
    
    // Validate whole numbers only (Naira)
    if (!Number.isInteger(Number(withdrawData.amount)) || withdrawData.amount.includes('.')) {
      toast.error("Please enter whole numbers only (no decimals). Amount must be in Naira (₦).");
      return;
    }

    if (amount < 1) {
      toast.error("Amount must be at least ₦1");
      return;
    }
    
    if (amount < tier.minAmount) {
      toast.error(`Minimum withdrawal for ${tier.name} is ₦${tier.minAmount.toLocaleString()}`);
      return;
    }

    if (amount > profile.balance) {
      toast.error("Insufficient balance");
      return;
    }

    // Check referral requirement
    if (profile.total_referrals < tier.requiredReferrals) {
      toast.error(`You need at least ${tier.requiredReferrals} referrals for ${tier.name}`);
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Create withdrawal record
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from("withdrawals")
        .insert({
          user_id: session?.user.id,
          amount,
          account_name: withdrawData.accountName,
          account_number: withdrawData.accountNumber,
          bank_name: withdrawData.bankName,
          type: withdrawalTier,
          status: "awaiting_activation_payment",
        })
        .select()
        .maybeSingle();

      if (withdrawalError) throw withdrawalError;

      // Now prompt for activation AFTER submission
      if (withdrawalTier === "light") {
        // Light: lower/no activation
        toast.success("Withdrawal submitted! Processing...");
        navigate("/history");
      } else {
        // Standard: activation required
        toast.info("Standard withdrawal requires ₦6,660 activation fee");
        navigate("/withdrawal-activation", { state: { withdrawalId: withdrawal.id } });
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

          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <Label className="text-base font-semibold mb-3 block">Choose Withdrawal Type</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWithdrawalTier("light")}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  withdrawalTier === "light"
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-card/50 hover:border-primary/50"
                }`}
              >
                <p className="font-semibold text-sm">⚡ Light</p>
                <p className="text-xs text-muted-foreground">₦50,000+ • 2 referrals</p>
              </button>
              <button
                type="button"
                onClick={() => setWithdrawalTier("standard")}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  withdrawalTier === "standard"
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-card/50 hover:border-primary/50"
                }`}
              >
                <p className="font-semibold text-sm">💯 Standard</p>
                <p className="text-xs text-muted-foreground">₦100,000+ • 5 referrals</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (₦) (Min: ₦{tiers[withdrawalTier].minAmount.toLocaleString()})
              </Label>
              <Input
                id="amount"
                type="number"
                required
                step="1"
                min={tiers[withdrawalTier].minAmount}
                max={Math.floor(profile.balance)}
                value={withdrawData.amount}
                onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                placeholder="Enter amount (whole numbers only)"
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Enter whole numbers only. No decimals allowed.</p>
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
              <Select
                value={withdrawData.bankName}
                onValueChange={(value) => setWithdrawData({ ...withdrawData, bankName: value })}
                required
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {nigerianBanks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
