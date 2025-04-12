export interface IAuthService {
  login(email: string, password: string): Promise<any | null>; // `any` es el tipo de retorno, puede ser el objeto de usuario o `null`
  recoverPassword(email: string): Promise<{ success: boolean }>; // Retorna un objeto con una propiedad `success` de tipo `boolean`
}
