import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// A new page starts at the top, immediately. "instant" matters: a smooth
// scroll here made every navigation glide up the old page before the new one
// could be read, which is most of what made page changes feel slow.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
