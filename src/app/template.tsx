import { ViewTransition } from "react";

export default function RootTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransition default="none" enter="route-fade" exit="route-fade">
      {children}
    </ViewTransition>
  );
}
