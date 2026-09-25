"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface SearchableSelectOption {
  value: string;
  label: string;
  badge?: string | number | React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  badgeClassName?: string;
  id?: string;
  name?: string;
  renderOption?: (
    option: SearchableSelectOption,
    isSelected: boolean
  ) => React.ReactNode;
}

export const SearchableSelect = React.forwardRef<
  HTMLButtonElement,
  SearchableSelectProps
>(
  (
    {
      options = [],
      value,
      onValueChange,
      placeholder = "Select an option...",
      searchPlaceholder = "Search...",
      emptyText = "No results found.",
      disabled = false,
      isLoading = false,
      className,
      triggerClassName,
      contentClassName,
      badgeClassName,
      id,
      name,
      renderOption,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    // Find the currently selected option object
    const selectedOption = React.useMemo(
      () => options.find((opt) => opt.value === value),
      [options, value]
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            id={id}
            name={name}
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoading}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 hover:border-brand-primary/40 transition-all duration-200 text-left",
              triggerClassName,
              className
            )}
          >
            <span
              className={cn(
                "truncate block flex-1 mr-2",
                !selectedOption && "text-gray-400"
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                  <span>Loading options...</span>
                </span>
              ) : selectedOption ? (
                <span className="capitalize">{selectedOption.label}</span>
              ) : (
                placeholder
              )}
            </span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 shrink-0 text-brand-primary animate-spin" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 text-gray-500" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className={cn(
            "w-[var(--radix-popover-trigger-width)] min-w-[220px] p-0 border border-brand-primary/20 bg-white shadow-lg rounded-lg overflow-hidden z-50",
            contentClassName
          )}
        >
          <Command
            className="w-full"
            filter={(itemValue, search) => {
              if (!search) return 1;
              const cleanSearch = search.trim().toLowerCase();
              const cleanItem = itemValue.toLowerCase();
              return cleanItem.includes(cleanSearch) ? 1 : 0;
            }}
          >
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-9 text-xs"
            />
            <CommandList className="max-h-60 overflow-y-auto p-1">
              <CommandEmpty className="py-4 text-center text-xs text-gray-500">
                {emptyText}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.description || ""} ${
                        option.value
                      }`}
                      disabled={option.disabled}
                      onSelect={() => {
                        if (option.disabled) return;
                        onValueChange?.(option.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "cursor-pointer text-xs py-2 px-2.5 rounded-md flex items-center gap-2",
                        "hover:bg-brand-primary/5 focus:bg-brand-primary/10 focus:text-brand-primary",
                        isSelected &&
                          "bg-brand-primary/10 text-brand-primary font-medium"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-brand-primary",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {renderOption ? (
                        renderOption(option, isSelected)
                      ) : (
                        <div className="flex items-center justify-between w-full min-w-0 gap-2">
                          <div className="truncate flex-1">
                            <span className="capitalize block truncate">
                              {option.label}
                            </span>
                            {option.description && (
                              <span className="text-[10px] text-gray-500 block truncate">
                                {option.description}
                              </span>
                            )}
                          </div>
                          {option.badge !== undefined && (
                            <span
                              className={cn(
                                "ml-auto px-2 py-0.5 text-xs rounded-full bg-brand-primary text-white font-medium shrink-0",
                                badgeClassName
                              )}
                            >
                              {option.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

SearchableSelect.displayName = "SearchableSelect";

export default SearchableSelect;
