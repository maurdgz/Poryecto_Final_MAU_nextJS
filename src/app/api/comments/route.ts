import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, content } = body;
    const userId = (session.user as any).id;

    if (!projectId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        projectId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for project owner if commenter is not the owner
    if (project.clientId !== userId) {
      await prisma.notification.create({
        data: {
          userId: project.clientId,
          type: "COMMENT",
          message: `${session.user?.name || 'Alguien'} comentó en tu proyecto "${project.title}"`,
          link: `/projects/${projectId}`,
        },
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Error creating comment" }, { status: 500 });
  }
}
