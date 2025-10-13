import FooterSection from "@/components/footer";
import MarketingHeader from "@/components/marketing/marketing-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader />
      {children}
      <FooterSection />
    </>
  );
}
