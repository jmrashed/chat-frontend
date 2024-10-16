import { Session } from "next-auth";

export interface User {
  id: number;
  user_name: string;
  email: string;
}

export interface ISession extends Session {
  token: string;
}


// Define the shape of the user data returned by your API
export interface AuthUser {
  id: number; // or whatever your user ID type is
  name: string;
  email: string;
  accessToken: string; // Assuming you have an access token
}

