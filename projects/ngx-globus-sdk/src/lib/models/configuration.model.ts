export interface Configuration {
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
    scope: string;
    authorizeUrl?: string;
    tokenUrl?: string;
}

export const defaultConfiguration: Configuration = {
    clientId: "",
    clientSecret: "",
    redirectUrl: "http://localhost:4200/authcallback",
    scope: "openid profile email urn:globus:auth:scope:transfer.api.globus.org:all urn:globus:auth:scope:transfer.api.globus.org:all",
    authorizeUrl: "https://auth.globus.org/v2/oauth2/authorize",
    tokenUrl: "https://auth.globus.org/v2/oauth2/token"
}