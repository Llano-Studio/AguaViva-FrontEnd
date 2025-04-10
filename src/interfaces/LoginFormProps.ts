export interface LoginFormProps {
    onLogin: (email: string, password: string) => Promise<boolean>;
  }
  