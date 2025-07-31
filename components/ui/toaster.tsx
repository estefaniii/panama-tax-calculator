"use client";

import { Toaster as SonnerToaster } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export function Toaster({ position = "top-right", ...props }: ToasterProps) {
  return <SonnerToaster position={position} {...props} />;
}