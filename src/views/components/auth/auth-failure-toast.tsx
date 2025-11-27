import { FC } from "hono/jsx";

type AuthFailureToastProps = {
  errorMessage: string;
};

export const AuthFailureToast: FC<AuthFailureToastProps> = ({
  errorMessage,
}) => {
  return (
    <section id="toast-container">
      <div role="alert" class="alert alert-error mt-3 text-base">
        {errorMessage}
      </div>
    </section>
  );
};
