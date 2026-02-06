import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, MessageCircle, Send } from "lucide-react";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const UpgradePending = () => {
  const navigate = useNavigate();

  const TELEGRAM_SUPPORT = "https://t.me/Nairox9jasupport";

  return (
    <div className="min-h-screen liquid-bg pb-20">
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="bg-card/95 backdrop-blur-lg border-red-500/30 p-8 max-w-md w-full text-center glow-red-500">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/30">
            <X className="w-14 h-14 text-red-600 font-bold" />
          </div>

          <h1 className="text-2xl font-bold mb-2 text-red-600">Payment Failed</h1>
          <p className="text-muted-foreground mb-6 font-semibold">
            Your upgrade payment could not be processed. Please contact our support team immediately to resolve this issue.
          </p>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-red-500/10 rounded-lg text-left border border-red-500/30">
              <p className="text-sm font-semibold mb-2 text-red-600">⚠️ Action Required</p>
              <p className="text-sm text-muted-foreground">Contact support to troubleshoot your payment issue</p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg text-left">
              <p className="text-sm font-semibold mb-2">💬 How to Get Help</p>
              <p className="text-sm text-muted-foreground">Reach out via Telegram for immediate assistance</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-red-600 mb-3">Contact Support Now</p>
            
            <Button
              onClick={() => (window.location.href = TELEGRAM_SUPPORT)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <Send className="w-4 h-4 mr-2" />
              Message Support on Telegram
            </Button>

            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="w-full mt-6"
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

export default UpgradePending;