import Placeholder from "@/components/app/Placeholder";
import { IconBookmark } from "@/components/icons";

export default function BookmarksPage() {
  return (
    <Placeholder
      title="Bookmarks"
      subtitle="Posts, markets and theses you save will be filed here for later."
      icon={<IconBookmark className="h-6 w-6" />}
    />
  );
}
