import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
export function LandingPage() {
  return (
    <Container
      disableGutters
      maxWidth="sm"
      component="main"
      sx={{ pt: 8, pb: 6 }}
    >
      <Typography
        component="h3"
        variant="h3"
        align="center"
        color="text.primary"
        gutterBottom
      >
        AmplifyNotes
      </Typography>
      <Typography
        variant="h5"
        align="center"
        color="text.secondary"
        component="p"
      >
        Pancake Technical Exercise.
      </Typography>
      <Typography
        variant="h6"
        align="center"
        color="text.secondary"
        component="p"
      >
        by: Ignacio Romanow
      </Typography>
    </Container>
  );
}
