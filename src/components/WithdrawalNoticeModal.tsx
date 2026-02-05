import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Lightbulb } from "lucide-react";

interface WithdrawalNoticeModalProps {
  onContinue: () => void;
  onCancel: () => void;
}

const WithdrawalNoticeModal = ({ onContinue, onCancel }: WithdrawalNoticeModalProps) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 border border-border/50 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              ⚠️ Withdrawal Notice
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Before proceeding with withdrawal, please read carefully:
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Choose Your Withdrawal Type */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                💡 Choose Your Withdrawal Type
              </h3>
            </div>

            <div className="space-y-4 ml-7">
              {/* Light Withdrawal */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Light Withdrawal
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Minimum balance: ₦150,000</li>
                  <li>• Requires 5 successful referrals</li>
                  <li>• No account upgrade needed</li>
                </ul>
              </div>

              {/* Standard Withdrawal */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-4 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Standard Withdrawal
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Minimum balance: ₦150,000</li>
                  <li>• No referral required</li>
                  <li>• Account upgrade is required before withdrawal</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Important */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                ✅ Important
              </h3>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/30 dark:to-green-900/20 p-4 rounded-lg border border-green-200/50 dark:border-green-800/50 ml-7">
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Ensure you meet the requirements of your chosen withdrawal option.</li>
                <li>• Incomplete requirements may delay or block your withdrawal request.</li>
              </ul>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 p-4 rounded-lg border border-primary/20 dark:border-primary/30">
            <p className="text-sm text-gray-900 dark:text-white font-medium">
              👉 Please select the withdrawal option that best suits you.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-border/50">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Go Back
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalNoticeModal;
