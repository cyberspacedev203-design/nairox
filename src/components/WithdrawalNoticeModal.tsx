import { Button } from "@/components/ui/button";

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
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4 border border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          ⚠️ Withdrawal Notice
        </h2>

        {/* Content */}
        <div className="space-y-3 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Before proceeding, please review the withdrawal types:
          </p>

          {/* Light Withdrawal */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200/50 dark:border-blue-800/50">
            <p className="font-semibold text-gray-900 dark:text-white">Light Withdrawal</p>
            <ul className="text-xs text-gray-700 dark:text-gray-300 mt-1 space-y-1">
              <li>• Min: ₦150,000</li>
              <li>• Requires 5 referrals</li>
              <li>• No upgrade needed</li>
            </ul>
          </div>

          {/* Standard Withdrawal */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded border border-emerald-200/50 dark:border-emerald-800/50">
            <p className="font-semibold text-gray-900 dark:text-white">Standard Withdrawal</p>
            <ul className="text-xs text-gray-700 dark:text-gray-300 mt-1 space-y-1">
              <li>• Min: ₦150,000</li>
              <li>• No referrals needed</li>
              <li>• Upgrade required</li>
            </ul>
          </div>

          {/* Important */}
          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded border border-yellow-200/50 dark:border-yellow-800/50">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              <strong>Note:</strong> Ensure you meet the requirements. Incomplete requirements may delay your request.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-border/50">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 text-sm h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-sm h-9"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalNoticeModal;
