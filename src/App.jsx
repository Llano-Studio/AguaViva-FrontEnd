import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/router";
import { SnackbarProvider } from "./context/SnackbarContext";

const App = () => {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <AppRouter />
      </SnackbarProvider>
    </AuthProvider>
  );
};

export default App;
