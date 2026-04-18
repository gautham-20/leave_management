import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "src/data/db.json");

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();
    
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fileData = fs.readFileSync(dbPath, "utf-8");
    const users = JSON.parse(fileData || "[]");

    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const newUser = { id: Date.now().toString(), name, email, password, role };
    users.push(newUser);
    
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

    return NextResponse.json({ success: true });

  } catch (error: any) {
    
    console.error("SIGNUP SERVER ERROR:", error); return NextResponse.json(
      { message: "Error saving user: " + (error.message || "Unknown error") },{ status: 500 }
    );
  }
}