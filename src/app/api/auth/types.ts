export interface User {
    username: string;
    password: string;
    email: string;
  }

export interface AccountsData {
  users: User[];
}