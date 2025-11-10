import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SpinWheel } from "@/components/SpinWheel";
import { AddBalanceModal } from "@/components/AddBalanceModal";

type SpinOutcome = "WIN" | "LOSE" | "TRY_AGAIN";

const Spin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [selectedStake, setSelectedStake] = useState("50000");
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<SpinOutcome | null>(null);
  const [lastDelta, setLastDelta] = useState(0);
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinOutcome | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    } else {
      setUser(session.user);
      loadBalance(session.user.id);
    }
  };

  const loadBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setBalance(Number(data.balance) || 0);
    } catch (error: any) {
      toast.error("Failed to load balance");
    }
  };

  const handleSpin = async () => {
    const stake = Number(selectedStake);
    
    if (balance < stake) {
      setShowAddBalance(true);
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    setSpinResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to spin");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("spin", {
        body: { stake },
      });

      if (error) {
        console.error("Spin error:", error);
        throw error;
      }

      const { outcome, delta, newBalance } = data;
      
      // Set spin result to trigger wheel animation
      setSpinResult(outcome);
      
      // Wait for wheel animation to complete
      setTimeout(() => {
        setLastOutcome(outcome);
        setLastDelta(delta);
        setBalance(newBalance);
        setShowResult(true);
        setIsSpinning(false);
      }, 4000); // Match wheel animation duration

    } catch (error: any) {
      console.error("Spin failed:", error);
      toast.error(error.message || "Spin failed—no charges made. Try again.");
      setIsSpinning(false);
      setSpinResult(null);
    }
  };

  const getResultMessage = () => {
    if (!lastOutcome) return "";
    
    switch (lastOutcome) {
      case "WIN":
        return `🎉 You Won! +₦${Math.abs(lastDelta).toLocaleString()}`;
      case "LOSE":
        return `😢 You Lost! -₦${Math.abs(lastDelta).toLocaleString()}`;
      case "TRY_AGAIN":
        return `🔄 Try Again! -₦${Math.abs(lastDelta).toLocaleString()} (Spin again for free!)`;
    }
  };

  const getResultColor = () => {
    switch (lastOutcome) {
      case "WIN":
        return "text-green-500";
      case "LOSE":
        return "text-destructive";
      case "TRY_AGAIN":
        return "text-yellow-500";
      default:
        return "";
    }
  };

  const stake = Number(selectedStake);
  const canSpin = balance >= stake && !isSpinning;

  return (
    <div className="min-h-screen liquid-bg pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-background/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Spin & Win</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Wallet Balance */}
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-4">
          <p className="text-sm text-muted-foreground">Wallet Balance</p>
          <h2 className="text-3xl font-bold gradient-text">₦{balance.toLocaleString()}.00</h2>
        </Card>

        {/* Stake Selector */}
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-3">Select Stake</h3>
          <RadioGroup value={selectedStake} onValueChange={setSelectedStake}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="50000" id="stake1" />
                <Label htmlFor="stake1" className="cursor-pointer">₦50,000</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="100000" id="stake2" />
                <Label htmlFor="stake2" className="cursor-pointer">₦100,000</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="150000" id="stake3" />
                <Label htmlFor="stake3" className="cursor-pointer">₦150,000</Label>
              </div>
            </div>
          </RadioGroup>
        </Card>

        {/* Spin Wheel */}
        <SpinWheel isSpinning={isSpinning} result={spinResult} />

        {/* Result Banner */}
        {showResult && (
          <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-4 animate-fade-in">
            <p className={`text-center text-lg font-bold ${getResultColor()}`}>
              {getResultMessage()}
            </p>
            <p className="text-center text-sm text-muted-foreground mt-1">
              New Balance: ₦{balance.toLocaleString()}.00
            </p>
          </Card>
        )}

        {/* Spin Button */}
        <Button
          onClick={handleSpin}
          disabled={!canSpin}
          className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50"
        >
          {isSpinning ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Spinning...
            </>
          ) : !canSpin && balance < stake ? (
            "Insufficient Balance"
          ) : (
            `Spin (₦${stake.toLocaleString()})`
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Odds: Win 15% · Try Again 25% · Lose 60%
        </p>

        {/* Add Balance Button */}
        {balance < stake && (
          <Button
            onClick={() => setShowAddBalance(true)}
            variant="outline"
            className="w-full"
          >
            Add Balance
          </Button>
        )}
      </div>

      <AddBalanceModal
        open={showAddBalance}
        onOpenChange={setShowAddBalance}
        onSuccess={() => {
          if (user) loadBalance(user.id);
        }}
      />
    </div>
  );
};

export default Spin;
