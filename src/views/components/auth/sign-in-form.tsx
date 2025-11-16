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
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold">Sign In</h1>
        </div>
        <div className="card flex-shrink-0 w-full max-w-sm shadow-lg bg-base-100">
          <div className="card-body">
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
              <div className="form-control mt-6">
                <button className="btn btn-primary w-full text-base">
                  Login
                </button>
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
