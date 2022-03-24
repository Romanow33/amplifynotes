import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useEffect, useState } from "react";
import { API, Storage } from "aws-amplify";
import { listNotes } from "../graphql/queries";
import { updateNote as updateNoteMutation } from "../graphql/mutations";

export function EditForm({ notes }) {
  const [isSend, setIsSend] = useState(false);
  const [allnotes, setAllNotes] = useState([]);
  const { noteId } = useParams();
  const note = notes.find((note) => note.id === noteId);

  useEffect(() => {
    fetchNotes();
  }, []);
  async function updateNote(valores, e) {
    if (!valores.image) return;
    const values = {
      ...valores,
      id: note.id,
      image: valores.image.name,
      userId: note.userId,
    };
    await Storage.put(valores.image.name, valores.image);
    fetchNotes();
    if (!valores.name || !valores.description) return;
    await API.graphql({
      query: updateNoteMutation,
      variables: { input: values },
    });
    if (valores.image) {
      const image = await Storage.get(values.image);
      valores.image = image;
    }
    setAllNotes([...allnotes, values]);
  }

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
    setAllNotes(apiData.data.listNotes.items);
  }
  if (!note) return null;
  if (!notes) {
    return (
      <>
        <h1>cargando </h1>
      </>
    );
  } else {
    return (
      <Formik
        initialValues={{
          name: "",
          description: "",
          image: "",
        }}
        validate={(values) => {
          let errors = {};
          //Title validation
          if (!values.name) {
            errors.name = "Please enter a title";
          } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.title)) {
            errors.name = "title only contain letters and spacings";
          }
          //Content Validation
          if (!values.description) {
            errors.description = "The note need content";
          }

          return errors;
        }}
        onSubmit={(valores, { resetForm }) => {
          let data = new FormData();
          data.append("image", valores.image);
          updateNote(valores);
          resetForm();
          setIsSend(true);
          setTimeout(() => setIsSend(false), 2000);
        }}
      >
        {({ errors, setFieldValue }) => (
          <Form>
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
                  <label htmlFor="image">Change image</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={(event) =>
                      setFieldValue("image", event.target.files[0])
                    }
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
                    <div>
                      <label htmlFor="name">Change title</label>
                      <Field
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Take a shower"
                      />
                      <ErrorMessage
                        name="name"
                        component={() => <div>{errors.name}</div>}
                      />
                    </div>
                    <Typography>{note.description}</Typography>
                    <div>
                      <label htmlFor="description">Change text</label>
                      <Field
                        type="text"
                        id="description"
                        name="description"
                        placeholder="deberia bañarme a las 16"
                      />
                      <ErrorMessage
                        name="description"
                        component={() => <div>{errors.description}</div>}
                      />
                    </div>
                  </CardContent>
                  <Typography>{note.userId}</Typography>
                  <CardActions>
                    <Button size="small" type="submit">
                      Submit
                    </Button>
                    {isSend && <p>Note create!</p>}
                  </CardActions>
                </Card>
              </Grid>
            </Container>
          </Form>
        )}
      </Formik>
    );
  }
}
