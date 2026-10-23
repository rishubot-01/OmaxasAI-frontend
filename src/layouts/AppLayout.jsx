import ChatLayout from "./ChatLayout/ChatLayout";

export default function AppLayout({ guestMode = false }) {
  return <ChatLayout guestMode={guestMode} />;
}