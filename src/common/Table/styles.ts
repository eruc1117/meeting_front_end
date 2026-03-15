import styled from "styled-components";

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid #2e2e35;
    padding: 8px;
    text-align: center;
    color: #c8c8d8;
  }

  th {
    background-color: #1a1a2e;
    color: #9a8ef5;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 0.8rem;
  }

  tr:hover {
    background-color: #1a1a1f;
  }

  tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.02);
  }
`;
