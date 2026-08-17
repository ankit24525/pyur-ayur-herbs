import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function GET() {
  const db = readDB();
  return NextResponse.json({ coupons: db.coupons });
}

export async function POST(request: Request) {
  try {
    const { code, type, value, status, minCartValue, applicableType, applicableValue } = await request.json();
    const db = readDB();

    const exists = db.coupons.some((c) => c.code === code.toUpperCase());
    if (exists) {
      return NextResponse.json({ success: false, error: "Coupon code already exists." }, { status: 400 });
    }

    const newCoupon = {
      code: code.toUpperCase(),
      type,
      value,
      status: status || "Active",
      minCartValue: minCartValue ? parseFloat(minCartValue) : 0,
      applicableType: applicableType || "All",
      applicableValue: applicableValue || "",
      used: 0,
    };

    db.coupons.push(newCoupon);
    writeDB(db);

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
