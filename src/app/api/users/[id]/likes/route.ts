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

    const likes = await prisma.like.findMany({
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
    const currentUserId = (session.user as any).id;
    const likesWithState = await Promise.all(
      likes.map(async (like) => {
        const [isLiked, isReposted, isSaved] = await Promise.all([
          prisma.like.findUnique({
            where: {
              projectId_userId: {
                projectId: like.project.id,
                userId: currentUserId,
              },
            },
          }),
          prisma.repost.findUnique({
            where: {
              projectId_userId: {
                projectId: like.project.id,
                userId: currentUserId,
              },
            },
          }),
          prisma.savedProject.findUnique({
            where: {
              projectId_userId: {
                projectId: like.project.id,
                userId: currentUserId,
              },
            },
          }),
        ]);
        return {
          ...like,
          project: {
            ...like.project,
            isLiked: !!isLiked,
            isReposted: !!isReposted,
            isSaved: !!isSaved,
          },
        };
      })
    );

    return NextResponse.json(likesWithState);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching likes" }, { status: 500 });
  }
}
