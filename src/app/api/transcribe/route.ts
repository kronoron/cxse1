import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await req.formData();
    const file = data.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filePath = join(uploadDir, `${uuidv4()}-${file.name}`);
    await writeFile(filePath, buffer);

    let transcript = "Transcription placeholder for MVP.";
    const key = process.env.OPENAI_API_KEY_TEXT;
    if (key) {
      const openai = new OpenAI({ apiKey: key });
      try {
        const fileBlob = new Blob([buffer]);
        const response = await openai.audio.transcriptions.create({
          file: fileBlob as any,
          model: "whisper-1",
        } as any);
        // @ts-ignore shape depends on SDK
        transcript = response.text || transcript;
      } catch (err) {
        console.error("OpenAI transcription failed", err);
      }
    }

    const recording = await prisma.recording.create({
      data: {
        userId: user.id,
        filePath,
        transcript,
      },
    });

    return NextResponse.json({ id: recording.id, transcript });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}


