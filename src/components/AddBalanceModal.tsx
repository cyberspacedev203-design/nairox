import { useState } from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";
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
    const valid = selected.filter(file => {
      const okType = ["image/jpeg", "image/jpg", "image/png", "application/pdf"].includes(file.type);
      const okSize = file.size <= 5 * 1024 * 1024;
      if (!okType) toast.error(`${file.name}: Wrong file type`);
      if (!okSize) toast.error(`${file.name}: Max 5MB`);
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
    if (files.length === 0) return toast.error("Upload at least one receipt");

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

      if (error || !topup) throw error || new Error("Failed");

      await Promise.all(
        files.map(async (file, i) => {
          const ext = file.name.split(".").pop() || "file";
          const path = `${session.user.id}/topup_${topup.id}_${i}.${ext}`;

          const { error: upErr } = await supabase.storage
            .from("receipts")
            .upload(path, file, { upsert: false });
          if (upErr) throw upErr;

          const { error: metaErr } = await supabase
            .from("topup_receipts")
            .insert({
              topup_id: topup.id,
              storage_key: path,
              mime_type: file.type,
              file_size: file.size,
              uploaded_by: session.user.id,
            });
          if (metaErr) throw metaErr;
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
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/60 z-50" />

        {/* THIS IS THE ONLY THING THAT CHANGED — removed overflow-y-auto from here */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <DialogTitle className="text-xl font-bold">Add Balance</DialogTitle>
              <button onClick={() => onOpenChange(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* SCROLLABLE BODY — this one now actually scrolls on phone */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* ←←← ALL YOUR CONTENT SAME AS BEFORE ←←← */}
              {/* Bank details */}
              <div className="bg-muted/50 p-5 rounded-lg border">
                <p className="font-bold mb-3">Transfer to:</p>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Bank</span><span className="font-medium">{BANK_DETAILS.bankName}</span></div>
                  <div className="flex justify-between"><span>Name</span><span className="font-medium">{BANK_DETAILS.accountName}</span></div>
                  <div className="flex justify-between"><span>Account No.</span><span className="font-mono text-lg">{BANK_DETAILS.accountNumber}</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Amount (₦)</Label>
                <Input type="number" placeholder="Min ₦1,000" value={amount} onChange={e => setAmount(e.target.value)} className="h-12" />
              </div>

              {amountNum >= 1000 && (
                <div className="bg-muted/50 p-5 rounded-lg border space-y-3">
                  <div className="flex justify-between"><span>Amount</span><span>₦{amountNum.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Fee (2%)</span><span>₦{fee.toLocaleString()}</span></div>
                  <div className="pt-3 border-t font-bold text-lg flex justify-between">
                    <span>Total to Pay</span>
                    <span className="text-primary">₦{totalToPay.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Label>Upload Receipt</Label>
                <div className="border-2 border-dashed rounded-xl p-8 text-center">
                  <input type="file" id="f" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" disabled={files.length >= 3} />
                  <label htmlFor="f" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-2" />
                    <p>{files.length >= 3 ? "Max 3 files" : "Tap to upload"}</p>
                  </label>
                </div>

                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg">
                    {f.type.startsWith("image/") ? <img src={URL.createObjectURL(f)} className="w-12 h-12 rounded object-cover" /> : <FileText className="w-12 h-12" />}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(i)}><X /></Button>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                <p className="font-bold">Send exact total amount shown above</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex-shrink-0">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || amountNum < 1000 || files.length === 0}
                className="w-full h-12 font-semibold"
              >
                {isSubmitting ? "Submitting..." : "I've Paid & Uploaded Receipt"}
              </Button>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
};