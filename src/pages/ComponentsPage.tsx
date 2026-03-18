import { useState } from "react";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import TabBar from "@/components/ui/TabBar";

const TABS = [
  { id: "button", label: "Button" },
  { id: "avatar", label: "Avatar" },
  { id: "badge", label: "Badge" },
  { id: "input", label: "Input" },
  { id: "tabbar", label: "TabBar" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-[18px] font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
        {title}
      </h2>
      <div className="flex flex-wrap gap-4 items-start">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-gray-400 mb-1">{children}</p>;
}

function Col({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

// ── Button ──────────────────────────────────────────────────
function ButtonSection() {
  return (
    <Section title="Button">
      <Col>
        <Label>primary</Label>
        <Button variant="primary" width={120}>제출하기</Button>
      </Col>
      <Col>
        <Label>basic</Label>
        <Button variant="basic" width={120}>취소</Button>
      </Col>
      <Col>
        <Label>invaild</Label>
        <Button variant="invaild" width={120}>건너뛰기</Button>
      </Col>
      <Col>
        <Label>primary (full width)</Label>
        <Button variant="primary" className="w-64">전체 너비 버튼</Button>
      </Col>
    </Section>
  );
}

// ── Avatar ──────────────────────────────────────────────────
function AvatarSection() {
  return (
    <Section title="Avatar">
      <Col>
        <Label>한글 이름</Label>
        <Avatar name="투자왕김철수" />
      </Col>
      <Col>
        <Label>영문 1단어</Label>
        <Avatar name="apple" color="#7c3aed" />
      </Col>
      <Col>
        <Label>영문 2단어</Label>
        <Avatar name="John Doe" color="#059669" />
      </Col>
      <Col>
        <Label>이미지</Label>
        <Avatar name="테스트" src="https://i.pravatar.cc/80" size={40} />
      </Col>
      <Col>
        <Label>size 32</Label>
        <Avatar name="삼성전자" size={32} color="#dc2626" />
      </Col>
      <Col>
        <Label>size 56</Label>
        <Avatar name="SK하이닉스" size={56} color="#0046FF" />
      </Col>
    </Section>
  );
}

// ── Badge ──────────────────────────────────────────────────
function BadgeSection() {
  return (
    <Section title="Badge">
      <Col>
        <Label>primary</Label>
        <Badge name="주식" color="#0046FF" />
      </Col>
      <Col>
        <Label>green</Label>
        <Badge name="ETF" color="#059669" />
      </Col>
      <Col>
        <Label>red</Label>
        <Badge name="위험" color="#ef4444" />
      </Col>
      <Col>
        <Label>purple</Label>
        <Badge name="파생상품" color="#7c3aed" />
      </Col>
      <Col>
        <Label>gray</Label>
        <Badge name="기타" color="#6B7280" />
      </Col>
    </Section>
  );
}

// ── Input ──────────────────────────────────────────────────
function InputSection() {
  const [value, setValue] = useState("");

  return (
    <Section title="Input">
      <div className="w-64">
        <Col>
          <Label>기본</Label>
          <Input placeholder="입력해주세요" />
        </Col>
      </div>
      <div className="w-64">
        <Col>
          <Label>레이블</Label>
          <Input label="이메일" placeholder="example@email.com" type="email" />
        </Col>
      </div>
      <div className="w-64">
        <Col>
          <Label>에러</Label>
          <Input
            label="비밀번호"
            type="password"
            value="wrong"
            error="비밀번호가 일치하지 않습니다."
            onChange={() => {}}
          />
        </Col>
      </div>
      <div className="w-64">
        <Col>
          <Label>힌트</Label>
          <Input
            label="닉네임"
            value={value}
            hint="사용 가능한 닉네임입니다."
            onChange={(e) => setValue(e.target.value)}
            placeholder="닉네임을 입력하세요"
          />
        </Col>
      </div>
    </Section>
  );
}

// ── TabBar ──────────────────────────────────────────────────
function TabBarSection() {
  const [activeId, setActiveId] = useState("diary");
  const tabs = [
    { id: "diary", label: "매매일지" },
    { id: "analysis", label: "분석" },
    { id: "history", label: "거래내역" },
  ];

  return (
    <Section title="TabBar">
      <Col>
        <Label>현재 선택: {tabs.find((t) => t.id === activeId)?.label}</Label>
        <TabBar tabs={tabs} activeId={activeId} onChange={setActiveId} />
      </Col>
    </Section>
  );
}

// ── Page ──────────────────────────────────────────────────
const SECTION_MAP: Record<string, React.ReactNode> = {
  button: <ButtonSection />,
  avatar: <AvatarSection />,
  badge: <BadgeSection />,
  input: <InputSection />,
  tabbar: <TabBarSection />,
};

export default function ComponentsPage() {
  const [activeTab, setActiveTab] = useState("button");

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-[24px] font-bold text-gray-900 mb-1">컴포넌트 테스트</h1>
      <p className="text-[14px] text-gray-400 mb-6">공통 UI 컴포넌트 모음</p>
      <div className="mb-8">
        <TabBar tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
      </div>
      {SECTION_MAP[activeTab]}
    </div>
  );
}
