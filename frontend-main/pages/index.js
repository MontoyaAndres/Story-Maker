import { Typography } from "@mui/material";

import { Wrapper } from "../styles";

const Home = () => {
  return (
    <Wrapper>
      <div className="titles">
        <Typography variant="h4" className="title">
          Welcome to Story-Maker
        </Typography>
        <Typography variant="h6" className="description">
          Generate a story by clicking the button below
        </Typography>
      </div>
    </Wrapper>
  );
};

export default Home;
