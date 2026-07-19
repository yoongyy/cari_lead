import type { Metadata } from "next";
import MalaysiaInsuranceReportClient from "@/components/reports/malaysia-insurance-client";

export const metadata: Metadata = {
  title: "Malaysia Insurance Customer Voice Report | CariLead",
  description: "A clearly labeled sample of CariLead's Malaysia insurance customer voice and opportunity report.",
};

export default function MalaysiaInsuranceReport() {
  return <MalaysiaInsuranceReportClient />;
}
