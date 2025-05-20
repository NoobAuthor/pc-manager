"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import {
  ChangeEvent,
  ChangeEventHandler,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import slugify from "slugify";
import { toast } from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Project } from "@/models/project";
import AddBoardForm from "@/components/AddBoardForm/AddBoardForm";
import Modal from "@/components/Modal/Modal";
import AddFeatureForm from "@/components/AddFeatureForm/AddFeatureForm";
import { SortableBoard } from "@/components/SortableBoard/SortableBoard";

const ProjectItem = () => {
  const [project, setProject] = useState<null | Project>(null);
  const [isAddBoardFormVisible, setIsAddBoardFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddFeatureFormVisible, setIsAddFeatureFormVisible] = useState(false);
  const [boardData, setBoardData] = useState({ status: "" });
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [featureFormData, setFeatureFormData] = useState({
    name: "",
    description: "",
    finishDate: "",
  });

  const { slug } = useParams();

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const fetchProject = async () => {
      const { data } = await axios.get(`/api/projects/${slug}`);
      setProject(data);
    };

    fetchProject();
  }, [slug]);

  if (!project) return <></>;

  const toggleAddBoardForm = () =>
    setIsAddBoardFormVisible((prevState) => !prevState);

  const updateBoardHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, value } = event.target;

    setBoardData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleBoardSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const slug = slugify(boardData.status);

    try {
      const { statusText } = await axios.post("/api/project-board", {
        status: boardData.status,
        projectId: project.id,
        slug,
      });

      toast.success(statusText);
    } catch (error: any) {
      toast.error(error.response.data);
    } finally {
      setBoardData({ status: "" });
      setIsSubmitting(false);
      setIsAddBoardFormVisible(false);
    }
  };

  const handleFeatureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFeatureFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFeatureSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const slug = slugify(featureFormData.name.toLowerCase());

    try {
      const { statusText } = await axios.post("/api/features", {
        ...featureFormData,
        slug,
        projectBoardId: selectedBoardId,
      });

      toast.success(statusText);
    } catch (error: any) {
      toast.error(error.response.data);
    } finally {
      setFeatureFormData({ description: "", finishDate: "", name: "" });
      setIsAddFeatureFormVisible(false);
    }
  };

  const toggleAddFeatureForm = () =>
    setIsAddFeatureFormVisible((prevState) => !prevState);

  // Handle drag end for both boards and features
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Extract information from the custom id format "type:id:boardId"
    const [activeType, activeId, activeParentId] = active.id
      .toString()
      .split(":");
    const [overType, overId, overParentId] = over.id.toString().split(":");

    if (activeType === "board") {
      // Handle board reordering
      const oldIndex = project?.projectBoards?.findIndex(
        (board) => board.id === activeId,
      );
      const newIndex = project?.projectBoards?.findIndex(
        (board) => board.id === overId,
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedBoards = arrayMove(
          project.projectBoards!,
          oldIndex!,
          newIndex!,
        );

        // Update UI optimistically
        setProject({
          ...project,
          projectBoards: updatedBoards.map((board, idx) => ({
            ...board,
            order: idx + 1,
          })),
        });

        // Update server
        try {
          const { statusText } = await axios.patch("/api/project-board", {
            projectId: project.id,
            sourceIndex: oldIndex,
            destinationIndex: newIndex,
            type: "status",
          });

          toast.success(statusText);
        } catch (error) {
          // Revert UI on error
          setProject({
            ...project,
            projectBoards: project?.projectBoards ?? [],
          });
          toast.error("Update not successful");
        }
      }
    } else if (activeType === "feature") {
      // Handle feature movement
      const sourceBoard = project?.projectBoards?.find(
        (board) => board.id === activeParentId,
      );
      const destBoard = project?.projectBoards?.find(
        (board) => board.id === overParentId,
      );

      if (!sourceBoard || !destBoard) return;

      const sourceIndex = sourceBoard.features.findIndex(
        (feature) => feature.id === activeId,
      );
      const destinationIndex = destBoard.features.findIndex(
        (feature) => feature.id === overId,
      );

      // Create a new project state
      const newProjectBoards = project?.projectBoards?.map((board) => {
        if (board.id === activeParentId) {
          // Remove from source board
          return {
            ...board,
            features: board.features.filter((f) => f.id !== activeId),
          };
        }
        if (board.id === overParentId) {
          // Add to destination board
          const featureToMove = sourceBoard.features.find(
            (f) => f.id === activeId,
          )!;
          const newFeatures = [...board.features];

          // Insert at the correct position
          if (destinationIndex !== -1) {
            newFeatures.splice(
              activeParentId === overParentId && sourceIndex < destinationIndex
                ? destinationIndex
                : destinationIndex + 1,
              0,
              featureToMove,
            );
          } else {
            newFeatures.push(featureToMove);
          }

          return {
            ...board,
            features: newFeatures,
          };
        }
        return board;
      });

      // Update UI optimistically
      setProject({
        ...project,
        projectBoards: newProjectBoards ?? [],
      });

      // Update server
      try {
        const { statusText } = await axios.patch("/api/project-board", {
          type: "feature",
          projectId: project.id,
          sourceIndex,
          destinationIndex: destinationIndex !== -1 ? destinationIndex : 0,
          sourceBoardId: activeParentId,
          destinationBoardId: overParentId,
        });

        toast.success(statusText);
      } catch (error) {
        toast.error("Update not successful");
        // Fetch fresh data from server to revert state
        const { data } = await axios.get(`/api/projects/${slug}`);
        setProject(data);
      }
    }
  };

  return (
    <>
      <Modal isVisible={isAddBoardFormVisible || isAddFeatureFormVisible} />

      <AddFeatureForm
        featureFormData={featureFormData}
        handleFeatureChange={handleFeatureChange}
        handleFeatureSubmit={handleFeatureSubmit}
        isVisible={isAddFeatureFormVisible}
        toggleAddFeatureForm={toggleAddFeatureForm}
      />

      <AddBoardForm
        isVisible={isAddBoardFormVisible}
        toggleAddBoardForm={toggleAddBoardForm}
        boardData={boardData}
        handleBoardSubmit={handleBoardSubmit}
        isSubmitting={isSubmitting}
        updateBoardHandler={updateBoardHandler}
      />

      <div className="mb-6">
        <h4 className="text-2xl font-bold">{project.name}</h4>
        <p className="text-base text-gray-600">{project.description}</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 items-start overflow-x-auto pb-6">
          <SortableContext
            items={(project?.projectBoards ?? []).map(
              (board) => `board:${board.id}:`,
            )}
            strategy={horizontalListSortingStrategy}
          >
            {(project?.projectBoards ?? [])
              .sort((a, b) => a.order - b.order)
              .map((projectBoard) => (
                <SortableBoard
                  key={projectBoard.id}
                  id={`board:${projectBoard.id}:`}
                  board={projectBoard}
                  onAddFeature={() => {
                    setSelectedBoardId(projectBoard.id);
                    toggleAddFeatureForm();
                  }}
                />
              ))}
          </SortableContext>

          <div
            onClick={toggleAddBoardForm}
            className="grid place-content-center hover:bg-[#f5f5f5] cursor-pointer rounded-2xl border-4 border-dotted flex-none w-[354px] h-20 py-7"
          >
            <AiFillPlusCircle className="text-6xl" />
          </div>
        </div>
      </DndContext>
    </>
  );
};

export default ProjectItem;
