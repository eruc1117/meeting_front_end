import { StyledTable } from "./styles"; // 引入剛剛的 StyledTable

interface TableProps {
  columnsTitle: string[];
  columns: string[];
  data: { [key: string]: any }[];
}

function TableComponent({columnsTitle, columns, data }: TableProps) {
  return (
    <StyledTable>
      <thead>
        <tr>
          {columnsTitle.map((col) => (
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
