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

    const body = await req.json();
    const { reason } = body;
    const userId = (session.user as any).id;

    // Check if user is a developer
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "DEVELOPER") {
      return NextResponse.json({ error: "Only developers can apply" }, { status: 403 });
    }

    // Check if project exists and is open
    const project = await prisma.project.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status !== "OPEN") {
      return NextResponse.json({ error: "Project is not open for applications" }, { status: 400 });
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        projectId: id,
        developerId: userId,
      },
    });

    if (existingApplication) {
      return NextResponse.json({ error: "Already applied" }, { status: 400 });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        projectId: id,
        developerId: userId,
        reason: reason || "",
      },
      include: {
        developer: true,
      },
    });

    // Create notification for project owner
    await prisma.notification.create({
      data: {
        userId: project.clientId,
        type: "APPLICATION",
        message: `${user.name} ha aplicado a tu proyecto "${project.title}"`,
        link: `/projects/${id}`,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error applying to project:", error);
    return NextResponse.json({ error: "Error applying to project" }, { status: 500 });
  }
}
