import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

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
      take: 10,
    });

    const results = users.map((user) => ({
      ...user,
      type: "user",
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search users error:", error);
    return NextResponse.json({ error: "Error searching users" }, { status: 500 });
  }
}
