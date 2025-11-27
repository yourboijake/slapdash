import { FC } from "hono/jsx";

type AuthToastProps = {
  message: string;
  type: "success" | "failure";
};

export const AuthToast: FC<AuthToastProps> = ({ message, type }) => {
  return (
    <section id="toast-container">
      <div
        role="alert"
        class={
          type === "failure"
            ? "alert alert-error mt-3 text-base"
            : "alert alert-success mt-3 text-base"
        }
      >
        {message}
      </div>
    </section>
  );
};
