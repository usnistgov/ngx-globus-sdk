# NgxGlobusSdk

NgxGlobusSdk is a library that enables you to easily work with [Globus](https://www.globus.org/) and its [APIs](https://docs.globus.org/api/). So far, the SDK only allows interaction with the Auth and Transfer APIs.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.5.


## How to install

Install from the command line:

```
npm install @usnistgov/ngx-globus-sdk@0.0.1
```

Install via `package.json`:

```
"@usnistgov/ngx-globus-sdk": "0.0.1"
```


## How to use

Import the the `NgxGlobusSdkModule` module and add it to your `app.module.ts` imports:

```
import { NgxGlobusSdkModule } from 'ngx-globus-sdk';

@NgModule({
  ...
    imports: [
		...
		NgxGlobusSdkModule.forRoot({
			clientId: "YOUR_CLIENT_ID",
			clientSecret: "YOUR_CLIENT_SECRET",
            ...
		})
	],
...
})

export class AppModule {
}
```

then import the `NgxGlobusSdkService` service, and inject it into a constructor:

```
import { NgxGlobusSdkService } from 'ngx-globus-sdk';

...
constructor(private globusService: NgxGlobusSdkService)
{
  ...
  let authUrl = this.globusService.getAuthorizeUrl();
  ...
}
```

## Configuration

The module expects the following configuration interface:

```
export interface Configuration {
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
    scope?: string;
    authorizeUrl?: string;
    tokenUrl?: string;
}
```

where:
 - `clientId`, and `clientSecret` are provided by Globus when first registering and creating the app. **These should be hidden in env variables**.
 - `redirectUrl` is the url to redirect the user to after a login. This is specified by the app developer during app creation and registration. 
 - `scope` the scopes that the app has access to. Defaults to "openid profile email".
 - `authorizeUrl` is the OAuth2 authorization endpoint. Defaults to "https://auth.globus.org/v2/oauth2/authorize".
 - `tokenUrl` is the endpoint used to exchange an authorization code for an access token. Defaults to "https://auth.globus.org/v2/oauth2/token".
