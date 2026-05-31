import Placeholder from "@/components/app/Placeholder";
import { IconSettings } from "@/components/icons";

export default function SettingsPage() {
  return (
    <Placeholder
      title="Settings"
      subtitle="Manage your codename, linked wallets, privacy and notification preferences from your profile for now."
      icon={<IconSettings className="h-6 w-6" />}
    />
  );
}
