import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingActionButton } from "@/components/FloatingActionButton";

interface Bank {
  name: string;
  code: string;
}

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
  const [resolvingAccountName, setResolvingAccountName] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCodes, setBankCodes] = useState<{ [key: string]: string }>({});

  // Fallback bank list in case Paystack API fails
  const fallbackBanks: Bank[] = [
    { name: "Access Bank", code: "044" },
    { name: "Citibank", code: "023" },
    { name: "Ecobank", code: "050" },
    { name: "FCMB", code: "214" },
    { name: "Fidelity Bank", code: "070" },
    { name: "First Bank", code: "011" },
    { name: "GTBank", code: "058" },
    { name: "Heritage Bank", code: "030" },
    { name: "Keystone Bank", code: "082" },
    { name: "Kuda Bank", code: "50211" },
    { name: ",Opay", code: "100004" },
    { name: "Palmpay", code: "100033" },
    { name: "Polaris Bank", code: "076" },
    { name: "Providus Bank", code: "101" },
    { name: "Stanbic IBTC", code: "221" },
    { name: "Standard Chartered", code: "068" },
    { name: "Sterling Bank", code: "232" },
    { name: "SunTrust Bank", code: "100" },
    { name: "UBA", code: "033" },
    { name: "Union Bank", code: "032" },
    { name: "Unity Bank", code: "215" },
    { name: "Wema Bank", code: "035" },
    { name: "Zenith Bank", code: "057" },
    { name: "Moniepoint MFB", code: "50515" },
    { name: "VFD MFB", code: "566" }
  ];

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

    const fetchBanks = async () => {
      try {
        console.log('Fetching banks from API...');
        const response = await fetch('/api/get-banks');
        console.log('Banks API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Banks API response data:', data);
          console.log('Banks array exists:', !!data.banks);
          console.log('Banks array length:', data.banks?.length);
          console.log('Banks array type:', typeof data.banks);
          console.log('First bank:', data.banks?.[0]);

          if (data.banks && data.banks.length > 0) {
            console.log('Setting banks from API:', data.banks.length);
            setBanks(data.banks);
            // Build bank code mapping
            const codes: { [key: string]: string } = {};
            data.banks.forEach((bank: Bank) => {
              codes[bank.name] = bank.code;
            });
            setBankCodes(codes);
            console.log('Loaded banks from Paystack API:', data.banks.length, data.fallback ? '(FALLBACK)' : '(LIVE)');
            return;
          } else {
            console.log('No banks returned from API - condition failed');
            console.log('data.banks:', data.banks);
            console.log('data.banks.length:', data.banks?.length);
          }
        } else {
          const errorData = await response.json();
          console.log('Banks API error:', errorData);
        }
      } catch (error) {
        console.warn('Failed to fetch banks from API', error);
      }

      // Fallback to hardcoded list
      console.log('Using fallback bank list');
      setBanks(fallbackBanks);
      const codes: { [key: string]: string } = {};
      fallbackBanks.forEach((bank) => {
        codes[bank.name] = bank.code;
      });
      setBankCodes(codes);
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
    fetchBanks();
    verifySession();
  }, [navigate]);

  // Resolve account name when account number or bank changes
  useEffect(() => {
    if (walletDetails.accountNumber.length === 10 && walletDetails.bankName && bankCodes[walletDetails.bankName]) {
      resolveAccountName(walletDetails.accountNumber, bankCodes[walletDetails.bankName]);
    }
  }, [walletDetails.accountNumber, walletDetails.bankName]);

  const resolveAccountName = async (accountNumber: string, bankCode: string) => {
    if (!accountNumber || !bankCode) return;

    console.log('Resolving account:', { accountNumber, bankCode });
    setResolvingAccountName(true);
    try {
      const payload = { accountNumber, bankCode };
      console.log('Sending payload:', payload);

      const response = await fetch('/api/verify-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Verification API error:', errorData);
        return;
      }

      const data = await response.json();
      console.log('API response:', data);

      if (data && data.accountName) {
        setWalletDetails(prev => ({ ...prev, accountName: data.accountName }));
      } else {
        console.warn('No account name returned from API');
      }
    } catch (error) {
      console.error('Error resolving account name:', error);
    } finally {
      setResolvingAccountName(false);
    }
  };

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
                <div className="relative">
                  <Input
                    id="accountName"
                    type="text"
                    value={walletDetails.accountName}
                    onChange={(e) => setWalletDetails({ ...walletDetails, accountName: e.target.value })}
                    placeholder="Enter name on account"
                    className="bg-background/50 pr-10"
                    readOnly={resolvingAccountName}
                  />
                  {resolvingAccountName && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {resolvingAccountName && (
                  <p className="text-xs text-muted-foreground">Resolving account name...</p>
                )}
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
                <Select
                  value={walletDetails.bankName}
                  onValueChange={(value) => setWalletDetails({ ...walletDetails, bankName: value })}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.name}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {usingFallbackBanks && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    ⚠️ Using limited bank list. Paystack API may be unavailable.
                  </p>
                )}
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
