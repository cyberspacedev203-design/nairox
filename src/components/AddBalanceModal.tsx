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
  bankName: "Moniepoint",
  accountName: "DEBORAH VINCENT",
  accountNumber: "5045609512",
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
      <DialogContent className="bg-card border-border max-h-[85vh] w-[95vw] sm:w-[500px] md:w-[550px] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <DialogTitle className="text-xl">Add Balance</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-6">
          {/* Bank Details */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm border border-border">
            <p className="font-semibold text-base">Bank Details:</p>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-semibold">{BANK_DETAILS.bankName}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Account Name:</span>
                <span className="font-semibold">{BANK_DETAILS.accountName}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-semibold text-lg">{BANK_DETAILS.accountNumber}</span>
              </p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-base font-medium">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount (minimum ₦1,000)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1000"
              className="h-12 text-base"
            />
          </div>

          {/* Fee Breakdown */}
          {amountNum > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm border border-border">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">₦{amountNum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Fee ({FEE_PERCENT}%):</span>
                <span className="font-semibold">₦{fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2 text-lg">
                <span className="font-bold">Total to Pay:</span>
                <span className="font-bold text-primary">₦{totalToPay.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Receipt Upload */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Upload Receipt (Required)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
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
                className={`cursor-pointer flex flex-col items-center gap-3 ${files.length >= 3 ? 'opacity-50' : 'hover:opacity-80'}`}
              >
                <Upload className="w-10 h-10 text-muted-foreground" />
                <p className="text-base text-muted-foreground">
                  {files.length >= 3 
                    ? "Maximum 3 files reached" 
                    : "Click to upload receipt"}
                </p>
                <p className="text-sm text-muted-foreground">JPG, PNG, PDF (max 5MB each)</p>
              </label>
            </div>

            {/* File previews */}
            {files.length > 0 && (
              <div className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">Uploaded files:</p>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      {file.type === 'application/pdf' ? (
                        <FileText className="w-8 h-8 text-primary" />
                      ) : (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <p className="text-base font-medium truncate max-w-[220px]">
                          {file.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="h-9 w-9 p-0"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-sm text-yellow-500">
            <p className="font-semibold text-base mb-2">Important Note:</p>
            <p>A {FEE_PERCENT}% fee is added to all top-ups. Please transfer the exact total amount shown above and upload your payment receipt for verification.</p>
          </div>
        </div>

        {/* Fixed Button at Bottom */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-card/80 backdrop-blur-sm">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || amountNum < 1000 || files.length === 0}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-base font-semibold"
          >
            {isSubmitting 
              ? uploading 
                ? "Uploading Receipts..." 
                : "Processing Request..." 
              : "I've Paid & Attached Receipt"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};