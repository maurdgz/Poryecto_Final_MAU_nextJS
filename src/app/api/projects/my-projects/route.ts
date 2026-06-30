import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "ClientId is required" }, { status: 400 });
    }

    const projects = await prisma.project.findMany({
      where: {
        clientId: clientId,
      },
      include: {
        applications: {
          include: {
            developer: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener proyectos" }, { status: 500 });
  }
}
