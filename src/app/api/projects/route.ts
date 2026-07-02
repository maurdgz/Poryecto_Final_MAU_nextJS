import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const isProfileRequest = url.searchParams.get("profile") === "true";

    const projects = await prisma.project.findMany({
      where: {
        status: "OPEN",
        ...(isProfileRequest && userId && {
          OR: [
            { clientId: userId },
            { developerId: userId }
          ]
        }),
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

    // If userId is provided, check if user liked/reposted/saved each project
    let projectsWithUserData = projects;
    if (userId) {
      projectsWithUserData = await Promise.all(
        projects.map(async (project) => {
          const [like, repost, saved] = await Promise.all([
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
            prisma.savedProject.findUnique({
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
            isSaved: !!saved,
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
