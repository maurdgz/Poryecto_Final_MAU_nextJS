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

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Remove like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return NextResponse.json({ liked: false });
    } else {
      // Add like
      const like = await prisma.like.create({
        data: {
          projectId,
          userId,
        },
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
      });

      // Create notification for project owner if the liker is not the owner
      if (like.project.clientId !== userId) {
        await prisma.notification.create({
          data: {
            userId: like.project.clientId,
            type: "LIKE",
            message: `A ${session.user?.name || 'Alguien'} le dio like a tu proyecto "${like.project.title}"`,
            link: `/projects/${projectId}`,
          },
        });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error toggling like" }, { status: 500 });
  }
}
