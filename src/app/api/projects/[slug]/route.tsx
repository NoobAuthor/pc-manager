import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { Project } from "@/types/project";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(
  req: Request,
  { params }: RouteParams,
): Promise<NextResponse<Project | { error: string }>> {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
      include: {
        projectBoards: {
          include: {
            features: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project, {
      status: 200,
      statusText: "Successful",
    });
  } catch (error) {
    console.error("Failed to fetch project", error);
    return NextResponse.json({ error: "Cannot fetch data" }, { status: 500 });
  }
}
