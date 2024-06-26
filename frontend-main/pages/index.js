import { useState } from "react";

import {
  TextField,
  Typography,
  Button,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  Slider,
} from "@mui/material";
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
    creativity: 100,
    email: "",
    downloadEmail: "",
    characters: "",
    size: "Short (1500 - 3000 words)",
    atmosphere: "",
    genre: "Non-Fiction",
    perspective: "Third Person",
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

  const handleValues = (e, customName) => {
    const { name, value } = e.target;
    setValues({ ...values, [name || customName]: value });
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
      setStory(null);

      if (!values.email) {
        throw new Error("Email is required");
      }

      if (files) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        await fetch(
          `https://story-maker.fly.dev/upload-multiple?email=${values.email}`,
          {
            method: "POST",
            body: formData,
          }
        );
      }

      const apiChat = await fetch(
        "https://story-maker.fly.dev/api/chat/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            messages: [
              {
                content: `You are a Book writer and publisher especialized on Amazon KDP. Always answer the query using the provided context information, and prior knowledge only if needed.  Some rules to follow:  1. Use the 'amazon_book_data' tool to find the best Amazon keywords to use on the title and description of the book  2. Never directly reference the given context in your answer.  3. Avoid statements like 'Based on the context, ...' or 'The context information ...' or anything along those lines. 4. Make sure that at the end of all the proces you return only the following JSON format: '{title, description, keywords, chapters_outline: [{chapter_number, chapter_title, chapter_description}]}'. Ok, Given the context information and prior knowledge, please write a Book proposal in markdown format, and save it as a note for email '${
                  values.email
                }' using the 'note_saver' tool, and make sure to finally return only the following JSON format: '{title, description, keywords, chapters_outline: [{chapter_number, chapter_title, chapter_description}]}', with the following input parameters: ${JSON.stringify(
                  values
                )}`,
                role: "user",
              },
            ],
          }),
        }
      ).then((res) => res.json());

      if (apiChat && apiChat.result?.content !== "{}") {
        console.log("apiChat:", apiChat);
        setStory(JSON.parse(apiChat.result.content));
      } else {
        throw new Error("Error generating story");
      }

      setStatus("resolved");
    } catch (error) {
      console.error(error);
      setStatus("rejected");
    }
  };

  const handleSave = async () => {
    try {
      setStatus("pending");

      if (!values.email) {
        throw new Error("Email is required");
      }

      if (!story) {
        throw new Error("Generate a story first");
      }

      const response = await fetch(
        "https://story-maker.fly.dev/api/chat/request-2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            messages: [
              {
                content: `You are a Book writer and publisher especialized on Amazon KDP. Don't describe the chapter, instead use all of your knowledge to find the best inspiration and write the actual content of each chapter of the book, please loop trough all the chapters and write each full chapter with at least 500 words per chapter in markdown format, and save it as a note for email '${
                  values.email
                }' using the 'note_saver' tool, with the following input parameters: ${JSON.stringify(
                  values
                )} ${JSON.stringify(story)}`,
                role: "user",
              },
            ],
          }),
        }
      ).then((res) => res.json());

      if (response?.result?.content !== "{}") {
        setEmailSent(true);
        setStatus("resolved");
      } else {
        throw new Error("Error saving story");
      }
    } catch (error) {
      console.error(error);
      setEmailSent(false);
    }
  };

  const handleDownload = async () => {
    try {
      setStatus("pending_download");

      if (!values.downloadEmail) {
        throw new Error("Email is required");
      }

      const response = await fetch(
        `https://story-maker.fly.dev/download?email=${values.downloadEmail}`
      ).then((res) => res.text());

      const fileName = "downloaded_text.md";
      const element = document.createElement("a");

      element.setAttribute(
        "href",
        "data:text/markdown;charset=utf-8," + encodeURIComponent(response)
      );
      element.setAttribute("download", fileName);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setStatus("resolved");
    } catch (error) {
      console.error(error);
      setStatus("rejected");
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
      <Snackbar
        open={status === "rejected"}
        autoHideDuration={6000}
        onClose={() => setStatus("idle")}
      >
        <Alert
          onClose={() => setStatus("idle")}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          error generating, please try again
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
            placeholder="user@example.com"
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
          <Typography variant="h5" className="description">
            Write Smarter, Publish Faster!
          </Typography>
          <Typography className="description">
            AI Story Maker automates niche discovery, content creation, and
            market optimization for Amazon KDP with advanced AI and human
            co-creation.
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
            placeholder="Example: Love story with two women and one man."
            fullWidth
            multiline
            variant="standard"
            value={values.description}
            onChange={handleValues}
          />
          <div className="two">
            <div className="select">
              <InputLabel id="size-label">Story size</InputLabel>
              <Select
                labelId="size-label"
                id="size"
                value={values.size}
                fullWidth
                label="Story size"
                variant="standard"
                onChange={(e) => handleValues(e, "size")}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={"Short (1500 - 3000 words)"}>
                  Short (1500 - 3000 words)
                </MenuItem>
                <MenuItem value={"Medium (4000 - 6000 words)"}>
                  Medium (4000 - 6000 words)
                </MenuItem>
                <MenuItem value={"Long (7000 - 9000 words)"}>
                  Long (7000 - 9000 words)
                </MenuItem>
              </Select>
            </div>
            <TextField
              autoFocus
              required
              margin="dense"
              id="characters"
              name="characters"
              label="Characters"
              placeholder="Enter character details (e.g., John, a quirky inventor, and Mary, a mysterious detective.)"
              fullWidth
              multiline
              variant="standard"
              value={values.characters}
              onChange={handleValues}
            />
          </div>
          <div className="two">
            <TextField
              autoFocus
              required
              margin="dense"
              id="atmosphere"
              name="atmosphere"
              label="Atmosphere"
              placeholder="Enter setting and atmosphere (e.g., A medieval kingdom with a mystical aura, surrounded by dense forests and ancient ruins.)"
              fullWidth
              multiline
              variant="standard"
              value={values.atmosphere}
              onChange={handleValues}
            />
            <TextField
              autoFocus
              required
              margin="dense"
              id="email"
              name="email"
              label="Email"
              placeholder="user@example.com"
              fullWidth
              multiline
              variant="standard"
              value={values.email}
              onChange={handleValues}
            />
          </div>
          <div className="two">
            <div className="select">
              <InputLabel id="genre-label">Genre</InputLabel>
              <Select
                labelId="genre-label"
                id="genre"
                value={values.genre}
                fullWidth
                label="Genre"
                variant="standard"
                onChange={(e) => handleValues(e, "genre")}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={"Science Fiction"}>Science Fiction</MenuItem>
                <MenuItem value={"Romance"}>Romance</MenuItem>
                <MenuItem value={"Mystery"}>Mystery</MenuItem>
                <MenuItem value={"Fantasy"}>Fantasy</MenuItem>
                <MenuItem value={"Thriller"}>Thriller</MenuItem>
                <MenuItem value={"Historical"}>Historical</MenuItem>
                <MenuItem value={"Adventure"}>Adventure</MenuItem>
                <MenuItem value={"Horror"}>Horror</MenuItem>
                <MenuItem value={"Comedy"}>Comedy</MenuItem>
                <MenuItem value={"Action"}>Action</MenuItem>
                <MenuItem value={"Western"}>Western</MenuItem>
                <MenuItem value={"Documentary"}>Documentary</MenuItem>
                <MenuItem value={"Fiction"}>Fiction</MenuItem>
                <MenuItem value={"Non-Fiction"}>Non-Fiction</MenuItem>
                <MenuItem value={"Biography"}>Biography</MenuItem>
                <MenuItem value={"Self-Help"}>Self-Help</MenuItem>
              </Select>
            </div>
            <div className="select">
              <InputLabel id="perspective-label">Perspective</InputLabel>
              <Select
                labelId="perspective-label"
                id="perspective"
                value={values.perspective}
                fullWidth
                label="Perspective"
                variant="standard"
                onChange={(e) => handleValues(e, "perspective")}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={"First Person"}>First Person</MenuItem>
                <MenuItem value={"Third Person"}>Third Person</MenuItem>
                <MenuItem value={"Omniscient"}>Omniscient</MenuItem>
                <MenuItem value={"Second Person"}>Second Person</MenuItem>
                <MenuItem value={"Stream of Consciousness"}>
                  Stream of Consciousness
                </MenuItem>
                <MenuItem value={"Epistolary"}>Epistolary</MenuItem>
                <MenuItem value={"Multiple Perspectives"}>
                  Multiple Perspectives
                </MenuItem>
                <MenuItem value={"Interactive"}>Interactive</MenuItem>
                <MenuItem value={"Observer"}>Observer</MenuItem>
                <MenuItem value={"Camera Eye"}>Camera Eye</MenuItem>
              </Select>
            </div>
            <div className="slider">
              <Typography gutterBottom>Creativity</Typography>
              <Slider
                defaultValue={100}
                valueLabelDisplay="auto"
                name="creativity"
                value={values.creativity}
                onChange={(e) => handleValues(e, "creativity")}
              />
            </div>
          </div>
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
              "Generate Story Proposal"
            )}
          </Button>
          {story && (
            <>
              <Typography variant="body1" style={{ marginTop: 20 }}>
                {story?.title}
              </Typography>
              <Typography variant="body1" style={{ marginTop: 20 }}>
                {story?.description}
              </Typography>
              <Typography variant="body1" style={{ marginTop: 20 }}>
                {story?.keywords}
              </Typography>
              {story?.chapters_outline?.length > 0 &&
                story?.chapters_outline?.map((chapter) => (
                  <div key={chapter.chapter_number}>
                    <Typography variant="body1" style={{ marginTop: 20 }}>
                      {chapter.chapter_title}:
                    </Typography>
                    {chapter.chapter_description}
                  </div>
                ))}
              <div className="buttons">
                <Button
                  variant="contained"
                  color="primary"
                  style={{ width: 200 }}
                  onClick={handleSave}
                  disabled={status === "pending"}
                >
                  {status === "pending" ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Approve Book Proposal"
                  )}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ width: 200 }}
                  onClick={handleGenerate}
                  disabled={status === "pending"}
                >
                  {status === "pending" ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Re-generate"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Wrapper>
      <Wrapper>
        <div className="titles">
          <Typography variant="h4" className="title">
            Download your document
          </Typography>
          <Typography variant="h6" className="description">
            Download your story here! Enter your email to get it
          </Typography>
        </div>
        <div className="container">
          <TextField
            autoFocus
            required
            margin="dense"
            id="downloadEmail"
            name="downloadEmail"
            label="Email"
            placeholder="user@example.com"
            fullWidth
            multiline
            variant="standard"
            value={values.downloadEmail}
            onChange={handleValues}
          />
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: 20, width: 200 }}
            onClick={handleDownload}
            disabled={status === "pending_download"}
          >
            {status === "pending_download" ? (
              <CircularProgress size={24} />
            ) : (
              "Download Completed Book"
            )}
          </Button>
        </div>
      </Wrapper>
    </>
  );
};

export default Home;
