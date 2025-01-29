export interface User {
    _id: string;
    username: string;
    email: string;
    role: "detective" | "admin";
    newsWantedWords?: string[];
}