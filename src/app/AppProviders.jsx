import { AuthProvider } from "../context/AuthContext";
import { ChatProvider } from "../context/ChatContext";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ChatProvider>
        {children}
      </ChatProvider>
    </AuthProvider>
  );
}