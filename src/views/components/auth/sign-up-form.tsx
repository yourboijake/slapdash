import type { FC } from "hono/jsx";
import { type AuthFormFieldProps, AuthFormField } from "./auth-form-field";
import { AuthPageLink } from "./auth-page-link";

export const SignUpForm: FC = () => {
  const signUpFields: AuthFormFieldProps[] = [
    {
      fieldName: "full-name",
      fieldTitle: "Full Name",
      type: "text",
    },
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
    {
      fieldName: "confirm-password",
      fieldTitle: "Confirm Password",
      type: "password",
    },
  ];
  return (
    <div class="hero min-h-screen bg-base-200">
      <div class="hero-content flex-col">
        <div class="text-center lg:text-left">
          <h1 class="text-3xl font-bold">Sign Up</h1>
        </div>
        <div class="card flex-shrink-0 w-full max-w-sm shadow-lg bg-base-100">
          <div class="card-body">
            <form
              id="sign-up-form"
              hx-post="/auth/sign-up"
              hx-target="#toast-container"
            >
              {signUpFields.map((field) => {
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
                <button class="btn btn-primary w-full text-base">
                  Sign Up
                </button>
              </div>
            </form>
            <section id="toast-container"></section>
            <AuthPageLink
              nonBoldMessage="Already have an account? "
              boldLinkMessage="Sign In"
              link="/auth/sign-in"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
