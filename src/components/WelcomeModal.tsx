import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WelcomeModalProps {
  userId?: string | null;
}

export const WelcomeModal = ({ userId }: WelcomeModalProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"initial" | "verifying">("initial");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "Getmemberrrbot";

  useEffect(() => {
    if (!userId) return;

    const verificationKey = `telegram_channel_verified_${userId}`;
    const verified = localStorage.getItem(verificationKey) === "true";

    if (verified) {
      setIsVerified(true);
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setStep("initial");
    }
  }, [userId]);

  // Poll for verification every 2 seconds
  useEffect(() => {
    if (step !== "verifying" || !userId) return;

    const interval = setInterval(async () => {
      const verificationKey = `telegram_channel_verified_${userId}`;
      const verified = localStorage.getItem(verificationKey) === "true";

      if (verified) {
        clearInterval(interval);
        setIsVerified(true);
        setIsOpen(false);
        toast.success("Telegram verification complete!");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [step, userId, toast]);

  const handleOpenBotVerification = () => {
    if (!userId) {
      toast.error("User ID not found. Please reload the page.");
      return;
    }

    // Generate deep link to bot with user ID
    const deepLink = `https://t.me/${BOT_USERNAME}?start=${userId}`;
    window.open(deepLink, "_blank");

    setStep("verifying");
    setIsLoading(true);

    // Show a message that we're waiting
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  const handleVerificationComplete = () => {
    if (!userId) return;

    const verificationKey = `telegram_channel_verified_${userId}`;
    localStorage.setItem(verificationKey, "true");
    setIsVerified(true);
    setIsOpen(false);
    toast.success("Telegram verification complete!");
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-white font-medium">Waiting for verification...</p>
            <p className="text-white/70 text-sm mt-2">Follow the bot to complete verification</p>
          </div>
        </div>
      )}

      <Dialog
        open={isOpen && !isLoading}
        onOpenChange={(open) => {
          if (!isVerified) {
            setIsOpen(true);
          } else {
            setIsOpen(open);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          hideCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {step === "initial" ? "Welcome to Nairox9ja ! 🎉" : "Verifying Membership"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-center text-lg">
              {step === "initial"
                ? "Verify your Telegram channel membership to continue."
                : "Please complete verification with the bot."}
            </p>

            <p className="text-center text-sm text-muted-foreground">
              {step === "initial"
                ? "Click the button below to open our verification bot. It will confirm you are a channel member."
                : "Open the Telegram bot link again or click 'I have verified' below when done."}
            </p>

            <div className="space-y-2">
              <Button
                onClick={handleOpenBotVerification}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === "initial" ? "Verify with Bot 🤖" : "Open Bot Again"}
              </Button>

              {step === "verifying" && (
                <Button
                  onClick={handleVerificationComplete}
                  variant="outline"
                  className="w-full py-3 px-4 rounded-lg touch-manipulation min-h-[44px]"
                >
                  I have verified ✓
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

