import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"initial" | "verification">( "initial");

  useEffect(() => {
    // Check if user has completed the Telegram verification in this session
    const hasCompletedVerification = sessionStorage.getItem("telegram_verification_completed");
    if (!hasCompletedVerification) {
      setIsOpen(true);
      setStep("initial");
    }
  }, []);

  const handleJoinTelegram = () => {
    if (step === "initial") {
      // First click: show verification message and reopen
      window.open("https://t.me/Nairox9ja", "_blank", "rel=opener");
      setStep("verification");
    } else if (step === "verification") {
      // Second click: mark as complete and close permanently
      sessionStorage.setItem("telegram_verification_completed", "true");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        hideCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {step === "initial" ? "Welcome to Nairox9ja ! 🎉" : "Verification Needed"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-center text-lg">
            {step === "initial"
              ? "Join our Telegram channel for exclusive updates, tips, and support! 🚀✨"
              : "Couldn't be verified. Join our Telegram channel to continue."}
          </p>
          {step === "initial" && (
            <p className="text-center text-muted-foreground">
              Get instant notifications about new features and earn extra rewards! 💰🔥
            </p>
          )}
          <div className="space-y-2">
            <button
              onClick={handleJoinTelegram}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all touch-manipulation min-h-[44px]"
            >
              {step === "initial" ? "Join Telegram Channel 📢" : "Verify & Continue"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
