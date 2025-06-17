import React, { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import CustomizedInputWithLabel from './CustomizedInputWithLabel';
import PaginationComponent from './PaginationComponent';

interface ColumnConfig<T> {
    label: string;
    key: keyof T;
    sortable?: boolean;
    ignored?: boolean;
    align?: string;
}

interface TableProps<T> {
    data: T[];
    columns: ColumnConfig<T>[];
    itemsPerPage?: number;
    onRowClick?: (row: T) => void;
    onRowSelect?: (selectedRow: T | null) => void;
    className?: string;
    avoidSrNo?: boolean;
    customActionButton?: React.ReactNode;
    additionalData?: React.ReactNode;
    noPagination?: boolean;
    onRowSelectButtons?: React.ReactNode;
    additionalDataBetweenTableAndAction?: React.ReactNode;
    selectedRow?: any;
    isSelectable?: boolean;
    hideSearchAndOtherButtons?: boolean;
    fileName?: string;
    noDataFoundMessage?: string;
    defaultSortField?: keyof T;
    defaultSortOrder?: 'asc' | 'desc';
    dynamicPagination?: boolean;
    pageNumber?: number;
    totalPageNumber?: number;
    onPageChange?: (newPage: number) => void;
    downloadPdf?: () => void;
    customExport?: boolean;
    handleExportFile?: (type: string) => void;
}

const ReactTableReconciliation = <T extends Record<string, any>>({
    data,
    columns,
    itemsPerPage = 50,
    onRowClick,
    onRowSelect,
    className,
    avoidSrNo = false,
    customActionButton,
    noPagination,
    onRowSelectButtons,
    selectedRow,
    isSelectable = false,
    additionalData,
    hideSearchAndOtherButtons = false,
    additionalDataBetweenTableAndAction,
    fileName = 'Agency',
    noDataFoundMessage = 'No Records Available',
    defaultSortField = '',
    defaultSortOrder = 'asc',
    dynamicPagination = false,
    pageNumber = 1,
    totalPageNumber = 1,
    onPageChange,
    downloadPdf = () => { },
    customExport,
    handleExportFile
}: TableProps<T>) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof T | null>(defaultSortField || null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredData = data.filter(item =>
        columns.some(column =>
            item[column.key]?.toString()?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const sortedData = useMemo(() => {
        if (!sortField) return filteredData;

        return [...filteredData].sort((a, b) => {
            const valueA = a[sortField];
            const valueB = b[sortField];

            if (typeof valueA === "string" && typeof valueB === "string") {
                return sortOrder === "asc"
                    ? valueA.localeCompare(valueB, undefined, { sensitivity: "base" })
                    : valueB.localeCompare(valueA, undefined, { sensitivity: "base" });
            }

            if (typeof valueA === "number" && typeof valueB === "number") {
                return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
            }
            return 0;
        });
    }, [filteredData, sortField, sortOrder]);


    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData

    const handleSort = (field: keyof T) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const visibleColumns = columns.filter(column => !column.ignored);

    const handleRowSelect = (row: T) => {
        if (selectedRow?.id === row.id) {
            onRowSelect?.(null);
        } else {
            onRowSelect?.(row);
        }
    };

    return (
        <div className={`${className}`}>
            {!hideSearchAndOtherButtons ?
                <div className=''>
                    {additionalData && additionalData}
                    <div className="flex justify-between items-center py-4">
                        {isSelectable && selectedRow !== null && (
                            <div className="flex justify-center">
                                {onRowSelectButtons}
                            </div>
                        )}
                    </div>

                    {additionalDataBetweenTableAndAction && additionalDataBetweenTableAndAction}
                </div>
                : <>{isSelectable && selectedRow !== null && (
                    <div className="mb-4">
                        {onRowSelectButtons}
                    </div>
                )}</>
            }
            <div className='overflow-x-auto w-full'>
                <table border={1} width="100%" cellPadding={5} className='w-full caption-bottom text-sm min-w-full border border-gray-200 divide-y divide-gray-200'>
                    <thead className="bg-gray-100 z-10 text-sm text-black-500 uppercase tracking-wider">
                        <tr>
                            {isSelectable && <th className="px-2 py-3"></th>}
                            {!avoidSrNo && <th className="px-2 py-3">#</th>}
                            {columns.map(column => (
                                <th
                                    key={column.key as string}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                    className={`px-2 py-3 cursor-${column.sortable ? 'pointer' : 'default'} whitespace-nowrap`}
                                >
                                    <span className="flex items-center gap-1">
                                        {column.label}
                                        {/* {sortField === column.key && (sortOrder === 'asc' ? '↑' : '↓')} */}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => {
                                const isTotalRow = !Number.isFinite(item.index);
                                const rowKey = `${index}-${item.index}`;

                                return (
                                    <React.Fragment key={rowKey}>
                                        <tr
                                            key={rowKey}
                                            onClick={() => onRowClick && onRowClick(item)}
                                            className={`transition-all border-b hover:bg-gray-50`}
                                            style={item?.color ? { backgroundColor: item?.color } : {}}
                                        >
                                            {isSelectable && <td className="p-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRow?.id === item?.id}
                                                    onChange={() => handleRowSelect(item)}
                                                />
                                            </td>}
                                            {!avoidSrNo &&
                                                <td>{index + 1}</td>}
                                            {columns.map(column => (
                                                <td key={column.key as string}
                                                    className={`p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] whitespace-nowrap ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}
                                                > {item[column.key] || item[column.key] === 0 ? item[column.key] : isTotalRow ? '' : '-'}</td>
                                            ))}
                                        </tr>
                                        {isTotalRow && index == paginatedData?.length && (
                                            <tr>
                                                <td colSpan={isSelectable ? columns.length + (!avoidSrNo ? 2 : 1) : columns.length + (!avoidSrNo ? 1 : 0)}>&nbsp;</td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )
                            })
                        ) : (
                            <tr>
                                <td className='text-center' colSpan={avoidSrNo ? columns.length : columns.length + 1}>{noDataFoundMessage}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {
                (dynamicPagination && totalPageNumber > 0) &&
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <PaginationComponent totalPages={totalPageNumber} onPageChange={onPageChange} />
                </div>
            }
        </div >
    );
};

export default ReactTableReconciliation;