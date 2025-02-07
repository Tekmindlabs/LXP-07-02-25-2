export function Footer() {
  return (
    <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
      <p>© {new Date().getFullYear()} RBAC Starter. All rights reserved.</p>
    </footer>
  );
}