import { parseISO } from "date-fns";
import { NextResponse } from "next/server";

import prisma from "@/libs/prisma";

interface CreateFeatureRequest {
  name: string;
  description: string;
  finishDate: string;
  projectBoardId: string;
  slug: string;
}

interface ErrorResponse {
  error: string;
}

export async function POST(
  req: Request,
): Promise<NextResponse<any | ErrorResponse>> {
  try {
    const { name, description, finishDate, projectBoardId, slug } =
      (await req.json()) as CreateFeatureRequest;

    // Input validation
    if (!name || !description || !finishDate || !slug || !projectBoardId) {
      return NextResponse.json(
        { error: "Please provide all required fields" },
        { status: 400 },
      );
    }

    const projectBoard = await prisma.projectBoard.findUnique({
      where: { id: projectBoardId },
      include: {
        features: true,
      },
    });

    if (!projectBoard) {
      return NextResponse.json(
        { error: "Feature must belong to a valid project board" },
        { status: 404 },
      );
    }

    const order = projectBoard.features.length + 1;

    const feature = await prisma.feature.create({
      data: {
        description,
        finishDate: parseISO(finishDate),
        name,
        order,
        slug,
        projectBoard: {
          connect: { id: projectBoardId },
        },
      },
    });

    return NextResponse.json(feature, {
      status: 201, // Created
      statusText: "Feature Created",
    });
  } catch (error) {
    console.error("Failed to create feature:", error);

    // Handle specific errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "A feature with this name already exists in this board" },
        { status: 409 }, // Conflict
      );
    }

    return NextResponse.json(
      { error: "Failed to create feature" },
      { status: 500 },
    );
  }
}
