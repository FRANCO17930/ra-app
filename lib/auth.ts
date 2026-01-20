export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Laboratorio_Fuerza@Franco.07";

export function validatePassword(password: string): boolean {
    return password === ADMIN_PASSWORD;
}
