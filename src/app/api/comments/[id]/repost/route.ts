import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
    }

    const existingRepost = await prisma.commentRepost.findFirst({
      where: {
        commentId: id,
        userId,
      },
    });

    if (existingRepost) {
      await prisma.commentRepost.delete({
        where: { id: existingRepost.id },
      });
      return NextResponse.json({ reposted: false });
    } else {
      await prisma.commentRepost.create({
        data: {
          commentId: id,
          userId,
          createdAt: new Date(),
        },
      });
      return NextResponse.json({ reposted: true });
    }
  } catch (error) {
    console.error("Error toggling comment repost:", error);
    return NextResponse.json({ error: "Error al procesar repost" }, { status: 500 });
  }
}
