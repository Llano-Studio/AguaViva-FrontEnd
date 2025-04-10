import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/router";

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
