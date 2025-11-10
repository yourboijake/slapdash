import { Layout } from "../layout";
import type { FC } from "hono/jsx";
import { SignInForm } from "../components/auth/sign-in-form";

export const SignInPage: FC = (props) => {
  return (
    <Layout>
      <SignInForm />
    </Layout>
  );
};
