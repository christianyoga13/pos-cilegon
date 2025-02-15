import { type ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Column<T> {
  header: string
  accessorKey: keyof T
  cell?: (item: T) => ReactNode
}

interface ReusableTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  description?: string
  className?: string
  showCard?: boolean
}

export default function ReusableTable<T extends Record<string, unknown>>({
  data,
  columns,
  title,
  description,
  className = "",
  showCard = true,
}: ReusableTableProps<T>) {
  const TableContent = () => (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.header}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={`${item.id || index}-${column.header}`}>
                {column.cell ? column.cell(item) : (item[column.accessorKey] as ReactNode)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  if (!showCard) {
    return <TableContent />
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <div className="rounded-md bg-muted/50 p-4">
              <p>{description}</p>
            </div>
          )}
        </CardHeader>
      )}
      <CardContent>
        <TableContent />
      </CardContent>
    </Card>
  )
}

