import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, MessageCircle } from "lucide-react";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const GatewayPending = () => {
  const navigate = useNavigate();

  const openTelegram = () => {
    window.location.href = "https://t.me/Nairox9jasupport";
  };

  return (
    <div className="min-h-screen liquid-bg pb-20">
      <div className="bg-gradient-to-r from-destructive to-red-600 p-6 text-white">
        <h1 className="text-2xl font-bold text-center">Payment Failed</h1>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-lg border-red-500/30 p-8 text-center">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <X className="w-16 h-16 text-red-600 font-bold" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Failed</h2>
          <p className="text-muted-foreground mb-6 font-semibold">
            Your payment could not be processed. Please contact support immediately to resolve this issue.
          </p>
          <div className="bg-red-500/10 p-4 rounded-lg mb-6 border border-red-500/30">
            <p className="text-sm font-bold mb-2 text-red-600">⚠️ Immediate Action Required</p>
            <p className="text-sm text-muted-foreground">
              You must contact support to troubleshoot your payment issue
            </p>
          </div>
        </Card>

        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <h3 className="font-semibold mb-4">Contact Support</h3>
          <div className="space-y-3">
            <Button
              onClick={openTelegram}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Telegram Support
            </Button>
          </div>
        </Card>

        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="w-full"
        >
          Back to Dashboard
        </Button>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default GatewayPending;
