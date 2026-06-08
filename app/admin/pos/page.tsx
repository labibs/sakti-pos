import { AppShell } from "@/components/app-shell";
import { PosRegister } from "@/components/pos-register";

export default function PosPage() {
  return (
    <AppShell hideHeader noPadding>
      <PosRegister />
    </AppShell>
  );
}
