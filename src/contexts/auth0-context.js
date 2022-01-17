import createAuth0Client from "@auth0/auth0-spa-js";
import React, { createContext, useContext, useEffect, useState } from "react";


export const Auth0Context = createContext();
export const useAuth0 = () => useContext(Auth0Context);

export function Auth0Provider({children}) {
  const [isAuthenticated, setIsAuthenticated] =  useState(false);
  const [user, setUser] =  useState(null);
  const [auth0Client, setAuth0Client] =  useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth0();

    async function initAuth0(){
      const auth0 = await createAuth0Client({
        domain: 'dev-voe9-vjq.us.auth0.com',
        client_id: '54UWuQk8ZVoLSLZHw1b13X9DfJhup3RE',
        redirect_uri: window.location.origin,
      });
      setAuth0Client(auth0);

      // handle redirect when user comes back
      if(window.location.search.includes('code=') && window.location.search.includes('state=')){
        try {
          await auth0.handleRedirectCallback();
        } catch(err) {
          alert(err);
        }

        window.location.replace(window.location.pathname);
      }

      //is user authenticated
      const isAuthenticated = await auth0.isAuthenticated();
      setIsAuthenticated(isAuthenticated);

      // getting user
      if(isAuthenticated) {
        const user = auth0.getUser();
        setUser(user);
      }

      setIsLoading(false)
    }
  }, []);

  if(isLoading) return <div>Loading....</div>;

  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login: (...params) => auth0Client.loginWithRedirect(...params),
        logout: (...params) => auth0Client.logout(...params),
        getToken: (...params) => auth0Client.getTokenSilently(...params),
      }}
    >
      {children}
    </Auth0Context.Provider>
  )
}