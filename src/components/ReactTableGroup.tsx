import React, { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import CustomizedInputWithLabel from './CustomizedInputWithLabel';
import PaginationComponent from './PaginationComponent';

export interface ColumnConfig<T> {
    label: string;
    key: keyof T;
    sortable?: boolean;
    ignored?: boolean;
    align?: 'left' | 'right' | 'center';
}

const ReactTableGroup = <T extends Record<string, any>>({
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
}: any) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof T | null>(defaultSortField || null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Group data by the selected column (e.g., 'agency_name')
    const groupByColumn = (columnKey: keyof T) => {
        return data.reduce((groups, row) => {
            const key = row[columnKey] as unknown as string;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(row);
            return groups;
        }, {} as Record<string, T[]>);
    };

    // Toggle group expansion
    const toggleGroup = (groupKey: string) => {
        setExpandedGroups((prevExpandedGroups) => {
            const newExpandedGroups = new Set(prevExpandedGroups);
            if (newExpandedGroups.has(groupKey)) {
                newExpandedGroups.delete(groupKey);
            } else {
                newExpandedGroups.add(groupKey);
            }
            return newExpandedGroups;
        });
    };

    // Grouped data
    const groupedData = useMemo(() => {
        return groupByColumn('agency_name'); // Group by 'agency_name'
    }, [data]);

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

    return (
        <div className={`${className}`}>
            {!hideSearchAndOtherButtons ? (
                <div className=''>
                    {additionalData && additionalData}

                </div>
            ) : null}

            <div className='overflow-x-auto w-full'>
                <table border={1} width="100%" cellPadding={5} className='w-full caption-bottom text-sm min-w-full border border-gray-200 divide-y divide-gray-200'>
                    <thead className='[&_tr]:border-b bg-lightThemeColor sticky top-0 z-10'>
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key as string} onClick={() => column.sortable && handleSort(column.key)}>
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(groupedData).map((groupKey) => (
                            <React.Fragment key={groupKey}>
                                <tr onClick={() => toggleGroup(groupKey)} style={{ cursor: 'pointer' }}>
                                    <td colSpan={columns.length}>
                                        <strong>{groupKey}</strong> {expandedGroups.has(groupKey) ? '[-]' : '[+]'}
                                    </td>
                                </tr>
                                {expandedGroups.has(groupKey) && groupedData[groupKey].map((row, index) => (
                                    <tr key={index}>
                                        {columns.map((column) => (
                                            <td key={column.key as string}>{row[column.key]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {
                (dynamicPagination && totalPageNumber > 0) &&
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <PaginationComponent totalPages={totalPageNumber} onPageChange={onPageChange} />
                </div>
            }
        </div>
    );
};

export default ReactTableGroup;
