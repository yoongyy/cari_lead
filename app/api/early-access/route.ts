import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, whatsapp, industry, state, scale, customerDescription } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    if (!whatsapp || !whatsapp.trim()) {
      return NextResponse.json({ error: "WhatsApp number is required." }, { status: 400 });
    }

    if (!customerDescription || !customerDescription.trim()) {
      return NextResponse.json({ error: "Customer description is required." }, { status: 400 });
    }

    // 1. Connect and save to MongoDB
    const client = await clientPromise;
    const db = client.db("cari_lead");

    const earlyAccessDocument = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      whatsapp: whatsapp.trim(),
      industry,
      state,
      scale,
      customerDescription: customerDescription.trim(),
      createdAt: new Date(),
    };

    const dbResult = await db.collection("early_access").insertOne(earlyAccessDocument);

    // 2. Initialize Resend and send notification email
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const toEmail = process.env.RESEND_ALERT_TO_EMAIL || "yoongyy@gmail.com";

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #0f172a; margin-bottom: 5px; font-size: 20px;">CariLead Alert 📡</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 25px;">A new user requested Early Access to CariLead.</p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: bold; width: 30%;">Full Name:</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: bold;">Email:</td>
              <td style="padding: 12px 0; color: #0f172a;">${email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: bold;">WhatsApp:</td>
              <td style="padding: 12px 0; color: #0f172a;">${whatsapp}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: bold;">Industry:</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600;">${industry}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: bold;">State/Location:</td>
              <td style="padding: 12px 0; color: #0f172a;">${state}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: bold;">Scale:</td>
              <td style="padding: 12px 0; color: #0f172a;">${scale}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #64748b; font-weight: bold; vertical-align: top;">Looking For:</td>
              <td style="padding: 12px 0; color: #0f172a; line-height: 1.5;">${customerDescription}</td>
            </tr>
          </table>

          <div style="padding: 12px; background-color: #f8fafc; border-radius: 8px; font-size: 11px; color: #64748b; text-align: center; border: 1px solid #edf2f7;">
            Document ID: ${dbResult.insertedId} | Submitted At: ${new Date().toLocaleString()}
          </div>
        </div>
      `;

      await resend.emails.send({
        from: `CariLead Alerts <${fromEmail}>`,
        to: toEmail,
        subject: `[CariLead Alert] New Early Access Request: ${name}`,
        html: htmlContent,
      });
    } else {
      console.warn("RESEND_API_KEY is missing in env. Alert email skipped.");
    }

    return NextResponse.json({ success: true, id: dbResult.insertedId });
  } catch (error: any) {
    console.error("Error in early-access API route:", error);
    return NextResponse.json(
      { error: "Internal server error. Failed to process early access request." },
      { status: 500 }
    );
  }
}
