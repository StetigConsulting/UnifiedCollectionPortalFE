import React, { useState } from 'react';

interface ColumnConfig<T> {
    label: string;
    key: keyof T;
    sortable?: boolean;
}

interface TableProps<T> {
    data: T[];
    columns: ColumnConfig<T>[];
    itemsPerPage?: number;
    onRowClick?: (row: T) => void;
    className?: string;
}

const ReactTable = <T extends Record<string, any>>({
    data,
    columns,
    itemsPerPage = 5,
    onRowClick,
    className,
}: TableProps<T>) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof T | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredData = data.filter(item =>
        columns.some(column =>
            item[column.key].toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const sortedData = sortField
        ? [...filteredData].sort((a, b) => {
            if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        })
        : filteredData;

    // Pagination
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

    return (
        <div className={className}>
            <table border={1} width="100%" cellPadding={5} className='w-full caption-bottom text-sm min-w-full border border-gray-200 divide-y divide-gray-200'>
                <thead className='[&_tr]:border-b bg-gray-100'>
                    <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                        {columns.map(column => (
                            <th
                                key={column.key as string}
                                onClick={() => column.sortable && handleSort(column.key)}
                                className='h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] whitespace-nowrap'
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
                                {columns.map(column => (
                                    <td key={column.key as string}
                                        className='p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] whitespace-nowrap'
                                    >{item[column.key]}</td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length}>No data found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </button>
                <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default ReactTable;