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

    const existingSave = await prisma.savedComment.findFirst({
      where: {
        commentId: id,
        userId,
      },
    });

    if (existingSave) {
      await prisma.savedComment.delete({
        where: { id: existingSave.id },
      });
      return NextResponse.json({ saved: false });
    } else {
      await prisma.savedComment.create({
        data: {
          commentId: id,
          userId,
          createdAt: new Date(),
        },
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error("Error toggling comment save:", error);
    return NextResponse.json({ error: "Error al procesar save" }, { status: 500 });
  }
}
