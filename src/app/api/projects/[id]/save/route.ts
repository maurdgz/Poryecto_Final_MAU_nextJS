import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const projectId = id;

    // Check if already saved
    const existingSaved = await prisma.savedProject.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existingSaved) {
      // Remove save
      await prisma.savedProject.delete({
        where: {
          id: existingSaved.id,
        },
      });
      return NextResponse.json({ saved: false });
    } else {
      // Add save
      await prisma.savedProject.create({
        data: {
          projectId,
          userId,
        },
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error toggling save" }, { status: 500 });
  }
}
