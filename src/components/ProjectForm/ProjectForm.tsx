"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import slugify from "slugify";
import { z } from "zod";

// Define a schema for form validation
const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long"),
});

type FormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  projectId?: string;
  defaultValues?: {
    name: string;
    description: string;
    slug: string;
  };
  onSuccess?: () => void;
}

export default function ProjectForm({
  projectId,
  defaultValues,
  onSuccess,
}: ProjectFormProps) {
  const router = useRouter();
  const isEditMode = !!projectId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      const slug = slugify(data.name.toLowerCase());
      const payload = {
        ...data,
        slug,
      };

      if (isEditMode) {
        await axios.patch("/api/projects", {
          ...payload,
          id: projectId,
        });
        toast.success("Project updated successfully");
      } else {
        await axios.post("/api/projects", payload);
        toast.success("Project created successfully");
        reset();
      }

      router.refresh();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          id="name"
          {...register("name")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Project name"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Project description"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
              ? "Update Project"
              : "Create Project"}
        </button>
      </div>
    </form>
  );
}
