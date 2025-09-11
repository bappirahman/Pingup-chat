import Loader from "@/components/Loading";
import VerifyOtp from "@/components/VerifyOtp";
import { Suspense } from "react";

function page() {
  return (
    <div>
      <Suspense fallback={<Loader />}>
        <VerifyOtp />
      </Suspense>
    </div>
  );
}

export default page;
