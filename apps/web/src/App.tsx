import { useState } from "react";
import { Admin } from "./admin/Admin";
import { Storefront } from "./storefront/Storefront";

type View = "shop" | "admin";

function App() {
  const [view, setView] = useState<View>("shop");

  if (view === "admin") return <Admin onBack={() => setView("shop")} />;
  return <Storefront onOpenAdmin={() => setView("admin")} />;
}

export default App;
