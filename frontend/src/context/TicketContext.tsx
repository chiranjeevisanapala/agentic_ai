import React, { createContext, useContext, useState, useEffect } from 'react';
import { ResolutionResult, AgentStepTrace } from '../types/agent';
import { CustomerProfile, TicketItem } from '../types/ticket';
import { MOCK_INITIAL_RESOLUTION, MOCK_CUSTOMERS } from '../services/mockData';
import { resolveTicketApi, getTicketsApi, getCustomersApi } from '../services/api';

interface TicketContextType {
  activeResolution: ResolutionResult | null;
  activeCustomer: CustomerProfile;
  setActiveCustomer: (cust: CustomerProfile) => void;
  customers: CustomerProfile[];
  tickets: TicketItem[];
  isLoading: boolean;
  activeAgentIndex: number;
  runResolution: (query: string) => Promise<ResolutionResult>;
  refreshTickets: () => Promise<void>;
  selectedTicket: TicketItem | null;
  setSelectedTicket: (t: TicketItem | null) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<CustomerProfile[]>(MOCK_CUSTOMERS);
  const [activeCustomer, setActiveCustomer] = useState<CustomerProfile>(MOCK_CUSTOMERS[0]);
  const [activeResolution, setActiveResolution] = useState<ResolutionResult | null>(MOCK_INITIAL_RESOLUTION);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(6); // 6 = all completed

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [fetchedCustomers, fetchedTickets] = await Promise.all([
        getCustomersApi(),
        getTicketsApi()
      ]);
      if (fetchedCustomers && fetchedCustomers.length > 0) {
        setCustomers(fetchedCustomers);
        setActiveCustomer(fetchedCustomers[0]);
      }
      if (fetchedTickets) {
        setTickets(fetchedTickets);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const refreshTickets = async () => {
    const fetchedTickets = await getTicketsApi();
    if (fetchedTickets) setTickets(fetchedTickets);
  };

  const runResolution = async (query: string): Promise<ResolutionResult> => {
    setIsLoading(true);
    setActiveAgentIndex(0);

    // Progressive visual step animation for WOW factor
    const interval = setInterval(() => {
      setActiveAgentIndex(prev => {
        if (prev < 5) return prev + 1;
        clearInterval(interval);
        return 5;
      });
    }, 280);

    try {
      const result = await resolveTicketApi({
        customer_query: query,
        customer_id: activeCustomer.id
      });
      clearInterval(interval);
      setActiveAgentIndex(6);
      setActiveResolution(result);
      await refreshTickets();
      setIsLoading(false);
      return result;
    } catch (err) {
      clearInterval(interval);
      setActiveAgentIndex(6);
      setIsLoading(false);
      throw err;
    }
  };

  return (
    <TicketContext.Provider
      value={{
        activeResolution,
        activeCustomer,
        setActiveCustomer,
        customers,
        tickets,
        isLoading,
        activeAgentIndex,
        runResolution,
        refreshTickets,
        selectedTicket,
        setSelectedTicket
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => {
  const context = useContext(TicketContext);
  if (!context) throw new Error('useTicket must be used within a TicketProvider');
  return context;
};
