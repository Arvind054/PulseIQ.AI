import crypto from "crypto";
// Function to generate API key
export function generate_API_Key(){
    return "plsIQ_" + crypto.randomBytes(16).toString("hex");
};