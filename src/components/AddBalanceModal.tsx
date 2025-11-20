import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, FileText } from "lucide-react";

interface AddBalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const FEE_PERCENT = 2;
const BANK_DETAILS = {
  bankName: "Sterling Bank",
  accountName: "CHINEMEREM LIBERTY",
  accountNumber: "0108835271",
};

export const AddBalanceModal = ({ open, onOpenChange, onSuccess }: AddBalanceModalProps) => {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const amountNum = Number(amount) || 0;
  const fee = (amountNum * FEE_PERCENT) / 100;
  const totalToPay = amountNum + fee;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      if (!isValidType) toast.error(`${file.name}: Invalid file type`);
      if (!isValidSize) toast.error(`${file.name}: File too large (max 5MB)`);
      return isValidType && isValidSize;
    });
    
    if (files.length + validFiles.length > 3) {
      toast.error("Maximum 3 files allowed");
      return;
    }
    
    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (amountNum < 1000) {
      toast.error("Minimum amount is ₦1,000");
      return;
    }

    if (files.length === 0) {
      toast.error("Please upload at least one receipt");
      return;
    }

    setIsSubmitting(true);
    setUploading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Create top-up record
      const { data: topup, error: topupError } = await supabase
        .from("instant_activation_payments")
        .insert({
          user_id: session.user.id,
          amount: totalToPay,
          status: "pending",
          has_receipt: true,
          receipt_count: files.length,
        })
        .select()
        .maybeSingle();

      if (topupError) throw topupError;

      // Upload files to storage
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}/topup_${topup.id}_${index}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Store receipt metadata
        const { error: metaError } = await supabase
          .from('topup_receipts')
          .insert({
            topup_id: topup.id,
            storage_key: fileName,
            mime_type: file.type,
            file_size: file.size,
            uploaded_by: session.user.id,
          });

        if (metaError) throw metaError;
      });

      await Promise.all(uploadPromises);

      toast.success("Top-up request submitted! Processing...");
      onOpenChange(false);
      setAmount("");
      setFiles([]);
      
      setTimeout(() => {
        toast.info("Your deposit is being verified. Please wait...");
      }, 1000);
      
    } catch (error: any) {
      console.error("Top-up error:", error);
      toast.error(error.message || "Failed to submit top-up request");
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Balance</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Bank Details */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
            <p className="font-semibold">Bank Details:</p>
            <div className="space-y-1">
              <p><span className="text-muted-foreground">Bank:</span> {BANK_DETAILS.bankName}</p>
              <p><span className="text-muted-foreground">Name:</span> {BANK_DETAILS.accountName}</p>
              <p><span className="text-muted-foreground">Account:</span> {BANK_DETAILS.accountNumber}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1000"
            />
          </div>

          {/* Fee Breakdown */}
          {amountNum > 0 && (
            <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">₦{amountNum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee ({FEE_PERCENT}%):</span>
                <span className="font-semibold">₦{fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 mt-1">
                <span className="font-semibold">Total to Pay:</span>
                <span className="font-bold text-primary">₦{totalToPay.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label>Upload Receipt (Required)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <input
                type="file"
                id="receipt-upload"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={files.length >= 3}
              />
              <label
                htmlFor="receipt-upload"
                className={`cursor-pointer flex flex-col items-center gap-2 ${files.length >= 3 ? 'opacity-50' : ''}`}
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {files.length >= 3 
                    ? "Maximum 3 files" 
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground">JPG, PNG, PDF (max 5MB each)</p>
              </label>
            </div>

            {/* File previews */}
            {files.length > 0 && (
              <div className="space-y-2 mt-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted/50 p-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {file.type === 'application/pdf' ? (
                        <FileText className="w-5 h-5 text-primary" />
                      ) : (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-sm text-yellow-500">
            <p className="font-semibold">Note:</p>
            <p>A {FEE_PERCENT}% fee is added to all top-ups. Please transfer the total amount shown above and upload payment receipt.</p>
          </div>
        </div>

        {/* Button stays fixed at bottom */}
        <div className="pt-4 border-t border-border mt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || amountNum < 1000 || files.length === 0}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {isSubmitting 
              ? uploading 
                ? "Uploading..." 
                : "Processing..." 
              : "I've Paid & Attached Receipt"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};