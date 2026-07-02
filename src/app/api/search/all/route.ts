import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Search users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
      take: 5,
    });

    // Search projects
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
      take: 5,
    });

    const userResults = users.map((user) => ({
      ...user,
      type: "user",
    }));

    const projectResults = projects.map((project) => ({
      ...project,
      type: "project",
    }));

    // Interleave results
    const results: any[] = [];
    const maxLength = Math.max(userResults.length, projectResults.length);
    for (let i = 0; i < maxLength; i++) {
      if (i < userResults.length) results.push(userResults[i]);
      if (i < projectResults.length) results.push(projectResults[i]);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search all error:", error);
    return NextResponse.json({ error: "Error searching" }, { status: 500 });
  }
}
