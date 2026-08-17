import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, email, phone, message, type, concern, preferredTime } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Name and Mobile number are required to register your query." },
        { status: 400 }
      );
    }

    const db = await readDB();

    const newLead = {
      id: `LD-${Math.floor(500 + Math.random() * 500)}`,
      name,
      phone,
      type: type || "Contact Message",
      concern: concern || "General Wellness Support",
      detail: message || preferredTime || "Needs callback help",
      status: "Scheduled",
    };

    db.leads.push(newLead);
    await writeDB(db);

    console.log("[Contact Us lead logged in database]:", newLead);

    return NextResponse.json({
      success: true,
      message: "Your details have been received! Our support representative will contact you shortly.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
