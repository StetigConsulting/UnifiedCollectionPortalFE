import React from 'react';

interface ColumnConfig<T> {
    label: string;
    key: keyof T;
    sortable?: boolean;
    ignored?: boolean;
}

interface TableProps<T> {
    data: T[];
    columns: ColumnConfig<T>[];
    onRowClick?: (row: T) => void;
    className?: string;
    avoidSrNo?: boolean;
    noDataFoundMessage?: string;
}

const NormalReactTable = <T extends Record<string, any>>({
    data,
    columns,
    onRowClick,
    className,
    avoidSrNo = false,
    noDataFoundMessage = 'No Records Available',
}: TableProps<T>) => {

    return (
        <div className={`${className}`}>
            <div className='overflow-x-auto w-full'>
                <table border={1} width="100%" cellPadding={5} className='w-full caption-bottom text-sm min-w-full border border-gray-200 divide-y divide-gray-200'>
                    {/* Fixed Header: Added sticky class and top-0 to ensure header remains fixed */}
                    <thead className='[&_tr]:border-b bg-lightThemeColor sticky top-0 z-10'>
                        <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                            {columns.map(column => (
                                <th
                                    key={column.key as string}
                                    className='h-10 px-2 text-left align-middle font-medium text-muted-foreground capitalize whitespace-nowrap'>
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {/* Scrollable Body: Applied max-height and overflow-y-auto to the table body */}
                    <tbody className="max-h-[300px] overflow-y-auto">
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <tr
                                    key={index}
                                    onClick={() => onRowClick && onRowClick(item)}
                                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                    className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                                    {columns.map(column => (
                                        <td key={column.key as string}
                                            className='p-2 align-middle'>
                                            {item[column.key] ? item[column.key] : '-'}
                                        </td>
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
        </div>
    );
};

export default NormalReactTable;
