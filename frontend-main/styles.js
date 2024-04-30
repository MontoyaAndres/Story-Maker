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

  .container {
    width: 865px;
    margin: 0 auto;

    .upload {
      display: flex;
      flex-direction: column;
      margin-top: 20px;
      width: 300px;

      label {
        font-size: 16px;
        margin-bottom: 10px;
      }
    }

    .buttons {
      display: flex;
      margin-top: 20px;

      button {
        margin-right: 10px;
      }
    }

    .two {
      display: flex;
      justify-content: space-between;
      grid-gap: 20px;
      margin-top: 20px;

      .select,
      .slider {
        width: 100%;
      }
    }
  }
`;

export const VisuallyHiddenInput = styled.input`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1;
`;
