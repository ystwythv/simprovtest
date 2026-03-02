import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { iccid } = await req.json();

  if (!iccid || typeof iccid !== "string") {
    return NextResponse.json({ error: "Missing iccid" }, { status: 400 });
  }

  const apiKey = process.env.IQ_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "IQ_KEY not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      "https://partner.mobileportal.uk/api/simcards/activate-subscription",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "iq-key": apiKey,
        },
        body: `iccid=${encodeURIComponent(iccid)}`,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || `API returned ${res.status}` },
        { status: res.status }
      );
    }

    return NextResponse.json({ msisdn: data.msisdn });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to call IQ API: ${String(err)}` },
      { status: 502 }
    );
  }
}
