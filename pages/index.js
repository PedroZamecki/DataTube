import { useEffect } from "react";
import { useRouter } from "next/router";

function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/under-construction");
  }, [router]);

  return null;
}

export default Home;
