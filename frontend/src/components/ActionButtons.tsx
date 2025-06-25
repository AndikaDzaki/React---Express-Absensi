import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActionButtons({ onEdit, onDelete }: ActionButtonsProps) {
  return (
    <div className="space-x-2">
      <Button size="sm" variant="outline" onClick={onEdit}>
        <Pencil size={16} />
      </Button>
      <Button size="sm" variant="outline" onClick={onDelete}>
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
