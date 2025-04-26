import styled from "styled-components";

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color:rgb(38, 70, 122);
    color: white;
  }

  tr:hover {
    background-color:rgb(205, 205, 205);
  }
`;
