import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeModal } from "@/components/WelcomeModal";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showTelegramPrompt, setShowTelegramPrompt] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth", { replace: true, state: { from: location.pathname } });
        return;
      }

      if (!mounted) return;

      setUserId(session.user.id);

      const lastLoginAt = localStorage.getItem("lastLoginAt");
      const justSignedUp = localStorage.getItem("justSignedUp") === "true";
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const longBreak = lastLoginAt ? now - Date.parse(lastLoginAt) >= sevenDays : false;

      if (justSignedUp || longBreak) {
        setShowTelegramPrompt(true);
      }

      localStorage.setItem("lastLoginAt", new Date().toISOString());
      if (justSignedUp) {
        localStorage.removeItem("justSignedUp");
      }

      setChecking(false);
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [location.pathname, navigate]);

  if (checking) {
    return null;
  }

  return (
    <>
      {userId && <WelcomeModal userId={userId} showPrompt={showTelegramPrompt} />}
      {children}
    </>
  );
};

export default ProtectedRoute;
