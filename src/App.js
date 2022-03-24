import { Amplify, API, Storage } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotesGird } from "./notesGrid";
import { LandingPage } from "./landingPage";
import NavBar from "./navBar";
import { NotesForm } from "./notesForm";
import { NotesDetails } from "./notesDetails";
import { useEffect, useState } from "react";
import { listNotes } from "./graphql/queries";
import { EditForm } from "./editForm";

Amplify.configure(awsExports);

export default function App() {
  const [notes, setNotes] = useState([]);

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

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Router>
          <header>
            <NavBar />
          </header>
          <main>
            <Routes>
              <Route
                path="/"
                element={<LandingPage signOut={signOut} user={user} />}
              />
              <Route
                path="/notes"
                element={<NotesGird signOut={signOut} user={user} />}
              />
              <Route exact path="/create" element={<NotesForm user={user} />} />
              <Route
                path="/notes/:noteId"
                element={<NotesDetails notes={notes} />}
              />
              <Route
                exact path="/notes/:noteId/edit"
                element={<EditForm notes={notes} />}
              />
            </Routes>
          </main>
        </Router>
      )}
    </Authenticator>
  );
}
