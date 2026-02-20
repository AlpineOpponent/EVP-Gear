import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/shared/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TagSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export const TagSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select tag...",
  className
}: TagSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setOpen(false);
    setSearchValue("");
  };

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className="flex h-[40px] w-full items-center justify-between rounded-md border border-border bg-card px-4 py-[10px] text-[13px] transition-colors hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={cn("truncate", !value && "text-text-tertiary")}>
              {value || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command loop>
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty className="py-2 px-4 text-xs text-text-muted">
                No existing tags found.
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>

              {searchValue && !options.includes(searchValue) && (
                <CommandGroup heading="New Tag">
                  <CommandItem
                    value={searchValue}
                    onSelect={() => handleSelect(searchValue)}
                    className="text-primary font-medium"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{searchValue}"
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
