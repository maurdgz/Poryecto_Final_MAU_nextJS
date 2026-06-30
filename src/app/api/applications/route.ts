import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, developerId, reason } = body;

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: {
        projectId,
        developerId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Ya te has postulado a este proyecto" }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        projectId,
        developerId,
        reason,
      },
      include: {
        project: true,
        developer: true,
      }
    });

    // Create notification for the project owner
    await prisma.notification.create({
      data: {
        userId: application.project.clientId,
        type: "APPLICATION",
        message: `${application.developer.name} se ha postulado a tu proyecto: ${application.project.title}`,
        link: `/projects/${projectId}`,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    return NextResponse.json({ error: "Error al postular" }, { status: 500 });
  }
}
