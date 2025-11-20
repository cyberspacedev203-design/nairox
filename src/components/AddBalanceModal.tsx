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
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValidType) toast.error(`${file.name}: Invalid file type`);
      if (!isValidSize) toast.error(`${file.name}: File too large (max 5MB)`);
      return isValidType && isValidSize;
    });
    
    if (files.length + validFiles.length > 3) {
      toast.error("Maximum 3 files allowed");
      return;
    }
    
    setFiles([...files, ...validFiles]);
    e.target.value = ""; // Reset input
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
        .single();

      if (topupError) throw topupError;

      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop() || "file";
        const fileName = `${session.user.id}/topup_${topup.id}_${index}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

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
      onSuccess();
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
      {/* THIS IS THE ONLY CHANGE THAT FIXES SCROLLING */}
      <DialogContent className="max-w-lg p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Add Balance</DialogTitle>
        </DialogHeader>

        {/* SCROLLABLE BODY - THIS MAKES IT WORK ON ALL PHONES */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-4 space-y-5"
          style={{ WebkitOverflowScrolling: "touch" }} // Magic for iPhone
        >
          {/* Bank Details */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm border">
            <p className="font-bold text-base">Bank Details:</p>
            <div className="space-y-2">
              <p><span className="text-muted-foreground">Bank:</span> <strong>{BANK_DETAILS.bankName}</strong></p>
              <p><span className="text-muted-foreground">Name:</span> <strong>{BANK_DETAILS.accountName}</strong></p>
              <p><span className="text-muted-foreground">Account:</span> <strong className="font-mono text-lg">{BANK_DETAILS.accountNumber}</strong></p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-base">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount (min ₦1,000)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1000"
              className="h-12 text-lg"
            />
          </div>

          {/* Fee Breakdown */}
          {amountNum > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">₦{amountNum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee ({FEE_PERCENT}%):</span>
                <span className="font-semibold">₦{fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-3 mt-2 text-lg font-bold">
                <span>Total to Pay:</span>
                <span className="text-primary">₦{totalToPay.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Receipt Upload */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Upload Receipt (Required)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition">
              <input
                type="file"
                id="receipt-upload"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={files.length >= 3 || uploading}
              />
              <label
                htmlFor="receipt-upload"
                className={`cursor-pointer block ${files.length >= 3 || uploading ? 'opacity-50' : ''}`}
              >
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-msgid" />
                <p className="text-base">
                  {files.length >= 3 ? "Maximum 3 files reached" : "Click to upload receipt"}
                </p>
                <p className="text-sm text-muted-foreground">JPG, PNG, PDF (max 5MB each)</p>
              </label>
            </div>

            {/* File Previews */}
            {files.length > 0 && (
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {file.type === 'application/pdf' ? (
                        <FileText className="w-10 h-10 text-primary flex-shrink-0" />
                      ) : (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.size > 1024 * 1024 
                            ? (file.size / (1024 * 1024)).toFixed(1) + " MB" 
                            : (file.size / 1024).toFixed(1) + " KB"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
            <p className="font-bold text-yellow-700 dark:text-yellow-400">Important:</p>
            <p className="text-sm mt-1">Transfer the <strong>exact total amount</strong> above and upload clear receipt.</p>
          </div>
        </div>

        {/* Fixed Footer Button */}
        <div className="p-6 border-t flex-shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || amountNum < 1000 || files.length === 0}
            className="w-full h-12 text-base font-semibold"
          >
            {isSubmitting 
              ? (uploading ? "Uploading receipts..." : "Processing request...") 
              : "I've Paid & Attached Receipt"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};