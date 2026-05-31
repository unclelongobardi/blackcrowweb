import Placeholder from "@/components/app/Placeholder";
import { IconMail } from "@/components/icons";

export default function MessagesPage() {
  return (
    <Placeholder
      title="Messages"
      subtitle="Encrypted direct lines to other crows. Coordinate quietly, away from the public feed."
      icon={<IconMail className="h-6 w-6" />}
    />
  );
}
