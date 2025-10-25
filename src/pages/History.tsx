import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const History = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    return type === "credit" ? TrendingUp : TrendingDown;
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
          <h1 className="text-2xl font-bold">Transaction History</h1>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : transactions.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-8 text-center">
            <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No transactions yet</p>
          </Card>
        ) : (
          transactions.map((transaction) => {
            const Icon = getIcon(transaction.type);
            return (
              <Card key={transaction.id} className="bg-card/80 backdrop-blur-lg border-border/50 p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    transaction.type === "credit" ? "bg-green-500/10" : "bg-red-500/10"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      transaction.type === "credit" ? "text-green-500" : "text-red-500"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className={`text-lg font-bold ${
                    transaction.type === "credit" ? "text-green-500" : "text-red-500"
                  }`}>
                    {transaction.type === "credit" ? "+" : "-"}₦{Number(transaction.amount).toLocaleString()}
                  </p>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default History;
