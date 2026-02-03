import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen liquid-bg pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-primary-foreground hover:bg-background/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">About Nairox9ja</h1>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Main Info Card */}
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">What is Nairox9ja?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nairox9ja is a Nigerian tap-to-earn platform that rewards users for their consistency, successful referrals, and completion of simple daily tasks. It provides an accessible way for anyone to earn online — no special skills or prior experience required.
              </p>
            </div>
          </div>
        </Card>

        {/* How You Earn */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">💰 How You Earn</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="text-2xl flex-shrink-0">⏱️</div>
              <div>
                <p className="font-semibold text-foreground text-sm">Tap & Claim</p>
                <p className="text-muted-foreground text-xs">Earn ₦5,000 every 5 minutes of active participation</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl flex-shrink-0">👥</div>
              <div>
                <p className="font-semibold text-foreground text-sm">Refer & Earn</p>
                <p className="text-muted-foreground text-xs">Receive ₦10,000 for each successful referral</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl flex-shrink-0">✅</div>
              <div>
                <p className="font-semibold text-foreground text-sm">Daily Tasks</p>
                <p className="text-muted-foreground text-xs">Boost your earnings by completing easy daily activities</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Withdrawals */}
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-3">💳 Withdrawals</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-muted-foreground text-sm">Minimum Withdrawal</p>
              <p className="font-semibold text-foreground">₦150,000</p>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Withdrawals are processed securely after account verification and eligibility confirmation.
            </p>
          </div>
        </Card>

        {/* Fair Use & Security */}
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">🔒 Fair Use & Security</h3>
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <p className="text-muted-foreground text-sm">Strictly one account per user</p>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <p className="text-muted-foreground text-sm">User data is protected with industry-standard security measures</p>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <p className="text-muted-foreground text-sm">Earnings are activity-based and fully transparent</p>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <p className="text-muted-foreground text-sm">Fair reward distribution with no hidden deductions</p>
            </div>
          </div>
        </Card>

        {/* Our Mission */}
        <Card className="bg-gradient-to-br from-green-500/10 to-secondary/10 border-green-500/20 p-6">
          <h3 className="text-lg font-bold text-foreground mb-3">🎯 Our Mission</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            To empower Nigerians by offering a simple, transparent, and reliable platform that rewards genuine effort, consistency, and community building.
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Nairox9ja is committed to fair play: All earnings are based solely on verified user activity, participation, referrals, and task completion. We prioritize transparency, security, and long-term user trust.
          </p>
        </Card>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 mt-4"
        >
          Back to Dashboard
        </Button>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default About;
