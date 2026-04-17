import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const WalletDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [walletDetails, setWalletDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [hasWallet, setHasWallet] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    const loadSavedWallet = () => {
      const savedWallet = localStorage.getItem("walletDetails");
      if (savedWallet) {
        try {
          const parsed = JSON.parse(savedWallet);
          const hasSavedWallet =
            Boolean(parsed.accountName) &&
            Boolean(parsed.accountNumber) &&
            Boolean(parsed.bankName);

          setWalletDetails({
            accountName: parsed.accountName || "",
            accountNumber: parsed.accountNumber || "",
            bankName: parsed.bankName || "",
          });
          setHasWallet(hasSavedWallet);
          setIsEditing(!hasSavedWallet);
        } catch (error) {
          console.warn("Failed to parse saved wallet details", error);
          setHasWallet(false);
          setIsEditing(true);
        }
      } else {
        setHasWallet(false);
        setIsEditing(true);
      }
    };

    const verifySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }
      } catch (error: any) {
        toast.error("Failed to verify auth");
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    loadSavedWallet();
    verifySession();
  }, [navigate]);

  const handleSave = () => {
    const accountName = walletDetails.accountName.trim();
    const accountNumber = walletDetails.accountNumber.trim();
    const bankName = walletDetails.bankName.trim();

    if (!accountName || !accountNumber || !bankName) {
      setMessage("Please fill in all wallet/account fields before saving.");
      return;
    }

    setSaving(true);
    try {
      localStorage.setItem(
        "walletDetails",
        JSON.stringify({ accountName, accountNumber, bankName })
      );
      setMessage(null);
      setHasWallet(true);
      setIsEditing(false);
      toast.success("Wallet details saved successfully.");
    } catch (error) {
      toast.error("Could not save wallet details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    localStorage.removeItem("walletDetails");
    setWalletDetails({ accountName: "", accountNumber: "", bankName: "" });
    setMessage(null);
    setHasWallet(false);
    setIsEditing(true);
    toast.success("Wallet details deleted.");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
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
          <div>
            <h1 className="text-2xl font-bold">Wallet Details</h1>
            <p className="text-sm text-muted-foreground">
              Enter the account details you will use for withdrawals.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <div className="rounded-3xl border border-primary/10 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-primary">Withdrawal Wallet</p>
            <p className="text-sm text-muted-foreground mt-2">
              This is the destination you will use when withdrawing funds from your account.
            </p>
          </div>
        </Card>

        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Wallet Settings</h2>
              <p className="text-sm text-muted-foreground">
                Delete or edit the withdrawal wallet you have saved.
              </p>
            </div>
            {hasWallet && !isEditing && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleEdit}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  className="border border-rose-200 text-rose-700 hover:bg-rose-50"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          {hasWallet && !isEditing ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-border/50 bg-muted/50 p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Account / Wallet Name</p>
                  <p className="text-lg font-semibold">{walletDetails.accountName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Account / Wallet Number</p>
                  <p className="text-lg font-semibold font-mono">{walletDetails.accountNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bank / Wallet Provider</p>
                  <p className="text-lg font-semibold">{walletDetails.bankName}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account / Wallet Name</Label>
                <Input
                  id="accountName"
                  type="text"
                  value={walletDetails.accountName}
                  onChange={(e) => setWalletDetails({ ...walletDetails, accountName: e.target.value })}
                  placeholder="Enter name on account"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account / Wallet Number</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  value={walletDetails.accountNumber}
                  onChange={(e) => setWalletDetails({ ...walletDetails, accountNumber: e.target.value })}
                  placeholder="Enter account or wallet number"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank / Wallet Provider</Label>
                <Input
                  id="bankName"
                  type="text"
                  value={walletDetails.bankName}
                  onChange={(e) => setWalletDetails({ ...walletDetails, bankName: e.target.value })}
                  placeholder="Enter bank or wallet provider"
                  className="bg-background/50"
                />
              </div>

              {message && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {message}
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={saving || loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white"
              >
                {saving ? "Saving..." : "Save Wallet Details"}
              </Button>
            </div>
          )}
        </Card>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default WalletDetails;
