import React from "react";
import NotFoundView from "../components/system/NotFoundView.js";

export const metadata = {
  title: "Page not found — SayPay",
  description: "The page you requested does not exist in this SayPay sandbox.",
};

export default function NotFound() {
  return <NotFoundView />;
}
