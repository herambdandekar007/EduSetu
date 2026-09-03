import { ReactNode } from "react";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

const PageHeader = ({ icon, title, subtitle, children }: PageHeaderProps) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 text-white"
      style={{
        background:
          "linear-gradient(135deg, hsl(248,62%,16%) 0%, hsl(258,58%,22%) 45%, hsl(276,54%,26%) 100%)",
      }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-12 -right-12 h-48 w-48 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, hsl(265,80%,62%), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-8 left-1/3 h-32 w-32 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(250,84%,54%), transparent 70%)" }}
        />
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm mt-0.5" style={{ color: "hsl(250,28%,68%)" }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
