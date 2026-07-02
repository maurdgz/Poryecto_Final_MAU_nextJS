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
    const userId = (session?.user as any)?.id;

    const comments = await prisma.comment.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check if current user liked each comment
    let commentsWithLikeStatus = comments;
    if (userId) {
      commentsWithLikeStatus = await Promise.all(
        comments.map(async (comment) => {
          const like = await prisma.commentLike.findFirst({
            where: {
              commentId: comment.id,
              userId,
            },
          });
          return {
            ...comment,
            isLiked: !!like,
          };
        })
      );
    }

    return NextResponse.json(commentsWithLikeStatus);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Error fetching comments" }, { status: 500 });
  }
}
