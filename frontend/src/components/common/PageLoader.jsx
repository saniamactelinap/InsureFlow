import React from "react";
import LoadingSpinner from "./LoadingSpinner";

export const PageLoader = ({ message = "Loading InsureFlow..." }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};

export default PageLoader;
