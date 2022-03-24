import { useEffect, useState } from "react";
import { API, Storage } from "aws-amplify";
import { listNotes } from "../graphql/queries";
import { createNote as createNoteMutation } from "../graphql/mutations";
import { Formik, Form, Field, ErrorMessage } from "formik";

export function NotesForm(user) {
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
            <div>
              <label htmlFor="name">Title of note</label>
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
            <div>
              <label htmlFor="description">description of note</label>
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
            <div>
              <label htmlFor="image">Selecciona una imagen</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={(event) =>
                  setFieldValue("image", event.target.files[0])
                }
              />
            </div>
            <button type="submit">Crear nota</button>
            {isSend && <p>Note create!</p>}
          </Form>
        )}
      </Formik>
    </>
  );
}
