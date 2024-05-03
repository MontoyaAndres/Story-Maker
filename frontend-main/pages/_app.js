import * as React from "react";
import Head from "next/head";
import { AppCacheProvider } from "@mui/material-nextjs/v14-pagesRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
import GithubIcon from "@mui/icons-material/GitHub";

import theme from "../theme";

export default function MyApp(props) {
  const { Component, pageProps } = props;

  return (
    <AppCacheProvider {...props}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
          }}
        >
          <AppBar
            position="fixed"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Toolbar
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" noWrap component="div">
                Story-Maker
              </Typography>
              <Typography
                variant="body1"
                noWrap
                style={{ display: "flex", alignItems: "center" }}
              >
                <HomeIcon />
                <span style={{ marginLeft: 8 }}>
                  <a
                    href="#"
                    style={{ color: "#ffff", textDecoration: "none" }}
                  >
                    Generate Story
                  </a>
                </span>
              </Typography>
              <Typography
                variant="body1"
                noWrap
                style={{ display: "flex", alignItems: "center" }}
              >
                <GithubIcon />
                <span style={{ marginLeft: 8 }}>
                  <a
                    href="https://github.com/MontoyaAndres/Story-Maker"
                    target="_blank"
                    style={{ color: "#ffff", textDecoration: "none" }}
                  >
                    Github
                  </a>
                </span>
              </Typography>
            </Toolbar>
          </AppBar>
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
            <Component {...pageProps} />
          </Box>
        </Box>
      </ThemeProvider>
    </AppCacheProvider>
  );
}
