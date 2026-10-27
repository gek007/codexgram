import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/expo";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { errorMessage } from "@/lib/errors";
type CurrentUser = NonNullable<ReturnType<typeof useCurrentUserQuery>>;
function useCurrentUserQuery(enabled: boolean) {
  return useQuery(api.users.me, enabled ? {} : "skip");
}
const Context = createContext<{
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}>({ user: null, loading: true, error: null, retry: () => {} });
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const ensure = useMutation(api.users.ensureCurrent);
  const [result, setResult] = useState<{
    owner: string;
    attempt: number;
    error?: string;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    if (isAuthenticated && userId) {
      void ensure({})
        .then(() => {
          if (live) setResult({ owner: userId, attempt });
        })
        .catch((e) => {
          if (live)
            setResult({ owner: userId, attempt, error: errorMessage(e) });
        });
    }
    return () => {
      live = false;
    };
  }, [isAuthenticated, userId, ensure, attempt]);
  const current =
    result?.owner === userId && result?.attempt === attempt ? result : null;
  const user = useCurrentUserQuery(
    !!current && !current.error && isAuthenticated,
  );
  return (
    <Context.Provider
      value={{
        user: user ?? null,
        loading:
          !!isSignedIn &&
          (isLoading || !current || (!current.error && user === undefined)),
        error: current?.error ?? null,
        retry: () => setAttempt((x) => x + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useSession = () => useContext(Context);
