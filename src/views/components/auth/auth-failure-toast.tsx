import { FC } from "hono/jsx";

type AuthFailureToastProps = {
  errorMessage: string;
};

export const AuthFailureToast: FC<AuthFailureToastProps> = ({
  errorMessage,
}) => {
  return (
    <section id="toast-container" hx-swap-oob="true" hx-swap="innerHTML">
      <div role="alert" class="alert alert-error">
        {errorMessage}
      </div>
    </section>
  );
};
