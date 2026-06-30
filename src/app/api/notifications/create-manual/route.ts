import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, message, link } = body;

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        link,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ error: "Error al crear notificación" }, { status: 500 });
  }
}
