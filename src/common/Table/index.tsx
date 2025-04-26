import { StyledTable } from "./styles"; // 引入剛剛的 StyledTable

interface TableProps {
  columns: string[];
  data: { [key: string]: any }[];
}

function TableComponent({ columns, data }: TableProps) {
  return (
    <StyledTable>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {columns.map((col) => (
              <td key={col}>{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
}

export default TableComponent;
