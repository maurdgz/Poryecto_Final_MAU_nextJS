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

    // Verify comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comentario no encontrado" }, { status: 404 });
    }

    const existingLike = await prisma.commentLike.findFirst({
      where: {
        commentId: id,
        userId,
      },
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.commentLike.create({
        data: {
          commentId: id,
          userId,
          createdAt: new Date(),
        },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json({ error: "Error al procesar like" }, { status: 500 });
  }
}
