import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter(f => {
      const okType = ["image/jpeg", "image/jpg", "image/png", "application/pdf"].includes(f.type);
      const okSize = f.size <= 5 * 1024 * 1024;
      if (!okType) toast.error(`${f.name}: Wrong type`);
      if (!okSize) toast.error(`${f.name}: Max 5MB`);
      return okType && okSize;
    });

    if (files.length + valid.length > 3) {
      toast.error("Max 3 files only");
      return;
    }
    setFiles(prev => [...prev, ...valid]);
    e.target.value = "";
  };

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (amountNum < 1000) return toast.error("Minimum ₦1,000");
    if (!files.length) return toast.error("Upload receipt");

    setIsSubmitting(true);
    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Login required");

      const { data: topup, error } = await supabase
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

      if (error || !topup) throw error || "Failed";

      await Promise.all(
        files.map(async (file, i) => {
          const ext = file.name.split(".").pop() || "file";
          const path = `${session.user.id}/topup_${topup.id}_${i}.${ext}`;
          const { error: up } = await supabase.storage.from("receipts").upload(path, file);
          if (up) throw up;
          const { error: meta } = await supabase.from("topup_receipts").insert({
            topup_id: topup.id,
            storage_key: path,
            mime_type: file.type,
            file_size: file.size,
            uploaded_by: session.user.id,
          });
          if (meta) throw meta;
        })
      );

      toast.success("Submitted! We go verify sharpaly");
      onSuccess();
      onOpenChange(false);
      setAmount("");
      setFiles([]);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 border-b flex items-center justify-between flex-shrink-0">
          <DialogTitle className="text-xl font-bold">Add Balance</DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        {/* SCROLLABLE MIDDLE — THIS IS THE ONE THAT WORKS ON ALL PHONES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ WebkitOverflowScrolling: "touch" }}>
          {/* Bank Details */}
          <div className="bg-muted/50 p-5 rounded-xl border">
            <p className="font-bold mb-3">Transfer to:</p>
            <div className="space-y-2">
              <p><span className="text-muted-foreground">Bank:</span> {BANK_DETAILS.bankName}</p>
              <p><span className="text-muted-foreground">Name:</span> {BANK_DETAILS.accountName}</p>
              <p><span className="text-muted-foreground">Account:</span> <strong className="font-mono text-lg">{BANK_DETAILS.accountNumber}</strong></p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Amount (₦)</Label>
            <Input type="number" placeholder="Min ₦1,000" value={amount} onChange={e => setAmount(e.target.value)} className="h-12" />
          </div>

          {amountNum >= 1000 && (
            <div className="bg-muted/50 p-5 rounded-xl border space-y-3">
              <div className="flex justify-between"><span>Amount</span><span>₦{amountNum.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Fee (2%)</span><span>₦{fee.toLocaleString()}</span></div>
              <div className="pt-3 border-t font-bold text-lg flex justify-between">
                <span>Total to Pay</span>
                <span className="text-primary">₦{totalToPay.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Label>Upload Receipt (max 3)</Label>
            <div className="border-2 border-dashed rounded-xl p-8 text-center">
              <input type="file" id="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" disabled={files.length >= 3} />
              <label htmlFor="file" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p>{files.length >= 3 ? "Max reached" : "Tap to upload"}</p>
              </label>
            </div>

            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg">
                {f.type.startsWith("image/") ? <img src={URL.createObjectURL(f)} className="w-12 h-12 rounded object-cover" alt="" /> : <FileText className="w-12 h-12" />}
                <div className="flex-1">
                  <p className="text-sm truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(i)}><X /></Button>
              </div>
            ))}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
            <p className="font-bold">Send EXACT total amount above!</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex-shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || amountNum < 1000 || files.length === 0}
            className="w-full h-12 font-bold text-lg"
          >
            {isSubmitting ? "Submitting..." : "I've Paid & Uploaded Receipt"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};