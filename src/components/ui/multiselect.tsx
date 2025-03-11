"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "../ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Command as CommandPrimitive } from "cmdk";



type Project = {
  value: string;
  label: string;
};

interface FancyMultiSelectProps {
  value?: Project[];
  onChange?: (value: Project[]) => void;
}

export function FancyMultiSelect({ value, onChange }: FancyMultiSelectProps) {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Project[]>([]);
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/personio/projects');
        const data = await response.json();
        const formattedProjects = data
          .filter((project: any) => project.name.startsWith('_ext') && !project.name.includes('RDA'))
          .map((project: any) => ({
            value: project.name.toLowerCase(),
            label: project.name
          }));
        setProjects(formattedProjects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleSelect = (project: Project) => {
    const newSelected = [...selected, project];
    setSelected(newSelected);
    onChange?.(newSelected); // Notify parent component
  };

  const handleUnselect = React.useCallback((project: Project) => {
    const newSelected = selected.filter((s) => s.value !== project.value);
    setSelected(newSelected);
    onChange?.(newSelected); // Notify parent component
  }, [selected, onChange]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            setSelected((prev) => {
              const newSelected = [...prev];
              newSelected.pop();
              return newSelected;
            });
          }
        }
        // This is not a default behaviour of the <input /> field
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    []
  );

  const selectables = projects.filter(
    (project) => !selected.includes(project)
  );


  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group w-2/5 rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((project) => {
            return (
              <Badge key={project.value} variant="secondary">
                {project.label}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(project);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(project)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder="Select projects..."
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        <CommandList>
          {open && selectables.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full overflow-auto max-h-[200px]">
                {selectables.map((project) => {
                  return (
                    <CommandItem
                      key={project.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={(value) => {
                        setInputValue("");
                        handleSelect(project);
                      }}
                      className={"cursor-pointer"}
                    >
                      {project.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ) : null}
        </CommandList>
      </div>
    </Command>
  );
}