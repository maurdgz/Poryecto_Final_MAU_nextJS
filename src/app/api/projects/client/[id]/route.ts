import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const projects = await prisma.project.findMany({
      where: {
        clientId: id,
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
    return NextResponse.json({ error: "Error al obtener proyectos del cliente" }, { status: 500 });
  }
}
