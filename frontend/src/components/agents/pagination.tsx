import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
  showPageSizeSelector?: boolean;
  showJumpToPage?: boolean;
  showResultsInfo?: boolean;
  pageSizeOptions?: number[];
  position?: 'top' | 'bottom' | 'standalone';
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  showPageSizeSelector = true,
  showJumpToPage = true,
  showResultsInfo = true,
  pageSizeOptions = [10, 20, 50, 100],
  position = 'standalone'
}) => {
  const [jumpToPageInput, setJumpToPageInput] = useState<string>('');
  if (totalPages <= 1 && !showResultsInfo && !showPageSizeSelector && position === 'standalone') return null;

  const getVisiblePages = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    rangeWithDots.push(1);

    if (currentPage - delta > 2) {
      rangeWithDots.push('...');
    }

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      if (i !== 1 && i !== totalPages) {
        range.push(i);
      }
    }
    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...');
    }
    
    if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, arr) => arr.indexOf(page) === index);
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPageInput);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setJumpToPageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    }
  };

  const visiblePages = getVisiblePages();
  
  // Safe calculations with fallback values
  const safeCurrentPage = Number(currentPage) || 1;
  const safePageSize = Number(pageSize) || 20;
  const safeTotalItems = Number(totalItems) || 0;
  
  const startItem = (safeCurrentPage - 1) * safePageSize + 1;
  const endItem = Math.min(safeCurrentPage * safePageSize, safeTotalItems || safeCurrentPage * safePageSize);

  if (position === 'top') {
    return (
      <div className="py-4 border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {showResultsInfo && (
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{startItem}</span>
                <span className="mx-1">—</span>
                <span className="font-medium text-foreground">{endItem}</span>
                {totalItems ? (
                  <span className="ml-2 text-muted-foreground">of <span className="font-medium text-foreground">{totalItems}</span> results</span>
                ) : <span className="ml-2 text-muted-foreground">results</span>}
              </div>
            )}

            {showPageSizeSelector && onPageSizeChange && (
              <div className="inline-flex items-center rounded-xl border border-border/50 bg-card/50 px-3 py-1">
                <span className="text-sm text-muted-foreground mr-2">Show</span>
                <Select 
                  value={pageSize.toString()} 
                  onValueChange={(value) => onPageSizeChange(parseInt(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-20 h-9 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground ml-2">per page</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {totalPages > 1 && (
              <div className="inline-flex items-center gap-2 bg-gradient-to-br from-card/80 to-card/60 rounded-xl border border-border/40 p-2 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className="h-9 w-9 p-0"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="px-3 text-sm text-muted-foreground">
                  Page <span className="font-semibold text-foreground mx-1">{currentPage}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  className="h-9 w-9 p-0"
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div className="flex items-center gap-4">
          {showResultsInfo && position === 'standalone' && (
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{startItem}</span>
              <span className="mx-1">—</span>
              <span className="font-medium text-foreground">{endItem}</span>
              {totalItems ? (
                <span className="ml-2">of <span className="font-medium text-foreground">{totalItems}</span> results</span>
              ) : <span className="ml-2">results</span>}
            </div>
          )}

          {showPageSizeSelector && onPageSizeChange && position === 'standalone' && (
            <div className="inline-flex items-center rounded-xl border border-border/50 bg-card/50 px-3 py-1">
              <span className="text-sm text-muted-foreground mr-2">Show</span>
              <Select 
                value={pageSize.toString()} 
                onValueChange={(value) => onPageSizeChange(parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger className="w-20 h-9 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-2">per page</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showJumpToPage && totalPages > 5 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Go to</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={jumpToPageInput}
                onChange={(e) => setJumpToPageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-16 h-8"
                placeholder="Page"
                disabled={isLoading}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleJumpToPage}
                disabled={isLoading || !jumpToPageInput}
                className="h-8 px-2"
              >
                Go
              </Button>
            </div>
          )}

          <div className="inline-flex items-center gap-1 bg-gradient-to-br from-card/80 to-card/60 rounded-xl border border-border/40 p-2 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1 || isLoading || totalPages <= 1}
              className="h-9 w-9 p-0"
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading || totalPages <= 1}
              className="h-9 w-9 p-0"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {totalPages > 1 ? (
              <div className="flex items-center gap-2 px-3">
                {visiblePages.map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <div className="flex h-8 w-8 items-center justify-center">
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => onPageChange(page as number)}
                        disabled={isLoading}
                        className="h-8 w-8"
                        title={`Page ${page}`}
                      >
                        {page}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="px-3 text-sm text-muted-foreground">Page 1 of 1</div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading || totalPages <= 1}
              className="h-9 w-9 p-0"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages || isLoading || totalPages <= 1}
              className="h-9 w-9 p-0"
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 