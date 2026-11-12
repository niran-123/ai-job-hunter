import React, { createContext, useContext, useState } from 'react';

const QueryContext = createContext(null);

export class QueryClient {
  constructor() {
    this.cache = new Map();
  }
}

export const QueryClientProvider = ({ client, children }) => {
  return (
    <QueryContext.Provider value={client}>
      {children}
    </QueryContext.Provider>
  );
};

export const useQueryClient = () => useContext(QueryContext);

