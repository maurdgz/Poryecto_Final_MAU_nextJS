import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    
    // Only allow viewing own saved projects
    if (id !== currentUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const saved = await prisma.savedProject.findMany({
      where: { userId: id },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            },
            _count: {
              select: {
                applications: true,
                likes: true,
                reposts: true,
              },
            },
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add interaction states for current user
    const savedWithState = await Promise.all(
      saved.map(async (savedItem) => {
        const [isLiked, isReposted, isSaved] = await Promise.all([
          prisma.like.findUnique({
            where: {
              projectId_userId: {
                projectId: savedItem.project.id,
                userId: currentUserId,
              },
            },
          }),
          prisma.repost.findUnique({
            where: {
              projectId_userId: {
                projectId: savedItem.project.id,
                userId: currentUserId,
              },
            },
          }),
          prisma.savedProject.findUnique({
            where: {
              projectId_userId: {
                projectId: savedItem.project.id,
                userId: currentUserId,
              },
            },
          }),
        ]);
        return {
          ...savedItem,
          project: {
            ...savedItem.project,
            isLiked: !!isLiked,
            isReposted: !!isReposted,
            isSaved: !!isSaved,
          },
        };
      })
    );

    return NextResponse.json(savedWithState);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching saved projects" }, { status: 500 });
  }
}
