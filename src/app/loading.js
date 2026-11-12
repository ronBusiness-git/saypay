import React from "react";
import LoadingScreen from "../components/ui/LoadingScreen.js";

export default function RootLoading() {
  return <LoadingScreen fullscreen message="Loading SayPay" subtext="Syncing safety engine and session" />;
}
