import { Inject, Injectable } from '@angular/core';
import { Configuration } from './models/configuration.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { UserInfo } from './models/user.model';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NgxGlobusSdkService {

  constructor(@Inject('config') private config: Configuration, private cookieService: CookieService, private http: HttpClient) { }

  public healthCheck() {
    console.log("Service NgxGlobusSdkService is available.");
  }


  //  #### GLOBUS AUTHENTICATION RELATED METHODS ####


  /**
   * Get the authorization URL to which users should be sent.
   * 
   * @returns string - the authorization URL 
   */
  getAuthorizeUrl(): string {
    let httpParams = new HttpParams()
      .append('client_id', this.config.clientId)
      .append('redirect_uri', this.config.redirectUrl)
      .append('scope', this.config.scope)
      .append('state', "default")
      .append('response_type', 'code');

    return `${this.config.authorizeUrl}?${httpParams.toString()}`;
  }

  login() {
    window.location.href = this.getAuthorizeUrl();
  }

  checkCredential(name: string) {
    return this.cookieService.check(name);
  }

  logout(redirectUrl: string) {
    if (this.checkCredential('access_token'))
      this.cookieService.delete("access_token");
    if (this.checkCredential('transfer_access_token'))
      this.cookieService.delete("transfer_access_token");
    if (this.checkCredential('https_access_token'))
      this.cookieService.delete("https_access_token");

    window.location.href = redirectUrl;
  }


  /**
   * Stores tokens using a CookieService, then redirects browser to the given URL.
   * 
   * @param tokens -- tokens to store
   * @param redirectUrl -- URL to redirect the browser to
   */
  saveTokens(tokens: any, redirectUrl: string) {
    let expireDate = new Date().getTime() + (1000 * tokens.expires_in);
    this.cookieService.set("access_token", tokens.access_token, expireDate);
    this.cookieService.set("https_access_token", tokens.other_tokens[0].access_token, expireDate);
    this.cookieService.set("transfer_access_token", tokens.other_tokens[1].access_token, expireDate);
    window.location.href = redirectUrl; // comment this to see tokens in console before redirect
  }

  /**
   * Exchange an authorization code for a token or tokens.
   * 
   * @param code -- The code obtained by sending the user to the authorize URL.
   */
  exchangeCodeForTokens(code: string) {
    let httpParams = new URLSearchParams();
    httpParams.append('grant_type', "authorization_code");
    httpParams.append('client_id', this.config.clientId);
    httpParams.append('client_secret', this.config.clientSecret);
    httpParams.append('redirect_uri', this.config.redirectUrl);
    httpParams.append('code', code);

    console.log("httpParams=" + httpParams.toString())
    let headers = new HttpHeaders({ 'Content-type': 'application/x-www-form-urlencoded; charset=utf-8' });
    this.http.post<any>(this.config.tokenUrl!, httpParams.toString(), { headers: headers })
      .subscribe(tokens => {
        this.saveTokens(tokens, '');
      });
  }

  /**
   * Call the Userinfo endpoint of Globus Auth.
   * Userinfo is specified as part of the OpenID Connect (OIDC) standard.
   * 
   * @returns -- returns Observable of type UserInfo. The data returned will depend upon the set of OIDC-related scopes
   * which were used to acquire the token being used for this call
   */
  getUserInfo(): Observable<UserInfo> {
    let headers = new HttpHeaders(
      {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.cookieService.get("access_token")}`,

      });
    const httpOptions = {
      headers: headers
    };
    return this.http.get<UserInfo>(`https://auth.globus.org/v2/oauth2/userinfo`, httpOptions);
  }


  //  #### GLOBUS TRANSFER RELATED METHODS ####

}
