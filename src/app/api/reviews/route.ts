import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, reviewerId, revieweeId, stars, comment } = body;

    const review = await prisma.review.create({
      data: {
        projectId,
        reviewerId,
        revieweeId,
        stars: parseInt(stars),
        comment,
      },
    });

    // Create notification for the person reviewed
    const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
    await prisma.notification.create({
      data: {
        userId: revieweeId,
        type: "REVIEW",
        message: `${reviewer?.name} te ha dejado una reseña de ${stars} estrellas.`,
        link: `/profile/${revieweeId}`,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("REVIEW POST ERROR:", error);
    return NextResponse.json({ error: "Error al crear la reseña" }, { status: 500 });
  }
}
