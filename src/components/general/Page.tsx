import { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
};

const Page = ({ children, style = {} }: Props) => {
  return (
    <main className={"hide-scrollbar"} style={style}>
      {children}
    </main>
  );
};

export default Page;
