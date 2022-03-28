import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotesGird } from "./notesGrid";
import { LandingPage } from "./landingPage";
import NavBar from "./navBar";
import { NotesForm } from "./notesForm";
import { NotesDetails } from "./notesDetails";

import { EditForm } from "./editForm";

Amplify.configure(awsExports);

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Router>
          <header>
            <NavBar signOut={signOut} />
          </header>
          <main>
            <Routes>
              <Route path="/" element={<LandingPage user={user} />} />
              <Route path="/notes" element={<NotesGird user={user} />} />
              <Route exact path="/create" element={<NotesForm user={user} />} />
              <Route path="/notes/:noteId" element={<NotesDetails />} />
              <Route exact path="/notes/:noteId/edit" element={<EditForm />} />
            </Routes>
          </main>
        </Router>
      )}
    </Authenticator>
  );
}
