import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, MessageCircle } from "lucide-react";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const UpgradePending = () => {
  const navigate = useNavigate();

  const TELEGRAM_SUPPORT = "https://t.me/Nairox9jasupport";

  return (
    <div className="min-h-screen liquid-bg pb-20">
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="bg-card/95 backdrop-blur-lg border-border/50 p-8 max-w-md w-full text-center glow-primary">

          {/* Failed Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-4 text-red-500">
            Payment Failed
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mb-6">
            Unfortunately, your upgrade verification payment could not be processed.
            Please contact our support team to resolve this issue.
          </p>

          {/* Warning Box */}
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left mb-8">
            <p className="text-sm text-red-400">
              ⚠️ Your payment may have been declined. Please reach out to support for assistance.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">

            <p className="text-sm font-semibold text-muted-foreground">
              Contact Support Immediately:
            </p>

            <Button
              onClick={() => (window.location.href = TELEGRAM_SUPPORT)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Telegram Support
            </Button>

            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="w-full"
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

export default UpgradePending;export default UpgradePending;
