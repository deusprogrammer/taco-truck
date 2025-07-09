import React, { createContext, useContext } from 'react';

// Fill in your default security context values here
const defaultSecurityContext = {
  username: null,
  roles: [],
  // Add other security-related fields as needed
};

export const SecurityContext = createContext(defaultSecurityContext);

export const SecurityProvider = ({ children, value }) => (
  <SecurityContext.Provider value={value}>
    {children}
  </SecurityContext.Provider>
);

// Custom hook to use the security context
export const useSecurity = () => useContext(SecurityContext);