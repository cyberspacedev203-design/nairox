import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, MessageCircle } from "lucide-react";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const WithdrawalActivationPending = () => {
  const navigate = useNavigate();

  const openTelegram = () => {
    window.location.href = "https://t.me/Nairox9jasupport";
  };

  return (
    <div className="min-h-screen liquid-bg pb-20">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold text-center">Payment Failed</h1>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
              <X className="w-12 h-12 text-red-500 font-bold" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4 text-red-500">Payment Failed</h2>
          
          <p className="text-muted-foreground mb-6">
            Unfortunately, your withdrawal verification payment could not be processed. 
            Please contact our support team to resolve this issue.
          </p>

          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
            <p className="text-sm text-red-600 dark:text-red-400">
              ⚠️ Your payment may have been declined. Please reach out to support for assistance.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold mb-2">Contact Support Immediately:</p>
            
            <Button
              onClick={openTelegram}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Telegram Support
            </Button>

            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="w-full mt-4"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default WithdrawalActivationPending;
