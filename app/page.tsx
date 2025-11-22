import { redirect } from "next/navigation"

export default function Home() {
  // Home page automatically redirects to dashboard for simplicity
  return redirect("/dashboard")
}

