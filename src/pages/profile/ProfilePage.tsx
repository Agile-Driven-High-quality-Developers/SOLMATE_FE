import ProfileCard from "@/components/profile/ProfileCard";
import ProfileTabs from "@/components/profile/ProfileTabs";

export default function ProfilePage() {
  return (
    <div className="flex h-full p-6 gap-5 bg-gray-50 min-h-screen">
      <div className="w-64 shrink-0">
        <ProfileCard
          nickname="투자왕김철수"
          email="kim@example.com"
          followerCount={42}
          followingCount={3}
          returnRate={12.5}
          returnAmount={1250000}
        />
      </div>

      <div className="flex-1">
        <ProfileTabs />
      </div>
    </div>
  );
}
