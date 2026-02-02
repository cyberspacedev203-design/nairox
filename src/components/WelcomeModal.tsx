import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"initial" | "verification">("initial");

  useEffect(() => {
    const hasCompletedVerification = sessionStorage.getItem("telegram_verification_completed");
    if (!hasCompletedVerification) {
      setIsOpen(true);
      setStep("initial");
    }
  }, []);

  const handleJoinTelegram = () => {
    if (step === "initial") {
      window.open("https://t.me/tivexxglobal", "_blank", "noopener,noreferrer");
      setStep("verification");
    } else if (step === "verification") {
      sessionStorage.setItem("telegram_verification_completed", "true");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && setIsOpen(open)}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden border-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">📢</span>
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-gray-800">
              {step === "initial" ? "Welcome to Tivexx_Global! 🎉" : "Almost There! ✅"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-gray-700 text-lg font-medium mb-2">
                {step === "initial"
                  ? "Join our Telegram channel for exclusive updates, tips, and support! 🚀"
                  : "Join our Telegram channel to continue"}
              </p>
              {step === "initial" ? (
                <p className="text-gray-500">
                  Get instant notifications about new features and earn extra rewards! ✨
                </p>
              ) : (
                <p className="text-gray-500">
                  Click below after joining our Telegram channel
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleJoinTelegram}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] min-h-[48px] text-lg"
              >
                {step === "initial" ? "Join Telegram Channel →" : "Verify & Continue →"}
              </button>
              
              {step === "verification" && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Click after joining Telegram</span>
                </div>
              )}
            </div>
            
            {step === "initial" && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">🔥</span>
                    <span className="text-sm">Exclusive Updates</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">💰</span>
                    <span className="text-sm">Extra Rewards</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">⚡</span>
                    <span className="text-sm">Quick Support</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};