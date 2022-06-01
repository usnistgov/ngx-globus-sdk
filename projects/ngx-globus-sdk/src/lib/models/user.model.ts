export interface UserInfo {
    email: string,
    name: string,
    preferred_username: string,
    identity_provider_display_name: string,
    identity_provider: string,
    organization: string,
    last_authentication: number,
    sub: string,
    identity_set: string[]
}