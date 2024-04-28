import { useState } from "react";

import { TextField, Typography, Button, Snackbar, Alert } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { VisuallyHiddenInput, Wrapper } from "../styles";

const Home = () => {
  const [values, setValues] = useState({
    description: "",
    email: "",
  });
  const [files, setFiles] = useState(null);
  const [status, setStatus] = useState("idle");
  const [story, setStory] = useState(null);
  const [open, setOpenDialog] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleUpload = (e) => {
    const files = e.target.files;
    setFiles(Array.from(files));
  };

  const handleValues = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleOpenDialog = (value) => {
    setOpenDialog(value);

    if (!value) {
      setValues({ ...values, email: "" });
    }
  };

  const handleGenerate = async () => {
    try {
      setStatus("pending");

      console.log(values, files);

      // Call the API to generate the story
      // Then set the story to the state
      setStory("This is a story");

      setStatus("resolved");
    } catch (error) {
      console.error(error);
      setStatus("rejected");
    }
  };

  const handleSave = async () => {
    try {
      // Call the API to save the story
      // Then show a success message
      setEmailSent(true);
      handleOpenDialog(false);
    } catch (error) {
      console.error(error);
      setEmailSent(false);
    }
  };

  return (
    <>
      <Snackbar
        open={emailSent}
        autoHideDuration={6000}
        onClose={() => setEmailSent(false)}
      >
        <Alert
          onClose={() => setEmailSent(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          We'll send the story to your email
        </Alert>
      </Snackbar>
      <Dialog
        open={open}
        onClose={() => handleOpenDialog(false)}
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            handleSave();
          },
        }}
      >
        <DialogTitle>We'll send the story to your email</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter the email</DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="email"
            type="email"
            value={values.email}
            onChange={handleValues}
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleOpenDialog(false)}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
      <Wrapper>
        <div className="titles">
          <Typography variant="h4" className="title">
            Welcome to Story-Maker
          </Typography>
          <Typography variant="h6" className="description">
            Generate a story by clicking the button below
          </Typography>
        </div>
        <div className="container">
          <TextField
            autoFocus
            required
            margin="dense"
            id="description"
            name="description"
            label="Description"
            fullWidth
            multiline
            variant="standard"
            value={values.description}
            onChange={handleValues}
          />
          <div className="upload">
            <label htmlFor="upload" style={{ marginTop: 10 }}>
              Upload any file
            </label>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              id="upload"
            >
              Upload files
              <VisuallyHiddenInput
                type="file"
                multiple={true}
                onChange={handleUpload}
              />
            </Button>
          </div>
          {files?.length > 0 &&
            files?.map((file) => (
              <Typography key={file.name} variant="body1">
                {file.name}
              </Typography>
            ))}
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: 20, width: 200 }}
            onClick={handleGenerate}
            disabled={status === "pending"}
          >
            {status === "pending" ? (
              <CircularProgress size={24} />
            ) : (
              "Generate Story"
            )}
          </Button>
          {status === "resolved" && (
            <>
              <Typography variant="body1" style={{ marginTop: 20 }}>
                {story}
              </Typography>
              <div className="buttons">
                <Button
                  variant="contained"
                  color="primary"
                  style={{ width: 200 }}
                  onClick={() => handleOpenDialog(true)}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ width: 200 }}
                >
                  Re-generate
                </Button>
              </div>
            </>
          )}
        </div>
      </Wrapper>
    </>
  );
};

export default Home;
