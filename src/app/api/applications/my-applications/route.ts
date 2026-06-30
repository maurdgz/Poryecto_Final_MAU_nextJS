import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const developerId = searchParams.get("developerId");

    if (!developerId) {
      return NextResponse.json({ error: "DeveloperId is required" }, { status: 400 });
    }

    const applications = await prisma.application.findMany({
      where: {
        developerId: developerId,
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener postulaciones" }, { status: 500 });
  }
}
