import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  showingFrom: number;
  showingTo: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  showingFrom,
  showingTo,
}) => {
  const { getColorClasses } = useTheme();
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200'>
      <div className='text-sm text-gray-700'>
        Showing <span className='font-medium'>{showingFrom}</span> to{' '}
        <span className='font-medium'>{showingTo}</span> of{' '}
        <span className='font-medium'>{totalItems}</span> results
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          leftIcon={<ChevronsLeft className='h-4 w-4' />}
          className='border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <span className='sr-only'>First page</span>
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          leftIcon={<ChevronLeft className='h-4 w-4' />}
          className='border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <span className='sr-only'>Previous page</span>
        </Button>

        <div className='flex items-center gap-1'>
          {getPageNumbers().map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size='sm'
              onClick={() => onPageChange(page)}
              className={`min-w-[2.5rem] ${
                currentPage === page
                  ? `bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white border-${getColorClasses('primary')}`
                  : `border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-${getColorClasses('accent')}`
              }`}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          leftIcon={<ChevronRight className='h-4 w-4' />}
          className='border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <span className='sr-only'>Next page</span>
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          leftIcon={<ChevronsRight className='h-4 w-4' />}
          className='border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <span className='sr-only'>Last page</span>
        </Button>
      </div>
    </div>
  );
};
