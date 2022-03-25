import { listNotes } from "../graphql/queries";
import { deleteNote as deleteNoteMutation } from "../graphql/mutations";
import { useEffect, useState } from "react";
import { API, Storage } from "aws-amplify";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
const useStyles = makeStyles({
  headTitle: {
    textDecoration: "underline red",
  },
  title: {
    padding: "0px",
    color: "#1976d2",
  },
  labels: {
    margin: "20px",
    color: "#1976d2",
    textAlign: "center",
    fontSize: "20px",
  },
  inputNote: {
    height: "100px",
  },

  userId: {
    padding: "10px",
    color: "gray",
  },
});
export function NotesGird({ signOut, user }) {
  const classes = useStyles();
  let navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const theme = createTheme();
  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const image = await Storage.get(note.image);
          note.image = image;
        }
        return note;
      })
    );
    setNotes(apiData.data.listNotes.items);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter((note) => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }
  const goDetails = (id) => {
    navigate("/notes/" + id);
  };
  const goEdit = (id) => {
    navigate("/notes/" + id + "/edit");
  };
  console.log(notes);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Container sx={{ py: 8 }} maxWidth="md">
        <Typography
          component="h4"
          variant="h4"
          align="left"
          color="gray"
          gutterBottom
          clasName={classes.headTitle}
        >
          Notes of {user.username}:
        </Typography>
        <Grid container spacing={4}>
          {notes.map((note) => (
            <Grid item key={note.id || note.name} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    pt: "0%",
                    height: "30%",
                  }}
                  image={note.image}
                  alt="random"
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    className={classes.title}
                    gutterBottom
                    variant="h5"
                    align="center"
                  >
                    {note.name}
                  </Typography>
                  <Typography>{note.description}</Typography>
                </CardContent>
                <Typography className={classes.userId}>
                  {note.userId}
                </Typography>
                <CardActions>
                  <Button size="small" onClick={() => goDetails(note.id)}>
                    View
                  </Button>
                  <Button size="small" onClick={() => goEdit(note.id)}>
                    Edit
                  </Button>
                  <Button size="small" onClick={() => deleteNote(note)}>
                    delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
