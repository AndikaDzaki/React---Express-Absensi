
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({ value, onChange, placeholder }: SearchBarProps) => {
  return (
    <div className="relative">
      <Input
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
