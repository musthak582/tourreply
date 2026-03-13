import type { Metadata } from "next";
import { MaintenanceClient } from "./maintenance-client";

export const metadata: Metadata = {
  title: "TourReply — System Improvement in Progress",
  description:
    "We're making TourReply even better. Our team is working on technical improvements. We'll notify you when we're back online.",
};

export default function MaintenancePage() {
  return <MaintenanceClient />;
}
