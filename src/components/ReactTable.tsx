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

const ReactTable = <T extends Record<string, any>>({
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
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

    const handleCopy = () => {
        const header = visibleColumns.map(column => column.label).join('\t');
        const text = data
            .map(row => {
                const rowData = visibleColumns
                    .map(column => {
                        const value = row[column.key];
                        return typeof value === "object" && value !== null ? value?.props?.children : value;
                    });

                const isRowEmpty = rowData.every(value => value === '');
                return isRowEmpty ? null : rowData.join('\t');
            })
            .filter(row => row !== null)
            .join('\n');

        const result = `${header}\n${text}`;
        navigator.clipboard.writeText(result).then(() => toast.success('Data copied to clipboard!'));
    };

    const exportToExcel = () => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB').split('/').reverse().join('');
        const formattedTime = now
            .toLocaleTimeString('en-GB', { hour12: false })
            .replace(/:/g, '_');

        const filename = `${fileName}_${formattedDate}_${formattedTime}.xlsx`;

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, filename);
    };

    const convertToCSVString = (value: any): string => {
        if (value === null || value === undefined) {
            return '';
        }

        // Convert other types to string
        let valueAsString = String(value);

        // Escape double quotes and wrap the value in double quotes if it contains commas
        if (valueAsString.includes('"')) {
            valueAsString = `"${valueAsString.replace(/"/g, '""')}"`;
        }

        // Wrap the value in double quotes if it contains commas, line breaks, or double quotes
        if (valueAsString.includes(',') || valueAsString.includes('\n')) {
            valueAsString = `"${valueAsString}"`;
        }

        return valueAsString;
    };


    const exportToCSV = () => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB').split('/').reverse().join('');
        const formattedTime = now
            .toLocaleTimeString('en-GB', { hour12: false })
            .replace(/:/g, '_');

        const filename = `${fileName}_${formattedDate}_${formattedTime}.csv`;

        const csvData = data.map((row) =>
            visibleColumns
                .map((col) => convertToCSVString(row[col.key]))  // Using the helper function
                .join(',')
        );

        const csvString = [visibleColumns.map((col) => col.label).join(','), ...csvData].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

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
                        {customActionButton ? customActionButton :
                            <div className="flex space-x-2">
                                <Button variant="default" onClick={handleCopy}>Copy</Button>
                                <Button variant="default" onClick={() => {
                                    customExport ? handleExportFile('xlsx') : exportToExcel()
                                }}>Excel</Button>
                                <Button variant="default" onClick={() => {
                                    customExport ? handleExportFile('csv') : exportToCSV()
                                }}>CSV</Button>
                                {/* <Button variant="default" onClick={() => {
                                    customExport ? handleExportFile('pdf') : downloadPdf()
                                }}>PDF</Button> */}
                            </div>
                        }
                        {isSelectable && selectedRow !== null && (
                            <div className="flex justify-center">
                                {onRowSelectButtons}
                            </div>
                        )}
                        <CustomizedInputWithLabel
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e)}
                        />
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
                    <thead className='[&_tr]:border-b bg-lightThemeColor sticky top-0 z-10'>
                        <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                            {isSelectable && <th></th>}
                            {!avoidSrNo && <th className='h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] whitespace-nowrap'>Sr.No</th>}
                            {columns.map(column => (
                                <th
                                    key={column.key as string}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                    className='h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] whitespace-nowrap capitalize'
                                    style={{ cursor: column.sortable ? 'pointer' : 'default' }}
                                >
                                    {column.label} {sortField === column.key ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                                <tr
                                    key={index}
                                    onClick={() => onRowClick && onRowClick(item)}
                                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                    className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'
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
                                        > {item[column.key] || item[column.key] === 0 ? item[column.key] : '-'}</td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className='text-center' colSpan={avoidSrNo ? columns.length : columns.length + 1}>{noDataFoundMessage}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {
                !dynamicPagination && totalPages > 1 && !noPagination &&
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            }
            {/* {
                dynamicPagination &&
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <button onClick={() => onPageChange(pageNumber - 1)} disabled={pageNumber === 1}>
                        Previous
                    </button>
                    <span style={{ margin: '0 10px' }}>{pageNumber}</span>
                    <button onClick={() => onPageChange(pageNumber + 1)} disabled={totalPageNumber == pageNumber}>
                        Next
                    </button>
                </div>
            } */}
            {
                (dynamicPagination && totalPageNumber > 0) &&
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <PaginationComponent totalPages={totalPageNumber} onPageChange={onPageChange} />
                </div>
            }
        </div >
    );
};

export default ReactTable;