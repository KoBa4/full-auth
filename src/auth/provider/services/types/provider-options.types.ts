export type TypeProviderOptions = {
  scopes: string[]
  client_id: string
  client_secret: string
}

export type TypeBaseProviderOptions = TypeProviderOptions & {
  name: string
  authorize_url: string
  access_url: string
  profile_url: string
}
