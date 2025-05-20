import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import ProjectBoard from "@/components/ProjectBoard/ProjectBoard";
import { SortableFeature } from "@/components/SortableFeature/SortableFeature";
import { Feature } from "@/models/project";

interface Board {
  id: string;
  name: string;
  features: Feature[];
  status: string;
}

interface SortableBoardProps {
  id: string;
  board: Board;
  onAddFeature: (boardId: string) => void;
}
export function SortableBoard({ id, board, onAddFeature }: SortableBoardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#f5f5f5] flex-shrink-0 w-[354px] rounded-2xl py-3 px-6"
      {...attributes}
      {...listeners}
    >
      <ProjectBoard
        boardHeading={board.status}
        boardId={board.id}
        numFeatures={board.features.length}
        setSelectedBoardId={() => {}}
        toggleAddFeature={() => onAddFeature(board.id)}
      />

      <SortableContext
        items={board.features.map(
          (feature) => `feature:${feature.id}:${board.id}`,
        )}
        strategy={verticalListSortingStrategy}
      >
        {board.features.map((feature) => (
          <SortableFeature
            key={feature.id}
            id={`feature:${feature.id}:${board.id}`}
            feature={feature}
          />
        ))}
      </SortableContext>
    </div>
  );
}
