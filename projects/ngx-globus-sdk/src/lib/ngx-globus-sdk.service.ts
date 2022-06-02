import { Inject, Injectable } from '@angular/core';
import { Configuration } from './models/configuration.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserInfo } from './models/user.model';
import { Observable } from 'rxjs';
import { TransferDocument } from './models/transfer.model';
import { Settings } from './settings';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class NgxGlobusSdkService {

  constructor(@Inject('config') private config: Configuration, private cookieService: CookieService, private http: HttpClient) { }

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

  /**
   * Constructs the Authorize URL and redirects the user to it.
   */
  login() {
    window.location.href = this.getAuthorizeUrl();
  }

  /**
   * Check whether a key exists in cookies.
   * This relies on the {@link https://github.com/stevermeister/ngx-cookie-service}.
   */

  checkCredential(name: string) {
    return this.cookieService.check(name);
  }

  /**
   * Logout the user by removing all the access tokens that are stored in the cookies.
   * 
   * @param redirectUrl url to redirect the user to after logging out.
   */
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
   * Stores tokens using the CookieService, then redirects browser to the given URL.
   * 
   * @param tokens tokens to store
   * @param redirectUrl URL to redirect the browser to
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
   * Once the tokens are received, they will be stored in the cookies.
   * 
   * @param code the code obtained by sending the user to the authorize URL.
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
        this.saveTokens(tokens, this.config.redirectUrl);
      });
  }

  /**
   * Call the Userinfo endpoint of Globus Auth.
   * Userinfo is specified as part of the OpenID Connect (OIDC) standard.
   * 
   * @returns returns Observable of type UserInfo. The data returned will depend upon the set of OIDC-related scopes
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

  /**
   * Get a submission ID. Submission IDs are required to submist a transfer.
   * It is different that the task ID.
   * 
   * @returns an Observable of type any. 
   * @todo change type to TaskListResponse. 
   */
  getSubmissionId() {
    let headers = new HttpHeaders(
      {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.cookieService.get("transfer_access_token")}`,

      });
    let httpOptions = {
      headers: headers
    };

    return this.http.get<any>(`${Settings.GLOBUS_TRANSFER_BASE_URL}/submission_id`, httpOptions);
  }


  /**
   * Get the list of tasks that were submitted by the current authenticated user.
   * 
   * @returns an Observable of type any. 
   * @todo change type to TaskListResponse.  
   */
  getTaskList() {
    let headers = new HttpHeaders(
      {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.cookieService.get("transfer_access_token")}`,

      });
    let httpOptions = {
      headers: headers
    };
    return this.http.get<any>(`${Settings.GLOBUS_TRANSFER_BASE_URL}/task_list?limit=50`, httpOptions);
  }


  /**
   * Start a transfer using the given transfer document
   * @param transferDocument of type TransferDocument, the document containing information about the transfer.
   * @returns an Observable of type any. 
   * @todo change type to TransferResponse. 
   */
  transferFiles(transferDocument: TransferDocument) {

    let headers = new HttpHeaders(
      {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.cookieService.get("transfer_access_token")}`,

      });
    let httpOptions = {
      headers: headers
    };

    let transferItems: any[] = [];

    transferDocument.data.forEach(item => {
      transferItems.push({
        "DATA_TYPE": "transfer_item",
        "source_path": Settings.DEFAULT_SOURCE_PATH_BASE + item.sourcePath,
        "destination_path": Settings.DEFAULT_DESTINATION_PATH_BASE + item.destinationPath,
        "recursive": item.recursive
      });
    });

    let body = {
      "DATA_TYPE": transferDocument.dataType,
      "submission_id": transferDocument.submissionId,
      "label": transferDocument.label,
      "source_endpoint": Settings.DEFAULT_SOURCE_ENDPOINT,
      "destination_endpoint": transferDocument.destinationEndpoint,
      "DATA": transferItems


    }
    return this.http.post<any>(`${Settings.GLOBUS_TRANSFER_BASE_URL}/transfer`, body, httpOptions);
  }

  /**
   * Get a list of the current authenticated user's endpoints.
   * 
   * @param scope the scope filter specifies what type of endpoints to list. Default is 'administered-by-me'
   * @returns an Observable of type any. 
   * @todo change type to Endpoint[].
   */
  getUserEndpoints(scope: string) {
    let headers = new HttpHeaders(
      {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.cookieService.get("transfer_access_token")}`,

      });
    const httpOptions = {
      headers: headers
    };
    return this.http.get<any>(`${Settings.GLOBUS_TRANSFER_BASE_URL}/endpoint_search?filter_scope=${scope}`, httpOptions);
  }

  /**
   * List the content of a given endpoint.
   * 
   * @param endpoint_id the id of the endpoint
   * @param endpoint_base a specific directory in the endpoint to fetch the content from.
   * @returns an Observable of type any. 
   * @todo change type to EndpointContent[].
   */
  listEndpointContent(endpoint_id: string, endpoint_base: string) {
    let httpParams = new HttpParams()
      .append("path", endpoint_base);
    let headers = new HttpHeaders(
      {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.cookieService.get("transfer_access_token")}`,

      });
    const httpOptions = {
      headers: headers
    };
    return this.http.get<any>(`${Settings.GLOBUS_TRANSFER_BASE_URL}/operation/endpoint/${endpoint_id}/ls?` + httpParams.toString(), httpOptions);
  }


  /**
   * Download file using https.
   * @experimental not supported by Globus.
   * 
   * @param https_server url of the http server containing the file.
   * @param filename the file name
   * @returns an Observable of type any.
   * @todo change type
   */
  downloadFile(https_server: string, filename: string) {
    let headers = new HttpHeaders(
      {
        'Authorization': `Bearer ${this.cookieService.get("https_access_token")}`,
        'X-Requested-With': 'XMLHttpRequest'

      });
    const httpOptions = {
      headers: headers
    };
    return this.http.get<any>(`${https_server}/${filename}?download`, httpOptions);
  }
}
