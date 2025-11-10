import { FC } from "hono/jsx";

type AuthPageLinkProps = {
  nonBoldMessage: string;
  boldLinkMessage: string;
  link: string;
};

export const AuthPageLink: FC<AuthPageLinkProps> = ({
  nonBoldMessage,
  boldLinkMessage,
  link,
}) => {
  return (
    <div class="opacity-80 text-base text-center mt-2">
      {nonBoldMessage}
      <a class="font-bold hover:underline hover: opacity-100" href={link}>
        {boldLinkMessage}
      </a>
    </div>
  );
};
