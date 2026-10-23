
import MarkdownRenderer from "./MarkdownRenderer";
import { useAuth } from "../../auth/useAuth";
import omaxasLogo from "../../../assets/Analysis output 1.png";

function getUserName(user) {
  return (
    user?.full_name ||
    user?.name ||
    user?.display_name ||
    user?.username ||
    user?.first_name ||
    user?.email ||
    "User"
  );
}

function getProfileImage(user) {
  const image =
    user?.profile_photo ||
    user?.profile_picture ||
    user?.profile_image ||
    user?.avatar_url ||
    user?.photo_url ||
    user?.image_url ||
    user?.avatar ||
    user?.profile?.profile_photo ||
    user?.profile?.avatar ||
    null;

  if (typeof image === "string") {
    return image.trim() || null;
  }

  if (image && typeof image === "object") {
    return image.url || image.image || image.file || null;
  }

  return null;
}

export default function MessageBubble({ message }) {
  const auth = useAuth();

  const user =
    auth?.user ||
    auth?.currentUser ||
    auth?.userProfile ||
    auth?.profile ||
    {};

  const isUser = message?.role === "user";
  const content = message?.content ?? "";

  const userName = getUserName(user);
  const profileImage = getProfileImage(user);

  const userInitial = (
    String(userName).trim().charAt(0) || "U"
  ).toLocaleUpperCase();

  return (
    <article
      className={`message-row ${
        isUser ? "message-row-user" : "message-row-assistant"
      }`}
    >
      <div
        className={`message-avatar ${
          isUser
            ? "message-avatar-user"
            : "message-avatar-assistant"
        }`}
        aria-hidden="true"
      >
        {isUser ? (
          profileImage ? (
            <img
              src={profileImage}
              alt=""
              className="message-avatar-user-photo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            userInitial
          )
        ) : (
          <img
            src={omaxasLogo}
            alt=""
            className="message-avatar-assistant-logo"
          />
        )}
      </div>

      <div className="message-body">
        <div className="message-author">
          {isUser ? userName : "OmaxasAI"}
        </div>

        <div className="message-content">
          {isUser ? (
            <>{String(content)}</>
          ) : (
            <MarkdownRenderer content={String(content)} />
          )}
        </div>
      </div>
    </article>
  );
}
