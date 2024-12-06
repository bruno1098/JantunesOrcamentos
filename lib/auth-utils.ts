const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin"
};

export function validateCredentials(username: string, password: string) {
  return username === ADMIN_CREDENTIALS.username && 
         password === ADMIN_CREDENTIALS.password;
} 