import styled from "styled-components";

export const StockSection = styled("section")`
  position: relative;
  padding: 6rem 0 4rem;

  @media only screen and (max-width: 1024px) {
    padding: 4rem 0 2rem;
  }
`;

export const Title = styled("h6")`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #18216d;

  @media only screen and (max-width: 414px) {
    font-size: 1.5rem;
  }
`;

export const Content = styled("p")`
  margin: 0 0 1.5rem;
  max-width: 720px;
  color: #18216d;
`;

export const Toolbar = styled("div")`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

export const Status = styled("span")<{ online: boolean | null }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: #18216d;

  &::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ online }) => (online === null ? "#bfbfbf" : online ? "#35c76a" : "#ff5f57")};
  }
`;

export const Card = styled("div")`
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
`;

export const CardTitle = styled("h5")`
  font-size: 1.15rem;
  margin: 0 0 0.75rem;
  color: #18216d;
`;

export const Up = styled("span")`
  color: #d0021b;   /* 台股慣例：紅漲 */
  font-weight: 600;
`;

export const Down = styled("span")`
  color: #1f8f4e;   /* 綠跌 */
  font-weight: 600;
`;

export const Muted = styled("span")`
  color: #8c8c8c;
`;

export const Frame = styled("iframe")`
  width: 100%;
  height: 80vh;
  min-height: 560px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
`;
