import { useEffect, useState } from "react";
import { API, Storage } from "aws-amplify";
import { listNotes } from "../graphql/queries";
import { createNote as createNoteMutation } from "../graphql/mutations";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Button from "@mui/material/Button";

import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Grid, Paper } from "@mui/material";

const useStyles = makeStyles({
  title: {
    textAlign: "center",
    padding: "20px",
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

  buton: {
    fontSize: "15px",
    fontFamily: "Arial",
    height: "50px",
    borderWidth: "1px",
    color: "#666666",
    borderColor: "#dcdcdc",
    fontWeight: "bold",
  },
  errorMsg: {
    color: "red",
    fontWeight: "bold",
    fontSize: "10px",
  },
  goodmsg: {
    color: "green",
  },
});
export function NotesForm(user) {
  const classes = useStyles();
  const theme = createTheme();
  const [notes, setNotes] = useState([]);
  const [isSend, setIsSend] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    setUserId(user.user.username);
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

  async function createNote(valores, e) {
    if (!valores.image) return;
    const values = {
      ...valores,
      image: valores.image.name,
      userId: userId,
    };
    await Storage.put(valores.image.name, valores.image);
    fetchNotes();
    if (!valores.name || !valores.description) return;
    await API.graphql({
      query: createNoteMutation,
      variables: { input: values },
    });
    if (valores.image) {
      const image = await Storage.get(values.image);
      valores.image = image;
    }
    setNotes([...notes, values]);
  }

  return (
    <>
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
          if (!values.image) {
            errors.image = "Please select a image";
          }

          return errors;
        }}
        onSubmit={(valores, { resetForm }) => {
          let data = new FormData();
          data.append("image", valores.image);
          createNote(valores);
          resetForm();
          setIsSend(true);
          setTimeout(() => setIsSend(false), 2000);
        }}
      >
        {({ errors, setFieldValue }) => (
          <Form>
            <ThemeProvider theme={theme}>
              <Container component="main" maxWidth="md">
                <Paper
                  elevation={8}
                  sx={{
                    marginTop: 4,
                  }}
                >
                  <Typography
                    className={classes.title}
                    component="h1"
                    variant="h5"
                  >
                    Create note
                  </Typography>

                  <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Grid item md={12} spacing={6}>
                      <Typography className={classes.labels} htmlFor="name">
                        Title of note:
                      </Typography>
                      <Field
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Many pancake"
                      />
                      <ErrorMessage
                        name="name"
                        component={() => (
                          <div className={classes.errorMsg}>{errors.name}</div>
                        )}
                      />
                    </Grid>
                    <Grid item md={12}>
                      <Typography
                        className={classes.labels}
                        htmlFor="description"
                      >
                        description of note:
                      </Typography>

                      <Field
                        className={classes.inputNote}
                        type="text"
                        id="description"
                        name="description"
                        placeholder="I need an inordinate amount of pancake!!!"
                        as="textarea"
                      />

                      <ErrorMessage
                        name="description"
                        component={() => (
                          <div className={classes.errorMsg}>
                            {errors.description}
                          </div>
                        )}
                      />
                    </Grid>
                    <Grid item md={12} xs={6}>
                      <Typography className={classes.labels} htmlFor="image">
                        Selecciona una imagen:
                      </Typography>

                      <input
                        className={classes.buton}
                        type="file"
                        id="image"
                        name="image"
                        onChange={(event) =>
                          setFieldValue("image", event.target.files[0])
                        }
                      />
                      <ErrorMessage
                        name="image"
                        component={() => (
                          <div className={classes.errorMsg}>{errors.image}</div>
                        )}
                      />
                      {isSend && (
                        <p className={classes.goodmsg}>Note create!</p>
                      )}
                    </Grid>
                    <Button
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                      type="submit"
                    >
                      Crear nota
                    </Button>
                  </Grid>
                </Paper>
              </Container>
            </ThemeProvider>
          </Form>
        )}
      </Formik>
    </>
  );
}
