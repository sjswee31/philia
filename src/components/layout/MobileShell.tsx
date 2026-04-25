export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center w-full h-dvh">
      <div className="philia-shell">
        {children}
      </div>
    </div>
  )
}
