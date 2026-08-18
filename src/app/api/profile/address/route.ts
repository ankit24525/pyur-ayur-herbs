import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, address, addressId } = body;

    if (!userId || !action) {
      return NextResponse.json({ success: false, error: "User ID and action are required." }, { status: 400 });
    }

    const db = await readDB();
    const users = db.users || [];

    const idx = users.findIndex((u) => String(u.id) === String(userId));
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const user = users[idx];
    let savedAddresses = user.savedAddresses || [];

    if (action === "add" && address) {
      const newAddress = {
        ...address,
        id: address.id || `ADR-${Date.now()}`,
      };

      if (newAddress.isDefault) {
        // Unmark other defaults
        savedAddresses = savedAddresses.map((a: any) => ({ ...a, isDefault: false }));
      } else if (savedAddresses.length === 0) {
        newAddress.isDefault = true;
      }

      savedAddresses.push(newAddress);
    } else if (action === "edit" && address && addressId) {
      if (address.isDefault) {
        savedAddresses = savedAddresses.map((a: any) => ({ ...a, isDefault: false }));
      }
      savedAddresses = savedAddresses.map((a: any) =>
        String(a.id) === String(addressId) ? { ...a, ...address, id: addressId } : a
      );
    } else if (action === "delete" && addressId) {
      savedAddresses = savedAddresses.filter((a: any) => String(a.id) !== String(addressId));
      // Ensure there is at least one default if we have addresses left
      if (savedAddresses.length > 0 && !savedAddresses.some((a: any) => a.isDefault)) {
        savedAddresses[0].isDefault = true;
      }
    } else {
      return NextResponse.json({ success: false, error: "Invalid action or parameters." }, { status: 400 });
    }

    user.savedAddresses = savedAddresses;
    users[idx] = user;
    db.users = users;
    await writeDB(db);

    const { passwordHash, ...userResponse } = user;
    return NextResponse.json({
      success: true,
      user: userResponse,
      message: "Address list updated successfully!",
    });
  } catch (error) {
    console.error("[Profile Address API] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
