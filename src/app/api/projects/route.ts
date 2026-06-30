import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    const projects = await prisma.project.findMany({
      where: {
        status: "OPEN",
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
            likes: true,
            reposts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If userId is provided, check if user liked/reposted each project
    let projectsWithUserData = projects;
    if (userId) {
      projectsWithUserData = await Promise.all(
        projects.map(async (project) => {
          const [like, repost] = await Promise.all([
            prisma.like.findUnique({
              where: {
                projectId_userId: {
                  projectId: project.id,
                  userId: userId,
                },
              },
            }),
            prisma.repost.findUnique({
              where: {
                projectId_userId: {
                  projectId: project.id,
                  userId: userId,
                },
              },
            }),
          ]);
          return {
            ...project,
            isLiked: !!like,
            isReposted: !!repost,
          };
        })
      );
    }

    return NextResponse.json(projectsWithUserData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener proyectos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, budget, duration, clientId, type, expiresAt, paymentMethod, category, technologies, maxDevelopers } = body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        duration,
        clientId,
        category,
        technologies,
        type: type || "UNITARY",
        maxDevelopers: maxDevelopers ? parseInt(maxDevelopers) : 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        paymentMethod,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("POST PROJECT ERROR:", error);
    return NextResponse.json({ error: "Error al crear proyecto" }, { status: 500 });
  }
}
