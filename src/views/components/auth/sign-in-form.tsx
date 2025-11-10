import type { FC } from "hono/jsx";
import { type AuthFormFieldProps, AuthFormField } from "./auth-form-field";
import { AuthPageLink } from "./auth-page-link";

export const SignInForm: FC = () => {
  const signInFormFields: AuthFormFieldProps[] = [
    {
      fieldName: "email",
      fieldTitle: "Email",
      type: "text",
    },
    {
      fieldName: "password",
      fieldTitle: "Password",
      type: "password",
    },
  ];
  return (
    <div class="hero min-h-screen bg-base-200">
      <div class="hero-content flex-col">
        <div class="text-center lg:text-left">
          <h1 class="text-3xl font-bold">Sign In</h1>
        </div>
        <div class="card flex-shrink-0 w-full max-w-sm shadow-lg bg-base-100">
          <div class="card-body">
            <form
              id="sign-in-form"
              hx-post="/sign-in"
              hx-target="#toast-container"
            >
              {signInFormFields.map((field) => {
                return (
                  <AuthFormField
                    fieldName={field.fieldName}
                    fieldTitle={field.fieldTitle}
                    type={field.type}
                    placeholder={field.placeholder}
                  />
                );
              })}
              <div class="form-control mt-6">
                <button class="btn btn-primary w-full text-base">Login</button>
              </div>
            </form>
            <section id="toast-container"></section>
            <AuthPageLink
              nonBoldMessage="No account? You can "
              boldLinkMessage="Sign Up"
              link="/auth/sign-up"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
