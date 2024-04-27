import styled from "@emotion/styled";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  .titles {
    max-width: 700px;
    margin: 0 auto;
  }

  .title {
    margin: 20px auto;
    text-align: center;
    margin-bottom: 10px;
    font-weight: 600;
  }

  .description {
    text-align: center;
    margin-top: 10px;
  }
`;
