import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate, useParams } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { listNotes } from "../graphql/queries";
import { Amplify, API, Storage } from "aws-amplify";

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
export function NotesDetails() {
  const classes = useStyles();
  const { noteId } = useParams();
  const [notes, setNotes] = useState([]);

  let navigate = useNavigate();
  const goEditNote = () => {
    navigate("/notes/" + note.id + "/edit");
  };
  const note = notes.find((note) => note.id === noteId);
  useEffect(() => {
    fetchNotes();
  }, [notes]);

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
  if (!note) {
    return (
      <>
        <Grid
          md={12}
          xs={12}
          container
          alignItems="center"
          justifyContent="flex-end"
          direction="column"
          sx={{ mt: "25%" }}
        >
          <CircularProgress />
        </Grid>
      </>
    );
  }
  return (
    <Container sx={{ py: 2 }} maxWidth="xs">
      <Grid item xs={12} sm={6} md={4}>
        <Card
          sx={{
            height: "10%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardMedia
            component="img"
            sx={{
              pt: "0%",
              height: "35%",
            }}
            image={note.image}
            alt="random"
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography
              gutterBottom
              variant="h5"
              align="center"
              component="h2"
              className={classes.title}
            >
              {note.name}
            </Typography>
            <Typography>{note.description}</Typography>
          </CardContent>
          <Typography className={classes.userId}>{note.userId}</Typography>
          <CardActions>
            <Button size="small" onClick={goEditNote}>
              Edit
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Container>
  );
}
