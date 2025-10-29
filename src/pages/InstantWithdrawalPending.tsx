import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MessageCircle } from "lucide-react";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const InstantWithdrawalPending = () => {
  const navigate = useNavigate();

  const openWhatsApp = () => {
    window.open("https://wa.me/2347059382766", "_blank");
  };

  const openTelegram = () => {
    window.open("https://t.me/Chixx9ja", "_blank");
  };

  return (
    <div className="min-h-screen liquid-bg pb-20">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold text-center">Payment Pending</h1>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Payment Under Review</h2>
          
          <p className="text-muted-foreground mb-6">
            Your instant withdrawal activation payment of ₦12,600 has been received and is currently being reviewed. 
            This process may take up to 24 hours.
          </p>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              💡 Once approved, you'll be able to withdraw without needing any referrals!
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold mb-2">Need help? Contact support:</p>
            
            <Button
              onClick={openWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp Support
            </Button>

            <Button
              onClick={openTelegram}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Telegram Support
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

export default InstantWithdrawalPending;
