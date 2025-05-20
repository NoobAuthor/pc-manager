import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

interface CreateProjectBoardRequest {
  status: string;
  projectId: string;
  slug: string;
}

interface UpdateBoardOrderRequest {
  projectId: string;
  sourceIndex: number;
  destinationIndex: number;
  type: "status" | "feature";
  sourceBoardId?: string;
  destinationBoardId?: string;
}

interface ErrorResponse {
  error: string;
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<any | ErrorResponse>> {
  try {
    const { status, projectId, slug } =
      (await req.json()) as CreateProjectBoardRequest;

    if (!status || !projectId || !slug) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const maxOrderResult = await prisma.projectBoard.aggregate({
      _max: {
        order: true,
      },
      where: {
        projectId,
      },
    });

    const nextOrder = maxOrderResult._max?.order
      ? maxOrderResult._max.order + 1
      : 1;

    const createdProjectBoard = await prisma.projectBoard.create({
      data: {
        slug,
        status,
        project: {
          connect: { id: projectId },
        },
        order: nextOrder,
      },
    });

    return NextResponse.json(createdProjectBoard, {
      status: 201, // Created
      statusText: "Project board created",
    });
  } catch (error) {
    console.error("Failed to create project board:", error);
    return NextResponse.json(
      { error: "Failed to create project board" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
): Promise<NextResponse<string | ErrorResponse>> {
  try {
    const {
      projectId,
      sourceIndex,
      destinationIndex,
      type,
      sourceBoardId,
      destinationBoardId,
    } = (await req.json()) as UpdateBoardOrderRequest;

    if (
      !projectId ||
      sourceIndex === undefined ||
      destinationIndex === undefined ||
      !type
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (type === "status") {
      const projectBoards = await prisma.projectBoard.findMany({
        where: { projectId },
        orderBy: { order: "asc" },
      });

      if (
        sourceIndex < 0 ||
        sourceIndex >= projectBoards.length ||
        destinationIndex < 0 ||
        destinationIndex >= projectBoards.length
      ) {
        return NextResponse.json(
          { error: "Invalid source or destination index" },
          { status: 400 },
        );
      }

      const sourceBoard = projectBoards[sourceIndex];
      const destinationBoard = projectBoards[destinationIndex];

      await prisma.projectBoard.update({
        where: { id: sourceBoard.id },
        data: { order: destinationBoard.order },
      });

      await prisma.projectBoard.update({
        where: { id: destinationBoard.id },
        data: { order: sourceBoard.order },
      });

      return NextResponse.json("Update successful", {
        status: 200,
        statusText: "Successful",
      });
    }

    if (type === "feature") {
      if (!sourceBoardId || !destinationBoardId) {
        return NextResponse.json(
          {
            error:
              "Source and destination board IDs are required for feature updates",
          },
          { status: 400 },
        );
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { projectBoards: { include: { features: true } } },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        );
      }

      const sourceBoard = project.projectBoards.find(
        (board) => board.id === sourceBoardId,
      );

      const destinationBoard = project.projectBoards.find(
        (board) => board.id === destinationBoardId,
      );

      if (!sourceBoard || !destinationBoard) {
        return NextResponse.json(
          { error: "Source or destination board not found" },
          { status: 404 },
        );
      }

      if (sourceIndex < 0 || sourceIndex >= sourceBoard.features.length) {
        return NextResponse.json(
          { error: "Invalid source feature index" },
          { status: 400 },
        );
      }

      const movedFeature = sourceBoard.features[sourceIndex];

      if (sourceBoardId === destinationBoardId) {
        // Moving within the same board
        const sourceFeatures = [...sourceBoard.features];
        const movedFeature = sourceFeatures.splice(sourceIndex, 1)[0];

        if (destinationIndex < 0 || destinationIndex >= sourceFeatures.length) {
          return NextResponse.json(
            { error: "Invalid destination feature index" },
            { status: 400 },
          );
        }

        const destinationOrder =
          sourceFeatures[destinationIndex]?.order || destinationIndex + 1;

        await prisma.feature.update({
          where: { id: movedFeature.id },
          data: {
            order: destinationOrder,
            projectBoardId: destinationBoardId,
          },
        });

        // Update order for all affected features
        for (let i = 0; i < sourceFeatures.length; i++) {
          if (
            i >= Math.min(sourceIndex, destinationIndex) &&
            i <= Math.max(sourceIndex, destinationIndex)
          ) {
            await prisma.feature.update({
              where: { id: sourceFeatures[i].id },
              data: { order: i + 1 },
            });
          }
        }
      } else {
        // Moving to a different board
        await prisma.feature.update({
          where: { id: movedFeature.id },
          data: {
            projectBoardId: destinationBoardId,
            order: destinationIndex + 1,
          },
        });
      }

      return NextResponse.json("Update successful", {
        status: 200,
        statusText: "Feature moved successfully",
      });
    }

    return NextResponse.json({ error: "Invalid update type" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update project board:", error);
    return NextResponse.json(
      { error: "Failed to update project board" },
      { status: 500 },
    );
  }
}
