import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const projects = await prisma.project.findMany({
      where: {
        status: "OPEN",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
          { technologies: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      take: 10,
    });

    const results = projects.map((project) => ({
      ...project,
      type: "project",
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search projects error:", error);
    return NextResponse.json({ error: "Error searching projects" }, { status: 500 });
  }
}
