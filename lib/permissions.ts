import { error } from "console";
import { getCurrentUser } from "./auth";


export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("unauthorized");
    }

    return user;
}
export async function requireRole(allowedRoles: Array<"user" | "admin" | "business">) {
    const user = await requireAuth();
    if (!allowedRoles.includes(user.role)) {
        throw new Error("Forbidden");
    }

    return user;

}


