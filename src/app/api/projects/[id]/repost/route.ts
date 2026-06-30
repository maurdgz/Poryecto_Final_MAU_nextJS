import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const projectId = id;

    // Check if already reposted
    const existingRepost = await prisma.repost.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existingRepost) {
      // Remove repost
      await prisma.repost.delete({
        where: {
          id: existingRepost.id,
        },
      });
      return NextResponse.json({ reposted: false });
    } else {
      // Add repost
      await prisma.repost.create({
        data: {
          projectId,
          userId,
        },
      });
      return NextResponse.json({ reposted: true });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error toggling repost" }, { status: 500 });
  }
}
