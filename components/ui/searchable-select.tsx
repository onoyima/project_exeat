'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found',
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile on mount
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    const searchLower = search.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchLower) ||
      option.description?.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  // Get selected option
  const selectedOption = options.find((option) => option.value === value);

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
    setSearch('');
  };

  // Clear search when closed
  React.useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  // Render option list
  const OptionList = () => (
    <div className="flex flex-col">
      {/* Search Input */}
      <div className="p-3 border-b sticky top-0 bg-white z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
            autoFocus
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearch('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Options List */}
      <ScrollArea className="flex-1 max-h-[300px] md:max-h-[400px]">
        <div className="p-2">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-md hover:bg-accent transition-colors text-left',
                  value === option.value && 'bg-accent'
                )}
              >
                <Check
                  className={cn(
                    'h-4 w-4 flex-shrink-0',
                    value === option.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {option.description}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Mobile: Use Dialog (Full screen)
  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          onClick={() => setOpen(true)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px] p-0 gap-0">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle>{placeholder}</DialogTitle>
            </DialogHeader>
            <OptionList />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop: Use Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <OptionList />
      </PopoverContent>
    </Popover>
  );
}

