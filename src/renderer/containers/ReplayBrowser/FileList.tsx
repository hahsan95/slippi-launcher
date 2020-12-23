import React from "react";

import { useReplays } from "@/store/replays";
import { ReplayFile } from "./ReplayFile";

export const FileList: React.FC = () => {
  const files = useReplays((store) => store.files);
  const loading = useReplays((store) => store.loading);
  const fileErrorCount = useReplays((store) => store.fileErrorCount);
  const progress = useReplays((store) => store.progress);
  if (loading) {
    if (progress === null) {
      return null;
    }
    return (
      <div>
        Loading... {Math.round((progress.current / progress.total) * 100)}%
      </div>
    );
  }
  return (
    <div>
      {fileErrorCount > 0 && <div>{fileErrorCount} files had errors.</div>}
      {files.map((f) => (
        <ReplayFile key={f.fullPath} {...f} />
      ))}
    </div>
  );
};
