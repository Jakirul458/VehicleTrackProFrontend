import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

interface WhatsAppLanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
  englishMessage: string;
  bengaliMessage: string;
  hindiMessage: string;
}

export function WhatsAppLanguageDialog({
  open,
  onOpenChange,
  phone,
  englishMessage,
  bengaliMessage,
  hindiMessage,
}: WhatsAppLanguageDialogProps) {
  const sendMessage = (message: string) => {
    const number = normalizeWhatsAppNumber(phone);
    if (!number) return;

    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose message language</DialogTitle>
          <DialogDescription>
            Select the language for the WhatsApp renewal message.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => sendMessage(englishMessage)}>
            English
          </Button>
          <Button type="button" onClick={() => sendMessage(bengaliMessage)}>
            বাংলা
          </Button>
          <Button type="button" variant="outline" onClick={() => sendMessage(hindiMessage)}>
            हिन्दी
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
