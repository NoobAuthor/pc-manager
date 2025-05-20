import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import FeatureCard from "@/components/FeatureCard/FeatureCard";
import { Feature } from "@/models/project";

interface SortableFeatureProps {
  id: string;
  feature: Feature;
}

export function SortableFeature({ id, feature }: SortableFeatureProps) {
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <FeatureCard feature={feature} />
    </div>
  );
}
