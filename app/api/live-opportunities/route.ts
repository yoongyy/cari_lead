import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("cari_lead");

    // Fetch findings from MongoDB
    const dbFindings = await db
      .collection("findings")
      .find({ sentiment: "negative" }) // Negative sentiment findings are usually pain points/complaints
      .limit(10)
      .toArray();

    // Map database findings to opportunities format
    const mappedOpportunities = dbFindings.map((finding) => {
      let signal = "Complaint";
      if (finding.considering_switch) signal = "Considering switch";
      else if (finding.explicit_solution_request) signal = "Asking for help";
      else if (finding.purchase_intent) signal = "Comparing options";

      return {
        id: finding._id.toString(),
        quote: finding.evidence_text || finding.problem_description || "Need advice on service provider.",
        industry: finding.industry === "property" ? "Property" : "Insurance",
        location: finding.location_label || "Selangor",
        signal: signal,
        time: "Just now",
        confidence: Math.round((finding.confidence || 0.8) * 100),
        source: finding.source_type === "post" ? "XHS Post" : "XHS Comment",
      };
    });

    // Static fallback templates if database is empty or has low count
    const templates = [
      {
        id: "temp-1",
        quote: "Medical card premium naik lagi 30%. Prudential or Great Eastern okay now? Looking to switch.",
        industry: "Insurance",
        location: "Kuala Lumpur",
        signal: "Considering switch",
        time: "Just now",
        confidence: 94,
        source: "XHS Comment",
      },
      {
        id: "temp-2",
        quote: "Any good property agent in Cheras to rent out my condo unit? Prefer fast reply.",
        industry: "Property",
        location: "Selangor",
        signal: "Looking for recommendation",
        time: "Just now",
        confidence: 98,
        source: "XHS Post",
      },
      {
        id: "temp-3",
        quote: "Family car SUV budget RM150k. Mazda CX5 vs Chery Tiggo 8 Pro, which one better for long distance?",
        industry: "Automotive",
        location: "Penang",
        signal: "Comparing options",
        time: "1 minute ago",
        confidence: 91,
        source: "XHS Post",
      },
      {
        id: "temp-4",
        quote: "My kid is sitting for SPM. Need recommended chemistry tuition class in Subang Jaya.",
        industry: "Education",
        location: "Selangor",
        signal: "Asking for help",
        time: "2 minutes ago",
        confidence: 89,
        source: "XHS Comment",
      },
      {
        id: "temp-5",
        quote: "Renovation contractor delayed 2 months, now cannot contact him. Any agency or lawyer advice?",
        industry: "Renovation",
        location: "Johor",
        signal: "Complaint",
        time: "3 minutes ago",
        confidence: 97,
        source: "XHS Comment",
      },
      {
        id: "temp-6",
        quote: "AIA medical card renewal price increase again. Thinking of downgrade or check Allianz.",
        industry: "Insurance",
        location: "Perak",
        signal: "Considering switch",
        time: "4 minutes ago",
        confidence: 93,
        source: "XHS Post",
      },
      {
        id: "temp-7",
        quote: "Looking for reliable runner to settle JPJ transfer for secondhand car in PJ area.",
        industry: "Automotive",
        location: "Selangor",
        signal: "Looking for recommendation",
        time: "5 minutes ago",
        confidence: 87,
        source: "XHS Post",
      },
      {
        id: "temp-8",
        quote: "Renting in Mont Kiara. The landlord refused to return deposit. How to make claim under small claims court?",
        industry: "Property",
        location: "Kuala Lumpur",
        signal: "Complaint",
        time: "6 minutes ago",
        confidence: 95,
        source: "XHS Comment",
      },
    ];

    // Combine database records first, then fill in with templates
    const finalOpportunities = [...mappedOpportunities, ...templates].slice(0, 12);

    return NextResponse.json({
      success: true,
      opportunities: finalOpportunities,
    });
  } catch (error: any) {
    console.error("Error fetching live opportunities:", error);
    return NextResponse.json({
      success: false,
      opportunities: [],
    });
  }
}
