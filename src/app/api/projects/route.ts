import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Project } from "@models/project";

interface CreateProjectRequest {
  name: string;
  description: string;
  slug: string;
}

interface UpdateProjectRequest {
  id: string;
  name: string;
  description: string;
  slug: string;
}

interface ErrorResponse {
  error: string;
}
export async function GET(
  req: NextRequest,
): Promise<NextResponse<Project[] | ErrorResponse>> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects, {
      status: 200,
      statusText: "Successful",
    });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json({ error: "Cannot fetch data" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<Project | ErrorResponse>> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { description, name, slug } =
      (await req.json()) as CreateProjectRequest;

    if (!description || !name || !slug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    const createdProject = await prisma.project.create({
      data: {
        description,
        name,
        slug,
        userId,
      },
    });

    return NextResponse.json(createdProject, {
      status: 201,
      statusText: "Project Created",
    });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: "Creation Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
): Promise<NextResponse<Project | ErrorResponse>> {
  try {
    const { description, name, id, slug } =
      (await req.json()) as UpdateProjectRequest;

    if (!description || !name || !id || !slug) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { description, name, slug },
    });

    return NextResponse.json(updatedProject, {
      status: 200,
      statusText: "Successful",
    });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json({ error: "Error Updating" }, { status: 500 });
  }
}
