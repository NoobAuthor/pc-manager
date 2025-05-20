import { FC } from "react";
import { FaRobot } from "react-icons/fa";
import Image from "next/image";

type Props = {
  text: string;
  role: "user" | "assistant";
  userImage: string;
};

const ChatMessage: FC<Props> = ({ role, text, userImage }) => {
  const isUser = role === "user";

  return (
    <article
      className={`${isUser ? "bg-white" : "bg-gray-100 mb-6"} p-4 rounded-lg flex gap-4 items-start whitespace-pre-wrap`}
      aria-label={`${isUser ? "User" : "Assistant"} message`}
    >
      {isUser ? (
        <Image
          src={userImage}
          alt="User profile"
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : (
        <FaRobot className="text-3xl text-blue-600" aria-hidden="true" />
      )}

      <div>
        <span className="sr-only">
          {isUser ? "You wrote:" : "Assistant replied:"}
        </span>
        <p className="text-gray-700">{text}</p>
      </div>
    </article>
  );
};

export default ChatMessage;
