import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, industry } = body;

    // Validate inputs
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!industry) {
      return NextResponse.json(
        { error: "Industry selection is required." },
        { status: 400 }
      );
    }

    // 1. Connect and save to MongoDB
    const client = await clientPromise;
    const db = client.db("cari_lead");
    
    const signupDocument = {
      email: email.trim().toLowerCase(),
      industry,
      createdAt: new Date(),
    };

    const dbResult = await db.collection("report_signups").insertOne(signupDocument);

    // 2. Initialize Resend and send notification email
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const toEmail = process.env.RESEND_ALERT_TO_EMAIL || "yoongyy@gmail.com";

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #0f172a; margin-bottom: 5px;">CariLead Alert 📡</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 20px;">New Free Weekly Leads Report request received.</p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: bold; width: 30%;">Email:</td>
              <td style="padding: 10px 0; color: #0f172a;">${email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: bold;">Industry:</td>
              <td style="padding: 10px 0; color: #0f172a;">${industry}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-weight: bold;">Signed Up At:</td>
              <td style="padding: 10px 0; color: #0f172a;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
          
          <div style="margin-top: 25px; padding: 12px; background-color: #f8fafc; border-radius: 8px; font-size: 12px; color: #64748b; text-align: center;">
            Document ID: ${dbResult.insertedId}
          </div>
        </div>
      `;

      await resend.emails.send({
        from: `CariLead Alerts <${fromEmail}>`,
        to: toEmail,
        subject: `[CariLead Alert] New Weekly Report Request: ${industry}`,
        html: htmlContent,
      });
    } else {
      console.warn("RESEND_API_KEY is missing in env. Alert email skipped.");
    }

    return NextResponse.json({ success: true, id: dbResult.insertedId });
  } catch (error: any) {
    console.error("Error in free-report API route:", error);
    return NextResponse.json(
      { error: "Internal server error. Failed to submit request." },
      { status: 500 }
    );
  }
}
