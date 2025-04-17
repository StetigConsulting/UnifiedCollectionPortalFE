import React, { useState } from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from './ui/pagination';

interface PaginationComponentProps {
    totalPages: number;
    onPageChange?: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({ totalPages, onPageChange }) => {
    const [currentPage, setCurrentPage] = useState<number>(1);

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
        onPageChange?.(page);
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            const prev = currentPage - 1;
            setCurrentPage(prev);
            onPageChange?.(prev);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            const next = currentPage + 1;
            setCurrentPage(next);
            onPageChange?.(next);
        }
    };

    const renderPageNumbers = () => {
        const pages: React.ReactNode[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <PaginationItem key={i}>
                        <PaginationLink

                            isActive={currentPage === i}
                            onClick={() => handlePageClick(i)}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            pages.push(
                <PaginationItem key={1}>
                    <PaginationLink

                        isActive={currentPage === 1}
                        onClick={() => handlePageClick(1)}
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            if (currentPage > 3) {
                pages.push(<PaginationEllipsis key="start-ellipsis" />);
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            isActive={currentPage === i}
                            onClick={() => handlePageClick(i)}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (currentPage < totalPages - 2) {
                pages.push(<PaginationEllipsis key="end-ellipsis" />);
            }

            pages.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink

                        isActive={currentPage === totalPages}
                        onClick={() => handlePageClick(totalPages)}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return pages;
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious onClick={handlePrevious} aria-disabled={currentPage === 1} />
                </PaginationItem>

                {renderPageNumbers()}

                <PaginationItem>
                    <PaginationNext onClick={handleNext} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationComponent;
