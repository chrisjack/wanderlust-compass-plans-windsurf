
import { Badge } from "@/components/ui/badge";

// Array of background colors for tags
const TAG_COLORS = [
  'bg-[#9b87f5]',
  'bg-[#7E69AB]',
  'bg-[#6E59A5]',
  'bg-[#D6BCFA]',
  'bg-[#E5DEFF]',
  'bg-[#8B5CF6]',
  'bg-[#D946EF]',
];

interface TagsProps {
  tags: string;
}

export function Tags({ tags }: TagsProps) {
  if (!tags) return null;
  
  const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
  
  return (
    <div className="flex flex-wrap gap-2">
      {tagArray.map((tag, index) => (
        <Badge
          key={tag}
          className={`${TAG_COLORS[index % TAG_COLORS.length]} text-white border-none`}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
