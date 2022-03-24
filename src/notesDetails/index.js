import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate, useParams } from "react-router-dom";
export function NotesDetails({ notes }) {
  const { noteId } = useParams();
  const note = notes.find((note) => note.id === noteId);
  let navigate = useNavigate();
  if (!note) return null;
  const goEditNote = () => {
    navigate("/notes/" + note.id + "/edit");
  };
  if (!notes) {
    return (
      <>
        <h1>cargando </h1>
      </>
    );
  } else {
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
              >
                {note.name}
              </Typography>
              <Typography>{note.description}</Typography>
            </CardContent>
            <Typography>{note.userId}</Typography>
            <CardActions>
              <Button size="small" onClick={goEditNote}>Edit</Button>
            </CardActions>
          </Card>
        </Grid>
      </Container>
    );
  }
}
