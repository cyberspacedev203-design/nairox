import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, History, Gift, User, DollarSign, MessageCircle, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: History, label: "History", path: "/history" },
    { icon: Gift, label: "Referrals", path: "/referrals" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: DollarSign, label: "Withdraw", path: "/withdraw" },
    { icon: Radio, label: "Channel", path: "#", external: true },
    { icon: MessageCircle, label: "Support", path: "#", external: true },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <Card className="absolute bottom-16 right-0 p-2 bg-card/95 backdrop-blur-lg border-border/50 shadow-lg animate-fade-in mb-2">
            <div className="flex flex-col gap-2">
              {menuItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start gap-3 hover:bg-muted"
                  onClick={() => {
                    if (!item.external) {
                      navigate(item.path);
                    }
                    setIsOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </Card>
        )}

        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg glow-primary hover:opacity-90"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>
    </>
  );
};
