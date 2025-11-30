import React from 'react';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export function Table({ columns, data, onRowClick }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map(column => (
              <th
                key={column.key}
                className="text-left p-4 text-gray-700"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(column => (
                <td key={column.key} className="p-4">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Tidak ada data
        </div>
      )}
    </div>
  );
}

interface ListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function ListItem({ children, onClick }: ListItemProps) {
  return (
    <div
      className={`bg-white rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
